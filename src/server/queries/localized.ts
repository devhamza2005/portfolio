import "server-only";

import { localizeRow, localizeRows } from "@/lib/i18n/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import {
  getAchievements,
  getCertifications,
  getEducation,
  getExperiences,
  getLanguages,
  getProfile,
  getProjectBySlug,
  getProjectCategories,
  getProjects,
  getQualities,
  getServices,
  getSkillGroups,
  getStats,
  getSocialLinks,
} from "@/server/queries/portfolio";
import { getTranslationMap } from "@/server/queries/translations";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LECTURES LOCALISÉES — français + traductions fusionnés
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Couche MINCE au-dessus de `portfolio.ts`, qui n'est pas modifié : les
 * requêtes d'origine continuent de renvoyer le français, cachées et balisées
 * exactement comme avant. Ici on ne fait que superposer les traductions.
 *
 * Sur `/fr`, `getTranslationMap` retourne immédiatement une Map vide sans
 * toucher la base, et `localizeRows` renvoie les objets tels quels : le chemin
 * français ne coûte donc rien de plus qu'avant la phase B.
 *
 * Chaque fonction reçoit `locale` explicitement — jamais depuis un cookie ni
 * un en-tête. Les deux lectures partent en parallèle.
 */

export async function getProfileLocalized(locale: Locale) {
  const [profile, map] = await Promise.all([getProfile(), getTranslationMap("profile", locale)]);
  return profile ? localizeRow("profile", profile, map) : profile;
}

export async function getServicesLocalized(locale: Locale) {
  const [services, map] = await Promise.all([getServices(), getTranslationMap("service", locale)]);
  return localizeRows("service", services, map);
}

export async function getQualitiesLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([getQualities(), getTranslationMap("quality", locale)]);
  return localizeRows("quality", rows, map);
}

export async function getLanguagesLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([getLanguages(), getTranslationMap("language", locale)]);
  return localizeRows("language", rows, map);
}

export async function getSocialLinksLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([getSocialLinks(), getTranslationMap("socialLink", locale)]);
  return localizeRows("socialLink", rows, map);
}

export async function getStatsLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([getStats(), getTranslationMap("statCard", locale)]);
  return localizeRows("statCard", rows, map);
}

export async function getAchievementsLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([
    getAchievements(),
    getTranslationMap("achievement", locale),
  ]);
  return localizeRows("achievement", rows, map);
}

export async function getCertificationsLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([
    getCertifications(),
    getTranslationMap("certification", locale),
  ]);
  return localizeRows("certification", rows, map);
}

export async function getEducationLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([getEducation(), getTranslationMap("education", locale)]);
  return localizeRows("education", rows, map);
}

/** Expériences — les points forts sont une relation, traduite séparément. */
export async function getExperiencesLocalized(locale: Locale) {
  const [rows, experienceMap, highlightMap] = await Promise.all([
    getExperiences(),
    getTranslationMap("experience", locale),
    getTranslationMap("experienceHighlight", locale),
  ]);

  if (locale === DEFAULT_LOCALE) return rows;

  return rows.map((row) => ({
    ...localizeRow("experience", row, experienceMap),
    highlights: localizeRows("experienceHighlight", row.highlights, highlightMap),
  }));
}

/**
 * Groupes de compétences.
 *
 * Le nom du groupe vient de `Category`, les compétences de `Skill` : deux
 * entités distinctes dans le registre. `group.id` EST l'identifiant de la
 * catégorie (voir `getSkillGroups`), la traduction s'applique donc directement.
 */
export async function getSkillGroupsLocalized(locale: Locale) {
  const [groups, categoryMap, skillMap] = await Promise.all([
    getSkillGroups(),
    getTranslationMap("category", locale),
    getTranslationMap("skill", locale),
  ]);

  if (locale === DEFAULT_LOCALE) return groups;

  return groups.map((group) => ({
    ...group,
    name: categoryMap.get(`${group.id}.name`) ?? group.name,
    skills: localizeRows("skill", group.skills, skillMap),
  }));
}

/** Cartes de projet — le nom de la catégorie est traduit au passage. */
export async function getProjectsLocalized(locale: Locale) {
  const [projects, projectMap, categoryMap] = await Promise.all([
    getProjects(),
    getTranslationMap("project", locale),
    getTranslationMap("category", locale),
  ]);

  if (locale === DEFAULT_LOCALE) return projects;

  return projects.map((project) => {
    const localized = localizeRow("project", project, projectMap);
    return project.category
      ? {
          ...localized,
          category: {
            ...project.category,
            name: categoryMap.get(`${project.category.id}.name`) ?? project.category.name,
          },
        }
      : localized;
  });
}

export async function getProjectCategoriesLocalized(locale: Locale) {
  const [rows, map] = await Promise.all([
    getProjectCategories(),
    getTranslationMap("category", locale),
  ]);
  return localizeRows("category", rows, map);
}

/**
 * Étude de cas complète.
 *
 * Cinq entités à fusionner : le projet, ses fonctionnalités, ses défis, ses
 * métriques et ses légendes d'images. `id`, `slug`, technologies et médias
 * restent strictement identiques dans les trois langues.
 */
export async function getProjectBySlugLocalized(slug: string, locale: Locale) {
  const [project, projectMap, featureMap, challengeMap, metricMap, imageMap, categoryMap] =
    await Promise.all([
      getProjectBySlug(slug),
      getTranslationMap("project", locale),
      getTranslationMap("projectFeature", locale),
      getTranslationMap("projectChallenge", locale),
      getTranslationMap("projectMetric", locale),
      getTranslationMap("projectImage", locale),
      getTranslationMap("category", locale),
    ]);

  if (!project || locale === DEFAULT_LOCALE) return project;

  return {
    ...localizeRow("project", project, projectMap),
    category: project.category
      ? {
          ...project.category,
          name: categoryMap.get(`${project.category.id}.name`) ?? project.category.name,
        }
      : project.category,
    features: localizeRows("projectFeature", project.features, featureMap),
    challenges: localizeRows("projectChallenge", project.challenges, challengeMap),
    metrics: localizeRows("projectMetric", project.metrics, metricMap),
    images: localizeRows("projectImage", project.images, imageMap),
  };
}
