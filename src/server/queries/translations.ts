import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { EntityKey } from "@/lib/i18n/content-registry";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { db } from "@/server/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CHARGEMENT DES TRADUCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Comment cela s'articule avec Cache Components ─────────────────────────
 *
 * `locale` est un ARGUMENT de la fonction cachée : il entre donc dans sa clé
 * de cache. `/fr`, `/en` et `/ar` ne peuvent pas se partager une entrée par
 * accident. Aucune lecture de `headers()` ni de `cookies()` — la locale vient
 * du segment d'URL, comme partout depuis la phase A.
 *
 * ── Pourquoi les requêtes françaises ne changent pas ──────────────────────
 *
 * `getProjects()`, `getProfile()` et les quinze autres restent strictement
 * identiques : elles renvoient le français, cachées et balisées comme avant.
 * Les traductions sont chargées À PART puis fusionnées. Faire entrer la locale
 * dans le cache de TOUT le contenu en aurait triplé le volume pour rien, le
 * français étant identique dans les trois langues.
 *
 * ── Coût réel ─────────────────────────────────────────────────────────────
 *
 * Une requête par entité et par langue, mise en cache `max`. Sur `/fr`, la
 * fonction sort immédiatement sans toucher la base : zéro surcoût sur la
 * langue principale, qui est aussi la plus visitée.
 */

/** Clé de recherche d'une traduction : `<entityId>.<field>`. */
export type TranslationMap = ReadonlyMap<string, string>;

const EMPTY: TranslationMap = new Map();

/** Clé utilisée dans la Map. */
export function translationKey(entityId: string, field: string): string {
  return `${entityId}.${field}`;
}

/**
 * Traductions d'une entité dans une langue.
 *
 * Les balises permettent une invalidation à trois granularités : toutes les
 * traductions, celles d'une entité, ou celles d'une entité dans une langue.
 */
export async function getTranslationMap(
  entity: EntityKey,
  locale: Locale,
): Promise<TranslationMap> {
  "use cache";
  cacheTag(
    "translations",
    `translations:${entity}`,
    `translations:${entity}:${locale}`,
    "portfolio",
  );
  cacheLife("max");

  // Le français vit dans les colonnes d'origine : rien à charger.
  if (locale === DEFAULT_LOCALE) return EMPTY;

  const rows = await db.translation.findMany({
    where: { entity, locale },
    select: { entityId: true, field: true, value: true },
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    // Une chaîne vide n'est pas une traduction : elle doit retomber sur le
    // français plutôt que d'effacer le contenu à l'écran.
    if (row.value.trim().length > 0) map.set(translationKey(row.entityId, row.field), row.value);
  }

  return map;
}

/** Traductions de plusieurs entités en une fois — une requête cachée par entité. */
export async function getTranslationMaps(
  entities: readonly EntityKey[],
  locale: Locale,
): Promise<Record<string, TranslationMap>> {
  if (locale === DEFAULT_LOCALE) {
    return Object.fromEntries(entities.map((entity) => [entity, EMPTY]));
  }

  const maps = await Promise.all(entities.map((entity) => getTranslationMap(entity, locale)));
  return Object.fromEntries(entities.map((entity, index) => [entity, maps[index]!]));
}

/**
 * Nombre de traductions renseignées par entité et par langue.
 *
 * Alimente la progression du back-office et le calcul d'indexabilité. Compté
 * en base plutôt qu'en mémoire : `groupBy` évite de rapatrier 500 valeurs de
 * texte pour n'en tirer que des totaux.
 */
export async function getTranslationCounts(): Promise<
  { entity: string; locale: string; count: number }[]
> {
  "use cache";
  cacheTag("translations", "portfolio");
  cacheLife("max");

  const rows = await db.translation.groupBy({
    by: ["entity", "locale"],
    _count: { _all: true },
  });

  return rows.map((row) => ({
    entity: row.entity,
    locale: row.locale,
    count: row._count._all,
  }));
}
