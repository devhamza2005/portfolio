import { z } from "zod";

import { ENTITY_KEYS } from "@/lib/i18n/content-registry";

/**
 * Validation des écritures de traduction.
 *
 * Premier filet seulement : Zod garantit la FORME (entité connue, locale
 * autorisée, longueurs). La cohérence métier — le champ est-il réellement
 * traduisible ? la ligne visée existe-t-elle ? — est vérifiée dans la Server
 * Action, contre le registre puis contre la base. Voir translation.actions.ts.
 */

/** Le français n'est jamais stocké : il vit dans les colonnes d'origine. */
export const contentLocaleSchema = z.enum(["en", "ar"]);

export type ContentLocaleInput = z.infer<typeof contentLocaleSchema>;

export const translationUpsertSchema = z.object({
  entity: z.enum(ENTITY_KEYS as [string, ...string[]]),
  entityId: z.string().trim().min(1, "Identifiant manquant").max(64),
  locale: contentLocaleSchema,
  /** Champ simple (`title`) ou élément de tableau (`features.2`). */
  field: z
    .string()
    .trim()
    .min(1, "Champ manquant")
    .max(64)
    .regex(/^[a-zA-Z]+(\.\d{1,3})?$/, "Nom de champ invalide"),
  /**
   * Une valeur vide n'est pas une erreur : elle signifie « supprimer cette
   * traduction », et le contenu retombe alors sur le français.
   */
  value: z.string().max(8000, "8000 caractères maximum"),
});

export type TranslationUpsertInput = z.infer<typeof translationUpsertSchema>;

export const translationDeleteSchema = translationUpsertSchema.pick({
  entity: true,
  entityId: true,
  locale: true,
  field: true,
});
