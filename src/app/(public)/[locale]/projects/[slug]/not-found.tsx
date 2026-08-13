import { AuroraBackground } from "@/components/layout/aurora-background";
import { ProjectNotFoundContent } from "@/components/projects/project-not-found-content";
import { getProjects } from "@/server/queries/portfolio";

/**
 * Projet introuvable.
 *
 * Plutôt qu'une page d'erreur sèche, on propose immédiatement les projets
 * existants : un lien périmé ou une faute de frappe ne doit pas faire quitter
 * le portfolio.
 *
 * Ce fichier ne fait plus que charger les données : `not-found.tsx` ne reçoit
 * pas de `params`, la locale ne peut donc pas y être lue côté serveur. Le
 * rendu — et la relecture de la langue depuis l'URL — vit dans
 * `ProjectNotFoundContent`.
 */
export default async function ProjectNotFound() {
  const projects = await getProjects();

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-24">
      <AuroraBackground />

      <ProjectNotFoundContent
        projects={projects.map((project) => ({
          id: project.id,
          slug: project.slug,
          title: project.title,
        }))}
      />
    </section>
  );
}
