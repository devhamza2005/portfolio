import "server-only";

import { forbidden, redirect } from "next/navigation";

import { auth } from "@/server/auth";

/**
 * Gardes serveur — deuxième et troisième lignes de défense (§15).
 *
 * `proxy.ts` ne fait que rediriger l'utilisateur non connecté : c'est du
 * confort de navigation, pas de la sécurité (le cookie n'y est pas vérifié
 * cryptographiquement). La vraie protection est ici, et elle est appelée :
 *   1. dans le layout /admin  → protège toutes les pages du back-office,
 *   2. au début de CHAQUE Server Action → protège les mutations même si
 *      elles sont invoquées directement, hors de l'interface.
 */

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

/** Retourne la session si l'utilisateur est authentifié, sinon `null`. */
export async function getCurrentUser(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role,
  };
}

/**
 * Exige une session administrateur.
 * Redirige vers /login si absente, renvoie 403 si le rôle est insuffisant.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "EDITOR") forbidden();

  return user;
}

/**
 * Variante non redirigeante, destinée aux Server Actions : elle lève une
 * erreur au lieu de tenter une redirection, afin que l'action retourne un
 * résultat exploitable par le formulaire.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("Action non autorisée : authentification requise.");
    this.name = "UnauthorizedError";
  }
}

export async function requireAdminOrThrow(): Promise<AdminSession> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
