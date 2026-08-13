import type { Metadata } from "next";

import { Icon } from "@/components/admin/icon";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel, TextReveal } from "@/components/motion/text-reveal";
import { ProjectFilters } from "@/components/projects/project-filters";
import { JsonLd } from "@/components/seo/json-ld";
import { EmptyState } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, requireLocale, type Messages } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { alternatesFor, openGraph, robotsFor, truncate, twitterCard } from "@/lib/seo";
import { breadcrumbJsonLd, projectCollectionJsonLd } from "@/lib/structured-data";
import { getProfile, getProjectCategories, getProjects } from "@/server/queries/portfolio";

/** Description partagée par les métadonnées et le JSON-LD — une seule vérité. */
function describeCollection(t: Messages, name: string, count: number): string {
  return count > 0
    ? interpolate(t.seo.projectsDescription, { count, name })
    : interpolate(t.projectsPage.emptyDescription, { name });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale: Locale = requireLocale((await params).locale);
  const [t, profile, projects] = await Promise.all([
    getDictionary(locale),
    getProfile(),
    getProjects(),
  ]);
  const name = profile?.fullName ?? siteConfig.fallback.name;
  const description = describeCollection(t, name, projects.length);
  const title = `${t.seo.projectsTitle} — ${name}`;

  // À défaut d'illustration propre à la page, l'image Open Graph du profil
  // sert de repli. Si elle n'existe pas non plus, aucune balise image n'est
  // émise — jamais d'URL inventée.
  const image = profile?.ogImage ?? null;

  return {
    title: t.seo.projectsTitle,
    description,
    alternates: alternatesFor(locale, "/projects"),
    robots: robotsFor(locale),
    openGraph: openGraph({
      title,
      description,
      path: "/projects",
      siteName: `${name} — Portfolio`,
      type: "website",
      image,
      locale,
    }),
    twitter: twitterCard({ title, description: truncate(description), image }),
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = requireLocale((await params).locale);
  const t = await getDictionary(locale);

  const [projects, categories, profile] = await Promise.all([
    getProjects(),
    getProjectCategories(),
    getProfile(),
  ]);

  const technologies = new Set(
    projects.flatMap((project) => project.technologies.map((link) => link.technology.id)),
  );

  const name = profile?.fullName ?? siteConfig.fallback.name;
  const jsonLd = [
    projectCollectionJsonLd(projects, describeCollection(t, name, projects.length), locale),
    breadcrumbJsonLd(
      [
        { name: t.seo.breadcrumbHome, path: "/" },
        { name: t.seo.breadcrumbProjects, path: "/projects" },
      ],
      locale,
    ),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero de page */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32">
        <AuroraBackground />

        <div className="container-content relative">
          <Reveal>
            <SectionLabel index="—">{t.projectsPage.label}</SectionLabel>
          </Reveal>

          <h1 className="text-display-lg font-display">
            <TextReveal text={t.projectsPage.title} className="text-gradient block" />
          </h1>

          <Reveal delay={0.3}>
            <p className="text-muted mt-5 max-w-2xl leading-relaxed">{t.projectsPage.intro}</p>
          </Reveal>

          {projects.length > 0 ? (
            <Reveal delay={0.4}>
              <dl className="text-muted mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">{t.projectsPage.title}</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {projects.length}
                  </dd>
                  <span>{t.projectsPage.statProjects}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">{t.technologies.label}</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {technologies.size}
                  </dd>
                  <span>{t.projectsPage.statTechnologies}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">{t.projectsPage.categoriesLabel}</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {categories.length}
                  </dd>
                  <span>{t.projectsPage.statCategories}</span>
                </div>
              </dl>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Grille filtrable */}
      <Section className="pt-4">
        <div className="container-content">
          {/*
            Les cartes de projet portent un <h3> — le niveau correct sur
            l'accueil, où la section « Projets » a son propre <h2>. Ici le
            <h2> manquerait et la hiérarchie sauterait de 1 à 3 : ce titre le
            rétablit pour les lecteurs d'écran sans alourdir la page.
          */}
          <h2 className="sr-only">{t.projectsPage.srTitle}</h2>

          {projects.length === 0 ? (
            <EmptyState
              title={t.projectsPage.emptyTitle}
              description={interpolate(t.projectsPage.emptyDescription, {
                name: profile?.fullName ?? t.projectsPage.ownerFallback,
              })}
            />
          ) : (
            <ProjectFilters
              projects={projects}
              // Les icônes sont résolues ici, côté serveur : la grille
              // filtrable est un composant client, et y résoudre un `iconKey`
              // y ferait entrer toute la bibliothèque Lucide.
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                icon: category.iconKey ? (
                  <Icon name={category.iconKey} className="size-3.5" />
                ) : null,
                count: category._count.projects,
              }))}
              locale={locale}
              status={t.enums.projectStatus}
              t={t.projectsPage}
            />
          )}
        </div>
      </Section>
    </>
  );
}
