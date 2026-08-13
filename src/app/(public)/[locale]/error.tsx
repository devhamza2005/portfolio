"use client";

import { House, RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/skeleton";
import { localizedPath } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/use-locale";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

/**
 * Les trois dictionnaires sont importés statiquement — ici seulement.
 *
 * `error.tsx` est un composant client : il ne peut ni lire `next/root-params`,
 * ni recevoir de props depuis le serveur. Seule la tranche `errors` est
 * retenue, soit une quinzaine de chaînes ; le reste est éliminé au bundling.
 * C'est le prix, minime, d'un écran d'erreur traduit.
 */
const ERRORS = { fr: fr.errors, en: en.errors, ar: ar.errors };

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
  const locale = useLocale();
  const t = ERRORS[locale];
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
          <h1 className="sr-only">{t.sectionTitle}</h1>

          <ErrorState
            icon={<TriangleAlert />}
            title={t.title}
            description={t.description}
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" onClick={retry} disabled={isRetrying}>
                  <RotateCw className={isRetrying ? "animate-spin" : undefined} />
                  {isRetrying ? t.retrying : t.retry}
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={localizedPath(locale, "/")}>
                    <House />
                    {t.backHome}
                  </Link>
                </Button>
              </div>
            }
          />

          {error.digest ? (
            <p className="text-subtle mt-4 text-center font-mono text-xs">
              {interpolate(t.reference, { digest: error.digest })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
