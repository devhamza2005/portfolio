"use client";

import { ArrowUpRight, Check, Circle, Dot, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ROADMAP_STAGES,
  STAGE_TECHS,
  completionRatio,
  type RoadmapProject,
  type StageId,
  type StageStatus,
} from "@/config/roadmap";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ROADMAP DES PROJETS — frise interactive
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Mise en page ──────────────────────────────────────────────────────────
 *
 * À partir de `md`, la frise est HORIZONTALE : dix jalons répartis en parts
 * égales, reliés par un rail dont la portion parcourue est remplie. Le rail
 * s'arrête au centre du premier et du dernier jalon — soit `50 / n` pour cent
 * de chaque côté, calculé plutôt qu'écrit en dur.
 *
 * Sous `md`, dix libellés côte à côte deviendraient illisibles : la frise
 * bascule en VERTICALE, une ligne par étape. Même balisage, même composant.
 *
 * ── RTL ───────────────────────────────────────────────────────────────────
 *
 * Le rail et son remplissage utilisent des propriétés logiques
 * (`inset-inline-*`) : en arabe la frise se lit naturellement de droite à
 * gauche, sans code conditionnel. Les icônes directionnelles sont retournées.
 *
 * ── Accessibilité ─────────────────────────────────────────────────────────
 *
 * Chaque jalon est un vrai `<button>` : tabulation, Entrée et Espace marchent
 * sans code. `aria-current="step"` marque l'étape en cours, `aria-expanded`
 * l'ouverture du panneau, et la liste est une `<ol>` — la chronologie est
 * portée par le HTML, pas seulement par la mise en page.
 */

export type StageMessages = { name: string; description: string; deliverables: string[] };

export type RoadmapMessages = {
  projectsAria: string;
  stagesAria: string;
  hint: string;
  close: string;
  status: Record<StageStatus, string>;
  statusLabel: string;
  technologies: string;
  deliverables: string;
  progress: string;
  caseStudy: string;
  noCaseStudy: string;
  stages: Record<string, StageMessages>;
};

const STATUS_DOT: Record<StageStatus, string> = {
  completed: "border-brand bg-brand text-brand-contrast",
  current: "border-brand bg-brand-soft text-brand",
  pending: "border-border-strong bg-surface text-subtle",
};

const STATUS_BADGE: Record<StageStatus, string> = {
  completed: "border-brand/25 bg-brand-soft text-brand",
  current: "border-ember/25 bg-ember-soft text-ember",
  pending: "border-border text-subtle",
};

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === "completed") return <Check className="size-3.5" strokeWidth={3} />;
  if (status === "current") return <Dot className="size-6" strokeWidth={6} />;
  return <Circle className="size-2" strokeWidth={4} />;
}

export function RoadmapTimeline({
  projects,
  locale,
  t,
}: {
  projects: readonly RoadmapProject[];
  locale: Locale;
  t: RoadmapMessages;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [stageId, setStageId] = useState<StageId | null>(null);

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? projects[0],
    [projects, projectId],
  );

  if (!project) return null;

  /** Changer de projet referme le panneau : l'étape n'a plus le même état. */
  function selectProject(id: string) {
    if (id === projectId) return;
    setProjectId(id);
    setStageId(null);
  }

  const ratio = completionRatio(project);
  const count = ROADMAP_STAGES.length;
  // Le rail relie le centre du premier jalon à celui du dernier.
  const inset = `${50 / count}%`;

  return (
    <div className="space-y-6">
      {/* ── Choix du projet ──────────────────────────────────────────── */}
      <div role="group" aria-label={t.projectsAria} className="flex flex-wrap gap-2">
        {projects.map((item) => {
          const current = item.id === project.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectProject(item.id)}
              aria-pressed={current}
              className={cn(
                "focus-visible:ring-ring rounded-full border px-3.5 py-1.5 text-xs font-medium",
                "transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
                current
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* ── Entête du projet ─────────────────────────────────────────── */}
      <div className="border-border bg-surface rounded-[var(--radius-lg)] border p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="font-display min-w-0 flex-1 text-base font-semibold">{project.name}</h3>

          <span className="text-subtle font-mono text-xs tabular-nums">
            {interpolate(t.progress, { percent: ratio })}
          </span>

          {project.slug ? (
            <Link
              href={localizedPath(locale, `/projects/${project.slug}`)}
              className="text-brand hover:text-brand-hover focus-visible:ring-ring inline-flex items-center gap-1 rounded-[var(--radius-sm)] text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t.caseStudy}
              <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
            </Link>
          ) : (
            <span className="text-subtle text-xs">{t.noCaseStudy}</span>
          )}
        </div>

        {/* Barre de progression globale */}
        <div
          className="bg-elevated mb-6 h-1 overflow-hidden rounded-full"
          role="meter"
          aria-valuenow={ratio}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={interpolate(t.progress, { percent: ratio })}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--hf-gradient-via),var(--hf-gradient-from))] transition-[width] duration-500"
            style={{ width: `${ratio}%` }}
          />
        </div>

        {/* ── Frise ──────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Rail — masqué en vertical, où chaque ligne porte son propre trait */}
          <span
            aria-hidden
            className="bg-border-strong absolute top-[0.9375rem] hidden h-px md:block"
            style={{ insetInlineStart: inset, insetInlineEnd: inset }}
          />
          <span
            aria-hidden
            className="bg-brand absolute top-[0.9375rem] hidden h-px transition-[width] duration-500 md:block"
            style={{ insetInlineStart: inset, width: `calc((100% - ${inset} * 2) * ${ratio} / 100)` }}
          />

          <ol
            aria-label={t.stagesAria}
            className="relative flex flex-col gap-1 md:flex-row md:gap-0"
          >
            {ROADMAP_STAGES.map((stage, index) => {
              const status = project.stages[stage];
              const selected = stageId === stage;
              const messages = t.stages[stage];

              return (
                <li key={stage} className="md:flex-1">
                  <button
                    type="button"
                    onClick={() => setStageId(selected ? null : stage)}
                    aria-pressed={selected}
                    aria-expanded={selected}
                    {...(status === "current" ? { "aria-current": "step" as const } : {})}
                    className={cn(
                      "group focus-visible:ring-ring flex w-full items-center gap-3 rounded-[var(--radius-sm)]",
                      "px-2 py-1.5 text-start transition-colors",
                      "focus-visible:ring-2 focus-visible:outline-none",
                      "md:flex-col md:gap-2 md:px-1 md:text-center",
                      selected ? "bg-brand-soft" : "hover:bg-elevated",
                    )}
                  >
                    <span
                      className={cn(
                        "z-10 grid size-[1.875rem] shrink-0 place-items-center rounded-full border-2",
                        "transition-transform duration-200 group-hover:scale-110",
                        STATUS_DOT[status],
                      )}
                    >
                      <StatusIcon status={status} />
                    </span>

                    <span className="min-w-0 flex-1 md:flex-none">
                      <span className="text-subtle block font-mono text-[0.625rem] tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "block text-xs leading-tight",
                          status === "pending" ? "text-subtle" : "text-foreground font-medium",
                          selected && "text-brand",
                        )}
                      >
                        {messages?.name ?? stage}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="text-subtle mt-5 text-center text-xs">{t.hint}</p>
      </div>

      {/* ── Panneau de détail ────────────────────────────────────────── */}
      {stageId ? (
        <StageDetail
          stage={stageId}
          index={ROADMAP_STAGES.indexOf(stageId)}
          status={project.stages[stageId]}
          messages={t.stages[stageId]}
          t={t}
          onClose={() => setStageId(null)}
        />
      ) : null}
    </div>
  );
}

function StageDetail({
  stage,
  index,
  status,
  messages,
  t,
  onClose,
}: {
  stage: StageId;
  index: number;
  status: StageStatus;
  messages: StageMessages | undefined;
  t: RoadmapMessages;
  onClose: () => void;
}) {
  const techs = STAGE_TECHS[stage];

  return (
    <div className="border-brand/30 bg-surface rounded-[var(--radius-lg)] border p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border-2",
            STATUS_DOT[status],
          )}
        >
          <StatusIcon status={status} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-subtle font-mono text-[0.625rem] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h4 className="font-display text-base font-semibold">{messages?.name ?? stage}</h4>
          <p className="text-muted mt-1.5 text-sm leading-relaxed">{messages?.description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="text-subtle hover:text-foreground hover:bg-elevated focus-visible:ring-ring shrink-0 rounded-[var(--radius-sm)] p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <section>
          <h5 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
            {t.statusLabel}
          </h5>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              STATUS_BADGE[status],
            )}
          >
            <StatusIcon status={status} />
            {t.status[status]}
          </span>
        </section>

        <section>
          <h5 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
            {t.technologies}
          </h5>
          <ul className="flex flex-wrap gap-1.5" dir="ltr">
            {techs.map((tech) => (
              <li
                key={tech}
                className="border-border bg-elevated text-muted rounded-full border px-2.5 py-1 text-xs"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h5 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
            {t.deliverables}
          </h5>
          <ul className="space-y-1.5">
            {(messages?.deliverables ?? []).map((item) => (
              <li key={item} className="text-muted flex gap-2 text-sm leading-relaxed">
                <span className="bg-brand mt-[0.5rem] size-1 shrink-0 rounded-full" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
