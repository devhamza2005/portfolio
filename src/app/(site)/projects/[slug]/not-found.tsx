import { ArrowLeft, FolderSearch } from "lucide-react";
import Link from "next/link";

import { AuroraBackground } from "@/components/layout/aurora-background";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/server/queries/portfolio";

/**
 * Projet introuvable.
 *
 * Plutôt qu'une page d'erreur sèche, on propose immédiatement les projets
 * existants : un lien périmé ou une faute de frappe ne doit pas faire quitter
 * le portfolio.
 */
export default async function ProjectNotFound() {
  const projects = await getProjects();

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-24">
      <AuroraBackground />

      <div className="container-content relative text-center">
        <span className="bg-elevated text-subtle mx-auto mb-6 grid size-14 place-items-center rounded-full">
          <FolderSearch className="size-6" />
        </span>

        <p className="text-subtle mb-3 font-mono text-xs tracking-[0.2em] uppercase">Erreur 404</p>

        <h1 className="text-display-md font-display">Ce projet n&apos;existe pas</h1>

        <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
          L&apos;adresse demandée ne correspond à aucun projet publié. Il a peut-être été renommé,
          ou n&apos;est plus visible.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="md">
            <Link href="/projects">
              <ArrowLeft />
              Voir tous les projets
            </Link>
          </Button>
          <Button asChild size="md" variant="ghost">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="mt-12">
            <p className="text-subtle mb-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              Projets disponibles
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="border-border text-muted hover:border-brand/40 hover:text-foreground inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
