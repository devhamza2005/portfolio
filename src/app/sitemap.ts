import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getProfile, getPublishedProjectRefs } from "@/server/queries/portfolio";

/**
 * Plan du site — /sitemap.xml
 *
 * Les URLs sont dérivées de la base, jamais écrites en dur : publier un projet
 * depuis /admin le fait apparaître ici au recalcul suivant, le dépublier l'en
 * retire. `getPublishedProjectRefs()` filtre déjà sur `published: true`, donc
 * un brouillon ne peut pas fuiter.
 *
 * Aucune route privée n'y figure : ni /admin, ni /login, ni /api. Elles sont
 * en plus interdites dans robots.txt et marquées `noindex` par leurs
 * métadonnées — trois barrières indépendantes.
 *
 * `lastModified` vient de `updatedAt` en base. Utiliser l'heure du build
 * ferait croire aux moteurs que tout le site change à chaque déploiement, et
 * ils finissent par ignorer le signal.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getProfile(), getPublishedProjectRefs()]);

  // Le projet modifié le plus récemment date la page de liste.
  const projectsUpdatedAt = projects.reduce<Date | null>(
    (latest, project) => (!latest || project.updatedAt > latest ? project.updatedAt : latest),
    null,
  );

  const home: MetadataRoute.Sitemap[number] = {
    url: `${siteConfig.url}/`,
    changeFrequency: "monthly",
    priority: 1,
    ...(profile?.updatedAt ? { lastModified: profile.updatedAt } : {}),
  };

  const projectsIndex: MetadataRoute.Sitemap[number] = {
    url: `${siteConfig.url}/projects`,
    changeFrequency: "monthly",
    priority: 0.8,
    ...(projectsUpdatedAt ? { lastModified: projectsUpdatedAt } : {}),
  };

  const caseStudies: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [home, projectsIndex, ...caseStudies];
}
