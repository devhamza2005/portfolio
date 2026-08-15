"use client";

import { forwardRef } from "react";

import { downloadFile } from "@/lib/download-file";

/**
 * Lien de téléchargement forcé — remplace `<a href download>` pour les
 * ressources cross-origin (voir `lib/download-file.ts` pour le pourquoi).
 *
 * ── Composition avec `<Button asChild>` ─────────────────────────────────────
 *
 * `Button` clone ses props sur son enfant direct via `Slot.Root` (Radix) : ce
 * composant doit donc accepter `ref` et toutes les props d'un `<a>` normal, et
 * les reporter sur SON PROPRE `<a>` — exactement le même contrat qu'un `<a>`
 * brut, pour que le remplacement reste invisible dans les composants serveur
 * qui l'utilisent (Hero, Navbar, Contact).
 *
 * `href` reste posé sur l'élément : un clic droit « copier le lien », un
 * middle-click, ou un navigateur sans JavaScript continuent de fonctionner —
 * seul le clic gauche standard bascule sur le téléchargement forcé.
 */
export const DownloadLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { href: string }
>(function DownloadLink({ href, onClick, children, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      {...rest}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        void downloadFile(href);
      }}
    >
      {children}
    </a>
  );
});
