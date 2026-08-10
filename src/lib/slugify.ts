/**
 * Transforme un texte libre en identifiant d'URL.
 *
 * Les accents sont décomposés puis retirés (« Conventions gérées » →
 * « conventions-gerees ») afin que les URL restent lisibles et stables, quel
 * que soit le clavier utilisé pour la saisie.
 */
export function slugify(input: string, options?: { keepTrailingDash?: boolean }): string {
  const base = input
    .normalize("NFD")
    // Retire les diacritiques laissés par la décomposition NFD.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 120);

  // Pendant la saisie, un tiret final doit être conservé : sinon impossible
  // de taper « mon-projet », le tiret disparaîtrait à chaque frappe.
  return options?.keepTrailingDash ? base : base.replace(/-+$/, "");
}
