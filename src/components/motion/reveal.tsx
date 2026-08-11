"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Apparition au défilement.
 *
 * Règles appliquées partout dans le portfolio :
 *  • `once: true` — l'animation ne se rejoue pas quand on remonte la page,
 *    ce qui serait fatigant à la lecture ;
 *  • uniquement `transform` et `opacity` — les seules propriétés que le
 *    navigateur peut animer sans recalculer la mise en page (§19) ;
 *  • `useReducedMotion` — si le système demande moins d'animation, le contenu
 *    apparaît en fondu simple, sans déplacement (§20).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduced ? 0.2 : 0.6,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Groupe dont les enfants apparaissent en cascade.
 * Le décalage se propage par contexte : les enfants n'ont pas à connaître
 * leur propre index.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </Component>
  );
}

/** Conteneur de section : marge verticale standard + ancre de navigation. */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("section-y relative", className)}>
      {children}
    </section>
  );
}
