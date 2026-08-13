import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { CodeRunner, type RunnerMessages } from "@/components/sections/code-runner";
import { CODE_SAMPLES } from "@/config/code-samples";
import { highlight } from "@/lib/code/highlight";

/**
 * Section 05 — Engineering Lab.
 *
 * ── Pourquoi ici ──────────────────────────────────────────────────────────
 *
 * Placée juste après « Technologies » et avant « Parcours », elle referme la
 * démonstration technique : la stack est annoncée, le lab montre ce qu'on en
 * fait, puis le parcours dit où cela a servi. Placée après les projets, elle
 * aurait fait doublon avec les études de cas ; placée avant les compétences,
 * elle serait arrivée sans contexte.
 *
 * ── Enveloppe serveur ─────────────────────────────────────────────────────
 *
 * La coloration syntaxique est calculée ICI, côté serveur : l'analyseur ne part
 * jamais dans le navigateur, qui ne reçoit que des jetons déjà classés. Même
 * raisonnement que pour les icônes de la section Compétences.
 */

export type LabMessages = {
  label: string;
  title: string;
  intro: string;
  runner: RunnerMessages;
  /** Titre et message de résultat par exemple, indexés par `id`. */
  samples: Record<string, { title: string; message: string }>;
};

export function EngineeringLab({ t }: { t: LabMessages }) {
  const samples = CODE_SAMPLES.map((sample) => ({
    sample,
    lines: highlight(sample.code, sample.syntax),
    title: t.samples[sample.id]?.title ?? sample.language,
    message: t.samples[sample.id]?.message ?? "",
  }));

  return (
    <Section id="lab">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index="05">{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
          <p className="text-muted mt-4 leading-relaxed">{t.intro}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <CodeRunner samples={samples} t={t.runner} />
        </Reveal>
      </div>
    </Section>
  );
}
