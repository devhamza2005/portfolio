import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { SkillsTabs } from "@/components/sections/skills";
import type { SkillGroup } from "@/server/queries/portfolio";

/**
 * Enveloppe serveur de la section Compétences.
 *
 * L'en-tête est rendu côté serveur (donc indexable et immédiatement visible) ;
 * seuls les onglets interactifs partent dans le bundle client.
 */
export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null;

  const total = groups.reduce((sum, group) => sum + group.skills.length, 0);

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
          <SkillsTabs groups={groups} />
        </Reveal>
      </div>
    </Section>
  );
}
