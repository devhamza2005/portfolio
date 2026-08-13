import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_LOCALE, localizedPath } from "@/lib/i18n/config";
import fr from "@/messages/fr.json";

import "./globals.css";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  404 GLOBALE — adresse ne correspondant à aucune route
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Remplace l'ancien `app/not-found.tsx`, devenu impossible : l'application a
 * maintenant DEUX layouts racines (site public localisé et back-office), et
 * Next.js n'a donc plus de layout unique à partir duquel composer une 404
 * globale. `global-not-found.tsx` est la réponse prévue pour ce cas exact ;
 * elle est activée par `experimental.globalNotFound` dans next.config.ts.
 *
 * Ce fichier court-circuite le rendu normal : il doit donc importer lui-même
 * la feuille de styles et les polices, et rendre `<html>` et `<body>`.
 *
 * ── Langue ────────────────────────────────────────────────────────────────
 *
 * Elle est en FRANÇAIS, sans exception. Cette page ne se déclenche que pour
 * une URL qui ne correspond à aucune route : il n'y a donc pas de segment
 * `[locale]` à lire, et deviner la langue depuis un en-tête reviendrait à
 * rendre la réponse dynamique — précisément ce qu'on évite partout ailleurs.
 * Dans les faits, elle est rare : le proxy préfixe `/xyz` en `/fr/xyz`, qui
 * est alors pris en charge par la 404 localisée du site public.
 *
 * Aucune lecture en base : une 404 doit s'afficher même si Neon est injoignable.
 */
export const metadata: Metadata = {
  title: `${fr.errors.notFoundTitle} — ${siteConfig.fallback.name}`,
  description: fr.errors.notFoundBody,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  const t = fr.errors;

  return (
    <html lang={DEFAULT_LOCALE} dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <main className="flex flex-1 items-center justify-center px-5 py-24">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-subtle mb-3 font-mono text-xs tracking-[0.2em] uppercase">
              Erreur 404
            </p>

            <h1 className="text-display-md font-display">
              <span className="text-gradient">{t.notFoundTitle}</span>
            </h1>

            <p className="text-muted mx-auto mt-4 leading-relaxed">{t.notFoundBody}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/*
                `<a>` et non `<Link>` : cette page remplace le rendu normal de
                l'application, le routeur client n'y est pas monté.
              */}
              <a
                href={localizedPath(DEFAULT_LOCALE, "/")}
                className="bg-brand-solid text-brand-contrast hover:bg-brand-solid-hover inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium transition-colors"
              >
                {t.backHome}
              </a>
            </div>

            <p className="text-subtle mt-8 text-sm">{t.notFoundHint}</p>
          </div>
        </main>
      </body>
    </html>
  );
}
