"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bandeau défilant en continu.
 *
 * Le contenu est dupliqué une fois et la piste translate de -50 % : la boucle
 * est parfaitement continue, sans saut visible. L'animation est purement CSS
 * (`transform`), donc traitée par le compositeur et non par le fil principal.
 *
 * La copie est masquée aux technologies d'assistance, sinon chaque nom de
 * technologie serait annoncé deux fois.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  speed = 42,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  /** Durée d'un cycle complet, en secondes. */
  speed?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        // Fondu sur les bords : le défilement semble venir de l'infini.
        "[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          reverse ? "animate-[marquee-reverse_var(--speed)_linear_infinite]" : "animate-[marquee_var(--speed)_linear_infinite]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--speed": `${speed}s` } as React.CSSProperties}
      >
        {children}
        <span aria-hidden className="flex items-center">
          {children}
        </span>
      </div>
    </div>
  );
}
