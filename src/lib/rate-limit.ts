import "server-only";

/**
 * Limitation de débit en mémoire (fenêtre glissante).
 *
 * Portée : une instance de serveur. C'est suffisant pour un portfolio —
 * cela bloque les attaques par force brute depuis une même origine sur le
 * formulaire de connexion et le formulaire de contact.
 *
 * Si le site devait passer à plusieurs instances, il suffirait de remplacer
 * l'implémentation de `hit()` par un compteur Redis : la signature ne change pas.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Purge des compartiments expirés — évite que la Map ne grossisse sans fin. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Secondes avant la réinitialisation du compteur. */
  retryAfter: number;
};

export function hit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return { success: false, remaining: 0, retryAfter };
  }

  return { success: true, remaining: limit - existing.count, retryAfter };
}

/** Réinitialise un compteur — appelé après une connexion réussie. */
export function reset(key: string) {
  buckets.delete(key);
}
