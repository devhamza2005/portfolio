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
import { openGraph, truncate, twitterCard } from "@/lib/seo";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/structured-data";
import {
  getAdjacentProjects,
  getProfile,
  getProjectBySlug,
  getPublishedProjectRefs,
} from "@/server/queries/portfolio";

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProjectBySlug(slug), getProfile()]);

  if (!project) return { title: "Projet introuvable", robots: { index: false, follow: false } };

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
    keywords: [project.title, ...technologies, name, "étude de cas", "projet"],
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: openGraph({
      title,
      description,
      path: `/projects/${project.slug}`,
      siteName: `${name} — Portfolio`,
      type: "article",
      image,
    }),
    twitter: twitterCard({ title, description, image }),
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

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
    }),
    breadcrumbJsonLd([
      { name: "Accueil", path: "/" },
      { name: "Projets", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]),
  ];

  return (
    <article>
      <JsonLd data={jsonLd} />

      <CaseStudyHero project={project} />

      <div className="container-content">
        <div className="mx-auto max-w-3xl space-y-14 py-10 sm:py-14">
          <CaseStudySection
            id="apercu"
            index="01"
            title="Présentation"
            iconKey="FileText"
            text={project.overview}
          />

          <CaseStudySection
            id="problematique"
            index="02"
            title="Problématique"
            iconKey="TriangleAlert"
            text={project.problem}
          />

          <CaseStudySection
            id="solution"
            index="03"
            title="Solution apportée"
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
            title={`Fonctionnalités${project.features.length ? ` (${project.features.length})` : ""}`}
            iconKey="Blocks"
          >
            {project.features.length > 0 ? <FeatureGrid features={project.features} /> : null}
          </CaseStudySection>

          <CaseStudySection
            id="architecture"
            index="05"
            title="Architecture technique"
            iconKey="Network"
            text={project.architecture}
          />

          <CaseStudySection id="technologies" index="06" title="Technologies" iconKey="Boxes">
            {project.technologies.length > 0 ? (
              <TechnologyBreakdown technologies={project.technologies} />
            ) : null}
          </CaseStudySection>

          <CaseStudySection id="defis" index="07" title="Défis techniques" iconKey="Puzzle">
            {project.challenges.length > 0 ? (
              <ChallengeList challenges={project.challenges} />
            ) : null}
          </CaseStudySection>

          <CaseStudySection
            id="resultats"
            index="08"
            title="Résultats"
            iconKey="Trophy"
            text={project.results}
          >
            {project.metrics.length > 0 ? <MetricGrid metrics={project.metrics} /> : null}
          </CaseStudySection>

          <CaseStudySection
            id="apprentissages"
            index="09"
            title="Ce que j'en retiens"
            iconKey="GraduationCap"
            text={project.learnings}
          />

          <CaseStudySection id="galerie" index="10" title="Captures d'écran" iconKey="Images">
            {project.images.length > 0 ? <ProjectGallery images={project.images} /> : null}
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
                />
              ) : (
                <span className="hidden sm:block" />
              )}
              {adjacent.next ? (
                <NavCard direction="next" slug={adjacent.next.slug} title={adjacent.next.title} />
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="secondary" size="md">
                <Link href="/projects">
                  <ArrowLeft />
                  Tous les projets
                </Link>
              </Button>
              <Button asChild size="md">
                <Link href="/#contact">
                  <Mail />
                  Discuter d&apos;un projet
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
}: {
  direction: "previous" | "next";
  slug: string;
  title: string;
}) {
  const isNext = direction === "next";

  return (
    <Link href={`/projects/${slug}`} className="group">
      <Card
        variant="default"
        interactive
        className={`h-full p-5 ${isNext ? "sm:text-right" : ""}`}
      >
        <p
          className={`text-subtle flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wider uppercase ${
            isNext ? "sm:justify-end" : ""
          }`}
        >
          {isNext ? null : <ArrowLeft className="size-3" />}
          {isNext ? "Projet suivant" : "Projet précédent"}
          {isNext ? <ArrowRight className="size-3" /> : null}
        </p>
        <p className="font-display group-hover:text-brand mt-1.5 font-semibold transition-colors">
          {title}
        </p>
      </Card>
    </Link>
  );
}
