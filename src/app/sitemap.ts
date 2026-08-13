import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, LOCALES, isNoindexLocale, localizedPath } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";
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
 *
 * ── Multilingue ────────────────────────────────────────────────────────────
 *
 * Seules les locales INDEXABLES figurent dans le plan. En phase A, le contenu
 * éditorial n'est traduit ni en anglais ni en arabe : y envoyer un moteur
 * reviendrait à lui soumettre trois fois la même page. `/fr` est donc la seule
 * langue listée pour l'instant, et chaque entrée déclare quand même ses
 * `alternates` — c'est ce couple sitemap + hreflang que Google attend.
 *
 * Ouvrir `/en` et `/ar` à l'indexation ne demandera aucune modification ici :
 * il suffira de les retirer de `NOINDEX_LOCALES`.
 */

const INDEXABLE = LOCALES.filter((locale) => !isNoindexLocale(locale));

/** Bloc `alternates.languages` d'une entrée : les trois langues + x-default. */
function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));

  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, projects] = await Promise.all([getProfile(), getPublishedProjectRefs()]);

  // Le projet modifié le plus récemment date la page de liste.
  const projectsUpdatedAt = projects.reduce<Date | null>(
    (latest, project) => (!latest || project.updatedAt > latest ? project.updatedAt : latest),
    null,
  );

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of INDEXABLE) {
    entries.push({
      url: absoluteUrl(localizedPath(locale, "/")),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: languagesFor("/") },
      ...(profile?.updatedAt ? { lastModified: profile.updatedAt } : {}),
    });

    entries.push({
      url: absoluteUrl(localizedPath(locale, "/projects")),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: languagesFor("/projects") },
      ...(projectsUpdatedAt ? { lastModified: projectsUpdatedAt } : {}),
    });

    for (const project of projects) {
      const path = `/projects/${project.slug}`;
      entries.push({
        url: absoluteUrl(localizedPath(locale, path)),
        lastModified: project.updatedAt,
        changeFrequency: "yearly",
        priority: 0.7,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
