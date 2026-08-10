/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  AMORÇAGE DE LA BASE DE DONNÉES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Lancement :  npm run db:seed
 *
 *  Le script est IDEMPOTENT : il peut être relancé sans risque. Il utilise
 *  `upsert` sur des clés stables (slug, nom, plateforme…), donc les
 *  modifications faites depuis /admin sur des éléments existants sont
 *  écrasées uniquement pour les champs gérés ici — aucune ligne n'est
 *  supprimée, et le contenu ajouté depuis le back-office n'est jamais touché.
 */

import "dotenv/config";

import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  languagesData,
  profileData,
  projectCategoriesData,
  qualitiesData,
  skillsData,
  socialLinksData,
  techCategoriesData,
  technologiesData,
} from "./seed-data";
import {
  achievementsData,
  educationData,
  experiencesData,
  projectsData,
  servicesData,
  statCardsData,
} from "./seed-content";

const connectionString = process.env["DIRECT_DATABASE_URL"] || process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL est absent. Copiez .env.example en .env avant de lancer le seed.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Paramètres Argon2id conformes aux recommandations OWASP. */
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

const toDate = (value: string | null | undefined) => (value ? new Date(value) : null);

function step(message: string) {
  console.log(`  → ${message}`);
}

// ───────────────────────────────────────────────────────────────────────────

async function seedAdminUser() {
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];
  const name = process.env["ADMIN_NAME"] ?? "Administrateur";

  if (!email || !password) {
    console.warn(
      "  ⚠️  ADMIN_EMAIL ou ADMIN_PASSWORD absent — aucun compte administrateur créé.\n" +
        "     Renseignez ces variables dans .env puis relancez `npm run db:seed`.",
    );
    return;
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    step(`Compte administrateur déjà présent (${email}) — mot de passe inchangé`);
    return;
  }

  await db.user.create({
    data: { email, name, role: "ADMIN", passwordHash: await hash(password, ARGON2_OPTIONS) },
  });
  step(`Compte administrateur créé : ${email}`);
}

async function seedCategories() {
  for (const [index, category] of techCategoriesData.entries()) {
    await db.category.upsert({
      where: { kind_slug: { kind: "TECH", slug: category.slug } },
      update: { name: category.name, iconKey: category.iconKey, color: category.color, order: index },
      create: { kind: "TECH", ...category, order: index },
    });
  }

  for (const [index, category] of projectCategoriesData.entries()) {
    await db.category.upsert({
      where: { kind_slug: { kind: "PROJECT", slug: category.slug } },
      update: { name: category.name, iconKey: category.iconKey, order: index },
      create: { kind: "PROJECT", ...category, order: index },
    });
  }

  step(`${techCategoriesData.length} catégories tech + ${projectCategoriesData.length} catégories projet`);
}

/** Retourne une table de correspondance slug → id pour un type de catégorie. */
async function categoryMap(kind: "TECH" | "PROJECT") {
  const rows = await db.category.findMany({ where: { kind }, select: { id: true, slug: true } });
  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function seedTechnologies() {
  const categories = await categoryMap("TECH");

  for (const [index, tech] of technologiesData.entries()) {
    const payload = {
      name: tech.name,
      categoryId: categories.get(tech.category) ?? null,
      iconKey: tech.iconKey ?? null,
      color: tech.color ?? null,
      featured: tech.featured ?? false,
      order: index,
    };

    await db.technology.upsert({
      where: { slug: tech.slug },
      update: payload,
      create: { slug: tech.slug, ...payload },
    });
  }

  step(`${technologiesData.length} technologies`);
}

async function technologyMap() {
  const rows = await db.technology.findMany({ select: { id: true, slug: true } });
  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function seedSkills() {
  const categories = await categoryMap("TECH");
  const technologies = await technologyMap();

  for (const [index, skill] of skillsData.entries()) {
    const payload = {
      categoryId: categories.get(skill.category) ?? null,
      technologyId: skill.technology ? (technologies.get(skill.technology) ?? null) : null,
      proficiency: skill.proficiency,
      highlighted: skill.highlighted ?? false,
      order: index,
    };

    // `name` n'est pas unique en base (deux compétences homonymes de catégories
    // différentes restent possibles) : on cherche donc la ligne existante.
    const existing = await db.skill.findFirst({ where: { name: skill.name } });

    if (existing) {
      await db.skill.update({ where: { id: existing.id }, data: payload });
    } else {
      await db.skill.create({ data: { name: skill.name, ...payload } });
    }
  }

  step(`${skillsData.length} compétences`);
}

async function seedProfile() {
  const { availability, ...rest } = profileData;

  await db.profile.upsert({
    where: { id: "profile" },
    update: { ...rest, availability },
    create: { id: "profile", ...rest, availability },
  });

  for (const [index, link] of socialLinksData.entries()) {
    const payload = {
      label: link.label,
      url: link.url,
      iconKey: link.iconKey,
      inHero: link.inHero,
      visible: link.visible ?? true,
      order: index,
    };
    await db.socialLink.upsert({
      where: { platform: link.platform },
      update: payload,
      create: { platform: link.platform, ...payload },
    });
  }

  for (const [index, quality] of qualitiesData.entries()) {
    const existing = await db.quality.findFirst({ where: { label: quality.label } });
    if (existing) {
      await db.quality.update({ where: { id: existing.id }, data: { ...quality, order: index } });
    } else {
      await db.quality.create({ data: { ...quality, order: index } });
    }
  }

  for (const [index, language] of languagesData.entries()) {
    const existing = await db.language.findFirst({ where: { name: language.name } });
    if (existing) {
      await db.language.update({ where: { id: existing.id }, data: { order: index } });
    } else {
      await db.language.create({ data: { ...language, order: index } });
    }
  }

  step("Profil, liens sociaux, qualités et langues");
}

async function seedProjects() {
  const categories = await categoryMap("PROJECT");
  const technologies = await technologyMap();

  for (const [index, project] of projectsData.entries()) {
    const {
      slug,
      technologies: techSlugs,
      features = [],
      challenges = [],
      metrics = [],
      category,
      startDate,
      endDate,
      ...fields
    } = project;

    const payload = {
      ...fields,
      categoryId: categories.get(category) ?? null,
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      order: index,
      published: true,
    };

    const saved = await db.project.upsert({
      where: { slug },
      update: payload,
      create: { slug, ...payload },
    });

    // Les collections enfants sont remplacées intégralement : c'est le seul
    // moyen de garantir que l'ordre et le contenu correspondent à la source.
    await db.projectTechnology.deleteMany({ where: { projectId: saved.id } });
    await db.projectFeature.deleteMany({ where: { projectId: saved.id } });
    await db.projectChallenge.deleteMany({ where: { projectId: saved.id } });
    await db.projectMetric.deleteMany({ where: { projectId: saved.id } });

    const links = techSlugs
      .map((techSlug, order) => ({ technologyId: technologies.get(techSlug), order }))
      .filter((link): link is { technologyId: string; order: number } => Boolean(link.technologyId))
      .map((link) => ({ ...link, projectId: saved.id }));

    if (links.length) await db.projectTechnology.createMany({ data: links });

    if (features.length) {
      await db.projectFeature.createMany({
        data: features.map((feature, order) => ({ ...feature, projectId: saved.id, order })),
      });
    }
    if (challenges.length) {
      await db.projectChallenge.createMany({
        data: challenges.map((challenge, order) => ({ ...challenge, projectId: saved.id, order })),
      });
    }
    if (metrics.length) {
      await db.projectMetric.createMany({
        data: metrics.map((metric, order) => ({ ...metric, projectId: saved.id, order })),
      });
    }
  }

  step(`${projectsData.length} projets (avec fonctionnalités, défis et métriques)`);
}

async function seedExperiences() {
  const technologies = await technologyMap();

  for (const [index, experience] of experiencesData.entries()) {
    const { company, role, highlights, technologies: techSlugs, startDate, endDate, ...fields } =
      experience;

    const payload = {
      ...fields,
      role,
      startDate: new Date(startDate),
      endDate: toDate(endDate),
      order: index,
    };

    const existing = await db.experience.findFirst({ where: { company, role } });
    const saved = existing
      ? await db.experience.update({ where: { id: existing.id }, data: payload })
      : await db.experience.create({ data: { company, ...payload } });

    await db.experienceHighlight.deleteMany({ where: { experienceId: saved.id } });
    await db.experienceTechnology.deleteMany({ where: { experienceId: saved.id } });

    await db.experienceHighlight.createMany({
      data: highlights.map((text, order) => ({ text, order, experienceId: saved.id })),
    });

    const links = techSlugs
      .map((techSlug, order) => ({ technologyId: technologies.get(techSlug), order }))
      .filter((link): link is { technologyId: string; order: number } => Boolean(link.technologyId))
      .map((link) => ({ ...link, experienceId: saved.id }));

    if (links.length) await db.experienceTechnology.createMany({ data: links });
  }

  step(`${experiencesData.length} expériences`);
}

async function seedEducation() {
  for (const [index, education] of educationData.entries()) {
    const { school, degree, startDate, endDate, ...fields } = education;
    const payload = {
      ...fields,
      degree,
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      order: index,
    };

    const existing = await db.education.findFirst({ where: { school, degree } });
    if (existing) {
      await db.education.update({ where: { id: existing.id }, data: payload });
    } else {
      await db.education.create({ data: { school, ...payload } });
    }
  }

  step(`${educationData.length} formations`);
}

async function seedAchievements() {
  for (const [index, achievement] of achievementsData.entries()) {
    const existing = await db.achievement.findFirst({ where: { title: achievement.title } });
    if (existing) {
      await db.achievement.update({ where: { id: existing.id }, data: { ...achievement, order: index } });
    } else {
      await db.achievement.create({ data: { ...achievement, order: index } });
    }
  }

  step(`${achievementsData.length} réalisations`);
}

async function seedServices() {
  for (const [index, service] of servicesData.entries()) {
    const existing = await db.service.findFirst({ where: { title: service.title } });
    if (existing) {
      await db.service.update({ where: { id: existing.id }, data: { ...service, order: index } });
    } else {
      await db.service.create({ data: { ...service, order: index } });
    }
  }

  step(`${servicesData.length} services`);
}

async function seedStatCards() {
  for (const [index, stat] of statCardsData.entries()) {
    const existing = await db.statCard.findFirst({ where: { source: stat.source } });
    if (existing) {
      await db.statCard.update({ where: { id: existing.id }, data: { ...stat, order: index } });
    } else {
      await db.statCard.create({ data: { ...stat, order: index } });
    }
  }

  step(`${statCardsData.length} cartes statistiques`);
}

// ───────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Amorçage du portfolio de Hamza Fanoune\n");

  await seedAdminUser();
  await seedCategories();
  await seedTechnologies();
  await seedSkills();
  await seedProfile();
  await seedProjects();
  await seedExperiences();
  await seedEducation();
  await seedAchievements();
  await seedServices();
  await seedStatCards();

  console.log("\n✅ Base amorcée. Tout le contenu est désormais éditable depuis /admin.\n");
}

main()
  .catch((error: unknown) => {
    console.error("\n❌ Échec de l'amorçage :\n", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
