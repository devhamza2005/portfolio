import { ExternalLink, FileText } from "lucide-react";
import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMonthYear } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import { sectionIndex } from "@/config/sections";

type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date | null;
  expiryDate: Date | null;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
  fileUrl: string | null;
  featured: boolean;
  image: { url: string; alt: string } | null;
  /**
   * Calculé côté serveur dans la requête mise en cache : comparer à
   * `new Date()` ici empêcherait le prérendu de la page.
   */
  expired: boolean;
};

/**
 * Section « Certifications ».
 *
 * La section disparaît entièrement tant qu'aucune certification n'est saisie :
 * une rubrique vide fait plus de mal que son absence.
 */
export function Certifications({
  certifications,
  locale,
  t,
}: {
  certifications: Certification[];
  locale: Locale;
  t: { label: string; title: string; issuedIn: string; reference: string; expired: string; verify: string };
}) {
  if (certifications.length === 0) return null;

  return (
    <Section id="certifications">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index={sectionIndex("certifications")}>{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
        </Reveal>

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((certification) => {
            const expired = certification.expired;

            return (
              <StaggerItem key={certification.id} as="article" className="h-full">
                <Card variant="default" interactive className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start gap-3">
                    {certification.image ? (
                      <span className="bg-elevated relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                        <Image
                          src={certification.image.url}
                          alt={certification.image.alt || certification.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </span>
                    ) : (
                      <span className="bg-brand-soft text-brand grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)]">
                        <Icon name="BadgeCheck" className="size-5" />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm leading-snug font-semibold">
                        {certification.name}
                      </h3>
                      <p className="text-brand mt-0.5 text-xs font-medium">{certification.issuer}</p>
                    </div>
                  </div>

                  {certification.description ? (
                    <p className="text-muted mb-4 text-xs leading-relaxed">
                      {certification.description}
                    </p>
                  ) : null}

                  <div className="text-subtle mb-4 space-y-1 font-mono text-[0.6875rem]">
                    {certification.issueDate ? (
                      <p>{interpolate(t.issuedIn, { date: formatMonthYear(certification.issueDate, locale) })}</p>
                    ) : null}
                    {certification.credentialId ? (
                      <p>{interpolate(t.reference, { id: certification.credentialId })}</p>
                    ) : null}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {certification.featured ? (
                      <Badge variant="ember" size="sm">
                        Mise en avant
                      </Badge>
                    ) : null}
                    {expired ? (
                      <Badge variant="warning" size="sm">
                        {t.expired}
                      </Badge>
                    ) : null}

                    {certification.credentialUrl ? (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-brand ms-auto flex items-center gap-1 text-xs font-medium hover:underline"
                      >
                        {t.verify}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}

                    {certification.fileUrl ? (
                      <a
                        href={certification.fileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                      >
                        <FileText className="size-3" />
                        PDF
                      </a>
                    ) : null}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </Section>
  );
}
