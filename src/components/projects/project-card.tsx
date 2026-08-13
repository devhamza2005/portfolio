import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { localizedPath, type Locale } from "@/lib/i18n/config";

import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";
import { cn } from "@/lib/utils";

/**
 * Carte de projet standard.
 *
 * Ce fichier est importé par la grille filtrable, qui est un composant CLIENT.
 * Il ne doit donc contenir aucun import résolvant une icône par son nom
 * (`@/components/admin/icon`) : cela embarquerait toute la bibliothèque Lucide
 * dans le navigateur. La variante « projet phare », qui en a besoin, vit dans
 * son propre fichier et n'est rendue que côté serveur.
 */

/** Vignette de couverture, avec repli sur un motif quand aucune image n'existe. */
export function Cover({
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
export function ProjectCard({
  project,
  locale,
  status,
}: {
  project: ProjectCardData;
  locale: Locale;
  /** Libellés de `ProjectStatus`, indexés par valeur d'énumération. */
  status: Record<string, string>;
}) {
  return (
    <SpotlightCard as="article" className="h-full rounded-[var(--radius-lg)]">
      <Card variant="default" interactive className="group h-full overflow-hidden p-0">
        <Link href={localizedPath(locale, `/projects/${project.slug}`)} className="flex h-full flex-col">
          <div className="bg-elevated relative aspect-[16/10] overflow-hidden">
            <Cover
              cover={project.cover}
              title={project.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            <span className="absolute top-3 start-3 flex flex-wrap gap-1.5">
              {project.category ? (
                <Badge variant="brand" size="sm" className="backdrop-blur-sm">
                  {project.category.name}
                </Badge>
              ) : null}
              {project.status !== "COMPLETED" ? (
                <Badge variant="warning" size="sm" className="backdrop-blur-sm">
                  {status[project.status] ?? project.status}
                </Badge>
              ) : null}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="font-display group-hover:text-brand text-base leading-snug font-semibold transition-colors">
                {project.title}
              </h3>
              <ArrowUpRight className="text-subtle group-hover:text-brand mt-0.5 size-4 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
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
