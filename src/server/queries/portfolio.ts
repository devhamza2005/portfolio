import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/server/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LECTURES DU SITE PUBLIC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Chaque fonction porte `use cache` et une balise correspondant à la clé de
 * ressource du back-office. Le cycle complet est donc :
 *
 *    /admin — enregistrement  →  updateTag("projects")
 *                              →  ce cache expire immédiatement
 *                              →  la page publique se régénère
 *
 * Le visiteur reçoit du HTML prérendu : aucune requête base de données sur le
 * chemin critique (§19). Et aucun composant public ne connaît Prisma — il
 * reçoit des données déjà mises en forme.
 *
 * `cacheLife("max")` : le contenu d'un portfolio ne change que lorsque son
 * propriétaire le modifie. Inutile d'expirer sur une base de temps, les
 * balises font le travail au bon moment.
 */

const MEDIA_SELECT = { url: true, alt: true, width: true, height: true } as const;

// ───────────────────────────────────────────────────────────────────────────
//  PROFIL
// ───────────────────────────────────────────────────────────────────────────

export async function getProfile() {
  "use cache";
  cacheTag("profile", "portfolio");
  cacheLife("max");

  return db.profile.findUnique({
    where: { id: "profile" },
    include: { avatar: { select: MEDIA_SELECT }, ogImage: { select: MEDIA_SELECT } },
  });
}

export async function getSocialLinks() {
  "use cache";
  cacheTag("social-links", "portfolio");
  cacheLife("max");

  return db.socialLink.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    select: { id: true, platform: true, label: true, url: true, iconKey: true, inHero: true },
  });
}

export async function getQualities() {
  "use cache";
  cacheTag("qualities", "portfolio");
  cacheLife("max");

  return db.quality.findMany({ orderBy: { order: "asc" } });
}

export async function getLanguages() {
  "use cache";
  cacheTag("languages", "portfolio");
  cacheLife("max");

  return db.language.findMany({ orderBy: { order: "asc" } });
}

// ───────────────────────────────────────────────────────────────────────────
//  COMPÉTENCES ET TECHNOLOGIES
// ───────────────────────────────────────────────────────────────────────────

/** Niveau par défaut déduit du palier, quand aucun pourcentage n'est saisi. */
const PROFICIENCY_PERCENT: Record<string, number> = {
  BASICS: 35,
  GOOD_KNOWLEDGE: 65,
  ADVANCED: 85,
  EXPERT: 95,
};

const PROFICIENCY_LABEL: Record<string, string> = {
  BASICS: "Notions",
  GOOD_KNOWLEDGE: "Bonnes connaissances",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export type SkillGroup = {
  id: string;
  name: string;
  slug: string;
  iconKey: string | null;
  skills: {
    id: string;
    name: string;
    percent: number;
    proficiency: string;
    proficiencyLabel: string;
    iconKey: string | null;
    color: string | null;
    highlighted: boolean;
  }[];
};

/** Compétences regroupées par catégorie — alimente les onglets de la section. */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  "use cache";
  cacheTag("skills", "categories", "technologies", "portfolio");
  cacheLife("max");

  const skills = await db.skill.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: {
      category: { select: { id: true, name: true, slug: true, iconKey: true, order: true } },
      technology: { select: { iconKey: true, color: true } },
    },
  });

  const groups = new Map<string, SkillGroup & { order: number }>();

  for (const skill of skills) {
    const category = skill.category;
    const key = category?.id ?? "autres";

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        name: category?.name ?? "Autres",
        slug: category?.slug ?? "autres",
        iconKey: category?.iconKey ?? null,
        order: category?.order ?? 999,
        skills: [],
      });
    }

    groups.get(key)!.skills.push({
      id: skill.id,
      name: skill.name,
      percent: skill.percent ?? PROFICIENCY_PERCENT[skill.proficiency] ?? 50,
      proficiency: skill.proficiency,
      proficiencyLabel: PROFICIENCY_LABEL[skill.proficiency] ?? skill.proficiency,
      // La compétence emprunte l'icône et la couleur de sa technologie liée.
      iconKey: skill.iconKey ?? skill.technology?.iconKey ?? null,
      color: skill.technology?.color ?? null,
      highlighted: skill.highlighted,
    });
  }

  // `order` sert au tri puis disparaît du résultat : c'est une donnée interne
  // de tri, pas une information utile au composant.
  return Array.from(groups.values())
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      iconKey: group.iconKey,
      skills: group.skills,
    }));
}

export async function getTechnologies() {
  "use cache";
  cacheTag("technologies", "categories", "portfolio");
  cacheLife("max");

  return db.technology.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      iconKey: true,
      color: true,
      url: true,
      featured: true,
      logo: { select: MEDIA_SELECT },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

// ───────────────────────────────────────────────────────────────────────────
//  PARCOURS
// ───────────────────────────────────────────────────────────────────────────

export async function getExperiences() {
  "use cache";
  cacheTag("experiences", "technologies", "portfolio");
  cacheLife("max");

  return db.experience.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: {
      logo: { select: MEDIA_SELECT },
      highlights: { orderBy: { order: "asc" }, select: { id: true, text: true } },
      technologies: {
        orderBy: { order: "asc" },
        select: { technology: { select: { id: true, name: true, iconKey: true, color: true } } },
      },
    },
  });
}

export async function getEducation() {
  "use cache";
  cacheTag("education", "portfolio");
  cacheLife("max");

  return db.education.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: { logo: { select: MEDIA_SELECT } },
  });
}

export async function getCertifications() {
  "use cache";
  cacheTag("certifications", "portfolio");
  // Une journée, et non « max » : le drapeau `expired` dépend de la date du
  // jour. Une durée infinie le figerait au moment du build.
  cacheLife("days");

  const certifications = await db.certification.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: { image: { select: MEDIA_SELECT } },
  });

  const today = new Date();

  return certifications.map((certification) => ({
    ...certification,
    expired: certification.expiryDate !== null && certification.expiryDate < today,
  }));
}

export async function getAchievements() {
  "use cache";
  cacheTag("achievements", "portfolio");
  cacheLife("max");

  return db.achievement.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}

export async function getServices() {
  "use cache";
  cacheTag("services", "portfolio");
  cacheLife("max");

  return db.service.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

// ───────────────────────────────────────────────────────────────────────────
//  PROJETS
// ───────────────────────────────────────────────────────────────────────────

const PROJECT_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  summary: true,
  year: true,
  status: true,
  featured: true,
  context: true,
  demoUrl: true,
  repoUrl: true,
  cover: { select: MEDIA_SELECT },
  category: { select: { id: true, name: true, slug: true } },
  technologies: {
    orderBy: { order: "asc" as const },
    select: { technology: { select: { id: true, name: true, iconKey: true, color: true } } },
  },
  _count: { select: { features: true, images: true } },
} as const;

export type ProjectCard = Awaited<ReturnType<typeof getProjects>>[number];

export async function getProjects() {
  "use cache";
  cacheTag("projects", "technologies", "categories", "portfolio");
  cacheLife("max");

  return db.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    select: PROJECT_CARD_SELECT,
  });
}

/**
 * Un projet complet, avec tout le contenu de son étude de cas.
 *
 * Le tag `project:<slug>` s'ajoute au tag global `projects` : le second permet
 * d'invalider toutes les pages projet d'un coup, le premier de ne recalculer
 * qu'une seule étude de cas. Les actions du back-office émettent les deux.
 */
export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheTag("projects", `project:${slug}`, "technologies", "categories", "portfolio");
  cacheLife("max");

  return db.project.findFirst({
    where: { slug, published: true },
    include: {
      category: { select: { id: true, name: true, slug: true, iconKey: true } },
      cover: { select: MEDIA_SELECT },
      technologies: {
        orderBy: { order: "asc" },
        select: {
          technology: {
            select: {
              id: true,
              name: true,
              slug: true,
              iconKey: true,
              color: true,
              url: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      },
      features: { orderBy: { order: "asc" } },
      challenges: { orderBy: { order: "asc" } },
      metrics: { orderBy: { order: "asc" } },
      images: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          kind: true,
          caption: true,
          media: { select: MEDIA_SELECT },
        },
      },
    },
  });
}

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;

/** Slugs publiés — alimente `generateStaticParams` pour prégénérer les pages. */
/**
 * Références des projets publiés : slug, titre et date de dernière écriture.
 *
 * Une seule et même lecture sert `generateStaticParams`, le sitemap et le
 * JSON-LD de la collection. Comme elle porte `use cache` avec les mêmes
 * balises, les trois appels retombent sur la même entrée : une requête pour
 * l'ensemble du build, pas trois.
 *
 * `updatedAt` alimente `lastModified` du sitemap — une date réelle, issue de
 * la base, jamais l'heure du build.
 */
export async function getPublishedProjectRefs() {
  "use cache";
  cacheTag("projects", "portfolio");
  cacheLife("max");

  return db.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    select: { slug: true, title: true, updatedAt: true },
  });
}

/**
 * Projets précédent et suivant, dans l'ordre d'affichage du portfolio.
 *
 * Permet de terminer une étude de cas par un lien vers la suivante plutôt que
 * par un cul-de-sac — le visiteur continue à parcourir les réalisations.
 */
export async function getAdjacentProjects(slug: string) {
  "use cache";
  cacheTag("projects", `project:${slug}`, "portfolio");
  cacheLife("max");

  const projects = await db.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    select: { slug: true, title: true, summary: true, cover: { select: MEDIA_SELECT } },
  });

  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: index > 0 ? (projects[index - 1] ?? null) : null,
    next: index < projects.length - 1 ? (projects[index + 1] ?? null) : null,
  };
}

/** Catégories réellement utilisées par au moins un projet publié. */
export async function getProjectCategories() {
  "use cache";
  cacheTag("projects", "categories", "portfolio");
  cacheLife("max");

  const categories = await db.category.findMany({
    where: { kind: "PROJECT", projects: { some: { published: true } } },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      iconKey: true,
      _count: { select: { projects: { where: { published: true } } } },
    },
  });

  return categories;
}

// ───────────────────────────────────────────────────────────────────────────
//  STATISTIQUES — calculées, jamais saisies (§25)
// ───────────────────────────────────────────────────────────────────────────

export type PublicStat = {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  iconKey: string | null;
};

export async function getStats(): Promise<PublicStat[]> {
  "use cache";
  cacheTag(
    "stats",
    "projects",
    "technologies",
    "experiences",
    "certifications",
    "achievements",
    "skills",
    "profile",
    "portfolio",
  );
  cacheLife("max");

  const [cards, projects, technologies, experiences, certifications, achievements, skills, profile] =
    await Promise.all([
      db.statCard.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      db.project.count({ where: { published: true } }),
      db.technology.count({ where: { visible: true } }),
      db.experience.count({ where: { visible: true } }),
      db.certification.count({ where: { visible: true } }),
      db.achievement.count({ where: { visible: true } }),
      db.skill.count({ where: { visible: true } }),
      db.profile.findUnique({ where: { id: "profile" }, select: { careerStartYear: true } }),
    ]);

  const years = profile?.careerStartYear
    ? Math.max(0, new Date().getFullYear() - profile.careerStartYear)
    : 0;

  const resolve = (source: string, manual: number | null) => {
    switch (source) {
      case "PROJECTS_COUNT":
        return projects;
      case "TECHNOLOGIES_COUNT":
        return technologies;
      case "EXPERIENCES_COUNT":
        return experiences;
      case "CERTIFICATIONS_COUNT":
        return certifications;
      case "ACHIEVEMENTS_COUNT":
        return achievements;
      case "SKILLS_COUNT":
        return skills;
      case "YEARS_SINCE_START":
        return years;
      default:
        return manual ?? 0;
    }
  };

  return cards
    .map((card) => ({
      id: card.id,
      label: card.label,
      value: resolve(card.source, card.manualValue),
      prefix: card.prefix,
      suffix: card.suffix,
      iconKey: card.iconKey,
    }))
    // Un compteur à zéro (aucune certification saisie, par exemple) ferait
    // mauvais effet : on le masque plutôt que d'afficher « 0 ».
    .filter((stat) => stat.value > 0);
}
