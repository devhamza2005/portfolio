import "server-only";

import { cacheLife } from "next/cache";

/**
 * Valeurs temporelles utilisables pendant le prérendu.
 *
 * `new Date()` change à chaque appel : Next.js refuse de le prérendre, sinon
 * la page figerait une date au moment du build. Encapsulé dans `use cache`
 * avec une durée de vie d'un jour, le résultat devient une valeur stable et
 * régénérée quotidiennement.
 */

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** Horodatage du jour, pour comparer des dates d'expiration. */
export async function getToday(): Promise<Date> {
  "use cache";
  cacheLife("days");
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
