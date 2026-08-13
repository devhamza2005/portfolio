import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { Monogram } from "@/components/brand/monogram";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  bioShort: string | null;
  bioLong: string | null;
  location: string | null;
  avatar: { url: string; alt: string } | null;
  qualities: { id: string; label: string; iconKey: string | null }[];
  languages: { id: string; name: string; level: string | null; percent: number | null }[];
  t: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    qualities: string;
    languages: string;
    portraitAlt: string;
    photoPlaceholder: string;
  };
};

/**
 * Section 03 — À propos.
 *
 * La biographie est stockée en texte : les doubles retours à la ligne y font
 * office de séparateurs de paragraphes, ce qui évite d'imposer un éditeur
 * riche dans le back-office tout en gardant une mise en forme correcte.
 */
export function About({ bioShort, bioLong, location, avatar, qualities, languages, t }: Props) {
  const paragraphs = (bioLong ?? bioShort ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <Section id="about">
      <div className="container-content">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Portrait */}
          <Reveal>
            <div className="relative mx-auto max-w-sm lg:mx-0">
              <div className="border-gradient bg-elevated relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)]">
                {avatar ? (
                  <Image
                    src={avatar.url}
                    alt={avatar.alt || t.portraitAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 384px"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  // Repli tant qu'aucune photo n'est téléversée : le monogramme
                  // vaut mieux qu'un bloc vide ou une silhouette générique.
                  <div className="bg-grid flex h-full flex-col items-center justify-center gap-4">
                    <Monogram className="size-24" />
                    <p className="text-subtle px-6 text-center text-xs">{t.photoPlaceholder}</p>
                  </div>
                )}
              </div>

              {location ? (
                <div className="glass absolute -end-3 -bottom-3 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-[var(--shadow-md)]">
                  <Icon name="MapPin" className="text-brand size-3.5" />
                  <span className="text-xs font-medium">{location}</span>
                </div>
              ) : null}
            </div>
          </Reveal>

          {/* Texte */}
          <div>
            <Reveal>
              <SectionLabel index="01">{t.label}</SectionLabel>
              <h2 className="text-display-md font-display mb-6">
                {t.titleBefore} <span className="text-gradient-brand">{t.titleAccent}</span>
                {t.titleAfter}
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-muted leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {qualities.length > 0 ? (
              <Reveal delay={0.2} className="mt-8">
                <h3 className="text-subtle mb-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                  {t.qualities}
                </h3>
                <StaggerGroup className="flex flex-wrap gap-2">
                  {qualities.map((quality) => (
                    <StaggerItem key={quality.id}>
                      <Badge variant="outline" size="lg">
                        {quality.iconKey ? <Icon name={quality.iconKey} /> : null}
                        {quality.label}
                      </Badge>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </Reveal>
            ) : null}

            {languages.length > 0 ? (
              <Reveal delay={0.3} className="mt-8">
                <h3 className="text-subtle mb-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                  {t.languages}
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {languages.map((language) => (
                    <Card key={language.id} className="px-4 py-3">
                      <p className="text-sm font-medium">{language.name}</p>
                      {language.level ? (
                        <p className="text-subtle mt-0.5 text-xs">{language.level}</p>
                      ) : null}
                      {language.percent !== null ? (
                        <div className="bg-elevated mt-2 h-1 overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,var(--hf-gradient-via),var(--hf-gradient-from))]"
                            style={{ width: `${language.percent}%` }}
                          />
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
