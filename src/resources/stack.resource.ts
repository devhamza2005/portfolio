import {
  CATEGORY_KINDS,
  PROFICIENCY_LEVELS,
  STAT_SOURCES,
  achievementSchema,
  categorySchema,
  languageSchema,
  qualitySchema,
  serviceSchema,
  skillSchema,
  socialLinkSchema,
  statCardSchema,
  technologySchema,
} from "@/schemas/stack.schema";
import { defineResource } from "./types";

/** Technologies — registre canonique de la stack. */
export const technologyResource = defineResource({
  key: "technologies",
  model: "technology",
  label: { singular: "Technologie", plural: "Technologies" },
  icon: "Boxes",
  description: "La stack affichée sur le site et rattachée aux projets.",
  schema: technologySchema,
  sortable: true,
  searchable: ["name", "slug"],
  defaultSort: { field: "order", direction: "asc" },
  listInclude: { category: true },

  columns: [
    { key: "name", label: "Technologie", render: "title" },
    { key: "category", label: "Catégorie", render: "badge", hideBelow: "sm" },
    { key: "featured", label: "Vedette", render: "toggle", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucune technologie", description: "Ajoutez les outils que vous utilisez." },

  fields: [
    { name: "name", label: "Nom", type: "text", required: true, span: 6, group: "Technologie", placeholder: "Spring Boot" },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true, span: 6, group: "Technologie" },
    { name: "categoryId", label: "Catégorie", type: "relation", to: "category:TECH", span: 6, group: "Technologie" },
    { name: "color", label: "Couleur de marque", type: "color", span: 6, group: "Technologie", hint: "Utilisée sur les badges. Format #6DB33F." },

    { name: "iconKey", label: "Icône (simple-icons)", type: "text", span: 6, group: "Visuel", hint: "Ex. « springboot ». Évite d'avoir à téléverser un logo." },
    { name: "logoId", label: "Logo personnalisé", type: "image", folder: "logos", span: 6, group: "Visuel", hint: "Prioritaire sur l'icône si renseigné." },
    { name: "url", label: "Site officiel", type: "url", span: 12, group: "Visuel" },

    { name: "featured", label: "Mettre en avant", type: "switch", span: 6, group: "Publication", hint: "Apparaît dans le bandeau défilant." },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 6, group: "Publication" },
  ],
});

/** Compétences — niveau de maîtrise, éventuellement lié à une technologie. */
export const skillResource = defineResource({
  key: "skills",
  model: "skill",
  label: { singular: "Compétence", plural: "Compétences" },
  icon: "Gauge",
  description: "Vos compétences et leur niveau de maîtrise.",
  schema: skillSchema,
  sortable: true,
  searchable: ["name"],
  defaultSort: { field: "order", direction: "asc" },
  listInclude: { category: true, technology: true },

  columns: [
    { key: "name", label: "Compétence", render: "title" },
    { key: "category", label: "Catégorie", render: "badge", hideBelow: "sm" },
    { key: "proficiency", label: "Niveau", render: "badge", hideBelow: "md" },
    { key: "highlighted", label: "Point fort", render: "toggle", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucune compétence", description: "Déclarez vos compétences et leur niveau." },

  fields: [
    { name: "name", label: "Nom", type: "text", required: true, span: 6, group: "Compétence" },
    { name: "categoryId", label: "Catégorie", type: "relation", to: "category:TECH", span: 6, group: "Compétence" },
    { name: "proficiency", label: "Niveau de maîtrise", type: "select", options: [...PROFICIENCY_LEVELS], span: 6, group: "Compétence" },
    { name: "percent", label: "Pourcentage", type: "number", min: 0, max: 100, span: 6, group: "Compétence", hint: "Facultatif — déduit du niveau si vide." },

    { name: "technologyId", label: "Technologie liée", type: "relation", to: "technology", span: 6, group: "Complément", hint: "Réutilise automatiquement son logo et sa couleur." },
    { name: "iconKey", label: "Icône", type: "icon", span: 6, group: "Complément" },
    { name: "description", label: "Description", type: "text", span: 12, group: "Complément" },

    { name: "highlighted", label: "Point fort", type: "switch", span: 6, group: "Publication" },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 6, group: "Publication" },
  ],
});

/** Catégories — taxonomie partagée technologies / compétences / projets. */
export const categoryResource = defineResource({
  key: "categories",
  model: "category",
  label: { singular: "Catégorie", plural: "Catégories" },
  icon: "Tags",
  description: "Regroupements utilisés pour les filtres et les onglets.",
  schema: categorySchema,
  sortable: true,
  searchable: ["name", "slug"],
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "name", label: "Catégorie", render: "title" },
    { key: "kind", label: "Type", render: "badge" },
    { key: "slug", label: "Slug", hideBelow: "md" },
  ],

  emptyState: { title: "Aucune catégorie", description: "Créez vos regroupements." },

  fields: [
    { name: "name", label: "Nom", type: "text", required: true, span: 6 },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true, span: 6 },
    { name: "kind", label: "S'applique à", type: "select", options: [...CATEGORY_KINDS], span: 6 },
    { name: "iconKey", label: "Icône", type: "icon", span: 6 },
    { name: "color", label: "Couleur", type: "color", span: 6 },
    { name: "description", label: "Description", type: "text", span: 12 },
  ],
});

/** Réalisations et distinctions. */
export const achievementResource = defineResource({
  key: "achievements",
  model: "achievement",
  label: { singular: "Réalisation", plural: "Réalisations" },
  icon: "Trophy",
  description: "Distinctions, compétitions et accomplissements.",
  schema: achievementSchema,
  sortable: true,
  searchable: ["title", "description", "category"],
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "title", label: "Réalisation", render: "title" },
    { key: "category", label: "Type", render: "badge", hideBelow: "sm" },
    { key: "year", label: "Année", hideBelow: "md", align: "right" },
    { key: "featured", label: "Vedette", render: "toggle", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: {
    title: "Aucune réalisation",
    description: "Mentions, classements, présentations — tout ce qui vous distingue.",
  },

  fields: [
    { name: "title", label: "Titre", type: "text", required: true, span: 12, group: "Réalisation" },
    { name: "description", label: "Description", type: "textarea", rows: 3, span: 12, group: "Réalisation" },
    { name: "category", label: "Type", type: "text", span: 6, group: "Réalisation", placeholder: "Distinction académique" },
    { name: "organisation", label: "Organisation", type: "text", span: 6, group: "Réalisation" },

    { name: "year", label: "Année", type: "number", min: 1990, max: 2100, span: 4, group: "Complément" },
    { name: "date", label: "Date précise", type: "date", span: 4, group: "Complément" },
    { name: "iconKey", label: "Icône", type: "icon", span: 4, group: "Complément" },
    { name: "url", label: "Lien", type: "url", span: 12, group: "Complément" },

    { name: "featured", label: "Mettre en vedette", type: "switch", span: 6, group: "Publication" },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 6, group: "Publication" },
  ],
});

/** Services — section « What I do ». */
export const serviceResource = defineResource({
  key: "services",
  model: "service",
  label: { singular: "Service", plural: "Services" },
  icon: "Handshake",
  description: "Ce que vous proposez, affiché en cartes sur l'accueil.",
  schema: serviceSchema,
  sortable: true,
  searchable: ["title", "description"],
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "title", label: "Service", render: "title" },
    { key: "features", label: "Points", render: "count", hideBelow: "md", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucun service", description: "Décrivez ce que vous savez faire." },

  fields: [
    { name: "title", label: "Titre", type: "text", required: true, span: 8 },
    { name: "iconKey", label: "Icône", type: "icon", span: 4 },
    { name: "description", label: "Description", type: "textarea", required: true, rows: 3, span: 12 },
    { name: "features", label: "Points détaillés", type: "tags", span: 12, hint: "Entrée pour valider chaque point." },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 12 },
  ],
});

/** Cartes statistiques — les valeurs proviennent de requêtes réelles (§25). */
export const statCardResource = defineResource({
  key: "stats",
  model: "statCard",
  label: { singular: "Statistique", plural: "Statistiques" },
  icon: "ChartNoAxesColumn",
  description: "Les compteurs de la page d'accueil, calculés depuis vos données.",
  schema: statCardSchema,
  sortable: true,
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "label", label: "Libellé", render: "title" },
    { key: "source", label: "Source", render: "badge", hideBelow: "sm" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucune statistique", description: "Ajoutez un compteur." },

  fields: [
    { name: "label", label: "Libellé", type: "text", required: true, span: 6 },
    { name: "source", label: "Source de la valeur", type: "select", options: [...STAT_SOURCES], span: 6, hint: "Le chiffre est calculé automatiquement, sauf en mode manuel." },
    {
      name: "manualValue",
      label: "Valeur manuelle",
      type: "number",
      span: 4,
      showIf: { field: "source", equals: "MANUAL" },
    },
    { name: "prefix", label: "Préfixe", type: "text", span: 2 },
    { name: "suffix", label: "Suffixe", type: "text", span: 2, placeholder: "+" },
    { name: "iconKey", label: "Icône", type: "icon", span: 4 },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 12 },
  ],
});

/** Liens sociaux. */
export const socialLinkResource = defineResource({
  key: "social-links",
  model: "socialLink",
  label: { singular: "Lien social", plural: "Liens sociaux" },
  icon: "Link2",
  description: "GitHub, LinkedIn, email — affichés dans le Hero et le footer.",
  schema: socialLinkSchema,
  sortable: true,
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "label", label: "Lien", render: "title" },
    { key: "url", label: "Adresse", hideBelow: "sm" },
    { key: "inHero", label: "Hero", render: "toggle", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucun lien", description: "Ajoutez vos profils." },

  fields: [
    { name: "label", label: "Libellé", type: "text", required: true, span: 6 },
    { name: "platform", label: "Clé technique", type: "text", required: true, span: 6, hint: "github, linkedin, email…" },
    { name: "url", label: "Adresse", type: "url", required: true, span: 8, placeholder: "https://linkedin.com/in/…" },
    { name: "iconKey", label: "Icône", type: "icon", span: 4 },
    { name: "inHero", label: "Afficher dans le Hero", type: "switch", span: 6 },
    { name: "visible", label: "Visible", type: "switch", span: 6 },
  ],
});

/** Qualités personnelles. */
export const qualityResource = defineResource({
  key: "qualities",
  model: "quality",
  label: { singular: "Qualité", plural: "Qualités" },
  icon: "Sparkles",
  description: "Vos qualités personnelles, affichées dans la section À propos.",
  schema: qualitySchema,
  sortable: true,
  defaultSort: { field: "order", direction: "asc" },

  columns: [{ key: "label", label: "Qualité", render: "title" }],
  emptyState: { title: "Aucune qualité", description: "Ajoutez vos qualités." },

  fields: [
    { name: "label", label: "Qualité", type: "text", required: true, span: 8 },
    { name: "iconKey", label: "Icône", type: "icon", span: 4 },
  ],
});

/** Langues parlées. */
export const languageResource = defineResource({
  key: "languages",
  model: "language",
  label: { singular: "Langue", plural: "Langues" },
  icon: "Languages",
  description: "Les langues que vous parlez et votre niveau.",
  schema: languageSchema,
  sortable: true,
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "name", label: "Langue", render: "title" },
    { key: "level", label: "Niveau", hideBelow: "sm" },
  ],
  emptyState: { title: "Aucune langue", description: "Ajoutez les langues que vous parlez." },

  fields: [
    { name: "name", label: "Langue", type: "text", required: true, span: 5 },
    { name: "level", label: "Niveau", type: "text", span: 4, placeholder: "Courant" },
    { name: "percent", label: "Pourcentage", type: "number", min: 0, max: 100, span: 3 },
  ],
});
