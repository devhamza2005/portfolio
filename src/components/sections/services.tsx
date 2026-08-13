import { Check } from "lucide-react";

import { Icon } from "@/components/admin/icon";
import { Reveal, Section, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { SectionLabel } from "@/components/motion/text-reveal";
import { Card } from "@/components/ui/card";
import { sectionIndex } from "@/config/sections";

type Service = {
  id: string;
  title: string;
  description: string;
  iconKey: string | null;
  features: string[];
};

/** Section « What I do ». */
export function Services({
  services,
  t,
}: {
  services: Service[];
  t: { label: string; title: string };
}) {
  if (services.length === 0) return null;

  return (
    <Section id="services" className="bg-sunken/40">
      <div className="container-content">
        <Reveal className="mb-12 max-w-2xl">
          <SectionLabel index={sectionIndex("services")}>{t.label}</SectionLabel>
          <h2 className="text-display-md font-display">{t.title}</h2>
        </Reveal>

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <StaggerItem key={service.id} as="article" className="h-full">
              <SpotlightCard className="h-full rounded-[var(--radius-lg)]">
                <Card
                  variant="default"
                  interactive
                  className="flex h-full flex-col p-5"
                >
                  <span className="bg-brand-soft text-brand mb-4 grid size-11 place-items-center rounded-[var(--radius-md)]">
                    <Icon name={service.iconKey ?? "Sparkles"} className="size-5" />
                  </span>

                  <h3 className="font-display mb-2 text-base font-semibold">{service.title}</h3>
                  <p className="text-muted mb-4 text-sm leading-relaxed">{service.description}</p>

                  {service.features.length > 0 ? (
                    <ul className="mt-auto space-y-1.5">
                      {service.features.map((feature) => (
                        <li key={feature} className="text-subtle flex items-start gap-2 text-xs">
                          <Check className="text-brand mt-0.5 size-3 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </Section>
  );
}
