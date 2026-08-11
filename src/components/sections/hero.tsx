import { ArrowDown, Download, Mail, MapPin } from "lucide-react";

import { Icon } from "@/components/admin/icon";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { HeroCode } from "@/components/sections/hero-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  headline: string;
  subline: string | null;
  tagline: string | null;
  location: string | null;
  availabilityLabel: string | null;
  isAvailable: boolean;
  cvUrl: string | null;
  cvLabel: string | null;
  socialLinks: { id: string; label: string; url: string; iconKey: string | null }[];
};

/**
 * Section 01 — Hero.
 *
 * Tout le contenu vient du profil en base : le nom, le titre, la phrase
 * d'accroche, la disponibilité et les liens sont modifiables depuis
 * /admin/profile sans toucher à ce composant.
 */
export function Hero({
  name,
  headline,
  subline,
  tagline,
  location,
  availabilityLabel,
  isAvailable,
  cvUrl,
  cvLabel,
  socialLinks,
}: Props) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16">
      <AuroraBackground />

      <div className="container-content relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Colonne texte */}
          <div>
            {isAvailable && availabilityLabel ? (
              <Reveal>
                <Badge variant="success" size="lg" className="mb-6">
                  <span className="relative flex size-2">
                    <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                    <span className="bg-success relative inline-flex size-2 rounded-full" />
                  </span>
                  {availabilityLabel}
                </Badge>
              </Reveal>
            ) : null}

            <h1 className="text-display-xl font-display">
              <TextReveal text={name.toUpperCase()} className="text-gradient block" />
            </h1>

            <Reveal delay={0.45} className="mt-5">
              <p className="font-display text-foreground text-xl font-medium sm:text-2xl">
                {headline}
              </p>
              {subline ? (
                <p className="text-brand mt-1.5 font-mono text-sm tracking-wide sm:text-base">
                  {subline}
                </p>
              ) : null}
            </Reveal>

            {tagline ? (
              <Reveal delay={0.55} className="mt-6">
                <p className="text-muted max-w-xl text-base leading-relaxed">{tagline}</p>
              </Reveal>
            ) : null}

            <Reveal delay={0.65} className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#projects">
                  Voir mes projets
                  <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
                </a>
              </Button>

              {cvUrl ? (
                <Button asChild size="lg" variant="secondary">
                  <a href={cvUrl} download>
                    <Download />
                    {cvLabel ?? "Télécharger mon CV"}
                  </a>
                </Button>
              ) : null}

              <Button asChild size="lg" variant="ghost">
                <a href="#contact">
                  <Mail />
                  Me contacter
                </a>
              </Button>
            </Reveal>

            <Reveal delay={0.75} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              {socialLinks.length > 0 ? (
                <ul className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target={link.url.startsWith("http") ? "_blank" : undefined}
                        rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
                        aria-label={link.label}
                        className="border-border text-muted hover:text-brand hover:border-brand/40 hover:shadow-[var(--shadow-glow)] grid size-10 place-items-center rounded-full border transition-all duration-200"
                      >
                        <Icon name={link.iconKey ?? "Link2"} className="size-[1.1rem]" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              {location ? (
                <p className="text-subtle flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5" />
                  {location}
                </p>
              ) : null}
            </Reveal>
          </div>

          {/* Colonne visuelle */}
          <HeroCode className="hidden lg:block" />
        </div>
      </div>

      {/* Invitation à faire défiler */}
      <a
        href="#about"
        aria-label="Faire défiler vers la section À propos"
        className="text-subtle hover:text-foreground absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 transition-colors md:flex"
      >
        <span className="font-mono text-[0.625rem] tracking-[0.2em] uppercase">Défiler</span>
        <span className="border-border flex h-9 w-5 items-start justify-center rounded-full border p-1">
          <span className="bg-brand animate-float size-1 rounded-full" />
        </span>
      </a>
    </section>
  );
}
