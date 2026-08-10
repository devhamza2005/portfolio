"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Bascule dark ↔ light.
 * Le rendu réel n'a lieu qu'après le montage : côté serveur le thème est
 * inconnu, afficher une icône arbitraire provoquerait un écart d'hydratation.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      className={cn(
        "border-border text-muted hover:text-foreground hover:border-border-strong",
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border",
        "transition-colors duration-200",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        className,
      )}
    >
      {mounted ? (
        <>
          <Sun
            className={cn(
              "absolute size-[1.15rem] transition-all duration-400 ease-[var(--ease-signature)]",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
            )}
          />
          <Moon
            className={cn(
              "absolute size-[1.15rem] transition-all duration-400 ease-[var(--ease-signature)]",
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
            )}
          />
        </>
      ) : (
        <span className="bg-elevated size-[1.15rem] rounded-full" />
      )}
    </button>
  );
}
