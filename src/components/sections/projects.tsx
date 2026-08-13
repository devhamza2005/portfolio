import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { FeaturedProjectCard } from "@/components/projects/featured-project-card";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";
import { sectionIndex } from "@/config/sections";

/**
 * Section « Projets ».
 *
 * Le premier projet marqué « vedette » occupe une carte large ; les suivants
 * s'affichent en grille. Au-delà de six, un lien renvoie vers /projects plutôt
 * que d'allonger indéfiniment la page d'accueil.
 */
export function Projects({
  projects,
  locale,
  t,
  status,
}: {
  projects: ProjectCardData[];
  locale: Locale;
  t: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    all: string;
    viewAll: string;
    readCaseStudy: string;
    newWindow: string;
    featuredBadge: string;
  };
  status: Record<string, string>;
}) {
  if (projects.length === 0) return null;

  const featured = projects.find((project) => project.featured) ?? null;
  const others = projects.filter((project) => project.id !== featured?.id).slice(0, 6);
  const hasMore = projects.length > others.length + (featured ? 1 : 0);

  return (
    <Section id="projects">
      <div className="container-content">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel index={sectionIndex("projects")}>{t.label}</SectionLabel>
            <h2 className="text-display-md font-display">
              {t.titleBefore} <span className="text-gradient-brand">{t.titleAccent}</span>
              {t.titleAfter}
            </h2>
          </div>

          <Button asChild variant="ghost" size="md" className="shrink-0">
            <Link href={localizedPath(locale, "/projects")}>
              {t.all}
              <ArrowRight className="rtl:-scale-x-100" />
            </Link>
          </Button>
        </Reveal>

        {featured ? (
          <Reveal className="mb-6">
            <FeaturedProjectCard
              project={featured}
              locale={locale}
              readCaseStudy={t.readCaseStudy}
              newWindow={t.newWindow}
              featuredBadge={t.featuredBadge}
            />
          </Reveal>
        ) : null}

        {others.length > 0 ? (
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((project) => (
              <StaggerItem key={project.id} className="h-full">
                <ProjectCard project={project} locale={locale} status={status} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : null}

        {hasMore ? (
          <Reveal className="mt-10 text-center">
            <Button asChild variant="secondary" size="lg">
              <Link href={localizedPath(locale, "/projects")}>
                {interpolate(t.viewAll, { count: projects.length })}
                <ArrowRight className="rtl:-scale-x-100" />
              </Link>
            </Button>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
