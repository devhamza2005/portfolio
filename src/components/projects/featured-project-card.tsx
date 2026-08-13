import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";

import { localizedPath, type Locale } from "@/lib/i18n/config";

import { Icon } from "@/components/admin/icon";
import { GithubIcon } from "@/components/brand/brand-icons";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Cover } from "@/components/projects/project-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";

/**
 * Carte du projet vedette — mise en page horizontale, plus généreuse.
 *
 * Le projet Convention Management mérite ce traitement : c'est la réalisation
 * professionnelle réelle, celle qu'un recruteur doit voir en premier.
 *
 * Séparée de `project-card.tsx` pour une raison précise : elle affiche les
 * logos des technologies, dont le nom n'est connu qu'à l'exécution, et doit
 * donc importer toute la bibliothèque Lucide. Elle n'est rendue que côté
 * serveur, depuis la section « Projets » de l'accueil — la grille filtrable,
 * elle, est un composant client et ne touche jamais ce fichier.
 */
export function FeaturedProjectCard({
  project,
  locale,
  readCaseStudy,
  newWindow,
  featuredBadge,
}: {
  project: ProjectCardData;
  locale: Locale;
  readCaseStudy: string;
  newWindow: string;
  featuredBadge: string;
}) {
  return (
    <SpotlightCard as="article" className="rounded-[var(--radius-xl)]">
      <Card variant="gradient" className="group overflow-hidden p-0">
        <div className="grid lg:grid-cols-2">
          <div className="bg-elevated relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
            <Cover
              cover={project.cover}
              title={project.title}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="ember" size="md">
                <Star className="size-3" />
                {featuredBadge}
              </Badge>
              {project.category ? (
                <Badge variant="brand" size="md">
                  {project.category.name}
                </Badge>
              ) : null}
              {project.context ? (
                <Badge variant="outline" size="md">
                  {project.context}
                </Badge>
              ) : null}
            </div>

            <h3 className="text-display-sm font-display mb-2">{project.title}</h3>

            {project.subtitle ? (
              <p className="text-brand mb-4 text-sm font-medium">{project.subtitle}</p>
            ) : null}

            <p className="text-muted mb-6 leading-relaxed">{project.summary}</p>

            {project.technologies.length > 0 ? (
              <ul className="mb-6 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 8).map(({ technology }) => (
                  <li key={technology.id}>
                    <Badge variant="outline" size="sm">
                      {technology.iconKey ? (
                        <Icon
                          name={technology.iconKey}
                          fallback="Boxes"
                          style={technology.color ? { color: technology.color } : undefined}
                        />
                      ) : null}
                      {technology.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={localizedPath(locale, `/projects/${project.slug}`)}
                className="bg-brand-solid text-brand-contrast hover:bg-brand-solid-hover inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium transition-colors"
              >
                {readCaseStudy}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </Link>

              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border-border text-muted hover:text-foreground hover:border-border-strong inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border px-5 text-sm font-medium transition-colors"
                >
                  <GithubIcon className="size-4" />
                  Code
                  <span className="sr-only">{newWindow}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </SpotlightCard>
  );
}
