import { ExternalLink, Star } from "lucide-react";

import { GithubIcon } from "@/components/brand/brand-icons";
import { Counter } from "@/components/motion/counter";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Card } from "@/components/ui/card";
import { sectionIndex } from "@/config/sections";
import { languageColor } from "@/lib/github/colors";
import type { GithubStatsDisplay } from "@/server/queries/github";

type Messages = {
  label: string;
  title: string;
  subtitle: string;
  stats: { repos: string; stars: string; followers: string };
  languages: string;
  activity: string;
  viewProfile: string;
  noDescription: string;
};

/**
 * Section « GitHub » — activité réelle, lue en direct depuis l'API publique.
 *
 * ── « Live » sans dépasser la limite de débit ──────────────────────────────
 *
 * Les chiffres proviennent de `getGithubStats()` (§`server/queries/github.ts`),
 * mis en cache une heure pour tous les visiteurs à la fois — pas une seconde
 * requête par visite. Le compteur animé (`Counter`, déjà utilisé par la
 * section Statistiques) donne l'impression de fraîcheur sans qu'aucune donnée
 * ne soit inventée : la valeur affichée EST la valeur réelle du moment.
 *
 * ── Absence gracieuse ──────────────────────────────────────────────────────
 *
 * Aucun lien GitHub configuré, ou l'API indisponible : `stats` vaut `null` et
 * la section entière disparaît — même principe que Certifications quand la
 * base est vide. Un widget cassé nuirait plus qu'il n'apporterait.
 */
export function GithubStatsSection({
  stats,
  t,
}: {
  stats: GithubStatsDisplay | null;
  t: Messages;
}) {
  if (!stats) return null;

  const cards = [
    { label: t.stats.repos, value: stats.publicRepos },
    { label: t.stats.stars, value: stats.totalStars },
    { label: t.stats.followers, value: stats.followers },
  ];

  return (
    <Section id="github">
      <div className="container-content">
        <Reveal className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionLabel index={sectionIndex("github")}>{t.label}</SectionLabel>
            <h2 className="text-display-md font-display">{t.title}</h2>
            <p className="text-muted mt-4">{t.subtitle}</p>
          </div>

          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            dir="ltr"
            aria-label={`${t.viewProfile} — @${stats.login}`}
            className={[
              "border-border text-muted hover:text-foreground hover:border-brand/40",
              "inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2",
              "focus-visible:ring-ring text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
            ].join(" ")}
          >
            <GithubIcon className="size-4" />
            @{stats.login}
          </a>
        </Reveal>

        {/* ── Chiffres animés ──────────────────────────────────────────── */}
        <StaggerGroup className="mb-8 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.label}>
              <Card variant="outline" className="p-5 text-center sm:text-start">
                <p className="font-display text-display-sm font-semibold tabular-nums" dir="ltr">
                  <Counter value={card.value} />
                </p>
                <p className="text-muted mt-1 text-sm">{card.label}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Langages ───────────────────────────────────────────────── */}
          {stats.topLanguages.length > 0 ? (
            <Reveal delay={0.1} className="lg:col-span-2">
              <Card variant="default" className="h-full p-6">
                <h3 className="font-display mb-5 text-sm font-semibold">{t.languages}</h3>

                <ul className="space-y-3.5">
                  {stats.topLanguages.map((language) => (
                    <li key={language.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: languageColor(language.name) }}
                          />
                          <span className="text-foreground truncate">{language.name}</span>
                        </span>
                        <span className="text-subtle shrink-0 font-mono text-xs tabular-nums" dir="ltr">
                          {language.percent}%
                        </span>
                      </div>

                      <div className="bg-sunken h-1.5 overflow-hidden rounded-full" dir="ltr">
                        <div
                          className="bg-brand h-full rounded-full transition-[width] duration-700 ease-[var(--ease-signature)]"
                          style={{ width: `${language.percent}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ) : null}

          {/* ── Activité récente ───────────────────────────────────────── */}
          {stats.recentRepos.length > 0 ? (
            <Reveal
              delay={0.15}
              className={stats.topLanguages.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}
            >
              <h3 className="font-display mb-4 text-sm font-semibold">{t.activity}</h3>

              <StaggerGroup className="grid gap-3 sm:grid-cols-2">
                {stats.recentRepos.map((repo) => (
                  <StaggerItem key={repo.name}>
                    <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block h-full"
                      >
                        <Card variant="default" interactive className="flex h-full flex-col p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className="text-foreground truncate font-mono text-sm font-medium" dir="ltr">
                              {repo.name}
                            </span>
                            <ExternalLink className="text-subtle mt-0.5 size-3.5 shrink-0" aria-hidden />
                          </div>

                          <p className="text-muted mb-3 line-clamp-2 flex-1 text-xs leading-relaxed">
                            {repo.description ?? t.noDescription}
                          </p>

                          <div className="text-subtle flex items-center gap-3 text-[0.6875rem]" dir="ltr">
                            {repo.language ? (
                              <span className="flex items-center gap-1.5">
                                <span
                                  aria-hidden
                                  className="size-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: languageColor(repo.language) }}
                                />
                                {repo.language}
                              </span>
                            ) : null}
                            {repo.stars > 0 ? (
                              <span className="flex items-center gap-1">
                                <Star className="size-3" aria-hidden />
                                {repo.stars}
                              </span>
                            ) : null}
                            <span className="ms-auto">{repo.pushedAtLabel}</span>
                          </div>
                        </Card>
                      </a>
                    </SpotlightCard>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

