/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ORDRE DES SECTIONS DE L'ACCUEIL — SOURCE UNIQUE DE VÉRITÉ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Le problème que ce fichier supprime ───────────────────────────────────
 *
 * Les numéros affichés (« 01 », « 02 »…) étaient écrits en dur dans chaque
 * composant de section. Insérer une section au milieu obligeait à renuméroter
 * la main tous les composants situés après — six fichiers pour l'Engineering
 * Lab, six autres pour l'Architecture Lab. Un oubli passait inaperçu à la
 * compilation et se voyait en production.
 *
 * Désormais l'ordre est déclaré ICI, une fois. Le numéro s'en déduit.
 *
 * ── Ajouter une section ───────────────────────────────────────────────────
 *
 *   1. insérer son identifiant dans `HOME_SECTIONS`, à sa place ;
 *   2. dans le composant : `<SectionLabel index={sectionIndex("mon-id")}>`.
 *
 * Rien d'autre. Les sections suivantes se renumérotent seules, et
 * `OBSERVED_SECTIONS` — utilisé par l'indicateur de section active de la
 * navbar — dérive du même tableau : impossible que les deux divergent.
 *
 * ⚠️ L'ordre doit refléter celui du rendu dans `(public)/[locale]/page.tsx`.
 * C'est la seule cohérence que le typage ne peut pas garantir tout seul.
 *
 * Hero et Stats n'y figurent pas : ils ouvrent la page sans porter de numéro.
 */

export const HOME_SECTIONS = [
  "about",
  "services",
  "skills",
  "technologies",
  "lab",
  "architecture",
  "experience",
  "education",
  "projects",
  "roadmap",
  "certifications",
  "achievements",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

/**
 * Numéro affiché d'une section, sur deux chiffres — « 01 », « 07 », « 12 ».
 *
 * Le type de `id` interdit un identifiant absent du tableau : une faute de
 * frappe devient une erreur de compilation, pas un « 00 » silencieux à
 * l'écran.
 */
export function sectionIndex(id: HomeSectionId): string {
  return String(HOME_SECTIONS.indexOf(id) + 1).padStart(2, "0");
}
