import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatYearRange } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";

/** La couleur du badge est une décision de design, elle ne se traduit pas. */
const STATUS_VARIANT: Record<string, "success" | "warning" | "brand"> = {
  COMPLETED: "success",
  PENDING_DIPLOMA: "warning",
  ONGOING: "brand",
};

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  grade: string | null;
  mention: string | null;
  honors: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  schoolUrl: string | null;
  description: string | null;
  logo: { url: string; alt: string } | null;
};

/**
 * Section 08 — Formation.
 *
 * La note et la mention sont mises en avant avec l'accent ambre — c'est
 * exactement le genre de détail qu'un recruteur cherche du regard, il ne doit
 * pas être noyé dans le texte.
 */
export function EducationSection({
  education,
  locale,
  t,
  status: STATUS_LABEL,
}: {
  education: Education[];
  locale: Locale;
  t: { label: string; title: string; mention: string };
  status: Record<string, string>;
}) {
  if (education.length === 0) return null;

  return (
    <Section id="education" className="bg-sunken/40">
      <div className="container-content">
        <Reveal className="mb-12 max-w-2xl">
          <SectionLabel index="06">{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {education.map((item, index) => {
            const statusLabel = STATUS_LABEL[item.status];
            const statusVariant = STATUS_VARIANT[item.status];

            return (
              <Reveal key={item.id} delay={index * 0.07}>
                <Card variant="default" interactive className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start gap-3">
                    {item.logo ? (
                      <span className="bg-elevated relative size-10 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                        <Image
                          src={item.logo.url}
                          alt={item.logo.alt || item.school}
                          fill
                          sizes="40px"
                          className="object-contain p-1.5"
                        />
                      </span>
                    ) : (
                      <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]">
                        <Icon name="GraduationCap" className="size-5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="text-subtle font-mono text-[0.6875rem]">
                        {formatYearRange(item.startDate, item.endDate, locale)}
                      </p>
                      <h3 className="font-display mt-0.5 text-sm leading-snug font-semibold">
                        {item.degree}
                      </h3>
                    </div>
                  </div>

                  <p className="text-brand mb-1 text-sm font-medium">
                    {item.schoolUrl ? (
                      <a href={item.schoolUrl} target="_blank" rel="noreferrer noopener" className="hover:underline">
                        {item.school}
                      </a>
                    ) : (
                      item.school
                    )}
                  </p>

                  {item.field ? <p className="text-muted mb-3 text-xs">{item.field}</p> : null}

                  {/* Distinctions — l'information la plus regardée */}
                  {item.grade || item.mention ? (
                    <div className="border-ember/25 bg-ember-soft mb-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2">
                      <Icon name="Award" className="text-ember size-4 shrink-0" />
                      <span className="text-ember text-sm font-semibold">
                        {[item.grade, item.mention && interpolate(t.mention, { mention: item.mention })]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  ) : null}

                  {item.honors ? (
                    <p className="text-muted mb-3 text-xs leading-relaxed">{item.honors}</p>
                  ) : null}

                  {item.description ? (
                    <p className="text-muted mb-4 text-xs leading-relaxed">{item.description}</p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    {statusLabel ? (
                      <Badge variant={statusVariant} size="sm">
                        {statusLabel}
                      </Badge>
                    ) : null}
                    {item.location ? (
                      <span className="text-subtle flex items-center gap-1 text-[0.6875rem]">
                        <Icon name="MapPin" className="size-3" />
                        {item.location}
                      </span>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
