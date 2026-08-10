import "server-only";

import { db } from "@/server/db";

/**
 * Statistiques du portfolio.
 *
 * ⚠️ Aucun chiffre n'est écrit en dur (§25). Chaque valeur provient d'un
 * `count()` réel ou d'un calcul sur les données existantes. Si un projet est
 * supprimé depuis le back-office, le compteur baisse — automatiquement.
 */

export type PortfolioCounts = {
  projects: number;
  publishedProjects: number;
  technologies: number;
  skills: number;
  experiences: number;
  education: number;
  certifications: number;
  achievements: number;
  services: number;
  media: number;
  unreadMessages: number;
  yearsSinceStart: number;
};

export async function getPortfolioCounts(): Promise<PortfolioCounts> {
  const [
    projects,
    publishedProjects,
    technologies,
    skills,
    experiences,
    education,
    certifications,
    achievements,
    services,
    media,
    unreadMessages,
    profile,
  ] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { published: true } }),
    db.technology.count({ where: { visible: true } }),
    db.skill.count({ where: { visible: true } }),
    db.experience.count({ where: { visible: true } }),
    db.education.count({ where: { visible: true } }),
    db.certification.count({ where: { visible: true } }),
    db.achievement.count({ where: { visible: true } }),
    db.service.count({ where: { visible: true } }),
    db.media.count(),
    db.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    db.profile.findUnique({ where: { id: "profile" }, select: { careerStartYear: true } }),
  ]);

  const startYear = profile?.careerStartYear;
  const yearsSinceStart = startYear
    ? Math.max(0, new Date().getFullYear() - startYear)
    : 0;

  return {
    projects,
    publishedProjects,
    technologies,
    skills,
    experiences,
    education,
    certifications,
    achievements,
    services,
    media,
    unreadMessages,
    yearsSinceStart,
  };
}

/** Résout la valeur d'une carte statistique à partir de sa source. */
export function resolveStatValue(
  source: string,
  counts: PortfolioCounts,
  manualValue: number | null,
): number {
  switch (source) {
    case "PROJECTS_COUNT":
      return counts.publishedProjects;
    case "TECHNOLOGIES_COUNT":
      return counts.technologies;
    case "EXPERIENCES_COUNT":
      return counts.experiences;
    case "CERTIFICATIONS_COUNT":
      return counts.certifications;
    case "ACHIEVEMENTS_COUNT":
      return counts.achievements;
    case "SKILLS_COUNT":
      return counts.skills;
    case "YEARS_SINCE_START":
      return counts.yearsSinceStart;
    case "MANUAL":
      return manualValue ?? 0;
    default:
      return 0;
  }
}
