import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { SkillsTabs } from "@/components/sections/skills";
import type { SkillGroup } from "@/server/queries/portfolio";

/**
 * Enveloppe serveur de la section Compétences.
 *
 * L'en-tête est rendu côté serveur (donc indexable et immédiatement visible) ;
 * seuls les onglets interactifs partent dans le bundle client.
 *
 * ── Pourquoi les icônes sont résolues ICI ──────────────────────────────────
 *
 * `Icon` traduit un nom stocké en base en composant, ce qui l'oblige à
 * importer Lucide en entier (`import * as Lucide`) : aucune sélection
 * statique n'est possible quand la clé n'est connue qu'à l'exécution. Importé
 * depuis un composant client, il embarquait les ~800 Ko de la bibliothèque
 * complète dans le navigateur.
 *
 * Résolues côté serveur et transmises en tant qu'éléments React, les icônes
 * arrivent déjà rendues : le client n'a plus besoin de Lucide, et le choix de
 * l'icône reste entièrement piloté depuis /admin (§12).
 */
export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null;

  const total = groups.reduce((sum, group) => sum + group.skills.length, 0);

  const groupIcons: Record<string, React.ReactNode> = {};
  const skillIcons: Record<string, React.ReactNode> = {};

  for (const group of groups) {
    if (group.iconKey) {
      groupIcons[group.id] = <Icon name={group.iconKey} className="mr-1.5 inline size-3.5" />;
    }
    for (const skill of group.skills) {
      if (skill.iconKey) {
        skillIcons[skill.id] = (
          <Icon
            name={skill.iconKey}
            className="size-3.5 shrink-0"
            style={skill.color ? { color: skill.color } : undefined}
          />
        );
      }
    }
  }

  return (
    <Section id="skills">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index="03">Compétences</SectionLabel>
          <h2 className="text-display-md font-display">
            {total} compétences, <span className="text-gradient-brand">réparties</span> par domaine
          </h2>
          <p className="text-muted mt-4">
            Les niveaux reflètent un usage réel : « Avancé » signifie utilisé en conditions de
            production, pas seulement étudié.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <SkillsTabs groups={groups} groupIcons={groupIcons} skillIcons={skillIcons} />
        </Reveal>
      </div>
    </Section>
  );
}
