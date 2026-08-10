import { z } from "zod";

import {
  booleanField,
  optionalColor,
  optionalDate,
  optionalId,
  optionalNumber,
  optionalString,
  optionalText,
  optionalUrl,
  requiredString,
  slugField,
  stringListField,
} from "./common";

/** Technologies, compétences, catégories, réalisations et services. */

export const PROFICIENCY_LEVELS = [
  { value: "BASICS", label: "Notions", description: "Premiers pas, usage encadré" },
  { value: "GOOD_KNOWLEDGE", label: "Bonnes connaissances", description: "Autonome sur les cas courants" },
  { value: "ADVANCED", label: "Avancé", description: "Utilisé en conditions réelles" },
  { value: "EXPERT", label: "Expert", description: "Maîtrise approfondie" },
] as const;

export const CATEGORY_KINDS = [
  { value: "TECH", label: "Technologie / compétence" },
  { value: "PROJECT", label: "Projet" },
] as const;

export const STAT_SOURCES = [
  { value: "PROJECTS_COUNT", label: "Nombre de projets publiés" },
  { value: "TECHNOLOGIES_COUNT", label: "Nombre de technologies" },
  { value: "EXPERIENCES_COUNT", label: "Nombre d'expériences" },
  { value: "CERTIFICATIONS_COUNT", label: "Nombre de certifications" },
  { value: "ACHIEVEMENTS_COUNT", label: "Nombre de réalisations" },
  { value: "SKILLS_COUNT", label: "Nombre de compétences" },
  { value: "YEARS_SINCE_START", label: "Années depuis le début du parcours" },
  { value: "MANUAL", label: "Valeur saisie à la main" },
] as const;

// ───────────────────────────────────────────────────────────────────────────

export const technologySchema = z.object({
  name: requiredString("Le nom", 80),
  slug: slugField(),
  categoryId: optionalId(),
  /** Clé simple-icons — évite d'avoir à téléverser un logo. */
  iconKey: optionalString(60),
  logoId: optionalId(),
  color: optionalColor(),
  url: optionalUrl(),
  featured: booleanField(false),
  visible: booleanField(true),
});

export const skillSchema = z.object({
  name: requiredString("Le nom", 120),
  categoryId: optionalId(),
  /** Lie la compétence à une technologie : logo et couleur sont réutilisés. */
  technologyId: optionalId(),
  proficiency: z.enum(["BASICS", "GOOD_KNOWLEDGE", "ADVANCED", "EXPERT"]).default("GOOD_KNOWLEDGE"),
  percent: optionalNumber(0, 100),
  iconKey: optionalString(60),
  description: optionalString(300),
  highlighted: booleanField(false),
  visible: booleanField(true),
});

export const categorySchema = z.object({
  kind: z.enum(["TECH", "PROJECT"]).default("TECH"),
  name: requiredString("Le nom", 80),
  slug: slugField(),
  description: optionalString(300),
  iconKey: optionalString(60),
  color: optionalColor(),
});

export const achievementSchema = z.object({
  title: requiredString("Le titre", 200),
  description: optionalText(2000),
  category: optionalString(80),
  organisation: optionalString(160),
  date: optionalDate(),
  year: optionalNumber(1990, 2100),
  url: optionalUrl(),
  iconKey: optionalString(60),
  featured: booleanField(false),
  visible: booleanField(true),
});

export const serviceSchema = z.object({
  title: requiredString("Le titre", 120),
  description: requiredString("La description", 600),
  iconKey: optionalString(60),
  features: stringListField(12),
  visible: booleanField(true),
});

export const statCardSchema = z
  .object({
    label: requiredString("Le libellé", 80),
    source: z.enum([
      "PROJECTS_COUNT",
      "TECHNOLOGIES_COUNT",
      "EXPERIENCES_COUNT",
      "CERTIFICATIONS_COUNT",
      "ACHIEVEMENTS_COUNT",
      "SKILLS_COUNT",
      "YEARS_SINCE_START",
      "MANUAL",
    ]),
    manualValue: optionalNumber(0, 100000),
    prefix: optionalString(10),
    suffix: optionalString(10),
    iconKey: optionalString(60),
    visible: booleanField(true),
  })
  .refine((data) => data.source !== "MANUAL" || data.manualValue !== null, {
    message: "Renseignez une valeur pour une statistique saisie à la main",
    path: ["manualValue"],
  });

export const socialLinkSchema = z.object({
  platform: requiredString("La plateforme", 40)
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets uniquement (ex. linkedin)"),
  label: requiredString("Le libellé", 60),
  url: requiredString("L'adresse", 400).refine(
    (value) => /^(https?:\/\/|mailto:)/i.test(value),
    "L'adresse doit commencer par https:// ou mailto:",
  ),
  iconKey: optionalString(60),
  inHero: booleanField(true),
  visible: booleanField(true),
});

export const qualitySchema = z.object({
  label: requiredString("Le libellé", 80),
  iconKey: optionalString(60),
});

export const languageSchema = z.object({
  name: requiredString("La langue", 60),
  level: optionalString(60),
  percent: optionalNumber(0, 100),
});

export type TechnologyOutput = z.output<typeof technologySchema>;
export type SkillOutput = z.output<typeof skillSchema>;
export type AchievementOutput = z.output<typeof achievementSchema>;
