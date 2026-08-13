import type { Tone } from "@/lib/code/highlight";

/**
 * Teintes de la coloration syntaxique.
 *
 * Extraites dans leur propre module pour que l'Engineering Lab et
 * l'Architecture Lab partagent exactement la même palette : deux blocs de code
 * qui ne se ressembleraient pas trahiraient immédiatement deux composants
 * écrits séparément.
 *
 * Ce sont les mêmes tons que la fenêtre de code du Hero.
 */
export const TONE_CLASS: Record<Tone, string> = {
  keyword: "text-[#c792ea]",
  annotation: "text-[#ffcb6b]",
  type: "text-[#ff8a80]",
  string: "text-[#c3e88d]",
  comment: "text-subtle italic",
  fn: "text-[#f48fb1]",
  number: "text-[#ffab70]",
  plain: "",
};
