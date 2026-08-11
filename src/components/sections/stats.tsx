import { Icon } from "@/components/admin/icon";
import { Counter } from "@/components/motion/counter";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { PublicStat } from "@/server/queries/portfolio";

/**
 * Section 02 — Statistiques.
 *
 * Chaque valeur provient d'un `count()` réel sur la base (§25). Supprimer un
 * projet depuis le back-office fait baisser le compteur automatiquement.
 * Aucun chiffre n'est écrit en dur dans ce composant.
 */
export function Stats({ stats }: { stats: PublicStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-border relative border-y">
      <div className="container-content">
        <StaggerGroup className="divide-border grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.id} className="px-2 py-8 text-center sm:px-6">
              {stat.iconKey ? (
                <Icon name={stat.iconKey} className="text-brand mx-auto mb-3 size-5" />
              ) : null}

              <p className="font-display text-display-sm font-semibold tabular-nums">
                {stat.prefix}
                <Counter value={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-muted mt-1 text-sm">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
