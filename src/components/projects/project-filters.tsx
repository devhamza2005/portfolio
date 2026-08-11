"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/admin/icon";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/skeleton";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; iconKey: string | null; count: number };

/**
 * Grille filtrable des projets.
 *
 * Le filtrage se fait en mémoire : les sept projets sont déjà chargés côté
 * serveur, une requête par clic serait du gaspillage. Seul ce composant part
 * dans le bundle client — l'en-tête de page reste rendu côté serveur.
 *
 * Les catégories proviennent de la base et ne listent que celles réellement
 * utilisées par un projet publié : aucun filtre ne peut donner zéro résultat.
 */
export function ProjectFilters({
  projects,
  categories,
}: {
  projects: ProjectCardData[];
  categories: Category[];
}) {
  const [active, setActive] = useState<string>("all");

  const visible = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.category?.slug === active)),
    [projects, active],
  );

  // Un seul groupe ne justifie pas d'afficher une barre de filtres.
  const showFilters = categories.length > 1;

  return (
    <>
      {showFilters ? (
        <div
          role="tablist"
          aria-label="Filtrer les projets par catégorie"
          className="mb-8 flex flex-wrap gap-2"
        >
          <FilterChip
            label="Tous"
            count={projects.length}
            active={active === "all"}
            onClick={() => setActive("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              iconKey={category.iconKey}
              count={category.count}
              active={active === category.slug}
              onClick={() => setActive(category.slug)}
            />
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="FolderOpen" />}
          title="Aucun projet dans cette catégorie"
          description="Choisissez une autre catégorie."
        />
      ) : (
        <StaggerGroup
          key={active}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((project) => (
            <StaggerItem key={project.id} className="h-full">
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <p className="text-subtle mt-8 text-sm">
        {visible.length} projet{visible.length > 1 ? "s" : ""}
        {active !== "all" ? ` sur ${projects.length}` : ""}
      </p>
    </>
  );
}

function FilterChip({
  label,
  count,
  iconKey,
  active,
  onClick,
}: {
  label: string;
  count: number;
  iconKey?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
        "transition-colors duration-200",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-border text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {iconKey ? <Icon name={iconKey} className="size-3.5" /> : null}
      {label}
      <span className={cn("font-mono text-[0.6875rem] tabular-nums", !active && "text-subtle")}>
        {count}
      </span>
    </button>
  );
}
