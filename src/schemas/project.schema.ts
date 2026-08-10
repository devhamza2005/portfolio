import { z } from "zod";

import {
  booleanField,
  optionalDate,
  optionalId,
  optionalNumber,
  optionalString,
  optionalText,
  optionalUrl,
  requiredString,
  slugField,
} from "./common";

/**
 * Projet — inclut l'intégralité du contenu de la case study (§24).
 *
 * Les collections enfants (technologies, fonctionnalités, défis, métriques,
 * captures) sont transformées ici au format attendu par Prisma : le moteur CRUD
 * générique les remplace ensuite intégralement, en conservant l'ordre saisi.
 */

export const PROJECT_STATUSES = [
  { value: "COMPLETED", label: "Terminé" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "MAINTAINED", label: "Maintenu" },
  { value: "ARCHIVED", label: "Archivé" },
] as const;

export const PROJECT_IMAGE_KINDS = [
  { value: "SCREENSHOT", label: "Capture d'écran" },
  { value: "DIAGRAM", label: "Schéma / diagramme" },
  { value: "MOCKUP", label: "Maquette" },
  { value: "LOGO", label: "Logo" },
] as const;

const featureSchema = z.object({
  title: requiredString("Le titre", 160),
  description: optionalText(1200),
  iconKey: optionalString(60),
});

const challengeSchema = z.object({
  title: requiredString("Le titre", 160),
  problem: requiredString("La problématique", 2000),
  solution: requiredString("La solution", 2000),
});

const metricSchema = z.object({
  label: requiredString("Le libellé", 80),
  value: requiredString("La valeur", 40),
  unit: optionalString(20),
  iconKey: optionalString(60),
});

const imageSchema = z.object({
  mediaId: z.string().min(1, "Image requise"),
  kind: z.enum(["SCREENSHOT", "DIAGRAM", "MOCKUP", "LOGO"]).default("SCREENSHOT"),
  caption: optionalString(200),
});

export const projectSchema = z.object({
  // ── Identité ────────────────────────────────────────────────────────────
  title: requiredString("Le titre", 160),
  slug: slugField(),
  subtitle: optionalString(200),
  summary: requiredString("Le résumé", 600),
  categoryId: optionalId(),
  status: z.enum(["COMPLETED", "IN_PROGRESS", "MAINTAINED", "ARCHIVED"]).default("COMPLETED"),

  // ── Contexte ────────────────────────────────────────────────────────────
  context: optionalString(160),
  role: optionalString(200),
  client: optionalString(200),
  teamSize: optionalNumber(1, 100),
  year: optionalNumber(1990, 2100),
  startDate: optionalDate(),
  endDate: optionalDate(),

  // ── Médias et liens ─────────────────────────────────────────────────────
  coverId: optionalId(),
  demoUrl: optionalUrl(),
  repoUrl: optionalUrl(),
  docUrl: optionalUrl(),

  // ── Case study — toute section vide est masquée à l'affichage ───────────
  overview: optionalText(),
  problem: optionalText(),
  solution: optionalText(),
  architecture: optionalText(),
  results: optionalText(),
  learnings: optionalText(),

  // ── Publication ─────────────────────────────────────────────────────────
  featured: booleanField(false),
  published: booleanField(true),

  // ── Collections enfants ─────────────────────────────────────────────────
  // Le formulaire manipule des identifiants ; Prisma attend des lignes de
  // table de liaison. La conversion se fait ici, une seule fois.
  technologies: z
    .array(z.string().min(1))
    .optional()
    .default([])
    .transform((ids) =>
      Array.from(new Set(ids)).map((technologyId) => ({ technologyId })),
    ),

  features: z.array(featureSchema).max(40, "40 fonctionnalités maximum").optional().default([]),
  challenges: z.array(challengeSchema).max(20, "20 défis maximum").optional().default([]),
  metrics: z.array(metricSchema).max(12, "12 métriques maximum").optional().default([]),
  images: z.array(imageSchema).max(30, "30 images maximum").optional().default([]),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectOutput = z.output<typeof projectSchema>;
