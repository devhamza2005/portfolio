"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { NodeKind } from "@/config/architecture";
import type { CodeLine } from "@/lib/code/highlight";
import { TONE_CLASS } from "@/lib/code/tones";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ARCHITECTURE LAB — diagramme interactif
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Mise en page ──────────────────────────────────────────────────────────
 *
 * Le diagramme est une pile d'ÉTAGES, chacun rendu par une grille CSS à N
 * colonnes égales. Les connecteurs n'ont donc aucune mesure à faire : le centre
 * de la i-ème carte se trouve exactement à `(i + 0.5) / N` de la largeur, et le
 * SVG trace ses courbes sur ces proportions. Rien à recalculer au
 * redimensionnement, donc aucun débordement possible.
 *
 * ── Mobile ────────────────────────────────────────────────────────────────
 *
 * Sous `md`, les étages passent à une colonne : le diagramme devient
 * naturellement une liste de cartes. Les connecteurs en éventail sont alors
 * masqués — leurs proportions ne vaudraient plus rien — et remplacés par un
 * simple segment vertical. Aucun second rendu, aucune duplication de balisage.
 *
 * ── RTL ───────────────────────────────────────────────────────────────────
 *
 * L'interface suit le sens de la page. Le diagramme se lit de haut en bas :
 * son orientation ne dépend donc pas de la direction du texte. Les extraits de
 * code et les routes forcent `dir="ltr"`.
 *
 * ── Accessibilité ─────────────────────────────────────────────────────────
 *
 * Les nœuds sont de vrais `<button>` : tabulation, Entrée et Espace
 * fonctionnent sans code supplémentaire. `aria-pressed` annonce la sélection,
 * `aria-expanded` l'ouverture du panneau, et le SVG est purement décoratif
 * (`aria-hidden`) — l'information qu'il porte est déjà dans l'ordre du DOM.
 */

export type DiagramNode = {
  id: string;
  kind: NodeKind;
  icon: React.ReactNode;
  name: string;
  description: string;
  responsibilities: readonly string[];
  techs: readonly string[];
  endpoints?: readonly string[];
  /** Extrait déjà colorisé côté serveur. */
  lines?: CodeLine[];
};

export type DiagramView = {
  id: string;
  name: string;
  description: string;
  tiers: readonly (readonly string[])[];
};

export type DiagramMessages = {
  viewsAria: string;
  nodesAria: string;
  hint: string;
  close: string;
  responsibilities: string;
  technologies: string;
  endpoints: string;
  codeExample: string;
};

/** Teinte de l'icône selon la famille du nœud — sobre, jamais criard. */
const KIND_CLASS: Record<NodeKind, string> = {
  client: "bg-brand-soft text-brand",
  gateway: "bg-accent-soft text-accent",
  security: "bg-ember-soft text-ember",
  service: "bg-brand-soft text-brand",
  data: "bg-elevated text-muted",
  infra: "bg-elevated text-subtle",
};

/** Colonnes par étage. Tailwind a besoin de classes littérales. */
const COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function ArchitectureDiagram({
  views,
  nodes,
  t,
}: {
  views: DiagramView[];
  nodes: Record<string, DiagramNode>;
  t: DiagramMessages;
}) {
  const [viewId, setViewId] = useState(views[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(() => views.find((v) => v.id === viewId) ?? views[0], [views, viewId]);
  const selected = selectedId ? nodes[selectedId] : null;

  /**
   * Le Developer Terminal peut demander une vue précise (`open architecture 03`).
   *
   * Un évènement plutôt qu'un paramètre d'URL : la section reste prérendue,
   * le `canonical` et le `hreflang` ne bougent pas, et un rechargement ne
   * conserve pas un état d'interface dans l'adresse. L'identifiant reçu est
   * vérifié contre les vues connues avant d'être appliqué.
   */
  useEffect(() => {
    function onRequest(event: Event) {
      const requested = (event as CustomEvent<string>).detail;
      if (typeof requested !== "string") return;
      if (!views.some((item) => item.id === requested)) return;
      setViewId(requested);
      setSelectedId(null);
    }

    window.addEventListener("portfolio:architecture-view", onRequest);
    return () => window.removeEventListener("portfolio:architecture-view", onRequest);
  }, [views]);

  if (!view) return null;

  /** Changer de vue referme le panneau : le nœud n'existe plus forcément. */
  function selectView(id: string) {
    if (id === viewId) return;
    setViewId(id);
    setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      {/* ── Choix de la vue ──────────────────────────────────────────── */}
      <div role="group" aria-label={t.viewsAria} className="flex flex-wrap gap-2">
        {views.map((item) => {
          const current = item.id === view.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectView(item.id)}
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

      <p className="text-muted max-w-2xl text-sm leading-relaxed">{view.description}</p>

      {/* ── Diagramme ────────────────────────────────────────────────── */}
      <div className="border-border bg-sunken/40 rounded-[var(--radius-lg)] border p-4 sm:p-6">
        <ol aria-label={t.nodesAria} className="mx-auto max-w-3xl">
          {view.tiers.map((tier, index) => (
            <li key={index}>
              <div className={cn("grid grid-cols-1 gap-3", COLS[tier.length] ?? "md:grid-cols-3")}>
                {tier.map((nodeId) => {
                  const node = nodes[nodeId];
                  if (!node) return null;
                  return (
                    <NodeCard
                      key={nodeId}
                      node={node}
                      selected={selectedId === nodeId}
                      onSelect={() =>
                        setSelectedId(selectedId === nodeId ? null : nodeId)
                      }
                    />
                  );
                })}
              </div>

              {index < view.tiers.length - 1 ? (
                <Connector targets={view.tiers[index + 1]?.length ?? 1} />
              ) : null}
            </li>
          ))}
        </ol>

        <p className="text-subtle mt-5 text-center text-xs">{t.hint}</p>
      </div>

      {/* ── Panneau de détail ────────────────────────────────────────── */}
      {selected ? <DetailPanel node={selected} t={t} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Carte de nœud
   ───────────────────────────────────────────────────────────────────────── */

function NodeCard({
  node,
  selected,
  onSelect,
}: {
  node: DiagramNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-expanded={selected}
      className={cn(
        "group focus-visible:ring-ring flex w-full items-center gap-3 rounded-[var(--radius-md)]",
        "border px-3.5 py-3 text-start transition-all duration-200",
        "focus-visible:ring-2 focus-visible:outline-none",
        selected
          ? "border-brand bg-brand-soft shadow-[var(--shadow-glow)]"
          : "border-border bg-surface hover:border-border-strong hover:-translate-y-0.5",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]",
          KIND_CLASS[node.kind],
        )}
      >
        {node.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{node.name}</span>
        <span className="text-subtle block truncate font-mono text-[0.625rem]" dir="ltr">
          {node.techs.join(" · ")}
        </span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Connecteur entre deux étages
   ───────────────────────────────────────────────────────────────────────── */

function Connector({ targets }: { targets: number }) {
  // Centre de la i-ème carte de l'étage suivant, en pourcentage de la largeur.
  const centers = Array.from({ length: targets }, (_, i) => ((i + 0.5) / targets) * 100);

  return (
    <div aria-hidden className="relative h-9">
      {/* Éventail — proportions exactes, donc uniquement quand la grille
          affiche réellement N colonnes, c'est-à-dire à partir de `md`. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 hidden size-full md:block"
      >
        {centers.map((x, index) => (
          <path
            key={index}
            d={`M 50 0 C 50 55, ${x} 45, ${x} 100`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {centers.map((x, index) => (
          <path
            key={`flux-${index}`}
            d={`M 50 0 C 50 55, ${x} 45, ${x} 100`}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="1.2"
            strokeDasharray="6 18"
            vectorEffect="non-scaling-stroke"
            className="animate-flow opacity-70"
          />
        ))}
      </svg>

      {/* Mobile : les cartes sont empilées, un simple segment suffit. */}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 md:hidden">
        <span className="bg-border-strong h-4 w-px" />
        <ChevronDown className="text-subtle size-3.5" />
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Panneau de détail
   ───────────────────────────────────────────────────────────────────────── */

function DetailPanel({
  node,
  t,
  onClose,
}: {
  node: DiagramNode;
  t: DiagramMessages;
  onClose: () => void;
}) {
  return (
    <div className="border-brand/30 bg-surface rounded-[var(--radius-lg)] border p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]",
            KIND_CLASS[node.kind],
          )}
        >
          {node.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold">{node.name}</h3>
          <p className="text-muted mt-1 text-sm leading-relaxed">{node.description}</p>
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

      <div className="grid gap-5 sm:grid-cols-2">
        {node.responsibilities.length > 0 ? (
          <section>
            <h4 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
              {t.responsibilities}
            </h4>
            <ul className="space-y-1.5">
              {node.responsibilities.map((item) => (
                <li key={item} className="text-muted flex gap-2 text-sm leading-relaxed">
                  <span className="bg-brand mt-[0.5rem] size-1 shrink-0 rounded-full" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h4 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
            {t.technologies}
          </h4>
          <ul className="flex flex-wrap gap-1.5" dir="ltr">
            {node.techs.map((tech) => (
              <li
                key={tech}
                className="border-border bg-elevated text-muted rounded-full border px-2.5 py-1 text-xs"
              >
                {tech}
              </li>
            ))}
          </ul>

          {node.endpoints && node.endpoints.length > 0 ? (
            <>
              <h4 className="text-subtle mt-5 mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                {t.endpoints}
              </h4>
              <ul className="space-y-1 overflow-x-auto" dir="ltr">
                {node.endpoints.map((endpoint) => (
                  <li key={endpoint} className="text-muted font-mono text-xs whitespace-pre">
                    {endpoint}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>

      {node.lines && node.lines.length > 0 ? (
        <section className="mt-5">
          <h4 className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
            {t.codeExample}
          </h4>
          {/* Le code se lit toujours de gauche à droite, même en arabe. */}
          <div
            dir="ltr"
            className="border-border bg-sunken overflow-x-auto rounded-[var(--radius-md)] border"
          >
            <pre className="min-w-max px-4 py-3 font-mono text-xs leading-relaxed">
              <code>
                {node.lines.map((tokens, index) => (
                  <span key={index} className="block">
                    {tokens.length === 0
                      ? " "
                      : tokens.map((token, position) => (
                          <span key={position} className={TONE_CLASS[token.tone]}>
                            {token.text}
                          </span>
                        ))}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </section>
      ) : null}
    </div>
  );
}
