/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ANALYSE DE LA SAISIE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Volontairement minimal : découper sur les espaces, mettre le nom en
 * minuscules, borner la longueur. Il n'y a ni guillemets, ni redirections, ni
 * variables — ce n'est pas un shell, et n'en devenir un ne serait pas un
 * progrès mais une faille.
 *
 * La longueur est plafonnée : une saisie de plusieurs milliers de caractères
 * ne doit pas se retrouver telle quelle dans l'historique affiché.
 */

const MAX_INPUT = 200;
const MAX_ARGS = 4;

export type ParsedCommand = {
  /** Nom en minuscules, sans espaces. Chaîne vide si la saisie est blanche. */
  name: string;
  args: string[];
  /** Saisie d'origine, nettoyée — c'est elle qui s'affiche dans l'historique. */
  raw: string;
};

export function parseCommand(input: string): ParsedCommand {
  const raw = input.slice(0, MAX_INPUT).trim().replace(/\s+/g, " ");
  if (raw.length === 0) return { name: "", args: [], raw: "" };

  const parts = raw.split(" ");
  const name = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1, 1 + MAX_ARGS).map((part) => part.toLowerCase());

  return { name, args, raw };
}

/**
 * Complétion sur le préfixe saisi.
 *
 * Rend la commande à compléter quand UNE seule correspond ; sinon la liste des
 * candidates, que l'appelant affiche. Compléter arbitrairement sur la première
 * correspondance ferait deviner à l'utilisateur ce qui a été choisi.
 */
export function complete(
  input: string,
  commands: readonly string[],
): { completion: string | null; candidates: string[] } {
  const prefix = input.trim().toLowerCase();
  if (prefix.length === 0) return { completion: null, candidates: [] };

  // La complétion ne porte que sur le PREMIER mot : « open 0 » ne doit pas
  // proposer une commande à la place de son argument.
  if (prefix.includes(" ")) return { completion: null, candidates: [] };

  const candidates = commands.filter((command) => command.startsWith(prefix));

  if (candidates.length === 1) return { completion: candidates[0]!, candidates: [] };
  return { completion: null, candidates };
}

/** Normalise « 01 », « 1 », « 003 » en index à partir de 1. Null si invalide. */
export function parseIndex(value: string | undefined): number | null {
  if (!value) return null;
  if (!/^\d{1,3}$/.test(value)) return null;
  const index = Number.parseInt(value, 10);
  return index > 0 ? index : null;
}

/** Numérotation d'affichage : 1 → « 01 ». */
export function formatIndex(index: number): string {
  return String(index).padStart(2, "0");
}
