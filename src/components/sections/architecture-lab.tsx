import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import {
  ArchitectureDiagram,
  type DiagramMessages,
  type DiagramNode,
} from "@/components/sections/architecture-diagram";
import {
  ARCHITECTURE_NODES,
  ARCHITECTURE_VIEWS,
  USED_NODE_IDS,
} from "@/config/architecture";
import { highlight } from "@/lib/code/highlight";

/**
 * Section 06 — Architecture Lab.
 *
 * ── Pourquoi ici ──────────────────────────────────────────────────────────
 *
 * Juste après l'Engineering Lab, qui montre du code, et avant le Parcours :
 * outils (04) → code (05) → architecture (06) → où cela a servi (07). La
 * progression va du concret vers la vision d'ensemble, ce qui est exactement
 * l'ordre dans lequel un recruteur technique évalue un profil.
 *
 * ── Enveloppe serveur ─────────────────────────────────────────────────────
 *
 * Deux choses sont résolues ICI plutôt que dans le navigateur :
 *  • la coloration syntaxique des extraits ;
 *  • les icônes Lucide, dont le nom n'est connu qu'à l'exécution — les
 *    résoudre côté client embarquerait toute la bibliothèque (~800 Ko).
 *
 * Le composant client ne reçoit donc que des données et des éléments déjà
 * rendus. Même approche que la section Compétences et que l'Engineering Lab.
 */

export type ArchitectureMessages = {
  label: string;
  title: string;
  intro: string;
  diagram: DiagramMessages;
  views: Record<string, { name: string; description: string }>;
  nodes: Record<string, { name: string; description: string; responsibilities: string[] }>;
};

export function ArchitectureLab({ t }: { t: ArchitectureMessages }) {
  const nodes: Record<string, DiagramNode> = {};

  for (const id of USED_NODE_IDS) {
    const definition = ARCHITECTURE_NODES[id];
    if (!definition) continue;

    const translated = t.nodes[id];

    nodes[id] = {
      id,
      kind: definition.kind,
      icon: <Icon name={definition.icon} className="size-[1.125rem]" />,
      name: translated?.name ?? id,
      description: translated?.description ?? "",
      responsibilities: translated?.responsibilities ?? [],
      techs: definition.techs,
      ...(definition.endpoints ? { endpoints: definition.endpoints } : {}),
      ...(definition.code
        ? { lines: highlight(definition.code.snippet, definition.code.syntax) }
        : {}),
    };
  }

  const views = ARCHITECTURE_VIEWS.map((view) => ({
    id: view.id,
    name: t.views[view.id]?.name ?? view.id,
    description: t.views[view.id]?.description ?? "",
    tiers: view.tiers,
  }));

  return (
    <Section id="architecture" className="bg-sunken/40">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index="06">{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
          <p className="text-muted mt-4 leading-relaxed">{t.intro}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <ArchitectureDiagram views={views} nodes={nodes} t={t.diagram} />
        </Reveal>
      </div>
    </Section>
  );
}
