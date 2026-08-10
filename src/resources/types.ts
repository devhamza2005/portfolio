import type { ZodType } from "zod";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DESCRIPTEURS DE RESSOURCES — le cœur du back-office
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Une « ressource » décrit une entité administrable : ses champs, ses colonnes
 * de liste, sa validation et ses libellés. Les composants `DataTable` et
 * `ResourceForm` lisent ce descripteur et génèrent l'écran correspondant.
 *
 * Conséquence directe (§12 et §26) :
 *   ajouter une entité au back-office = 1 modèle Prisma + 1 fichier descripteur.
 *   Aucun écran, aucun formulaire, aucune action à écrire.
 */

// ───────────────────────────────────────────────────────────────────────────
//  CHAMPS
// ───────────────────────────────────────────────────────────────────────────

type BaseField = {
  name: string;
  label: string;
  /** Texte d'aide affiché sous le champ. */
  hint?: string;
  placeholder?: string;
  required?: boolean;
  /** Largeur dans la grille du formulaire (12 colonnes). */
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Regroupe les champs sous un titre de section dans le formulaire. */
  group?: string;
  /**
   * Masque le champ tant que la condition n'est pas remplie.
   *
   * Décrit sous forme de données, et non de fonction : le descripteur traverse
   * la frontière serveur → client, où seules les valeurs sérialisables passent.
   */
  showIf?: { field: string; equals: string | number | boolean };
};

export type SelectOption = { value: string; label: string; description?: string };

export type FieldDef =
  | (BaseField & { type: "text" | "email" | "url" | "color" })
  | (BaseField & { type: "textarea"; rows?: number; max?: number })
  /** Texte long acceptant du Markdown léger (gras, listes, retours ligne). */
  | (BaseField & { type: "markdown"; rows?: number })
  /** Généré depuis un autre champ, modifiable manuellement. */
  | (BaseField & { type: "slug"; from: string })
  | (BaseField & { type: "number"; min?: number; max?: number; step?: number })
  | (BaseField & { type: "date" })
  | (BaseField & { type: "switch" })
  | (BaseField & { type: "select"; options: SelectOption[] })
  /** Liste de chaînes libres, saisies une par une (features d'un service…). */
  | (BaseField & { type: "tags" })
  /** Sélection d'icône Lucide. */
  | (BaseField & { type: "icon" })
  /** Une image issue de la médiathèque. */
  | (BaseField & { type: "image"; folder?: string })
  /** Plusieurs images ordonnées (captures d'écran d'un projet). */
  | (BaseField & { type: "gallery"; folder?: string })
  /** Relation vers une autre ressource (technologies, catégorie…). */
  | (BaseField & {
      type: "relation";
      to: string;
      multiple?: boolean;
      /** Autorise la création à la volée d'un élément absent de la liste. */
      creatable?: boolean;
    })
  /** Sous-formulaire répétable : fonctionnalités, défis, métriques… */
  | (BaseField & { type: "repeater"; fields: FieldDef[]; itemLabel?: string; max?: number });

export type FieldType = FieldDef["type"];

// ───────────────────────────────────────────────────────────────────────────
//  COLONNES DE LISTE
// ───────────────────────────────────────────────────────────────────────────

export type ColumnDef = {
  /** Nom du champ, ou clé calculée gérée par le DataTable. */
  key: string;
  label: string;
  /** Rendu de la cellule. `title` met en avant, `badge` colore, `toggle` est cliquable. */
  render?: "text" | "title" | "badge" | "date" | "boolean" | "toggle" | "image" | "count";
  /** Masque la colonne sous cette largeur d'écran. */
  hideBelow?: "sm" | "md" | "lg";
  align?: "left" | "right";
};

// ───────────────────────────────────────────────────────────────────────────
//  RESSOURCE
// ───────────────────────────────────────────────────────────────────────────

export type ResourceDef = {
  /** Segment d'URL du back-office : /admin/<key>. */
  key: string;
  /** Nom du modèle Prisma correspondant (db.<model>). */
  model: PrismaModelKey;
  label: { singular: string; plural: string };
  /** Nom d'icône Lucide affiché dans la navigation. */
  icon: string;
  description?: string;

  /** Validation partagée par le formulaire client et la Server Action. */
  schema: ZodType;

  fields: FieldDef[];
  columns: ColumnDef[];

  /** Champs interrogés par la recherche de la liste. */
  searchable?: string[];
  /** Tri par défaut de la liste. */
  defaultSort?: { field: string; direction: "asc" | "desc" };
  /** Active le glisser-déposer pour réordonner (nécessite un champ `order`). */
  sortable?: boolean;
  /** Ressource à ligne unique : pas de liste, formulaire direct (Profil). */
  singleton?: boolean;

  /** Relations Prisma à charger pour l'affichage de la liste. */
  listInclude?: Record<string, unknown>;
  /** Collections enfants gérées par un champ `repeater`. */
  nested?: NestedRelation[];

  /** Étiquettes des états vides. */
  emptyState?: { title: string; description?: string };
};

/**
 * Déclare une collection enfant pilotée par un champ `repeater`.
 * Les actions génériques savent alors la remplacer intégralement à chaque
 * enregistrement, en conservant l'ordre saisi.
 */
export type NestedRelation = {
  /** Nom du champ dans le formulaire. */
  field: string;
  /** Modèle Prisma de la collection enfant. */
  model: PrismaModelKey;
  /** Clé étrangère pointant vers le parent. */
  foreignKey: string;
  /**
   * Pour une table de liaison N-N : colonne portant l'identifiant lié
   * (ex. « technologyId »). Sa présence indique que le champ manipule une
   * simple liste d'identifiants, et non des lignes complètes.
   */
  linkKey?: string;
  /** Relation à charger pour reconstituer le formulaire à l'édition. */
  include?: Record<string, unknown>;
};

/** Modèles Prisma exposés au moteur CRUD générique. */
export type PrismaModelKey =
  | "project"
  | "projectFeature"
  | "projectChallenge"
  | "projectMetric"
  | "projectImage"
  | "projectTechnology"
  | "experience"
  | "experienceHighlight"
  | "experienceTechnology"
  | "education"
  | "certification"
  | "achievement"
  | "service"
  | "skill"
  | "technology"
  | "category"
  | "socialLink"
  | "quality"
  | "language"
  | "statCard"
  | "media"
  | "contactMessage"
  | "profile";

/** Simple fonction d'identité : sert uniquement à typer le descripteur. */
export function defineResource(resource: ResourceDef): ResourceDef {
  return resource;
}
