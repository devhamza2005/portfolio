import type { ReactNode } from "react";

import { Icon } from "@/components/admin/icon";
import { Reveal } from "@/components/motion/reveal";
import { Prose } from "@/components/projects/prose";
import { cn } from "@/lib/utils";

/**
 * Section d'une étude de cas.
 *
 * Elle se supprime elle-même quand elle n'a rien à afficher. C'est le mécanisme
 * qui permet à un projet peu documenté de rester présentable : sur les sept
 * projets du portfolio, la richesse va de six sections remplies à une seule.
 */
export function CaseStudySection({
  id,
  index,
  title,
  iconKey,
  text,
  children,
  className,
}: {
  id: string;
  /** Numéro affiché à gauche du titre. */
  index: string;
  title: string;
  iconKey?: string;
  /** Texte long en Markdown léger — la section disparaît s'il est vide. */
  text?: string | null;
  children?: ReactNode;
  className?: string;
}) {
  const hasText = Boolean(text?.trim());
  if (!hasText && !children) return null;

  return (
    <Reveal as="section" className={cn("scroll-mt-28", className)}>
      <div id={id} className="scroll-mt-28">
        <header className="mb-5 flex items-center gap-3">
          <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]">
            <Icon name={iconKey ?? "FileText"} className="size-4" />
          </span>
          <h2 className="font-display text-lg font-semibold sm:text-xl">
            <span className="text-subtle me-2 font-mono text-xs">{index}</span>
            {title}
          </h2>
        </header>

        {hasText ? <Prose text={text ?? null} /> : null}
        {children ? <div className={hasText ? "mt-6" : undefined}>{children}</div> : null}
      </div>
    </Reveal>
  );
}
