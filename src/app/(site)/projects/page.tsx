import type { Metadata } from "next";

import { Icon } from "@/components/admin/icon";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel, TextReveal } from "@/components/motion/text-reveal";
import { ProjectFilters } from "@/components/projects/project-filters";
import { JsonLd } from "@/components/seo/json-ld";
import { EmptyState } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { openGraph, truncate, twitterCard } from "@/lib/seo";
import { breadcrumbJsonLd, projectCollectionJsonLd } from "@/lib/structured-data";
import { getProfile, getProjectCategories, getProjects } from "@/server/queries/portfolio";

/** Description partagée par les métadonnées et le JSON-LD — une seule vérité. */
function describeCollection(name: string, count: number): string {
  return count > 0
    ? `${count} projets réalisés par ${name} : applications web Java/Spring Boot et React, ` +
        `desktop, DevOps et systèmes embarqués. Études de cas détaillées.`
    : `Les projets de ${name}.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const name = profile?.fullName ?? siteConfig.fallback.name;
  const description = describeCollection(name, projects.length);
  const title = `Projets — ${name}`;

  // À défaut d'illustration propre à la page, l'image Open Graph du profil
  // sert de repli. Si elle n'existe pas non plus, aucune balise image n'est
  // émise — jamais d'URL inventée.
  const image = profile?.ogImage ?? null;

  return {
    title: "Projets",
    description,
    alternates: { canonical: "/projects" },
    openGraph: openGraph({
      title,
      description,
      path: "/projects",
      siteName: `${name} — Portfolio`,
      type: "website",
      image,
    }),
    twitter: twitterCard({ title, description: truncate(description), image }),
  };
}

export default async function ProjectsPage() {
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
    projectCollectionJsonLd(projects, describeCollection(name, projects.length)),
    breadcrumbJsonLd([
      { name: "Accueil", path: "/" },
      { name: "Projets", path: "/projects" },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero de page */}
      <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32">
        <AuroraBackground />

        <div className="container-content relative">
          <Reveal>
            <SectionLabel index="—">Réalisations</SectionLabel>
          </Reveal>

          <h1 className="text-display-lg font-display">
            <TextReveal text="Mes projets" className="text-gradient block" />
          </h1>

          <Reveal delay={0.3}>
            <p className="text-muted mt-5 max-w-2xl leading-relaxed">
              Des applications réellement livrées, du projet professionnel mené pour une société de
              développement local aux expérimentations DevOps. Chaque projet dispose d&apos;une
              étude de cas détaillant le contexte, les choix techniques et les difficultés
              rencontrées.
            </p>
          </Reveal>

          {projects.length > 0 ? (
            <Reveal delay={0.4}>
              <dl className="text-muted mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Projets</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {projects.length}
                  </dd>
                  <span>projets</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Technologies</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {technologies.size}
                  </dd>
                  <span>technologies mobilisées</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Catégories</dt>
                  <dd className="font-display text-foreground text-xl font-semibold tabular-nums">
                    {categories.length}
                  </dd>
                  <span>domaines</span>
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
          <h2 className="sr-only">Tous les projets</h2>

          {projects.length === 0 ? (
            <EmptyState
              title="Aucun projet publié"
              description={`${profile?.fullName ?? "Le propriétaire du site"} n'a pas encore publié de projet.`}
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
            />
          )}
        </div>
      </Section>
    </>
  );
}
