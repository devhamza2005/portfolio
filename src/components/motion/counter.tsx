"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Compteur animé.
 *
 * Le décompte ne démarre qu'au moment où l'élément entre dans le champ de
 * vision, et une seule fois. Si le système demande moins d'animation, la
 * valeur finale s'affiche directement (§20).
 */
export function Counter({
  value,
  duration = 1.4,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
