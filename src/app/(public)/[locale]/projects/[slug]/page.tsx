import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import {
  ChallengeList,
  FeatureGrid,
  MetricGrid,
  ProjectGallery,
  TechnologyBreakdown,
} from "@/components/projects/case-study-blocks";
import { CaseStudyHero } from "@/components/projects/case-study-hero";
import { CaseStudySection } from "@/components/projects/case-study-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary, requireLocale } from "@/lib/i18n/dictionaries";
import { alternatesFor, openGraph, robotsFor, truncate, twitterCard } from "@/lib/seo";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/structured-data";
import { getProfileLocalized, getProjectBySlugLocalized } from "@/server/queries/localized";
import { getAdjacentProjects, getPublishedProjectRefs } from "@/server/queries/portfolio";

/**
 * Étude de cas d'un projet.
 *
 * Les sections sont facultatives et se masquent d'elles-mêmes : sur les sept
 * projets du portfolio, la richesse va de six sections rédigées à une seule.
 * Rien n'est inventé ici — tout provient de la base et reste éditable depuis
 * /admin/projects.
 */

/** Prégénère les études de cas des projets publiés. */
export async function generateStaticParams() {
  const projects = await getPublishedProjectRefs();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = requireLocale(raw);
  const [t, project, profile] = await Promise.all([
    getDictionary(locale),
    getProjectBySlugLocalized(slug, locale),
    getProfileLocalized(locale),
  ]);

  if (!project) {
    return { title: t.seo.projectNotFound, robots: { index: false, follow: false } };
  }

  const name = profile?.fullName ?? siteConfig.fallback.name;
  const description = truncate(project.summary);
  const technologies = project.technologies.map((link) => link.technology.name);
  const title = `${project.title} — ${name}`;

  // Couverture du projet en priorité ; à défaut, l'image Open Graph du profil.
  // Si aucune des deux n'existe, la clé disparaît : jamais d'URL inventée.
  const image = project.cover ?? profile?.ogImage ?? null;

  return {
    title: project.title,
    description,
    keywords: [
      project.title,
      ...technologies,
      name,
      t.seo.caseStudyKeyword,
      t.seo.projectKeyword,
    ],
    alternates: alternatesFor(locale, `/projects/${project.slug}`),
    robots: robotsFor(locale),
    openGraph: openGraph({
      title,
      description,
      path: `/projects/${project.slug}`,
      siteName: `${name} — Portfolio`,
      type: "article",
      image,
      locale,
    }),
    twitter: twitterCard({ title, description, image }),
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = requireLocale(raw);
  const t = await getDictionary(locale);
  const project = await getProjectBySlugLocalized(slug, locale);

  // Slug inconnu ou projet dépublié → 404 propre.
  if (!project) notFound();

  const adjacent = await getAdjacentProjects(slug);

  /**
   * Données structurées de l'étude de cas.
   *
   * `CreativeWork` décrit l'œuvre réalisée ; l'auteur est référencé par `@id`
   * vers la `Person` déclarée sur l'accueil, ce qui relie tous les projets à
   * une seule identité aux yeux d'un moteur. Le fil d'Ariane reproduit le
   * chemin réel : Accueil › Projets › ce projet.
   */
  const jsonLd = [
    projectJsonLd({
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      summary: project.summary,
      year: project.year,
      startDate: project.startDate,
      endDate: project.endDate,
      cover: project.cover,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      category: project.category,
      technologies: project.technologies.map((link) => link.technology.name),
      locale,
    }),
    breadcrumbJsonLd(
      [
        { name: t.seo.breadcrumbHome, path: "/" },
        { name: t.seo.breadcrumbProjects, path: "/projects" },
        { name: project.title, path: `/projects/${project.slug}` },
      ],
      locale,
    ),
  ];

  return (
    <article>
      <JsonLd data={jsonLd} />

      <CaseStudyHero
        project={project}
        locale={locale}
        t={t.caseStudy}
        status={t.enums.projectStatus}
        todayLabel={t.dates.today}
      />

      <div className="container-content">
        <div className="mx-auto max-w-3xl space-y-14 py-10 sm:py-14">
          <CaseStudySection
            id="apercu"
            index="01"
            title={t.caseStudy.sections.overview}
            iconKey="FileText"
            text={project.overview}
          />

          <CaseStudySection
            id="problematique"
            index="02"
            title={t.caseStudy.sections.problem}
            iconKey="TriangleAlert"
            text={project.problem}
          />

          <CaseStudySection
            id="solution"
            index="03"
            title={t.caseStudy.sections.solution}
            iconKey="Lightbulb"
            text={project.solution}
          />

          {/*
            Les blocs sont passés en enfant UNIQUEMENT si leur collection
            contient quelque chose. Un composant qui rend `null` reste un
            élément React « truthy » : sans ce test, la section afficherait son
            titre au-dessus du vide.
          */}
          <CaseStudySection
            id="fonctionnalites"
            index="04"
            title={`${t.caseStudy.sections.features}${project.features.length ? ` (${project.features.length})` : ""}`}
            iconKey="Blocks"
          >
            {project.features.length > 0 ? <FeatureGrid features={project.features} /> : null}
          </CaseStudySection>

          <CaseStudySection
            id="architecture"
            index="05"
            title={t.caseStudy.sections.architecture}
            iconKey="Network"
            text={project.architecture}
          />

          <CaseStudySection
            id="technologies"
            index="06"
            title={t.caseStudy.sections.stack}
            iconKey="Boxes"
          >
            {project.technologies.length > 0 ? (
              <TechnologyBreakdown
                technologies={project.technologies}
                otherCategory={t.technologies.otherCategory}
              />
            ) : null}
          </CaseStudySection>

          <CaseStudySection
            id="defis"
            index="07"
            title={t.caseStudy.sections.challenges}
            iconKey="Puzzle"
          >
            {project.challenges.length > 0 ? (
              <ChallengeList
                challenges={project.challenges}
                problemLabel={t.caseStudy.theProblem}
                solutionLabel={t.caseStudy.theSolution}
              />
            ) : null}
          </CaseStudySection>

          <CaseStudySection
            id="resultats"
            index="08"
            title={t.caseStudy.sections.results}
            iconKey="Trophy"
            text={project.results}
          >
            {project.metrics.length > 0 ? <MetricGrid metrics={project.metrics} /> : null}
          </CaseStudySection>

          <CaseStudySection
            id="apprentissages"
            index="09"
            title={t.caseStudy.sections.learnings}
            iconKey="GraduationCap"
            text={project.learnings}
          />

          <CaseStudySection
            id="galerie"
            index="10"
            title={t.caseStudy.sections.gallery}
            iconKey="Images"
          >
            {project.images.length > 0 ? (
              <ProjectGallery images={project.images} kinds={t.enums.imageKind} />
            ) : null}
          </CaseStudySection>
        </div>
      </div>

      {/* Navigation entre projets + appel à l'action */}
      <section className="border-border border-t">
        <div className="container-content py-12">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {adjacent.previous ? (
                <NavCard
                  direction="previous"
                  slug={adjacent.previous.slug}
                  title={adjacent.previous.title}
                  locale={locale}
                  label={t.caseStudy.previous}
                />
              ) : (
                <span className="hidden sm:block" />
              )}
              {adjacent.next ? (
                <NavCard
                  direction="next"
                  slug={adjacent.next.slug}
                  title={adjacent.next.title}
                  locale={locale}
                  label={t.caseStudy.next}
                />
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="secondary" size="md">
                <Link href={localizedPath(locale, "/projects")}>
                  <ArrowLeft className="rtl:-scale-x-100" />
                  {t.caseStudy.ctaProjects}
                </Link>
              </Button>
              <Button asChild size="md">
                <Link href={`${localizedPath(locale, "/")}#contact`}>
                  <Mail />
                  {t.caseStudy.ctaContact}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}

function NavCard({
  direction,
  slug,
  title,
  locale,
  label,
}: {
  direction: "previous" | "next";
  slug: string;
  title: string;
  locale: Locale;
  label: string;
}) {
  const isNext = direction === "next";

  return (
    <Link href={localizedPath(locale, `/projects/${slug}`)} className="group">
      <Card
        variant="default"
        interactive
        className={`h-full p-5 ${isNext ? "sm:text-end" : ""}`}
      >
        <p
          className={`text-subtle flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wider uppercase ${
            isNext ? "sm:justify-end" : ""
          }`}
        >
          {isNext ? null : <ArrowLeft className="size-3 rtl:-scale-x-100" />}
          {label}
          {isNext ? <ArrowRight className="size-3 rtl:-scale-x-100" /> : null}
        </p>
        <p className="font-display group-hover:text-brand mt-1.5 font-semibold transition-colors">
          {title}
        </p>
      </Card>
    </Link>
  );
}
