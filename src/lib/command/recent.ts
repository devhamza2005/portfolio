/**
 * Mémoire des dernières actions utilisées.
 *
 * ── Ce qui est stocké, et ce qui ne l'est pas ─────────────────────────────
 *
 * Uniquement des IDENTIFIANTS d'actions (`nav-about`, `action-terminal`…) —
 * des constantes du code, connues d'avance. Aucune saisie du visiteur, aucune
 * donnée personnelle, aucun horodatage : rien qui puisse servir à le suivre.
 *
 * Un identifiant inconnu à la relecture est ignoré, ce qui rend l'historique
 * inoffensif si le catalogue change ou si la valeur est bricolée à la main.
 *
 * `localStorage` peut lever — mode privé de Safari, quota plein, cookies
 * bloqués. Chaque accès est donc protégé : la palette doit fonctionner même
 * quand la mémoire est indisponible, elle perd seulement cette commodité.
 */

const KEY = "portfolio:recent-commands";
const MAX = 3;

export function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

/** Place l'action en tête, sans doublon, et borne la liste. */
export function pushRecent(id: string): string[] {
  const next = [id, ...readRecent().filter((item) => item !== id)].slice(0, MAX);

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Mémoire indisponible : la palette reste utilisable sans historique.
  }

  return next;
}
