import type { Metadata } from "next";

import { AuroraBackground } from "@/components/layout/aurora-background";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel, TextReveal } from "@/components/motion/text-reveal";
import { ProjectFilters } from "@/components/projects/project-filters";
import { EmptyState } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { getProfile, getProjectCategories, getProjects } from "@/server/queries/portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const name = profile?.fullName ?? siteConfig.fallback.name;

  const description =
    projects.length > 0
      ? `${projects.length} projets réalisés par ${name} : applications web Java/Spring Boot et React, ` +
        `desktop, DevOps et systèmes embarqués. Études de cas détaillées.`
      : `Les projets de ${name}.`;

  return {
    title: "Projets",
    description,
    alternates: { canonical: "/projects" },
    openGraph: {
      title: `Projets — ${name}`,
      description,
      url: `${siteConfig.url}/projects`,
      type: "website",
    },
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

  return (
    <>
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
          {projects.length === 0 ? (
            <EmptyState
              title="Aucun projet publié"
              description={`${profile?.fullName ?? "Le propriétaire du site"} n'a pas encore publié de projet.`}
            />
          ) : (
            <ProjectFilters
              projects={projects}
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                iconKey: category.iconKey,
                count: category._count.projects,
              }))}
            />
          )}
        </div>
      </Section>
    </>
  );
}
