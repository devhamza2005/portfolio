/**
 * Couleurs conventionnelles des langages — un petit sous-ensemble, pas la
 * table complète de GitHub Linguist (des centaines d'entrées pour un usage
 * qui n'en affiche jamais plus de cinq).
 *
 * ── Sur la présence de bleu ici ─────────────────────────────────────────────
 *
 * La consigne « pas de bleu » du portfolio vise l'identité visuelle — boutons,
 * fonds, états actifs. Elle ne s'applique pas aux couleurs de MARQUE d'un
 * langage : la section Technologies affiche déjà TypeScript en bleu
 * (`tech.color` en base, voir `src/components/sections/technologies.tsx`).
 * Un point de couleur à côté d'un nom de langage suit la même logique — un
 * simple repère de reconnaissance, jamais un accent de l'interface. La
 * structure autour (cartes, barres, bordures) reste strictement rouge/neutre.
 *
 * Un langage absent de cette table reçoit un point neutre : mieux vaut un
 * gris discret qu'une couleur inventée.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  SCSS: "#c6538c",
  PLpgSQL: "#336790",
};

/** Jeton existant, pas une teinte inventée — suit déjà le thème clair/sombre. */
export const FALLBACK_LANGUAGE_COLOR = "var(--foreground-subtle)";

export function languageColor(name: string): string {
  return LANGUAGE_COLORS[name] ?? FALLBACK_LANGUAGE_COLOR;
}
