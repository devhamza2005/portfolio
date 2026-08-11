"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SkillGroup } from "@/server/queries/portfolio";
import { cn } from "@/lib/utils";

/**
 * Section 05 — Compétences, regroupées par catégorie.
 *
 * Les catégories, leur ordre et les niveaux viennent tous de la base :
 * ajouter une catégorie depuis /admin/categories crée un nouvel onglet, sans
 * aucune modification de ce composant.
 *
 * Les icônes arrivent DÉJÀ RENDUES depuis le serveur (voir skills-section) :
 * les résoudre ici obligerait le navigateur à télécharger toute la
 * bibliothèque Lucide pour n'en afficher qu'une poignée.
 */
export function SkillsTabs({
  groups,
  groupIcons,
  skillIcons,
}: {
  groups: SkillGroup[];
  groupIcons: Record<string, React.ReactNode>;
  skillIcons: Record<string, React.ReactNode>;
}) {
  const [value, setValue] = useState(groups[0]?.slug ?? "");

  if (groups.length === 0) return null;

  return (
    <Tabs value={value} onValueChange={setValue} className="w-full">
      <TabsList className="mx-auto flex">
        {groups.map((group) => (
          <TabsTrigger key={group.id} value={group.slug}>
            {groupIcons[group.id] ?? null}
            {group.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {/*
        `forceMount` : par défaut Radix démonte les onglets inactifs, et seules
        les compétences du premier groupe existaient dans le HTML — les autres
        étaient invisibles pour un moteur de recherche comme pour un lecteur
        d'écran explorant la page. Montés en permanence, ils sont présents dans
        le document et masqués par l'attribut `hidden`, que Radix pose lui-même.

        Le remplissage des barres reste conditionné à `active` : elles ne
        s'animent qu'une fois leur onglet réellement ouvert.
      */}
      {groups.map((group) => (
        <TabsContent key={group.id} value={group.slug} forceMount>
          <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.skills.map((skill, index) => (
              <SkillBar
                key={skill.id}
                name={skill.name}
                percent={skill.percent}
                label={skill.proficiencyLabel}
                icon={skillIcons[skill.id] ?? null}
                color={skill.color}
                highlighted={skill.highlighted}
                index={index}
                active={value === group.slug}
              />
            ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function SkillBar({
  name,
  percent,
  label,
  icon,
  color,
  highlighted,
  index,
  active,
}: {
  name: string;
  percent: number;
  label: string;
  icon: React.ReactNode;
  color: string | null;
  highlighted: boolean;
  index: number;
  active: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  // La barre ne se remplit qu'une fois l'onglet ouvert ET l'élément visible :
  // sinon l'animation serait déjà terminée avant qu'on la regarde.
  const shouldFill = inView && active;

  return (
    <li ref={ref}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className={cn("truncate text-sm", highlighted ? "font-medium" : "text-muted")}>
            {name}
          </span>
          {highlighted ? (
            <Badge variant="brand" size="sm" className="shrink-0">
              Point fort
            </Badge>
          ) : null}
        </span>
        <span className="text-subtle shrink-0 font-mono text-[0.6875rem]">{label}</span>
      </div>

      <div
        className="bg-elevated h-1.5 overflow-hidden rounded-full"
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} — ${label}`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: color
              ? `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 55%, var(--accent)))`
              : "linear-gradient(90deg, var(--brand), var(--accent))",
          }}
          initial={{ width: 0 }}
          animate={{ width: shouldFill ? `${percent}%` : 0 }}
          transition={{
            duration: reduced ? 0.15 : 0.9,
            delay: reduced ? 0 : index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </li>
  );
}
