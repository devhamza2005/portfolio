import "server-only";

import {
  CONTENT_REGISTRY,
  ENTITY_KEYS,
  isSeoCritical,
  type EntityKey,
} from "@/lib/i18n/content-registry";
import { INDEX_THRESHOLDS, NOINDEX_LOCALES } from "@/lib/i18n/config";
import { db } from "@/server/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LECTURE DU BACK-OFFICE DES TRADUCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Volontairement SANS `use cache`, comme la boîte de réception : l'écran doit
 * montrer l'état réel de la base à la seconde près. Une traduction enregistrée
 * il y a dix secondes doit apparaître au rechargement suivant. La garde
 * d'authentification du layout /admin s'applique à chaque requête de toute
 * façon.
 *
 * Une seule ligne par COUPLE (élément, champ) : le français y sert de
 * référence, l'anglais et l'arabe de surcouches. Le français n'est jamais
 * stocké dans la table `Translation` — il est lu depuis sa colonne d'origine.
 */

export type TranslationRow = {
  entity: EntityKey;
  entityLabel: string;
  entityId: string;
  /** Nom lisible de l'élément — « Parking Management RFID ». */
  itemTitle: string;
  field: string;
  /** Source française, en lecture seule. */
  fr: string;
  en: string | null;
  ar: string | null;
  /** Palier A : champ qui alimente le titre ou la description SEO. */
  seoCritical: boolean;
};

export type EntityProgress = {
  entity: EntityKey;
  label: string;
  total: number;
  en: number;
  ar: number;
};

export type TranslationDashboard = {
  rows: TranslationRow[];
  progress: EntityProgress[];
  totals: { total: number; en: number; ar: number };
  /** Palier A — champs critiques pour le référencement. */
  seo: { total: number; en: number; ar: number };
  /** État d'indexabilité par locale — informatif, jamais appliqué tout seul. */
  indexability: LocaleIndexability[];
};

export type LocaleIndexability = {
  locale: "en" | "ar";
  /** Palier A : 100 % exigés. */
  seoRatio: number;
  /** Palier B : 90 % exigés. */
  bodyRatio: number;
  /** Les deux seuils sont-ils atteints ? */
  eligible: boolean;
  /** La locale est-elle actuellement en `noindex` ? */
  noindex: boolean;
};

type AnyDelegate = { findMany: (args?: unknown) => Promise<Record<string, unknown>[]> };

function delegateFor(entity: EntityKey): AnyDelegate {
  const client = db as unknown as Record<string, AnyDelegate>;
  const found = client[CONTENT_REGISTRY[entity].model];
  if (!found) throw new Error(`Modèle Prisma inconnu : ${CONTENT_REGISTRY[entity].model}`);
  return found;
}

/** Texte non vide ? Une chaîne d'espaces ne constitue pas du contenu. */
function filled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Construit le tableau de bord complet.
 *
 * Les lignes ne sont produites que pour les champs français RÉELLEMENT
 * remplis : proposer de traduire un champ vide n'aurait aucun sens et
 * gonflerait artificiellement le dénominateur de la progression.
 */
export async function getTranslationDashboard(): Promise<TranslationDashboard> {
  const existing = await db.translation.findMany({
    select: { entity: true, entityId: true, locale: true, field: true, value: true },
  });

  const byKey = new Map<string, string>();
  for (const row of existing) {
    byKey.set(`${row.entity}|${row.entityId}|${row.locale}|${row.field}`, row.value);
  }

  const rows: TranslationRow[] = [];
  const progress: EntityProgress[] = [];

  for (const entity of ENTITY_KEYS) {
    const def = CONTENT_REGISTRY[entity];

    const select: Record<string, boolean> = { id: true, [def.titleField]: true };
    for (const field of def.fields) select[field] = true;
    for (const field of def.arrayFields ?? []) select[field] = true;

    const records = await delegateFor(entity).findMany({ select });

    let total = 0;
    let en = 0;
    let ar = 0;

    for (const record of records) {
      const entityId = String(record["id"]);
      const itemTitle = filled(record[def.titleField])
        ? (record[def.titleField] as string).slice(0, 80)
        : entityId.slice(0, 8);

      /** Ajoute une ligne pour un champ français non vide. */
      const push = (field: string, fr: string) => {
        const valueEn = byKey.get(`${entity}|${entityId}|en|${field}`) ?? null;
        const valueAr = byKey.get(`${entity}|${entityId}|ar|${field}`) ?? null;

        total++;
        if (filled(valueEn)) en++;
        if (filled(valueAr)) ar++;

        rows.push({
          entity,
          entityLabel: def.label,
          entityId,
          itemTitle,
          field,
          fr,
          en: valueEn,
          ar: valueAr,
          seoCritical: isSeoCritical(entity, field),
        });
      };

      for (const field of def.fields) {
        if (filled(record[field])) push(field, record[field] as string);
      }

      for (const name of def.arrayFields ?? []) {
        const items = record[name];
        if (!Array.isArray(items)) continue;
        items.forEach((item, index) => {
          if (filled(item)) push(`${name}.${index}`, item);
        });
      }
    }

    progress.push({ entity, label: def.label, total, en, ar });
  }

  const totals = progress.reduce(
    (acc, item) => ({ total: acc.total + item.total, en: acc.en + item.en, ar: acc.ar + item.ar }),
    { total: 0, en: 0, ar: 0 },
  );

  const critiques = rows.filter((row) => row.seoCritical);
  const seo = {
    total: critiques.length,
    en: critiques.filter((row) => filled(row.en)).length,
    ar: critiques.filter((row) => filled(row.ar)).length,
  };

  const indexability: LocaleIndexability[] = (["en", "ar"] as const).map((locale) => {
    const seoDone = locale === "en" ? seo.en : seo.ar;
    const allDone = locale === "en" ? totals.en : totals.ar;

    // Le palier B porte sur le contenu NON critique : on retire le palier A
    // des deux termes, sinon les champs SEO seraient comptés deux fois.
    const bodyTotal = totals.total - seo.total;
    const bodyDone = allDone - seoDone;

    const seoRatio = seo.total === 0 ? 1 : seoDone / seo.total;
    const bodyRatio = bodyTotal === 0 ? 1 : bodyDone / bodyTotal;

    return {
      locale,
      seoRatio,
      bodyRatio,
      eligible:
        seoRatio >= INDEX_THRESHOLDS.seoCritical && bodyRatio >= INDEX_THRESHOLDS.body,
      noindex: (NOINDEX_LOCALES as readonly string[]).includes(locale),
    };
  });

  return { rows, progress, totals, seo, indexability };
}
