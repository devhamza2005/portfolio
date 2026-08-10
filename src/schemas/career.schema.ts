import { z } from "zod";

import {
  booleanField,
  optionalDate,
  optionalId,
  optionalString,
  optionalText,
  optionalUrl,
  requiredDate,
  requiredString,
} from "./common";

/** Expériences professionnelles, formations et certifications. */

export const EMPLOYMENT_TYPES = [
  { value: "INTERNSHIP", label: "Stage" },
  { value: "APPRENTICESHIP", label: "Alternance" },
  { value: "FULL_TIME", label: "Temps plein" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "PROJECT", label: "Projet / PFE" },
] as const;

export const WORK_MODES = [
  { value: "ONSITE", label: "Sur site" },
  { value: "HYBRID", label: "Hybride" },
  { value: "REMOTE", label: "À distance" },
] as const;

export const EDUCATION_STATUSES = [
  { value: "COMPLETED", label: "Obtenu" },
  { value: "PENDING_DIPLOMA", label: "En attente de délivrance" },
  { value: "ONGOING", label: "En cours" },
] as const;

// ───────────────────────────────────────────────────────────────────────────
//  EXPÉRIENCE
// ───────────────────────────────────────────────────────────────────────────

export const experienceSchema = z
  .object({
    company: requiredString("L'entreprise", 200),
    role: requiredString("Le poste", 200),
    employmentType: z
      .enum(["INTERNSHIP", "APPRENTICESHIP", "FULL_TIME", "PART_TIME", "FREELANCE", "PROJECT"])
      .default("INTERNSHIP"),
    workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]).nullable().optional().default(null),
    location: optionalString(160),
    companyUrl: optionalUrl(),
    logoId: optionalId(),

    startDate: requiredDate("La date de début"),
    endDate: optionalDate(),
    current: booleanField(false),

    description: optionalText(3000),
    visible: booleanField(true),

    highlights: z
      .array(z.object({ text: requiredString("Le texte", 500) }))
      .max(20, "20 missions maximum")
      .optional()
      .default([]),

    technologies: z
      .array(z.string().min(1))
      .optional()
      .default([])
      .transform((ids) => Array.from(new Set(ids)).map((technologyId) => ({ technologyId }))),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"],
  })
  .refine((data) => !(data.current && data.endDate), {
    message: "Un poste en cours ne peut pas avoir de date de fin",
    path: ["endDate"],
  });

// ───────────────────────────────────────────────────────────────────────────
//  FORMATION
// ───────────────────────────────────────────────────────────────────────────

export const educationSchema = z
  .object({
    school: requiredString("L'établissement", 200),
    degree: requiredString("Le diplôme", 200),
    field: optionalString(200),

    grade: optionalString(40),
    mention: optionalString(60),
    honors: optionalString(200),

    status: z.enum(["COMPLETED", "PENDING_DIPLOMA", "ONGOING"]).default("COMPLETED"),

    startDate: optionalDate(),
    endDate: optionalDate(),
    location: optionalString(160),
    schoolUrl: optionalUrl(),
    logoId: optionalId(),

    description: optionalText(3000),
    visible: booleanField(true),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"],
  });

// ───────────────────────────────────────────────────────────────────────────
//  CERTIFICATION
// ───────────────────────────────────────────────────────────────────────────

export const certificationSchema = z
  .object({
    name: requiredString("Le nom", 200),
    issuer: requiredString("L'organisme", 200),

    issueDate: optionalDate(),
    expiryDate: optionalDate(),

    credentialId: optionalString(120),
    credentialUrl: optionalUrl(),

    description: optionalText(2000),

    imageId: optionalId(),
    fileUrl: optionalUrl(),

    featured: booleanField(false),
    visible: booleanField(true),
  })
  .refine((data) => !data.issueDate || !data.expiryDate || data.expiryDate >= data.issueDate, {
    message: "La date d'expiration doit être postérieure à la date d'obtention",
    path: ["expiryDate"],
  });

export type ExperienceOutput = z.output<typeof experienceSchema>;
export type EducationOutput = z.output<typeof educationSchema>;
export type CertificationOutput = z.output<typeof certificationSchema>;
