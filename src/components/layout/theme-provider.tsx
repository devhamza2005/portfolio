"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Fournisseur de thème (dark par défaut, light disponible).
 * `next-themes` injecte un script bloquant dans le <head> : le thème est
 * appliqué avant le premier rendu, donc aucun flash de couleur.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="hf-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
