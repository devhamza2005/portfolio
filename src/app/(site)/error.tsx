"use client";

import { House, RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/skeleton";

/**
 * Limite d'erreur du site public.
 *
 * Cas visé : une lecture Neon qui échoue le temps d'un pic, ou une exception
 * dans une section. Sans ce fichier, le visiteur tombe sur l'écran d'erreur
 * brut de Next.js — anglais, non stylé, sans issue.
 *
 * Elle vit à l'intérieur du groupe `(site)`, donc la navigation et le pied de
 * page restent affichés : le visiteur peut toujours repartir ailleurs.
 *
 * ── Ce qui est montré, et ce qui ne l'est pas ─────────────────────────────
 *
 * `error.message` n'est jamais affiché : en production Next le remplace déjà
 * par un texte générique, mais une erreur levée côté client passerait telle
 * quelle et pourrait exposer un détail d'infrastructure. Seul `digest`, un
 * identifiant opaque, est proposé — de quoi retrouver la trace côté serveur.
 *
 * ── Pourquoi « Réessayer » fait deux choses ───────────────────────────────
 *
 * `reset()` seul ne remet à zéro que l'état de la limite d'erreur côté client.
 * Quand la panne vient du serveur — une lecture Neon qui a échoué — React
 * réutilise la charge RSC déjà reçue et réaffiche exactement la même erreur :
 * le bouton serait décoratif. `router.refresh()` redemande d'abord la page au
 * serveur, et `reset()` ne fait que rouvrir la limite ensuite.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    // Le détail part dans la console du serveur, pas à l'écran.
    console.error("[site]", error);
  }, [error]);

  function retry() {
    startRetry(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <section className="section-y">
      <div className="container-content">
        <div className="mx-auto max-w-lg">
          {/*
            La limite d'erreur remplace tout le contenu de la page : sans ce
            titre, le document se retrouverait sans `h1`. Il est masqué à
            l'écran — `ErrorState` affiche déjà son propre intitulé — mais
            rétablit la structure pour les lecteurs d'écran.
          */}
          <h1 className="sr-only">Erreur de chargement</h1>

          <ErrorState
            icon={<TriangleAlert />}
            title="Cette page n'a pas pu s'afficher"
            description="Un incident est survenu pendant le chargement du contenu. Réessayez — c'est le plus souvent passager."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" onClick={retry} disabled={isRetrying}>
                  <RotateCw className={isRetrying ? "animate-spin" : undefined} />
                  {isRetrying ? "Nouvelle tentative…" : "Réessayer"}
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/">
                    <House />
                    Retour à l&apos;accueil
                  </Link>
                </Button>
              </div>
            }
          />

          {error.digest ? (
            <p className="text-subtle mt-4 text-center font-mono text-xs">
              Référence : {error.digest}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
