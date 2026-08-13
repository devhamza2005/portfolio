import { Download, Mail, MapPin } from "lucide-react";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  email: string;
  location: string | null;
  availabilityLabel: string | null;
  isAvailable: boolean;
  cvUrl: string | null;
  socialLinks: { id: string; label: string; url: string; iconKey: string | null }[];
  t: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    intro: string;
    emailLabel: string;
    locationLabel: string;
  };
  form: React.ComponentProps<typeof ContactForm>["t"];
  downloadCvLabel: string;
  locale: Locale;
};

/** Section 12 — Contact. */
export function Contact({
  email,
  location,
  availabilityLabel,
  isAvailable,
  cvUrl,
  socialLinks,
  t,
  form,
  downloadCvLabel,
  locale,
}: Props) {
  return (
    <Section id="contact">
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionLabel index="10">{t.label}</SectionLabel>
            <h2 className="text-display-md font-display mb-5">
              {t.titleBefore} <span className="text-gradient-brand">{t.titleAccent}</span>
              {t.titleAfter}
            </h2>
            <p className="text-muted mb-8 leading-relaxed">{t.intro}</p>

            {isAvailable && availabilityLabel ? (
              <Badge variant="success" size="lg" className="mb-8">
                <span className="bg-success size-2 rounded-full" />
                {availabilityLabel}
              </Badge>
            ) : null}

            <div className="grid gap-3">
              <Card className="flex items-center gap-3 p-4">
                <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-subtle text-xs">{t.emailLabel}</p>
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-brand text-sm font-medium break-all transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </Card>

              {location ? (
                <Card className="flex items-center gap-3 p-4">
                  <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-subtle text-xs">{t.locationLabel}</p>
                    <p className="text-sm font-medium">{location}</p>
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {cvUrl ? (
                <Button asChild variant="secondary" size="md">
                  <a href={cvUrl} download>
                    <Download />
                    {downloadCvLabel}
                  </a>
                </Button>
              ) : null}

              {socialLinks.length > 0 ? (
                <ul className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target={link.url.startsWith("http") ? "_blank" : undefined}
                        rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
                        aria-label={link.label}
                        className="border-border text-muted hover:text-brand hover:border-brand/40 grid size-10 place-items-center rounded-full border transition-colors"
                      >
                        <Icon name={link.iconKey ?? "Link2"} className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card variant="glass" className="p-6 sm:p-8">
              <ContactForm t={form} locale={locale} />
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
