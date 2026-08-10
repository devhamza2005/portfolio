import "server-only";

import { z } from "zod";

/**
 * Validation des variables d'environnement côté serveur.
 *
 * Ce module est `server-only` : toute tentative de l'importer depuis un
 * composant client provoque une erreur de build — c'est la garantie qu'aucun
 * secret ne peut fuiter dans le bundle envoyé au navigateur (§15).
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Base de données
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  DIRECT_DATABASE_URL: z.string().optional(),

  // Authentification
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET doit faire au moins 16 caractères"),
  AUTH_URL: z.string().url().optional(),

  // Compte admin initial (seed uniquement)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().optional(),

  // Stockage
  STORAGE_PROVIDER: z.enum(["cloudinary", "local"]).default("local"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("portfolio-hamza"),

  // Email
  RESEND_API_KEY: z.string().optional(),
  CONTACT_FROM_EMAIL: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Variables d'environnement invalides :\n${issues}\n\n` +
        `Copiez .env.example en .env et complétez les valeurs manquantes.`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();

/** Le stockage Cloudinary n'est actif que si les trois clés sont présentes. */
export const isCloudinaryConfigured =
  env.STORAGE_PROVIDER === "cloudinary" &&
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

/** L'envoi d'email n'est actif que si une clé Resend est fournie. */
export const isEmailConfigured = Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL);
