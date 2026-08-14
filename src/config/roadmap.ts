/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ROADMAP DES PROJETS — modèle de données
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Pourquoi un fichier de configuration, et pas Prisma ───────────────────
 *
 * Le modèle `Project` porte un statut GLOBAL (`COMPLETED`, `IN_PROGRESS`…),
 * pas d'avancement par étape. Représenter dix étapes par projet exigerait un
 * modèle `ProjectStage`, une migration, un descripteur de ressource et un
 * écran d'administration — soit une fonctionnalité CRUD entière, hors du
 * périmètre de cette phase.
 *
 * Les données vivent donc ici, typées et versionnées. La forme est
 * délibérément proche de ce que serait une table :
 *
 *     ProjectStage { projectSlug, stage, status }
 *
 * Migrer plus tard revient à créer ce modèle, à copier ce fichier dans un seed
 * et à remplacer `ROADMAP_PROJECTS` par une requête. Les composants, eux, ne
 * changeraient pas : ils ne connaissent que le type `RoadmapProject`.
 *
 * ── Ce qui est traduit, et ce qui ne l'est pas ────────────────────────────
 *
 * Noms d'étapes, descriptions et livrables passent par les dictionnaires
 * (`roadmap.stages.<id>`). Les noms de projets et de technologies restent
 * identiques dans les trois langues.
 */

/** Les dix étapes du cycle de vie, dans l'ordre. */
export const ROADMAP_STAGES = [
  "idea",
  "spec",
  "uml",
  "architecture",
  "database",
  "development",
  "tests",
  "cicd",
  "deployment",
  "maintenance",
] as const;

export type StageId = (typeof ROADMAP_STAGES)[number];

export type StageStatus = "completed" | "current" | "pending";

/**
 * Technologies associées à chaque étape.
 *
 * Toutes proviennent de la stack réellement déclarée dans le portfolio ou de
 * faits vérifiables sur ce dépôt (Vercel, Docker, GitHub). Aucun outil n'est
 * ajouté pour « faire riche ».
 */
export const STAGE_TECHS: Record<StageId, readonly string[]> = {
  idea: ["Agile Scrum"],
  spec: ["UML", "Agile Scrum"],
  uml: ["UML", "Design Patterns"],
  architecture: ["Spring Boot", "REST", "Design Patterns"],
  database: ["PostgreSQL", "MySQL", "SQL"],
  development: ["Spring Boot", "React.js", "Java"],
  tests: ["SonarQube"],
  cicd: ["GitHub Actions", "Docker", "SonarQube"],
  deployment: ["Docker", "Vercel"],
  maintenance: ["Git", "GitHub"],
};

export type RoadmapProject = {
  id: string;
  /** Nom affiché — jamais traduit, c'est un nom propre. */
  name: string;
  /**
   * Slug du projet en base, quand il y existe : la carte renvoie alors vers
   * son étude de cas. `null` pour un projet qui n'est pas encore publié —
   * aucun lien n'est alors affiché plutôt qu'un lien mort.
   */
  slug: string | null;
  /** Stack du projet — noms de technologies, jamais traduits. */
  techs: readonly string[];
  /**
   * Avancement, étape par étape.
   *
   * ⚠️ CES VALEURS DÉCRIVENT L'AVANCEMENT RÉEL DES PROJETS.
   *
   * Elles ne sont pas déductibles automatiquement : `Project.status` en base
   * ne donne qu'un état global. Pour les projets marqués `COMPLETED` en base,
   * les dix étapes sont donc marquées terminées — c'est la seule lecture
   * défendable. Pour les autres, ces valeurs sont à confirmer et se corrigent
   * ici, en une ligne.
   */
  stages: Record<StageId, StageStatus>;
};

/** Raccourci : les dix étapes au même état. */
function allStages(status: StageStatus): Record<StageId, StageStatus> {
  return Object.fromEntries(ROADMAP_STAGES.map((stage) => [stage, status])) as Record<
    StageId,
    StageStatus
  >;
}

/** Étapes terminées jusqu'à `current` incluse ou non, le reste en attente. */
function upTo(current: StageId, includeCurrent = false): Record<StageId, StageStatus> {
  const index = ROADMAP_STAGES.indexOf(current);
  return Object.fromEntries(
    ROADMAP_STAGES.map((stage, position) => [
      stage,
      position < index ? "completed" : position === index ? (includeCurrent ? "completed" : "current") : "pending",
    ]),
  ) as Record<StageId, StageStatus>;
}

export const ROADMAP_PROJECTS: readonly RoadmapProject[] = [
  {
    id: "conventions",
    name: "Gestion des conventions — Casa Prestations",
    slug: "convention-management-casa-prestations",
    techs: ["Spring Boot", "PostgreSQL", "Spring Security", "JWT"],
    // Marqué COMPLETED en base : les dix étapes sont derrière.
    stages: allStages("completed"),
  },
  {
    id: "university",
    name: "University Management — Microservices",
    slug: null,
    techs: ["Spring Boot", "Microservices", "Docker", "PostgreSQL"],
    // ⚠️ Projet absent de la base : avancement à confirmer.
    stages: upTo("development"),
  },
  {
    id: "cabinet",
    name: "Cabinet Medical",
    slug: "cabinet-medical",
    techs: ["Java", "MySQL", "JavaFX"],
    stages: allStages("completed"),
  },
  {
    id: "parking",
    name: "Parking Management RFID",
    slug: "parking-management-rfid",
    techs: ["Python", "RFID", "Tkinter", "MySQL"],
    stages: allStages("completed"),
  },
  {
    id: "portfolio",
    name: "Portfolio personnel",
    slug: null,
    techs: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    /**
     * Seul projet dont l'avancement est directement observable dans ce dépôt :
     * conçu, développé, base en place, déployé sur Vercel, et maintenu en
     * continu. `.github/workflows/ci.yml` exécute lint, vérification des
     * types, tests Vitest et build à chaque push — l'étape CI/CD est donc
     * bien terminée (phase 7).
     */
    stages: {
      idea: "completed",
      spec: "completed",
      uml: "completed",
      architecture: "completed",
      database: "completed",
      development: "completed",
      tests: "completed",
      cicd: "completed",
      deployment: "completed",
      maintenance: "current",
    },
  },
];

/** Part d'étapes terminées, en pourcentage — alimente la barre de progression. */
export function completionRatio(project: RoadmapProject): number {
  const done = ROADMAP_STAGES.filter((stage) => project.stages[stage] === "completed").length;
  return Math.round((done / ROADMAP_STAGES.length) * 100);
}

/** Première étape en cours, s'il y en a une. */
export function currentStage(project: RoadmapProject): StageId | null {
  return ROADMAP_STAGES.find((stage) => project.stages[stage] === "current") ?? null;
}
