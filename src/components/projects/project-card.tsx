import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/admin/icon";
import { GithubIcon } from "@/components/brand/brand-icons";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Terminé",
  IN_PROGRESS: "En cours",
  MAINTAINED: "Maintenu",
  ARCHIVED: "Archivé",
};

/** Vignette de couverture, avec repli sur un motif quand aucune image n'existe. */
function Cover({
  cover,
  title,
  className,
  sizes,
}: {
  cover: { url: string; alt: string } | null;
  title: string;
  className?: string;
  sizes: string;
}) {
  if (cover) {
    return (
      <Image
        src={cover.url}
        alt={cover.alt || title}
        fill
        sizes={sizes}
        className={cn("object-cover transition-transform duration-700 group-hover:scale-[1.04]", className)}
      />
    );
  }

  return (
    <div className="bg-grid flex h-full items-center justify-center">
      <span className="font-display text-subtle/60 px-6 text-center text-lg font-semibold">
        {title}
      </span>
    </div>
  );
}

/** Carte de projet standard. */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <SpotlightCard as="article" className="h-full rounded-[var(--radius-lg)]">
      <Card variant="default" interactive className="group h-full overflow-hidden p-0">
        <Link href={`/projects/${project.slug}`} className="flex h-full flex-col">
          <div className="bg-elevated relative aspect-[16/10] overflow-hidden">
            <Cover
              cover={project.cover}
              title={project.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {project.category ? (
                <Badge variant="brand" size="sm" className="backdrop-blur-sm">
                  {project.category.name}
                </Badge>
              ) : null}
              {project.status !== "COMPLETED" ? (
                <Badge variant="warning" size="sm" className="backdrop-blur-sm">
                  {STATUS_LABEL[project.status] ?? project.status}
                </Badge>
              ) : null}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="font-display group-hover:text-brand text-base leading-snug font-semibold transition-colors">
                {project.title}
              </h3>
              <ArrowUpRight className="text-subtle group-hover:text-brand mt-0.5 size-4 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            {project.year ? (
              <p className="text-subtle mb-2 font-mono text-[0.6875rem]">{project.year}</p>
            ) : null}

            <p className="text-muted mb-4 line-clamp-3 text-sm leading-relaxed">
              {project.summary}
            </p>

            {project.technologies.length > 0 ? (
              <ul className="mt-auto flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map(({ technology }) => (
                  <li key={technology.id}>
                    <Badge variant="outline" size="sm">
                      {technology.name}
                    </Badge>
                  </li>
                ))}
                {project.technologies.length > 4 ? (
                  <li>
                    <Badge variant="default" size="sm">
                      +{project.technologies.length - 4}
                    </Badge>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </Link>
      </Card>
    </SpotlightCard>
  );
}

/**
 * Carte du projet vedette — mise en page horizontale, plus généreuse.
 *
 * Le projet Convention Management mérite ce traitement : c'est la réalisation
 * professionnelle réelle, celle qu'un recruteur doit voir en premier.
 */
export function FeaturedProjectCard({ project }: { project: ProjectCardData }) {
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
                Projet phare
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
                href={`/projects/${project.slug}`}
                className="bg-brand text-brand-contrast hover:bg-brand-hover inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium transition-colors"
              >
                Lire l&apos;étude de cas
                <ArrowUpRight className="size-4" />
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
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </SpotlightCard>
  );
}
