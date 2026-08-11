"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Carte avec halo lumineux suivant le curseur.
 *
 * La position est écrite dans deux variables CSS (`--mx`, `--my`) lues par
 * l'utilitaire `spotlight` : aucun rendu React n'est déclenché au déplacement
 * de la souris. C'est ce qui permet d'avoir l'effet sur une grille entière
 * sans coût mesurable.
 */
export function SpotlightCard({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  // `HTMLElement` plutôt qu'un type précis : le composant est polymorphe
  // (div, article ou li selon l'appel), et seules des propriétés communes
  // à tous les éléments sont utilisées ici.
  const ref = useRef<HTMLElement>(null);

  return (
    <Component
      ref={ref as never}
      onPointerMove={(event: React.PointerEvent) => {
        // Un pointeur grossier (doigt) n'a pas de survol : inutile de calculer.
        if (event.pointerType !== "mouse") return;
        const element = ref.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        element.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
      className={cn("spotlight", className)}
    >
      {children}
    </Component>
  );
}

/**
 * Léger effet 3D au survol (§8 : « uniquement lorsqu'ils améliorent le design »).
 * L'inclinaison est plafonnée à 6° — au-delà, l'effet devient tape-à-l'œil et
 * dessert la crédibilité recherchée.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function reset() {
    const element = ref.current;
    if (element) element.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const element = ref.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;

        element.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) ` +
          `rotateY(${(px * max).toFixed(2)}deg)`;
      }}
      onPointerLeave={reset}
      className={cn(
        "transition-transform duration-300 ease-[var(--ease-signature)] will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}
