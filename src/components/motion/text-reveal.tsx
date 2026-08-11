"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Titre révélé mot par mot derrière un masque.
 *
 * Réservé au Hero et aux titres de section : appliqué à des paragraphes,
 * l'effet gênerait la lecture. Le texte complet reste dans le DOM d'un seul
 * tenant pour les lecteurs d'écran et les moteurs de recherche — seule la
 * présentation est fragmentée (§18, §20).
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as: Component = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component className={className}>
      {/* Version accessible : une seule chaîne, lue normalement. */}
      <span className="sr-only">{text}</span>

      <motion.span
        aria-hidden
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
        className="inline"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                visible: {
                  y: "0%",
                  opacity: 1,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

/** Étiquette numérotée des sections : « 01 — À propos ». */
export function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <p className={cn("text-subtle mb-3 flex items-center gap-2.5 font-mono text-xs tracking-[0.2em] uppercase")}>
      <span className="text-brand">{index}</span>
      <span className="bg-border-strong h-px w-8" aria-hidden />
      {children}
    </p>
  );
}
