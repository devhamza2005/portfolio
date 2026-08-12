import { ArrowLeft, Compass, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Monogram } from "@/components/brand/monogram";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/**
 * 404 global — adresse inconnue.
 *
 * ── Pourquoi cette page n'a ni navbar ni pied de page ──────────────────────
 *
 * `app/not-found.tsx` est rendu avec le layout RACINE, pas avec celui du
 * groupe `(site)`. Elle ne peut donc pas hériter de la navigation, et doit
 * porter elle-même de quoi repartir : d'où le monogramme et les deux boutons.
 *
 * Elle ne complète pas, mais ne remplace pas, le 404 des études de cas :
 * `(site)/projects/[slug]/not-found.tsx` reste prioritaire pour un slug
 * inconnu, et bénéficie lui de la navigation complète.
 *
 * ── Pourquoi aucune lecture en base ───────────────────────────────────────
 *
 * Une page d'erreur doit être la plus fiable du site. Si Neon est
 * momentanément injoignable, le 404 doit s'afficher quand même — il reste donc
 * entièrement statique et n'utilise que les valeurs de repli de `siteConfig`.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  // Une adresse inexistante n'a rien à faire dans un index de recherche.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden py-24">
      <AuroraBackground />

      <div className="container-content relative">
        <div className="mx-auto max-w-xl text-center">
          <Link
            href="/"
            className="focus-visible:ring-ring mx-auto mb-8 inline-flex rounded-[var(--radius-md)] focus-visible:ring-2 focus-visible:outline-none"
            aria-label={`${siteConfig.fallback.name} — accueil`}
          >
            <Monogram className="size-12" title={siteConfig.fallback.name} />
          </Link>

          <p className="text-subtle mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            Erreur 404
          </p>

          <h1 className="text-display-md font-display">
            <span className="text-gradient">Page introuvable</span>
          </h1>

          <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
            Cette adresse ne correspond à aucune page du portfolio. Le lien est peut-être périmé,
            ou comporte une faute de frappe.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="md">
              <Link href="/">
                <ArrowLeft />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button asChild size="md" variant="secondary">
              <Link href="/projects">
                <FolderOpen />
                Voir mes projets
              </Link>
            </Button>
          </div>

          <p className="text-subtle mt-10 flex items-center justify-center gap-2 text-xs">
            <Compass className="size-3.5" aria-hidden />
            Vous pouvez aussi repartir de l&apos;accueil et naviguer par sections.
          </p>
        </div>
      </div>
    </main>
  );
}
