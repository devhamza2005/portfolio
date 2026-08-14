/**
 * Extraction du nom d'utilisateur GitHub depuis l'URL déjà enregistrée en
 * base (table `SocialLink`, back-office existant).
 *
 * ── Pourquoi extraire plutôt que dupliquer ─────────────────────────────────
 *
 * Le nom d'utilisateur n'est écrit NULLE PART dans le code : il vit une seule
 * fois, dans le lien GitHub que l'administrateur a déjà saisi. Le changer
 * depuis /admin met automatiquement à jour les statistiques affichées ici, le
 * Developer Terminal (phase 4) et la Command Palette (phase 5) — les trois
 * lisent la même URL.
 *
 * Chemins réservés par GitHub (« github.com/sponsors », « /orgs »…) exclus :
 * ce ne sont jamais des profils personnels, et les confondre afficherait des
 * statistiques trompeuses.
 */
const RESERVED_PATHS = new Set([
  "orgs",
  "sponsors",
  "marketplace",
  "settings",
  "notifications",
  "issues",
  "pulls",
  "topics",
  "collections",
  "about",
  "features",
  "pricing",
  "apps",
  "codespaces",
]);

export function extractGithubUsername(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) return null;

  const [segment] = parsed.pathname.split("/").filter(Boolean);
  if (!segment) return null;
  if (RESERVED_PATHS.has(segment.toLowerCase())) return null;

  // Un nom d'utilisateur GitHub : lettres, chiffres, tirets simples,
  // 1 à 39 caractères. Rejeter le reste évite d'interroger l'API avec une
  // valeur qui ne pourrait de toute façon jamais être un compte.
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(segment)) return null;

  return segment;
}
