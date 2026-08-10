import { PROJECT_IMAGE_KINDS, PROJECT_STATUSES, projectSchema } from "@/schemas/project.schema";
import { defineResource } from "./types";

/**
 * Projets — la ressource la plus riche : elle porte toute la case study (§24).
 *
 * Les champs `overview`, `problem`, `solution`, `architecture`, `results` et
 * `learnings` sont facultatifs. Une section laissée vide est simplement masquée
 * sur la page publique : un petit projet reste élégant, un projet phare se
 * déploie entièrement.
 */
export const projectResource = defineResource({
  key: "projects",
  model: "project",
  label: { singular: "Projet", plural: "Projets" },
  icon: "FolderKanban",
  description: "Vos réalisations et leurs études de cas détaillées.",
  schema: projectSchema,
  sortable: true,
  searchable: ["title", "summary", "slug"],
  defaultSort: { field: "order", direction: "asc" },

  listInclude: { category: true, technologies: { include: { technology: true } }, cover: true },

  // Collections remplacées intégralement à chaque enregistrement.
  nested: [
    {
      field: "technologies",
      model: "projectTechnology",
      foreignKey: "projectId",
      linkKey: "technologyId",
    },
    { field: "features", model: "projectFeature", foreignKey: "projectId" },
    { field: "challenges", model: "projectChallenge", foreignKey: "projectId" },
    { field: "metrics", model: "projectMetric", foreignKey: "projectId" },
    { field: "images", model: "projectImage", foreignKey: "projectId", include: { media: true } },
  ],

  columns: [
    { key: "cover", label: "", render: "image" },
    { key: "title", label: "Projet", render: "title" },
    { key: "category", label: "Catégorie", render: "badge", hideBelow: "md" },
    { key: "technologies", label: "Techs", render: "count", hideBelow: "lg", align: "right" },
    { key: "featured", label: "Vedette", render: "toggle", align: "right" },
    { key: "published", label: "Publié", render: "toggle", align: "right" },
  ],

  emptyState: {
    title: "Aucun projet",
    description: "Ajoutez votre premier projet — il apparaîtra aussitôt sur le portfolio.",
  },

  fields: [
    // ── Identité ──────────────────────────────────────────────────────────
    { name: "title", label: "Titre", type: "text", required: true, span: 8, group: "Identité", placeholder: "Convention Management" },
    { name: "slug", label: "Slug (URL)", type: "slug", from: "title", required: true, span: 4, group: "Identité", hint: "Adresse publique : /projects/mon-projet" },
    { name: "subtitle", label: "Sous-titre", type: "text", span: 12, group: "Identité", placeholder: "Casa Prestations — SDL de la Commune de Casablanca" },
    { name: "summary", label: "Résumé", type: "textarea", required: true, rows: 3, max: 600, span: 12, group: "Identité", hint: "2 à 3 lignes — c'est le texte affiché sur les cartes." },
    { name: "categoryId", label: "Catégorie", type: "relation", to: "category:PROJECT", span: 6, group: "Identité" },
    { name: "status", label: "Statut", type: "select", options: [...PROJECT_STATUSES], span: 6, group: "Identité" },

    // ── Contexte ──────────────────────────────────────────────────────────
    { name: "context", label: "Contexte", type: "text", span: 6, group: "Contexte", placeholder: "Projet de Fin d'Études" },
    { name: "role", label: "Votre rôle", type: "text", span: 6, group: "Contexte", placeholder: "Développeur Full Stack" },
    { name: "client", label: "Client / commanditaire", type: "text", span: 8, group: "Contexte" },
    { name: "teamSize", label: "Taille de l'équipe", type: "number", min: 1, max: 100, span: 4, group: "Contexte" },
    { name: "year", label: "Année", type: "number", min: 1990, max: 2100, span: 4, group: "Contexte" },
    { name: "startDate", label: "Date de début", type: "date", span: 4, group: "Contexte" },
    { name: "endDate", label: "Date de fin", type: "date", span: 4, group: "Contexte" },

    // ── Médias et liens ───────────────────────────────────────────────────
    { name: "coverId", label: "Image de couverture", type: "image", folder: "projects", span: 12, group: "Médias & liens" },
    { name: "demoUrl", label: "Démo en ligne", type: "url", span: 4, group: "Médias & liens", placeholder: "https://…" },
    { name: "repoUrl", label: "Dépôt GitHub", type: "url", span: 4, group: "Médias & liens", placeholder: "https://github.com/…" },
    { name: "docUrl", label: "Documentation", type: "url", span: 4, group: "Médias & liens" },

    // ── Technologies ──────────────────────────────────────────────────────
    { name: "technologies", label: "Technologies utilisées", type: "relation", to: "technology", multiple: true, span: 12, group: "Technologies", hint: "Absente de la liste ? Ajoutez-la depuis Technologies." },

    // ── Case study ────────────────────────────────────────────────────────
    { name: "overview", label: "Présentation", type: "markdown", rows: 5, span: 12, group: "Étude de cas", hint: "Vue d'ensemble du projet. Laissez vide pour masquer la section." },
    { name: "problem", label: "Problématique", type: "markdown", rows: 5, span: 12, group: "Étude de cas" },
    { name: "solution", label: "Solution apportée", type: "markdown", rows: 5, span: 12, group: "Étude de cas" },
    { name: "architecture", label: "Architecture technique", type: "markdown", rows: 6, span: 12, group: "Étude de cas" },
    { name: "results", label: "Résultats", type: "markdown", rows: 4, span: 12, group: "Étude de cas" },
    { name: "learnings", label: "Ce que j'en retiens", type: "markdown", rows: 4, span: 12, group: "Étude de cas" },

    // ── Détails structurés ────────────────────────────────────────────────
    {
      name: "features",
      label: "Fonctionnalités",
      type: "repeater",
      itemLabel: "Fonctionnalité",
      max: 40,
      span: 12,
      group: "Détails",
      fields: [
        { name: "title", label: "Titre", type: "text", required: true, span: 8 },
        { name: "iconKey", label: "Icône", type: "icon", span: 4 },
        { name: "description", label: "Description", type: "textarea", rows: 2, span: 12 },
      ],
    },
    {
      name: "challenges",
      label: "Défis rencontrés",
      type: "repeater",
      itemLabel: "Défi",
      max: 20,
      span: 12,
      group: "Détails",
      fields: [
        { name: "title", label: "Titre", type: "text", required: true, span: 12 },
        { name: "problem", label: "Le problème", type: "textarea", required: true, rows: 3, span: 6 },
        { name: "solution", label: "La solution", type: "textarea", required: true, rows: 3, span: 6 },
      ],
    },
    {
      name: "metrics",
      label: "Chiffres clés",
      type: "repeater",
      itemLabel: "Métrique",
      max: 12,
      span: 12,
      group: "Détails",
      hint: "N'indiquez que des chiffres vérifiables.",
      fields: [
        { name: "label", label: "Libellé", type: "text", required: true, span: 5 },
        { name: "value", label: "Valeur", type: "text", required: true, span: 3 },
        { name: "unit", label: "Unité", type: "text", span: 2 },
        { name: "iconKey", label: "Icône", type: "icon", span: 2 },
      ],
    },
    {
      name: "images",
      label: "Captures d'écran",
      type: "repeater",
      itemLabel: "Image",
      max: 30,
      span: 12,
      group: "Détails",
      fields: [
        { name: "mediaId", label: "Image", type: "image", folder: "projects", required: true, span: 6 },
        { name: "kind", label: "Type", type: "select", options: [...PROJECT_IMAGE_KINDS], span: 3 },
        { name: "caption", label: "Légende", type: "text", span: 3 },
      ],
    },

    // ── Publication ───────────────────────────────────────────────────────
    { name: "featured", label: "Mettre en vedette", type: "switch", span: 6, group: "Publication", hint: "Affiché en grand sur la page d'accueil." },
    { name: "published", label: "Publié", type: "switch", span: 6, group: "Publication", hint: "Décoché, le projet reste invisible sur le site." },
  ],
});
