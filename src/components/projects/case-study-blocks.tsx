import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectDetail } from "@/server/queries/portfolio";

/**
 * Blocs de contenu d'une étude de cas.
 *
 * Chacun rend `null` si sa collection est vide — la section parente disparaît
 * alors avec lui, sans laisser de titre orphelin.
 */

// ───────────────────────────────────────────────────────────────────────────
//  FONCTIONNALITÉS
// ───────────────────────────────────────────────────────────────────────────

export function FeatureGrid({ features }: { features: ProjectDetail["features"] }) {
  if (features.length === 0) return null;

  return (
    <StaggerGroup className="grid gap-3 sm:grid-cols-2">
      {features.map((feature) => (
        <StaggerItem key={feature.id} as="article">
          <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
            <Card variant="default" className="h-full p-4">
              <div className="flex items-start gap-3">
                <span className="bg-elevated text-brand grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]">
                  <Icon name={feature.iconKey ?? "Check"} className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm leading-snug font-medium">{feature.title}</h3>
                  {feature.description ? (
                    <p className="text-muted mt-1 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  DÉFIS TECHNIQUES
// ───────────────────────────────────────────────────────────────────────────

export function ChallengeList({
  challenges,
  problemLabel,
  solutionLabel,
}: {
  challenges: ProjectDetail["challenges"];
  problemLabel: string;
  solutionLabel: string;
}) {
  if (challenges.length === 0) return null;

  return (
    <div className="space-y-4">
      {challenges.map((challenge, index) => (
        <Card key={challenge.id} variant="default" className="overflow-hidden p-0">
          <div className="border-border flex items-center gap-3 border-b px-5 py-3.5">
            <span className="text-subtle font-mono text-xs tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-sm font-semibold">{challenge.title}</h3>
          </div>

          <div className="divide-border grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-danger mb-2 flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wider uppercase">
                <Icon name="TriangleAlert" className="size-3" />
                {problemLabel}
              </p>
              <p className="text-muted text-sm leading-relaxed">{challenge.problem}</p>
            </div>

            <div className="p-5">
              <p className="text-success mb-2 flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wider uppercase">
                <Icon name="Lightbulb" className="size-3" />
                {solutionLabel}
              </p>
              <p className="text-muted text-sm leading-relaxed">{challenge.solution}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  MÉTRIQUES
// ───────────────────────────────────────────────────────────────────────────

export function MetricGrid({ metrics }: { metrics: ProjectDetail["metrics"] }) {
  if (metrics.length === 0) return null;

  return (
    <StaggerGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <StaggerItem key={metric.id}>
          <Card variant="elevated" className="h-full p-4 text-center">
            {metric.iconKey ? (
              <Icon name={metric.iconKey} className="text-brand mx-auto mb-2 size-4" />
            ) : null}
            <p className="font-display text-2xl font-semibold tabular-nums">
              {metric.value}
              {metric.unit ? (
                <span className="text-muted text-base font-normal">{metric.unit}</span>
              ) : null}
            </p>
            <p className="text-muted mt-1 text-xs leading-snug">{metric.label}</p>
          </Card>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  TECHNOLOGIES, groupées par catégorie
// ───────────────────────────────────────────────────────────────────────────

export function TechnologyBreakdown({
  technologies,
  otherCategory,
}: {
  technologies: ProjectDetail["technologies"];
  otherCategory: string;
}) {
  if (technologies.length === 0) return null;

  const groups = new Map<string, { name: string; items: typeof technologies }>();
  for (const link of technologies) {
    const key = link.technology.category?.id ?? "autres";
    if (!groups.has(key)) {
      groups.set(key, { name: link.technology.category?.name ?? otherCategory, items: [] });
    }
    groups.get(key)!.items.push(link);
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from(groups.entries()).map(([key, group]) => (
        <div key={key}>
          <h3 className="text-subtle mb-2.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            {group.name}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {group.items.map(({ technology }) => (
              <li key={technology.id}>
                <Badge variant="outline" size="md">
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
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
//  GALERIE
// ───────────────────────────────────────────────────────────────────────────

export function ProjectGallery({
  images,
  kinds: IMAGE_KIND,
}: {
  images: ProjectDetail["images"];
  /** Libellés de ProjectImageKind, indexés par valeur d'énumération Prisma. */
  kinds: Record<string, string>;
}) {
  if (images.length === 0) return null;

  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2">
      {images.map((image) => (
        <StaggerItem key={image.id} as="article">
          <figure className="border-border overflow-hidden rounded-[var(--radius-lg)] border">
            <div className="bg-elevated relative aspect-[16/10]">
              <Image
                src={image.media.url}
                alt={image.media.alt || image.caption || ""}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="text-muted border-border border-t px-4 py-2.5 text-xs">
                <span className="text-subtle me-2 font-mono text-[0.625rem] uppercase">
                  {IMAGE_KIND[image.kind] ?? image.kind}
                </span>
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
