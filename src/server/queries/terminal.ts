import "server-only";

import { ARCHITECTURE_VIEWS } from "@/config/architecture";
import { ROADMAP_PROJECTS, completionRatio } from "@/config/roadmap";
import { formatPeriod } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dictionaries";
import type { TerminalData } from "@/lib/terminal/types";
import {
  getExperiencesLocalized,
  getProfileLocalized,
  getProjectsLocalized,
  getSkillGroupsLocalized,
  getSocialLinksLocalized,
} from "@/server/queries/localized";
import { getTechnologies } from "@/server/queries/portfolio";

/**
 * Instantané des données affichées par le Developer Terminal.
 *
 * ── Pourquoi un instantané, et pas des requêtes à la demande ──────────────
 *
 * Le terminal est un composant CLIENT : il ne peut pas interroger la base.
 * Tout ce qu'il affiche est donc préparé ici, à partir des lectures déjà
 * mises en cache par le portfolio. Aucune requête nouvelle n'est ajoutée : les
 * mêmes fonctions `use cache` servent les sections de la page.
 *
 * Le contenu est volontairement RÉDUIT — noms, titres, slugs — pour ne pas
 * alourdir la charge envoyée au navigateur : quelques kilo-octets, pas les
 * études de cas complètes.
 *
 * Les traductions du contenu éditorial (phase B) s'appliquent : le terminal
 * affiche le même texte que le reste du site dans la langue courante.
 */
export async function getTerminalData(locale: Locale, t: Messages): Promise<TerminalData> {
  const [profile, socialLinks, skillGroups, projects, experiences, technologies] =
    await Promise.all([
      getProfileLocalized(locale),
      getSocialLinksLocalized(locale),
      getSkillGroupsLocalized(locale),
      getProjectsLocalized(locale),
      getExperiencesLocalized(locale),
      getTechnologies(),
    ]);

  const github = socialLinks.find((link) => link.platform.toLowerCase() === "github");

  return {
    name: profile?.fullName ?? "",
    headline: profile?.headline ?? "",
    location: profile?.location ?? null,
    email: profile?.email ?? "",
    cvUrl: profile?.cvUrl ?? null,
    githubUrl: github?.url ?? null,

    // Les technologies mises en avant, dans l'ordre du back-office.
    techs: technologies
      .filter((technology) => technology.featured)
      .slice(0, 8)
      .map((technology) => technology.name),

    skillGroups: skillGroups.map((group) => ({
      name: group.name,
      skills: group.skills.map((skill) => skill.name),
    })),

    projects: projects.map((project) => ({ slug: project.slug, title: project.title })),

    experiences: experiences.map((experience) => ({
      company: experience.company,
      role: experience.role,
      period: formatPeriod(
        experience.startDate,
        experience.endDate,
        experience.current,
        locale,
        t.dates.today,
      ),
    })),

    // Le dictionnaire est typé sur `fr.json`, où chaque vue a sa propre clé ;
    // l'index par une chaîne dynamique demande donc un élargissement explicite.
    architectureViews: ARCHITECTURE_VIEWS.map((view) => {
      const views = t.architecture.views as Record<string, { name: string } | undefined>;
      return { id: view.id, name: views[view.id]?.name ?? view.id };
    }),

    roadmapProjects: ROADMAP_PROJECTS.map((project) => ({
      name: project.name,
      progress: completionRatio(project),
    })),
  };
}
