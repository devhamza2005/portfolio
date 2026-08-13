import {
  CONTENT_REGISTRY,
  parseArrayField,
  type EntityKey,
} from "@/lib/i18n/content-registry";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FUSION FRANÇAIS + TRADUCTION — abstraction unique du fallback
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Toute la règle de repli vit ici, et nulle part ailleurs :
 *
 *   fr → la valeur d'origine, telle qu'elle est en base ;
 *   en → la traduction anglaise si elle existe, sinon le français ;
 *   ar → la traduction arabe si elle existe, sinon le français.
 *
 * Aucun composant, aucune page ne réimplémente ce comportement.
 *
 * ── Ce qui n'est jamais touché ────────────────────────────────────────────
 *
 * `id`, `slug`, les relations, les médias, les technologies, l'ordre, les
 * booléens, les dates : les objets conservent EXACTEMENT leur forme. Seules
 * les chaînes déclarées au registre sont remplacées, ce qui permet de brancher
 * la traduction sans modifier un seul composant d'affichage.
 *
 * Ces fonctions sont volontairement synchrones et pures : la Map est chargée
 * une fois par entité (voir src/server/queries/translations.ts), puis
 * appliquée en mémoire.
 */

type Row = { id: string } & Record<string, unknown>;

/** Traductions d'une entité : `<entityId>.<field>` → valeur. */
type Map_ = ReadonlyMap<string, string>;

/**
 * Applique les traductions à UNE ligne.
 *
 * Retourne l'objet inchangé s'il n'y a rien à substituer — ce qui est toujours
 * le cas en français, et donc le chemin le plus fréquent.
 */
export function localizeRow<T extends Row>(entity: EntityKey, row: T, map: Map_): T {
  if (map.size === 0) return row;

  const def = CONTENT_REGISTRY[entity];
  let patched: Record<string, unknown> | null = null;

  for (const field of def.fields) {
    const value = map.get(`${row.id}.${field}`);
    if (value === undefined) continue;
    // Ne traduire qu'un champ qui porte réellement du texte : si le français
    // est vide, la section est masquée, et une traduction ne doit pas la
    // faire réapparaître avec un contenu orphelin.
    if (typeof row[field] !== "string" || (row[field] as string).length === 0) continue;
    patched ??= { ...row };
    patched[field] = value;
  }

  for (const name of def.arrayFields ?? []) {
    const original = row[name];
    if (!Array.isArray(original)) continue;

    let items: string[] | null = null;
    for (let index = 0; index < original.length; index++) {
      const value = map.get(`${row.id}.${name}.${index}`);
      if (value === undefined) continue;
      items ??= [...(original as string[])];
      items[index] = value;
    }
    if (items) {
      patched ??= { ...row };
      patched[name] = items;
    }
  }

  return (patched ?? row) as T;
}

/** Applique les traductions à une collection. */
export function localizeRows<T extends Row>(
  entity: EntityKey,
  rows: readonly T[],
  map: Map_,
): T[] {
  if (map.size === 0) return rows as T[];
  return rows.map((row) => localizeRow(entity, row, map));
}

/**
 * Valeur traduite d'un champ isolé.
 *
 * Utile là où l'on ne dispose pas de l'objet complet — le calcul de complétude,
 * par exemple. `original` est toujours le français.
 */
export function localizeValue(
  map: Map_,
  entityId: string,
  field: string,
  original: string | null,
): string | null {
  if (map.size === 0) return original;
  if (original === null || original.length === 0) return original;
  return map.get(`${entityId}.${field}`) ?? original;
}

/**
 * Libellé lisible d'un champ, pour le back-office.
 *
 * Les éléments de tableau sont numérotés à partir de 1 : un administrateur
 * compte « Point 1 », pas « features.0 ».
 */
export function fieldLabel(field: string): string {
  const array = parseArrayField(field);
  if (array) return `${array.name} — ${array.index + 1}`;
  return field;
}
