import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/admin/icon";
import { GithubIcon } from "@/components/brand/brand-icons";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatYearRange } from "@/lib/dates";
import type { ProjectDetail } from "@/server/queries/portfolio";

const STATUS: Record<string, { label: string; variant: "success" | "warning" | "brand" | "default" }> = {
  COMPLETED: { label: "Terminé", variant: "success" },
  IN_PROGRESS: { label: "En cours", variant: "warning" },
  MAINTAINED: { label: "Maintenu", variant: "brand" },
  ARCHIVED: { label: "Archivé", variant: "default" },
};

/**
 * En-tête d'une étude de cas.
 *
 * Les méta-informations (rôle, équipe, client, période) ne sont affichées que
 * si elles existent : sur les sept projets du portfolio, aucune ne les a
 * toutes. La grille s'adapte au nombre réel d'entrées.
 */
export function CaseStudyHero({ project }: { project: ProjectDetail }) {
  const status = STATUS[project.status];
  const period = formatYearRange(project.startDate, project.endDate);

  const meta = [
    project.role && { label: "Rôle", value: project.role, icon: "UserRound" },
    project.client && { label: "Client", value: project.client, icon: "Building2" },
    project.teamSize && {
      label: "Équipe",
      value: `${project.teamSize} personne${project.teamSize > 1 ? "s" : ""}`,
      icon: "Users",
    },
    (period || project.year) && {
      label: "Période",
      value: period || String(project.year),
      icon: "CalendarDays",
    },
  ].filter(Boolean) as { label: string; value: string; icon: string }[];

  const hasLinks = Boolean(project.demoUrl || project.repoUrl || project.docUrl);

  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32">
      <AuroraBackground />

      <div className="container-content relative">
        <Reveal>
          <Link
            href="/projects"
            className="text-muted hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Tous les projets
          </Link>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <Reveal className="mb-5 flex flex-wrap items-center gap-2">
              {project.category ? (
                <Badge variant="brand" size="md">
                  {project.category.iconKey ? <Icon name={project.category.iconKey} /> : null}
                  {project.category.name}
                </Badge>
              ) : null}
              {status ? (
                <Badge variant={status.variant} size="md">
                  {status.label}
                </Badge>
              ) : null}
              {project.context ? (
                <Badge variant="outline" size="md">
                  {project.context}
                </Badge>
              ) : null}
            </Reveal>

            <h1 className="text-display-lg font-display">
              <TextReveal text={project.title} className="text-gradient block" />
            </h1>

            {project.subtitle ? (
              <Reveal delay={0.3}>
                <p className="text-brand mt-3 text-base font-medium sm:text-lg">
                  {project.subtitle}
                </p>
              </Reveal>
            ) : null}

            <Reveal delay={0.4}>
              <p className="text-muted mt-5 max-w-2xl leading-relaxed">{project.summary}</p>
            </Reveal>

            {hasLinks ? (
              <Reveal delay={0.5} className="mt-7 flex flex-wrap items-center gap-3">
                {project.demoUrl ? (
                  <Button asChild size="md">
                    <a href={project.demoUrl} target="_blank" rel="noreferrer noopener">
                      <ExternalLink />
                      Voir la démo
                    </a>
                  </Button>
                ) : null}
                {project.repoUrl ? (
                  <Button asChild size="md" variant="secondary">
                    <a href={project.repoUrl} target="_blank" rel="noreferrer noopener">
                      <GithubIcon className="size-4" />
                      Code source
                    </a>
                  </Button>
                ) : null}
                {project.docUrl ? (
                  <Button asChild size="md" variant="ghost">
                    <a href={project.docUrl} target="_blank" rel="noreferrer noopener">
                      <FileText />
                      Documentation
                    </a>
                  </Button>
                ) : null}
              </Reveal>
            ) : null}
          </div>

          {/* Visuel : couverture si elle existe, sinon fiche d'identité du projet */}
          <Reveal delay={0.2}>
            {project.cover ? (
              <div className="border-gradient bg-elevated relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)]">
                <Image
                  src={project.cover.url}
                  alt={project.cover.alt || project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : meta.length > 0 ? (
              <dl className="glass grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-xl)]">
                {meta.map((item) => (
                  <div key={item.label} className="bg-surface/40 p-5">
                    <dt className="text-subtle flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.15em] uppercase">
                      <Icon name={item.icon} className="size-3" />
                      {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-snug font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Reveal>
        </div>

        {/* Méta-informations sous le titre quand une couverture occupe la colonne droite */}
        {project.cover && meta.length > 0 ? (
          <Reveal delay={0.3}>
            <dl className="border-border mt-10 grid gap-6 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-subtle flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.15em] uppercase">
                    <Icon name={item.icon} className="size-3" />
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
