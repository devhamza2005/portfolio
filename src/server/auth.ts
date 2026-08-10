import "server-only";

import { verify } from "@node-rs/argon2";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/server/db";
import { loginSchema } from "@/schemas/auth.schema";

/**
 * Authentification du back-office (§15).
 *
 * Choix retenus :
 *  • Session JWT dans un cookie httpOnly + sameSite=lax (+ secure en prod).
 *    Aucun jeton n'est accessible en JavaScript côté navigateur.
 *  • Mot de passe vérifié en Argon2id, jamais renvoyé au client.
 *  • Temps de réponse constant en cas d'email inconnu : on effectue quand même
 *    une vérification factice, ce qui empêche d'énumérer les comptes existants
 *    en mesurant la durée de la réponse.
 */

/** Hachage factice — sert uniquement à égaliser le temps de réponse. */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$3f5Xj6t7Q0mKQKQ0m0nQ0aQ0mKQKQ0m0nQ0aQ0mKQKQ";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  trustHost: true,

  providers: [
    Credentials({
      credentials: { email: {}, password: {} },

      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
          // Compte inexistant : on paie quand même le coût d'un Argon2 afin de
          // ne pas révéler, par le temps de réponse, si l'email est connu.
          await verify(DUMMY_HASH, password).catch(() => false);
          return null;
        }

        const isValid = await verify(user.passwordHash, password).catch(() => false);
        if (!isValid) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      // `user` n'est présent qu'au moment de la connexion.
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },

    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
});
