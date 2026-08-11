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
  // Le pool est dimensionné explicitement plutôt que laissé par défaut (10).
  //
  //  • Production (Vercel) : chaque instance sans serveur ouvre son propre
  //    pool. Un plafond bas évite d'épuiser le quota de connexions Neon quand
  //    plusieurs instances tournent en parallèle — le pooler Neon se charge
  //    déjà de la mutualisation.
  //  • Développement : un pool réduit limite la charge sur le serveur local.
  //
  // Les paramètres `connection_limit` placés dans l'URL sont propres au moteur
  // historique de Prisma ; avec l'adaptateur `pg`, c'est bien cette
  // configuration-ci qui fait foi.
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 5 : 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    // Neon impose TLS. `sslmode=require` dans l'URL suffit, mais l'expliciter
    // évite un échec silencieux si le paramètre venait à disparaître de l'URL.
    ...(env.DATABASE_URL.includes("neon.tech")
      ? { ssl: { rejectUnauthorized: true } }
      : {}),
  });

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
