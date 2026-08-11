"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { Icon } from "@/components/admin/icon";
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
 */
export function SkillsTabs({ groups }: { groups: SkillGroup[] }) {
  const [value, setValue] = useState(groups[0]?.slug ?? "");

  if (groups.length === 0) return null;

  return (
    <Tabs value={value} onValueChange={setValue} className="w-full">
      <TabsList className="mx-auto flex">
        {groups.map((group) => (
          <TabsTrigger key={group.id} value={group.slug}>
            {group.iconKey ? <Icon name={group.iconKey} className="mr-1.5 inline size-3.5" /> : null}
            {group.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map((group) => (
        <TabsContent key={group.id} value={group.slug}>
          <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.skills.map((skill, index) => (
              <SkillBar
                key={skill.id}
                name={skill.name}
                percent={skill.percent}
                label={skill.proficiencyLabel}
                iconKey={skill.iconKey}
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
  iconKey,
  color,
  highlighted,
  index,
  active,
}: {
  name: string;
  percent: number;
  label: string;
  iconKey: string | null;
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
          {iconKey ? (
            <Icon name={iconKey} className="size-3.5 shrink-0" style={color ? { color } : undefined} />
          ) : null}
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
