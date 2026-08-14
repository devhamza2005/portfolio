import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import {
  RoadmapTimeline,
  type RoadmapMessages,
} from "@/components/sections/roadmap-timeline";
import { ROADMAP_PROJECTS } from "@/config/roadmap";
import { sectionIndex } from "@/config/sections";
import type { Locale } from "@/lib/i18n/config";

/**
 * Roadmap des projets.
 *
 * ── Pourquoi ici ──────────────────────────────────────────────────────────
 *
 * Juste après « Projets », qui montre ce qui a été livré. La roadmap répond à
 * la question suivante : comment. Elle démontre la maîtrise du cycle complet —
 * analyse, spécification, conception, architecture, base, développement,
 * tests, intégration continue, déploiement, maintenance — là où la section
 * précédente ne montrait que le résultat.
 *
 * Son numéro d'affichage vient de `HOME_SECTIONS` (src/config/sections.ts) :
 * il n'est écrit nulle part et suit l'ordre réel de la page.
 *
 * ── Enveloppe serveur ─────────────────────────────────────────────────────
 *
 * Volontairement mince : les données sont statiques et la frise est
 * interactive, donc tout le rendu vit dans le composant client. Aucune icône
 * dynamique à résoudre ici — celles de la frise sont importées nommément, donc
 * élaguées par le bundler.
 */
export function ProjectRoadmap({ t, locale }: { t: RoadmapMessages & { label: string; title: string; intro: string }; locale: Locale }) {
  return (
    <Section id="roadmap">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index={sectionIndex("roadmap")}>{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
          <p className="text-muted mt-4 leading-relaxed">{t.intro}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <RoadmapTimeline projects={ROADMAP_PROJECTS} locale={locale} t={t} />
        </Reveal>
      </div>
    </Section>
  );
}
