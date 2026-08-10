"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { hit, reset } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth.schema";
import { signIn, signOut } from "@/server/auth";

export type LoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

/** Identifie l'appelant sans stocker d'adresse IP en clair. */
async function callerKey() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Connexion au back-office.
 *
 * Le message d'erreur est volontairement identique que l'email soit inconnu ou
 * que le mot de passe soit faux : distinguer les deux cas permettrait
 * d'énumérer les comptes existants.
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const key = `login:${await callerKey()}`;
  const limit = hit(key, 5, 300); // 5 tentatives par tranche de 5 minutes

  if (!limit.success) {
    return {
      error: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  const rawTarget = formData.get("from");
  // Seules les redirections internes sont acceptées : une URL absolue
  // permettrait de renvoyer l'utilisateur vers un site tiers après connexion.
  const target =
    typeof rawTarget === "string" && rawTarget.startsWith("/") && !rawTarget.startsWith("//")
      ? rawTarget
      : "/admin";

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Identifiants incorrects." };
    }
    throw error;
  }

  reset(key);
  redirect(target);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
