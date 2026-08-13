"use client";

import { FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/skeleton";
import type { Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import type { ProjectCard as ProjectCardData } from "@/server/queries/portfolio";
import { cn } from "@/lib/utils";

/**
 * L'icône arrive déjà rendue depuis le serveur plutôt que sous forme de nom.
 * Résoudre un `iconKey` dans le navigateur imposerait d'y embarquer toute la
 * bibliothèque Lucide (~800 Ko) pour n'afficher que quelques pictogrammes.
 */
type Category = {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  count: number;
};

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
  locale,
  status,
  t,
}: {
  projects: ProjectCardData[];
  categories: Category[];
  locale: Locale;
  status: Record<string, string>;
  t: {
    filterAria: string;
    filterAll: string;
    filterEmptyTitle: string;
    filterEmptyDescription: string;
    resultsCount: string;
    resultsOutOf: string;
  };
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
        /*
          `group` et non `tablist` : le motif ARIA des onglets impose une
          navigation aux flèches et un `tabpanel` associé à chaque onglet.
          Rien de tout cela ici — ce sont des boutons bascule qui filtrent une
          liste. Annoncer « onglet » à un lecteur d'écran promettrait un
          comportement que la page n'offre pas.
        */
        <div
          role="group"
          aria-label={t.filterAria}
          className="mb-8 flex flex-wrap gap-2"
        >
          <FilterChip
            label={t.filterAll}
            count={projects.length}
            active={active === "all"}
            onClick={() => setActive("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              icon={category.icon}
              count={category.count}
              active={active === category.slug}
              onClick={() => setActive(category.slug)}
            />
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-4" />}
          title={t.filterEmptyTitle}
          description={t.filterEmptyDescription}
        />
      ) : (
        <StaggerGroup
          key={active}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((project) => (
            <StaggerItem key={project.id} className="h-full">
              <ProjectCard project={project} locale={locale} status={status} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/*
        `aria-live` : le filtrage ne déplace pas le focus, un lecteur d'écran
        n'aurait donc aucun moyen de savoir que la grille a changé. Ce compteur
        est le seul retour parlé du filtre.
      */}
      <p aria-live="polite" className="text-subtle mt-8 text-sm">
        {interpolate(t.resultsCount, { shown: visible.length })}
        {active !== "all" ? interpolate(t.resultsOutOf, { total: projects.length }) : ""}
      </p>
    </>
  );
}

function FilterChip({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
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
      {icon}
      {label}
      <span className={cn("font-mono text-[0.6875rem] tabular-nums", !active && "text-subtle")}>
        {count}
      </span>
    </button>
  );
}
