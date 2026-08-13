import { ExternalLink } from "lucide-react";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatYear } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  organisation: string | null;
  date: Date | null;
  year: number | null;
  url: string | null;
  iconKey: string | null;
  featured: boolean;
};

/** Section 11 — Réalisations et distinctions. */
export function Achievements({
  achievements,
  locale,
  t,
}: {
  achievements: Achievement[];
  locale: Locale;
  t: { label: string; title: string; view: string };
}) {
  if (achievements.length === 0) return null;

  return (
    <Section id="achievements" className="bg-sunken/40">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index="11">{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
        </Reveal>

        <StaggerGroup className="grid gap-4 md:grid-cols-3">
          {achievements.map((achievement) => {
            const year = achievement.year ?? (achievement.date ? formatYear(achievement.date, locale) : null);

            return (
              <StaggerItem key={achievement.id} as="article" className="h-full">
                <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
                  <Card
                    variant={achievement.featured ? "gradient" : "default"}
                    interactive
                    className="flex h-full flex-col p-5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="bg-ember-soft text-ember grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)]">
                        <Icon name={achievement.iconKey ?? "Trophy"} className="size-5" />
                      </span>
                      {year ? (
                        <span className="text-subtle font-mono text-xs tabular-nums">{year}</span>
                      ) : null}
                    </div>

                    <h3 className="font-display mb-2 text-sm leading-snug font-semibold">
                      {achievement.title}
                    </h3>

                    {achievement.description ? (
                      <p className="text-muted mb-4 text-xs leading-relaxed">
                        {achievement.description}
                      </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      {achievement.category ? (
                        <Badge variant="outline" size="sm">
                          {achievement.category}
                        </Badge>
                      ) : null}
                      {achievement.organisation ? (
                        <span className="text-subtle text-[0.6875rem]">
                          {achievement.organisation}
                        </span>
                      ) : null}
                      {achievement.url ? (
                        <a
                          href={achievement.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-brand ms-auto flex items-center gap-1 text-xs font-medium hover:underline"
                        >
                          {t.view}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </div>
                  </Card>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </Section>
  );
}
