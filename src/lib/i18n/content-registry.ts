/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGISTRE DU CONTENU TRADUISIBLE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Source unique de vérité de la phase B : quels modèles, quels champs.
 *
 * ── Pourquoi une liste blanche ─────────────────────────────────────────────
 *
 * La table `Translation` est générique : `entity`, `entityId` et `field` sont
 * de simples chaînes. Sans ce registre, une requête forgée pourrait écrire
 * une traduction sur `passwordHash` ou sur n'importe quel champ. Toute écriture
 * est donc validée ici AVANT d'atteindre la base — jamais par la requête.
 *
 * Ce fichier est isomorphe (aucun import serveur) : l'écran d'administration,
 * qui est un composant client, s'en sert pour ses filtres.
 *
 * ── Ce qui n'est délibérément PAS traduisible ─────────────────────────────
 *
 *  • noms propres      company, school, issuer, organisation, client
 *  • technologies      tout Technology.* — React, Spring Boot, Docker…
 *  • identifiants      id, slug, platform, credentialId
 *  • URLs              url, demoUrl, repoUrl, cvUrl, schoolUrl…
 *  • présentation      color, iconKey, order, visible, featured
 *  • privé             User.*, ContactMessage.*
 *  • médias            Media.alt / caption — la médiathèque est partagée avec
 *                      le back-office ; les traduire compliquerait le
 *                      sélecteur sans bénéfice réel. À rouvrir si besoin.
 */

export type EntityKey =
  | "profile"
  | "project"
  | "projectFeature"
  | "projectChallenge"
  | "projectMetric"
  | "projectImage"
  | "experience"
  | "experienceHighlight"
  | "education"
  | "certification"
  | "achievement"
  | "service"
  | "skill"
  | "category"
  | "quality"
  | "statCard"
  | "socialLink"
  | "language";

export type EntityDef = {
  /** Nom du délégué Prisma — `db[model]`. */
  readonly model: string;
  /** Libellé affiché dans le back-office (francophone). */
  readonly label: string;
  /** Champ servant à nommer la ligne dans la liste des traductions. */
  readonly titleField: string;
  /** Champs texte traduisibles. */
  readonly fields: readonly string[];
  /**
   * Champs `String[]`. Leurs traductions sont indexées élément par élément
   * (`features.0`, `features.1`…), ce qui permet de traduire chaque puce sans
   * casser la contrainte d'unicité.
   */
  readonly arrayFields?: readonly string[];
  /**
   * Champs du PALIER A — ceux qui alimentent `<title>`, `<meta description>`
   * et les titres de premier niveau. Ils conditionnent l'indexabilité.
   */
  readonly seoCritical?: readonly string[];
};

export const CONTENT_REGISTRY: Record<EntityKey, EntityDef> = {
  profile: {
    model: "profile",
    label: "Profil",
    titleField: "fullName",
    fields: [
      "headline",
      "subline",
      "tagline",
      "bioShort",
      "bioLong",
      "cvLabel",
      "availabilityLabel",
      "seoTitle",
      "seoDescription",
    ],
    seoCritical: ["headline", "bioShort", "seoTitle", "seoDescription"],
  },
  project: {
    model: "project",
    label: "Projets",
    titleField: "title",
    fields: [
      "title",
      "subtitle",
      "summary",
      "role",
      "context",
      "overview",
      "problem",
      "solution",
      "architecture",
      "results",
      "learnings",
    ],
    seoCritical: ["title", "subtitle", "summary"],
  },
  projectFeature: {
    model: "projectFeature",
    label: "Fonctionnalités de projet",
    titleField: "title",
    fields: ["title", "description"],
  },
  projectChallenge: {
    model: "projectChallenge",
    label: "Défis de projet",
    titleField: "title",
    fields: ["title", "problem", "solution"],
  },
  projectMetric: {
    model: "projectMetric",
    label: "Métriques de projet",
    titleField: "label",
    fields: ["label", "unit"],
  },
  projectImage: {
    model: "projectImage",
    label: "Légendes d'images",
    titleField: "caption",
    fields: ["caption"],
  },
  experience: {
    model: "experience",
    label: "Expériences",
    titleField: "company",
    fields: ["role", "description"],
    seoCritical: ["role"],
  },
  experienceHighlight: {
    model: "experienceHighlight",
    label: "Points forts d'expérience",
    titleField: "text",
    fields: ["text"],
  },
  education: {
    model: "education",
    label: "Formation",
    titleField: "school",
    fields: ["degree", "field", "grade", "mention", "honors", "description"],
    seoCritical: ["degree"],
  },
  certification: {
    model: "certification",
    label: "Certifications",
    titleField: "name",
    fields: ["name", "description"],
  },
  achievement: {
    model: "achievement",
    label: "Réalisations",
    titleField: "title",
    fields: ["title", "description", "category"],
    seoCritical: ["title"],
  },
  service: {
    model: "service",
    label: "Services",
    titleField: "title",
    fields: ["title", "description"],
    arrayFields: ["features"],
    seoCritical: ["title", "description"],
  },
  skill: {
    model: "skill",
    label: "Compétences",
    titleField: "name",
    fields: ["name", "description"],
  },
  category: {
    model: "category",
    label: "Catégories",
    titleField: "name",
    fields: ["name", "description"],
  },
  quality: {
    model: "quality",
    label: "Qualités",
    titleField: "label",
    fields: ["label"],
  },
  statCard: {
    model: "statCard",
    label: "Statistiques",
    titleField: "label",
    fields: ["label", "prefix", "suffix"],
  },
  socialLink: {
    model: "socialLink",
    label: "Liens sociaux",
    titleField: "platform",
    fields: ["label"],
  },
  language: {
    model: "language",
    label: "Langues parlées",
    titleField: "name",
    fields: ["name", "level"],
  },
};

export const ENTITY_KEYS = Object.keys(CONTENT_REGISTRY) as EntityKey[];

/** Vrai si la valeur désigne une entité traduisible. Restreint le type. */
export function isEntityKey(value: string): value is EntityKey {
  return value in CONTENT_REGISTRY;
}

/** Élément d'un champ tableau : `features.0`, `features.12`… */
const ARRAY_FIELD = /^([a-zA-Z]+)\.(\d+)$/;

/**
 * Vrai si `field` est réellement traduisible pour cette entité.
 *
 * C'est LE contrôle qui empêche d'écrire une traduction sur un champ arbitraire.
 * Il accepte les champs simples déclarés au registre et les éléments indexés
 * des champs tableau.
 */
export function isTranslatableField(entity: EntityKey, field: string): boolean {
  const def = CONTENT_REGISTRY[entity];

  if (def.fields.includes(field)) return true;

  const match = ARRAY_FIELD.exec(field);
  if (match && def.arrayFields?.includes(match[1]!)) return true;

  return false;
}

/** Décompose `features.3` en `{ name: "features", index: 3 }`. */
export function parseArrayField(field: string): { name: string; index: number } | null {
  const match = ARRAY_FIELD.exec(field);
  if (!match) return null;
  return { name: match[1]!, index: Number(match[2]) };
}

/** Vrai si le champ relève du palier A (critique pour le référencement). */
export function isSeoCritical(entity: EntityKey, field: string): boolean {
  return CONTENT_REGISTRY[entity].seoCritical?.includes(field) ?? false;
}
