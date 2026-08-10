import { z } from "zod";

/**
 * Briques Zod réutilisées par tous les schémas de ressources.
 *
 * Objectif : que les formulaires du back-office se comportent de la même
 * manière partout — un champ vide devient `null` et non une chaîne vide, une
 * URL est validée, une date arrive toujours sous forme de `Date`.
 */

/** Chaîne obligatoire, espaces superflus retirés. */
export const requiredString = (label: string, max = 200) =>
  z
    .string({ error: `${label} est requis` })
    .trim()
    .min(1, `${label} est requis`)
    .max(max, `${label} : ${max} caractères maximum`);

/** Chaîne facultative : « » devient `null`, ce qui évite les champs vides en base. */
export const optionalString = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null);

/** Texte long (paragraphes, Markdown léger). */
export const optionalText = (max = 8000) => optionalString(max);

/** URL facultative — accepte aussi `mailto:` pour les liens de contact. */
export const optionalUrl = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine(
      (value) => value === null || /^(https?:\/\/|mailto:|\/)/i.test(value),
      "Adresse invalide : elle doit commencer par https://, mailto: ou /",
    );

export const requiredUrl = (label: string) =>
  z
    .string({ error: `${label} est requis` })
    .trim()
    .min(1, `${label} est requis`)
    .refine(
      (value) => /^(https?:\/\/|mailto:|\/)/i.test(value),
      "Adresse invalide : elle doit commencer par https://, mailto: ou /",
    );

/** Identifiant d'URL : minuscules, chiffres et tirets uniquement. */
export const slugField = () =>
  z
    .string({ error: "Le slug est requis" })
    .trim()
    .toLowerCase()
    .min(1, "Le slug est requis")
    .max(120, "120 caractères maximum")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Uniquement des minuscules, des chiffres et des tirets (ex. mon-projet)",
    );

/**
 * Identifiant de relation facultatif.
 * Les `<select>` renvoient "" quand rien n'est choisi : on le convertit en `null`
 * pour que Prisma détache correctement la relation.
 */
export const optionalId = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null);

/** Nombre facultatif — un champ vide vaut `null`, pas `0`. */
export const optionalNumber = (min?: number, max?: number) =>
  z
    .union([z.number(), z.string()])
    .transform((value) => {
      if (typeof value === "number") return value;
      const trimmed = value.trim();
      if (trimmed === "") return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine((value) => value === null || !Number.isNaN(value), "Valeur numérique invalide")
    .refine((value) => value === null || min === undefined || value >= min, `Minimum : ${min}`)
    .refine((value) => value === null || max === undefined || value <= max, `Maximum : ${max}`);

/** Date facultative — accepte une `Date`, une chaîne ISO ou "" (→ null). */
export const optionalDate = () =>
  z
    .union([z.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) return value;
      const trimmed = value.trim();
      if (trimmed === "") return null;
      const parsed = new Date(trimmed);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    })
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine((value) => value !== undefined, "Date invalide");

export const requiredDate = (label: string) =>
  z.union([z.date(), z.string()]).transform((value, ctx) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: `${label} est requise` });
      return z.NEVER;
    }
    return parsed;
  });

export const booleanField = (defaultValue = false) => z.coerce.boolean().default(defaultValue);

export const orderField = () => z.coerce.number().int().min(0).default(0);

/** Liste d'identifiants (relation multiple), doublons retirés. */
export const idListField = () =>
  z
    .array(z.string().min(1))
    .optional()
    .default([])
    .transform((values) => Array.from(new Set(values)));

/** Liste de chaînes libres (champ `tags`). */
export const stringListField = (max = 40) =>
  z
    .array(z.string().trim().min(1).max(160))
    .max(max, `${max} entrées maximum`)
    .optional()
    .default([]);

/** Couleur hexadécimale facultative. */
export const optionalColor = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null)
    .refine(
      (value) => value === null || /^#[0-9a-f]{6}$/i.test(value),
      "Couleur invalide (format attendu : #1A2B3C)",
    );

/**
 * Cohérence des périodes : une date de fin antérieure à la date de début
 * produirait un affichage absurde dans les frises chronologiques.
 */
export function refineDateRange<T extends { startDate?: Date | null; endDate?: Date | null }>(
  schema: z.ZodType<T>,
) {
  return schema.refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: "La date de fin doit être postérieure à la date de début", path: ["endDate"] },
  );
}
