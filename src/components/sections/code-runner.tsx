"use client";

import { Check, Copy, Play, RotateCcw, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CodeSample } from "@/config/code-samples";
import type { CodeLine } from "@/lib/code/highlight";
import { TONE_CLASS } from "@/lib/code/tones";
import { simulatedRunner, type RunOutcome } from "@/lib/code/runner";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  INTERACTIVE CODE RUNNER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ AUCUN CODE N'EST EXÉCUTÉ. Le bouton « Exécuter » n'appelle ni compilateur,
 * ni processus, ni serveur : il affiche le résultat déjà associé à l'exemple
 * (voir src/lib/code/runner.ts). Le visiteur ne peut rien saisir — les extraits
 * sont des constantes du dépôt.
 *
 * ── Ce qui est fait côté serveur ──────────────────────────────────────────
 *
 * La coloration syntaxique est calculée en amont : ce composant ne reçoit que
 * des jetons déjà classés. Aucun analyseur ne part dans le navigateur.
 *
 * ── RTL ───────────────────────────────────────────────────────────────────
 *
 * Les panneaux de code et de sortie forcent `dir="ltr"` : du code source et
 * une sortie de terminal se lisent de gauche à droite, même sur la version
 * arabe. Seuls l'en-tête et les libellés suivent le sens de la page.
 */

export type RunnerMessages = {
  run: string;
  running: string;
  reset: string;
  copy: string;
  copied: string;
  copyAria: string;
  response: string;
  awaiting: string;
  disclaimer: string;
  /** Mention permanente : rien n'est exécuté côté serveur. */
  secureNotice: string;
  /** Remplace toute formulation qui laisserait croire à une vraie exécution. */
  simulationCompleted: string;
  simulatedDuration: string;
  selectAria: string;
  outputAria: string;
};

export type RunnerSample = {
  sample: CodeSample;
  /** Code déjà découpé côté serveur. */
  lines: CodeLine[];
  /** Titre traduit de l'exemple. */
  title: string;
  /** Message de résultat, en langue humaine et traduit. */
  message: string;
};

type Phase = "idle" | "running" | "done";

export function CodeRunner({ samples, t }: { samples: RunnerSample[]; t: RunnerMessages }) {
  const [activeId, setActiveId] = useState(samples[0]?.sample.id ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const active = useMemo(
    () => samples.find((item) => item.sample.id === activeId) ?? samples[0],
    [samples, activeId],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!active) return null;

  async function run() {
    if (!active) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("running");
    setOutcome(null);

    try {
      const result = await simulatedRunner.run(active.sample, controller.signal);
      setOutcome(result);
      setPhase("done");
    } catch {
      // Annulation volontaire : l'état a déjà été réinitialisé ailleurs.
    }
  }

  /**
   * Changer d'exemple annule l'exécution en cours et remet le panneau à zéro.
   *
   * Fait ICI plutôt que dans un effet : la réinitialisation découle directement
   * du clic, pas d'un changement d'état externe à synchroniser. Un effet
   * provoquerait un rendu en cascade pour rien.
   */
  function selectSample(id: string) {
    if (id === activeId) return;
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("idle");
    setOutcome(null);
    setActiveId(id);
  }

  function reset() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("idle");
    setOutcome(null);
  }

  async function copy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.sample.code);
      setCopied(true);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : on n'insiste
      // pas, l'extrait reste sélectionnable à la souris.
    }
  }

  const { sample } = active;
  const statusText =
    sample.statusKind === "http"
      ? `${sample.expectedStatus} ${sample.statusLabel}`
      : sample.statusLabel;

  return (
    <div className="space-y-4">
      {/* ── Sélecteur d'exemples ─────────────────────────────────────── */}
      <div role="group" aria-label={t.selectAria} className="flex flex-wrap gap-2">
        {samples.map((item) => {
          const current = item.sample.id === activeId;
          return (
            <button
              key={item.sample.id}
              type="button"
              onClick={() => selectSample(item.sample.id)}
              aria-pressed={current}
              className={cn(
                "focus-visible:ring-ring rounded-full border px-3.5 py-1.5 text-xs font-medium",
                "transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
                current
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              {item.sample.language}
              {item.sample.framework ? (
                <span className="text-subtle ms-1.5 font-mono text-[0.625rem]">
                  {item.sample.framework}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/*
        Mention PERMANENTE, visible avant même toute interaction : le visiteur
        doit comprendre au premier coup d'œil que le résultat est une réponse
        pré-écrite, pas la sortie d'un serveur. Elle reste affichée pendant et
        après l'exécution — jamais masquée par le résultat.
      */}
      <p className="border-border bg-elevated text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
        <ShieldCheck className="text-success size-3.5 shrink-0" aria-hidden />
        {t.secureNotice}
      </p>

      {/* ── Fenêtre ──────────────────────────────────────────────────── */}
      <div className="border-border bg-surface overflow-hidden rounded-[var(--radius-lg)] border">
        {/* En-tête */}
        <div className="border-border bg-elevated flex flex-wrap items-center gap-3 border-b px-4 py-2.5">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>

          <p className="min-w-0 flex-1 truncate text-xs font-medium">
            {active.title}
            <span className="text-subtle ms-2 font-mono text-[0.6875rem]" dir="ltr">
              {sample.language}
              {sample.framework ? ` · ${sample.framework}` : ""}
            </span>
          </p>

          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={copy}
              aria-label={t.copyAria}
              className={cn(
                "border-border text-muted hover:text-foreground focus-visible:ring-ring",
                "inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5",
                "text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="hidden sm:inline">{copied ? t.copied : t.copy}</span>
            </button>

            {phase === "done" ? (
              <button
                type="button"
                onClick={reset}
                className={cn(
                  "border-border text-muted hover:text-foreground focus-visible:ring-ring",
                  "inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5",
                  "text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">{t.reset}</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={run}
              disabled={phase === "running"}
              className={cn(
                "bg-brand-solid text-brand-contrast hover:bg-brand-solid-hover",
                "focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)]",
                "px-3 text-xs font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:outline-none disabled:opacity-70",
              )}
            >
              {phase === "running" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
              {phase === "running" ? t.running : t.run}
            </button>
          </div>
        </div>

        {/* Code — toujours de gauche à droite */}
        <div dir="ltr" className="overflow-x-auto">
          <pre className="min-w-max px-4 py-4 font-mono text-[0.8125rem] leading-relaxed">
            <code>
              {active.lines.map((tokens, index) => (
                <span key={index} className="grid grid-cols-[2.25rem_1fr]">
                  <span className="text-subtle/60 pe-3 text-end tabular-nums select-none">
                    {index + 1}
                  </span>
                  <span>
                    {tokens.length === 0 ? (
                      " "
                    ) : (
                      tokens.map((token, position) => (
                        <span key={position} className={TONE_CLASS[token.tone]}>
                          {token.text}
                        </span>
                      ))
                    )}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        </div>

        {/* Réponse */}
        <div className="border-border bg-sunken border-t">
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
            <p className="text-subtle font-mono text-[0.625rem] tracking-[0.18em] uppercase">
              {t.response}
            </p>

            {phase === "done" && outcome ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
                  "font-mono text-[0.6875rem] font-medium",
                  outcome.ok
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-danger/25 bg-danger/10 text-danger",
                )}
                dir="ltr"
              >
                {outcome.ok ? (
                  <Check className="size-3" />
                ) : (
                  <TriangleAlert className="size-3" />
                )}
                {statusText}
              </span>
            ) : null}

            {phase === "done" && outcome ? (
              <span className="text-subtle ms-auto font-mono text-[0.6875rem]">
                <span dir="ltr">{outcome.executionTime}</span> · {t.simulatedDuration}
              </span>
            ) : null}
          </div>

          {/*
            `aria-live` : le résultat apparaît sans déplacer le focus. Sans cette
            région, un lecteur d'écran n'aurait aucun moyen de savoir que
            l'exécution a produit quelque chose.
          */}
          <div
            aria-live="polite"
            aria-label={t.outputAria}
            className="px-4 pt-2 pb-4"
            dir="ltr"
          >
            {phase === "idle" ? (
              <p className="text-subtle font-mono text-xs" dir="auto">
                {t.awaiting}
              </p>
            ) : phase === "running" ? (
              <p className="text-muted flex items-center gap-2 font-mono text-xs">
                <Loader2 className="size-3.5 animate-spin" />
                <span dir="auto">{t.running}</span>
              </p>
            ) : outcome ? (
              <>
                <p className="text-muted mb-2 text-xs" dir="auto">
                  <span className="text-success font-medium">{t.simulationCompleted}</span>
                  {" — "}
                  {active.message}
                </p>
                <pre className="text-foreground overflow-x-auto font-mono text-xs leading-relaxed">
                  {outcome.output}
                </pre>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <p className="text-subtle text-xs leading-relaxed">{t.disclaimer}</p>
    </div>
  );
}
