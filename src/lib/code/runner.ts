import type { CodeSample } from "@/config/code-samples";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EXÉCUTION D'UN EXEMPLE — contrat et implémentation simulée
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Ce que fait réellement cette fonction ─────────────────────────────────
 *
 * RIEN d'autre que d'attendre, puis de renvoyer le résultat DÉJÀ écrit dans
 * l'exemple. Aucune compilation, aucune évaluation, aucun processus, aucun
 * appel réseau. Le code affiché n'est jamais interprété — c'est du texte.
 *
 * ── Pourquoi une interface plutôt qu'une fonction ─────────────────────────
 *
 * Le jour où un vrai bac à sable isolé serait souhaitable — conteneur éphémère,
 * WebAssembly, service tiers —, il suffirait d'écrire une autre implémentation
 * de `SampleRunner` et de l'injecter. L'interface publique, les exemples et
 * l'affichage ne bougeraient pas.
 *
 * ⚠️ Toute implémentation future devra respecter la règle qui vaut ici :
 * n'exécuter QUE des extraits prédéfinis, jamais une saisie du visiteur. Le
 * portfolio n'a pas vocation à offrir une surface d'exécution de code à
 * distance.
 */

export type RunOutcome = {
  sampleId: string;
  /** Vrai pour un 2xx en HTTP, ou un code de sortie nul. */
  ok: boolean;
  status: number;
  statusLabel: string;
  statusKind: CodeSample["statusKind"];
  output: string;
  executionTime: string;
};

export interface SampleRunner {
  run(sample: CodeSample, signal?: AbortSignal): Promise<RunOutcome>;
}

/** Un statut est un succès si c'est un 2xx HTTP, ou un code de sortie nul. */
export function isSuccessStatus(sample: CodeSample): boolean {
  return sample.statusKind === "http"
    ? sample.expectedStatus >= 200 && sample.expectedStatus < 300
    : sample.expectedStatus === 0;
}

/**
 * Durée d'attente avant affichage du résultat.
 *
 * Purement cosmétique : elle rend l'état « en cours » perceptible. Bornée à
 * 1,2 s pour qu'un exemple annoncé à 12,4 s ne fasse pas patienter le visiteur
 * douze secondes pour rien.
 */
function delayFor(sample: CodeSample): number {
  const parsed = Number.parseFloat(sample.executionTime);
  if (Number.isNaN(parsed)) return 420;
  const ms = sample.executionTime.includes("s") && !sample.executionTime.includes("ms")
    ? parsed * 1000
    : parsed;
  return Math.min(Math.max(ms, 320), 1200);
}

/**
 * Exécuteur simulé — le seul utilisé aujourd'hui.
 *
 * `signal` permet d'annuler proprement si le visiteur change d'exemple ou
 * quitte la page pendant l'attente.
 */
export const simulatedRunner: SampleRunner = {
  run(sample, signal) {
    return new Promise<RunOutcome>((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({
          sampleId: sample.id,
          ok: isSuccessStatus(sample),
          status: sample.expectedStatus,
          statusLabel: sample.statusLabel,
          statusKind: sample.statusKind,
          output: sample.output,
          executionTime: sample.executionTime,
        });
      }, delayFor(sample));

      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Exécution annulée", "AbortError"));
        },
        { once: true },
      );
    });
  },
};
