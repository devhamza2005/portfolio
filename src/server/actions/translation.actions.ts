"use server";

import { updateTag } from "next/cache";

import {
  CONTENT_REGISTRY,
  isEntityKey,
  isTranslatableField,
  type EntityKey,
} from "@/lib/i18n/content-registry";
import {
  translationDeleteSchema,
  translationUpsertSchema,
} from "@/schemas/translation.schema";
import { db } from "@/server/db";
import { UnauthorizedError, requireAdminOrThrow } from "@/server/guards";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ACTIONS DE TRADUCTION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Mêmes garanties, dans le même ordre, que `resource.actions.ts` (§15) :
 *
 *    requireAdminOrThrow()   ← authentification, avant toute autre chose
 *    schema.parse(input)     ← forme validée par Zod
 *    registre                ← l'entité ET le champ sont-ils traduisibles ?
 *    existence en base       ← la ligne visée existe-t-elle vraiment ?
 *    upsert / delete
 *    updateTag(…)            ← le site public reflète le changement aussitôt
 *
 * ── Les trois contrôles qui comptent ──────────────────────────────────────
 *
 * La table `Translation` est générique : sans garde-fou, une requête forgée
 * pourrait écrire sur `passwordHash` ou sur un identifiant inventé. D'où :
 *
 *  1. `isEntityKey` — l'entité figure au registre ;
 *  2. `isTranslatableField` — le champ est déclaré traduisible pour CETTE
 *     entité (les autres sont refusés, y compris s'ils existent en base) ;
 *  3. vérification d'existence — `entityId` désigne une vraie ligne.
 *
 * Aucun de ces contrôles ne dépend de l'interface : ils vivent dans le corps
 * de la fonction serveur.
 *
 * Le FRANÇAIS n'est jamais écrit ici : `locale` n'accepte que `en` et `ar`,
 * au niveau de Zod comme du type PostgreSQL.
 */

export type TranslationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** Delegate Prisma du modèle visé — seul point où le typage est élargi. */
type ExistenceDelegate = { count: (args: unknown) => Promise<number> };

function delegateFor(entity: EntityKey): ExistenceDelegate {
  const model = CONTENT_REGISTRY[entity].model;
  const client = db as unknown as Record<string, ExistenceDelegate>;
  const found = client[model];
  if (!found) throw new Error(`Modèle Prisma inconnu : ${model}`);
  return found;
}

/**
 * Invalide le cache public.
 *
 * Trois granularités : toutes les traductions, celles de l'entité, celles de
 * l'entité dans la langue modifiée. `portfolio` couvre les pages qui agrègent
 * plusieurs entités.
 */
function revalidateTranslation(entity: string, locale: string) {
  updateTag("translations");
  updateTag(`translations:${entity}`);
  updateTag(`translations:${entity}:${locale}`);
  updateTag("portfolio");
}

/** Contrôles communs aux deux actions. Retourne l'entrée normalisée. */
async function guard(input: {
  entity: string;
  entityId: string;
  field: string;
}): Promise<{ ok: true; entity: EntityKey } | { ok: false; error: string }> {
  if (!isEntityKey(input.entity)) {
    return { ok: false, error: "Entité inconnue." };
  }

  if (!isTranslatableField(input.entity, input.field)) {
    return { ok: false, error: `Le champ « ${input.field} » n'est pas traduisible.` };
  }

  const exists = await delegateFor(input.entity).count({ where: { id: input.entityId } });
  if (exists === 0) {
    return { ok: false, error: "L'élément à traduire n'existe pas." };
  }

  return { ok: true, entity: input.entity };
}

/**
 * Crée ou met à jour une traduction.
 *
 * Une valeur vide SUPPRIME la traduction plutôt que d'enregistrer une chaîne
 * vide : le contenu retombe alors proprement sur le français, au lieu
 * d'afficher un blanc à l'écran.
 */
export async function upsertTranslationAction(
  input: unknown,
): Promise<TranslationResult> {
  try {
    await requireAdminOrThrow();

    const parsed = translationUpsertSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const { entity, entityId, locale, field, value } = parsed.data;

    const checked = await guard({ entity, entityId, field });
    if (!checked.ok) return checked;

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      await db.translation.deleteMany({ where: { entity, entityId, locale, field } });
      revalidateTranslation(entity, locale);
      return { ok: true, message: "Traduction retirée — le français reprend la main." };
    }

    await db.translation.upsert({
      where: { entity_entityId_locale_field: { entity, entityId, locale, field } },
      create: { entity, entityId, locale, field, value: trimmed },
      update: { value: trimmed },
    });

    revalidateTranslation(entity, locale);
    return { ok: true, message: "Traduction enregistrée." };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Session expirée. Reconnectez-vous." };
    }
    console.error("[translation.actions] upsert", error);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
}

/** Supprime une traduction — le contenu retombe sur le français. */
export async function deleteTranslationAction(
  input: unknown,
): Promise<TranslationResult> {
  try {
    await requireAdminOrThrow();

    const parsed = translationDeleteSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const { entity, entityId, locale, field } = parsed.data;

    if (!isEntityKey(entity)) return { ok: false, error: "Entité inconnue." };

    await db.translation.deleteMany({ where: { entity, entityId, locale, field } });

    revalidateTranslation(entity, locale);
    return { ok: true, message: "Traduction supprimée." };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Session expirée. Reconnectez-vous." };
    }
    console.error("[translation.actions] delete", error);
    return { ok: false, error: "La suppression a échoué." };
  }
}
