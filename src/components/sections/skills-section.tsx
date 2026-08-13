import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { SkillsTabs } from "@/components/sections/skills";
import { interpolate } from "@/lib/i18n/format";
import type { SkillGroup } from "@/server/queries/portfolio";
import { sectionIndex } from "@/config/sections";

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
export function SkillsSection({
  groups,
  t,
  proficiency,
}: {
  groups: SkillGroup[];
  t: { label: string; titleBefore: string; titleAccent: string; titleAfter: string; note: string };
  /** Libellés des niveaux, indexés par valeur d'énumération Prisma. */
  proficiency: Record<string, string>;
}) {
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
          <SectionLabel index={sectionIndex("skills")}>{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">
            {interpolate(t.titleBefore, { count: total })}{" "}
            <span className="text-gradient-brand">{t.titleAccent}</span> {t.titleAfter}
          </h2>
          <p className="text-muted mt-4">{t.note}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <SkillsTabs
            groups={groups}
            groupIcons={groupIcons}
            skillIcons={skillIcons}
            proficiency={proficiency}
          />
        </Reveal>
      </div>
    </Section>
  );
}
