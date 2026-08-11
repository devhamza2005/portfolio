import Image from "next/image";

import { Icon } from "@/components/admin/icon";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/motion/text-reveal";
import { cn } from "@/lib/utils";

type Technology = {
  id: string;
  name: string;
  slug: string;
  iconKey: string | null;
  color: string | null;
  featured: boolean;
  logo: { url: string; alt: string } | null;
  category: { id: string; name: string; slug: string } | null;
};

/**
 * Section 06 — Technologies.
 *
 * Un bandeau défilant met en avant les technologies marquées « vedette »,
 * puis la stack complète est présentée groupée par catégorie. Les deux listes
 * viennent de la même table : cocher « Mettre en avant » dans le back-office
 * suffit à faire apparaître une techno dans le bandeau.
 */
export function Technologies({ technologies }: { technologies: Technology[] }) {
  if (technologies.length === 0) return null;

  const featured = technologies.filter((tech) => tech.featured);

  // Regroupement par catégorie, dans l'ordre où les technologies arrivent
  // (déjà trié par `order` en base).
  const groups = new Map<string, { name: string; items: Technology[] }>();
  for (const tech of technologies) {
    const key = tech.category?.id ?? "autres";
    if (!groups.has(key)) {
      groups.set(key, { name: tech.category?.name ?? "Autres", items: [] });
    }
    groups.get(key)!.items.push(tech);
  }

  return (
    <Section id="technologies" className="bg-sunken/40">
      <div className="container-content">
        <Reveal className="mb-10 max-w-2xl">
          <SectionLabel index="04">Technologies</SectionLabel>
          <h2 className="text-display-md font-display">Ma stack au quotidien</h2>
        </Reveal>
      </div>

      {featured.length > 3 ? (
        <Reveal className="mb-12">
          <Marquee speed={45}>
            {featured.map((tech) => (
              <span
                key={tech.id}
                className="border-border bg-surface mx-2 flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-3"
              >
                <TechIcon tech={tech} className="size-4" />
                <span className="text-sm font-medium whitespace-nowrap">{tech.name}</span>
              </span>
            ))}
          </Marquee>
        </Reveal>
      ) : null}

      <div className="container-content">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(groups.entries()).map(([key, group]) => (
            <Reveal key={key}>
              <h3 className="text-subtle mb-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                {group.name}
              </h3>
              <StaggerGroup className="flex flex-wrap gap-2">
                {group.items.map((tech) => (
                  <StaggerItem key={tech.id}>
                    <span
                      className={cn(
                        "border-border bg-surface hover:border-brand/40 flex items-center gap-2",
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      )}
                    >
                      <TechIcon tech={tech} className="size-3.5" />
                      {tech.name}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/**
 * Logo téléversé s'il existe, sinon icône Lucide, sinon initiale.
 * Cette cascade évite d'imposer un upload pour chaque technologie (§16).
 */
function TechIcon({ tech, className }: { tech: Technology; className?: string }) {
  if (tech.logo) {
    return (
      <Image
        src={tech.logo.url}
        alt=""
        width={16}
        height={16}
        className={cn("object-contain", className)}
      />
    );
  }

  if (tech.iconKey) {
    return (
      <Icon
        name={tech.iconKey}
        fallback="Boxes"
        className={className}
        style={tech.color ? { color: tech.color } : undefined}
      />
    );
  }

  return (
    <span
      className={cn("grid place-items-center rounded-sm text-[0.5rem] font-bold", className)}
      style={{ backgroundColor: tech.color ?? "var(--brand)", color: "#fff" }}
      aria-hidden
    >
      {tech.name.charAt(0)}
    </span>
  );
}
