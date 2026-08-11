"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Barre de progression de lecture.
 *
 * `useScroll` lit la position hors du cycle de rendu React et écrit
 * directement dans le style : la barre suit le défilement à 60 images par
 * seconde sans provoquer le moindre re-rendu.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[linear-gradient(90deg,var(--brand),var(--accent))]"
    />
  );
}
