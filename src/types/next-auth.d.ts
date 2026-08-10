import type { Role } from "@/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

/**
 * Extension des types Auth.js : la session et le JWT transportent l'identifiant
 * et le rôle de l'utilisateur, indispensables aux gardes serveur.
 *
 * Note : `next-auth/jwt` se contente de réexporter `@auth/core/jwt`.
 * C'est donc bien ce dernier module qu'il faut augmenter — augmenter le
 * réexport créerait une interface distincte, sans effet sur le callback `jwt`.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

export {};
