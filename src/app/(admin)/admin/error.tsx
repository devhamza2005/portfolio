"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/skeleton";

/**
 * Limite d'erreur du back-office.
 *
 * Le message affiché reste générique : le détail technique part dans la
 * console du serveur, pas à l'écran, pour ne rien révéler de l'infrastructure.
 *
 * ── Pourquoi « Réessayer » fait deux choses ───────────────────────────────
 *
 * `reset()` seul ne remet à zéro que l'état de la limite côté client. Les
 * écrans d'administration sont rendus à la demande et lisent tous la base :
 * quand la panne vient de là, React réutilise la charge RSC déjà reçue et
 * réaffiche exactement la même erreur. `router.refresh()` redemande d'abord
 * l'écran au serveur, `reset()` ne fait que rouvrir la limite ensuite.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  function retry() {
    startRetry(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        icon={<TriangleAlert />}
        title="Une erreur est survenue"
        description="L'opération n'a pas pu aboutir. Réessayez — si le problème persiste, vérifiez que la base de données est bien accessible."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" onClick={retry} disabled={isRetrying}>
              <RotateCw className={isRetrying ? "animate-spin" : undefined} />
              {isRetrying ? "Nouvelle tentative…" : "Réessayer"}
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin">Retour au tableau de bord</Link>
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
  );
}
