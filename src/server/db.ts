import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Client Prisma unique.
 *
 * Prisma 7 impose un « driver adapter » : la connexion passe par `pg`, ce qui
 * fonctionne aussi bien avec le Postgres local qu'avec le pooler Neon en
 * production.
 *
 * En développement, Next.js recharge les modules à chaque modification : sans
 * ce singleton attaché à `globalThis`, chaque rechargement ouvrirait un
 * nouveau pool de connexions jusqu'à saturer la base.
 */

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? [{ emit: "stdout", level: "warn" }, { emit: "stdout", level: "error" }]
        : [{ emit: "stdout", level: "error" }],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
