import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuration de la CLI Prisma (migrations, seed, studio).
 *
 * Les migrations utilisent la connexion DIRECTE : le pooler de Neon ne
 * supporte pas les commandes DDL longues. L'application, elle, passe par la
 * connexion poolée via l'adaptateur (voir src/server/db.ts).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_DATABASE_URL"] || process.env["DATABASE_URL"] || "",
  },
});
