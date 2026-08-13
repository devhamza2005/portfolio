"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/**
 * Bascule dark ↔ light.
 *
 * Les deux icônes sont rendues en permanence et permutées en CSS via la
 * variante `dark:`. Aucun état React, donc :
 *  • aucun écart d'hydratation (le serveur ne connaît pas le thème choisi),
 *  • l'icône correcte est visible dès le premier rendu, avant l'hydratation,
 *    puisque next-themes pose la classe sur <html> avant la peinture.
 */
export function ThemeToggle({
  className,
  /**
   * Libellé accessible. Fourni par le dictionnaire côté site public ; la valeur
   * par défaut sert au back-office, qui reste francophone.
   */
  label = "Changer de thème",
}: {
  className?: string;
  label?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={label}
      className={cn(
        "border-border text-muted hover:text-foreground hover:border-border-strong",
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border",
        "transition-colors duration-200",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-[1.15rem] transition-all duration-400 ease-[var(--ease-signature)]",
          "-rotate-90 scale-0 opacity-0",
          "dark:rotate-0 dark:scale-100 dark:opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-[1.15rem] transition-all duration-400 ease-[var(--ease-signature)]",
          "rotate-0 scale-100 opacity-100",
          "dark:rotate-90 dark:scale-0 dark:opacity-0",
        )}
      />
    </button>
  );
}
