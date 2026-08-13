import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPeriod } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";

type Experience = {
  id: string;
  company: string;
  role: string;
  employmentType: string;
  workMode: string | null;
  location: string | null;
  companyUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
  logo: { url: string; alt: string } | null;
  highlights: { id: string; text: string }[];
  technologies: { technology: { id: string; name: string; iconKey: string | null; color: string | null } }[];
};

/**
 * Section 07 — Expérience professionnelle, en frise verticale.
 *
 * Le trait vertical et les pastilles sont dessinés en CSS. Chaque entrée est
 * un `<li>` dans une liste ordonnée : la chronologie est portée par le HTML,
 * pas seulement par la mise en page (§20).
 */
export function ExperienceSection({
  experiences,
  locale,
  t,
  employmentType: EMPLOYMENT_LABEL,
  workMode: WORK_MODE_LABEL,
  todayLabel,
}: {
  experiences: Experience[];
  locale: Locale;
  t: { label: string; title: string };
  employmentType: Record<string, string>;
  workMode: Record<string, string>;
  todayLabel: string;
}) {
  if (experiences.length === 0) return null;

  return (
    <Section id="experience">
      <div className="container-content">
        <Reveal className="mb-12 max-w-2xl">
          <SectionLabel index="05">{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
        </Reveal>

        <ol className="relative">
          {/* Trait de la frise */}
          <span
            className="bg-border absolute top-2 bottom-2 start-[7px] w-px sm:start-[11px]"
            aria-hidden
          />

          {experiences.map((experience, index) => (
            <li key={experience.id} className="relative pb-10 ps-8 last:pb-0 sm:ps-12">
              {/* Pastille */}
              <span
                className={
                  "bg-background absolute top-1.5 start-0 grid size-4 place-items-center rounded-full " +
                  "ring-4 ring-[var(--background)] sm:size-6"
                }
                aria-hidden
              >
                <span
                  className={
                    experience.current
                      ? "bg-success size-2.5 rounded-full sm:size-3"
                      : "bg-brand size-2.5 rounded-full sm:size-3"
                  }
                />
              </span>

              <Reveal delay={index * 0.05}>
                <Card variant="default" className="p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-start gap-4">
                    {experience.logo ? (
                      <span className="bg-elevated relative size-11 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                        <Image
                          src={experience.logo.url}
                          alt={experience.logo.alt || experience.company}
                          fill
                          sizes="44px"
                          className="object-contain p-1.5"
                        />
                      </span>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold sm:text-lg">
                        {experience.role}
                      </h3>
                      <p className="text-brand mt-0.5 text-sm font-medium">
                        {experience.companyUrl ? (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:underline"
                          >
                            {experience.company}
                          </a>
                        ) : (
                          experience.company
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {experience.current ? (
                        <Badge variant="success" size="sm">
                          En cours
                        </Badge>
                      ) : null}
                      <Badge variant="default" size="sm">
                        {EMPLOYMENT_LABEL[experience.employmentType] ?? experience.employmentType}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-subtle mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Icon name="CalendarDays" className="size-3.5" />
                      {formatPeriod(
                        experience.startDate,
                        experience.endDate,
                        experience.current,
                        locale,
                        todayLabel,
                      )}
                    </span>
                    {experience.location ? (
                      <span className="flex items-center gap-1.5">
                        <Icon name="MapPin" className="size-3.5" />
                        {experience.location}
                      </span>
                    ) : null}
                    {experience.workMode ? (
                      <span className="flex items-center gap-1.5">
                        <Icon name="Building2" className="size-3.5" />
                        {WORK_MODE_LABEL[experience.workMode] ?? experience.workMode}
                      </span>
                    ) : null}
                  </div>

                  {experience.description ? (
                    <p className="text-muted mb-4 text-sm leading-relaxed">
                      {experience.description}
                    </p>
                  ) : null}

                  {experience.highlights.length > 0 ? (
                    <ul className="mb-4 space-y-2">
                      {experience.highlights.map((highlight) => (
                        <li key={highlight.id} className="text-muted flex gap-2.5 text-sm">
                          <span className="bg-brand mt-[0.55rem] size-1 shrink-0 rounded-full" aria-hidden />
                          <span className="leading-relaxed">{highlight.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {experience.technologies.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {experience.technologies.map(({ technology }) => (
                        <li key={technology.id}>
                          <Badge variant="outline" size="sm">
                            {technology.iconKey ? (
                              <Icon
                                name={technology.iconKey}
                                fallback="Boxes"
                                style={technology.color ? { color: technology.color } : undefined}
                              />
                            ) : null}
                            {technology.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
