import {
  EDUCATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  certificationSchema,
  educationSchema,
  experienceSchema,
} from "@/schemas/career.schema";
import { defineResource } from "./types";

/** Expériences professionnelles. */
export const experienceResource = defineResource({
  key: "experiences",
  model: "experience",
  label: { singular: "Expérience", plural: "Expériences" },
  icon: "Briefcase",
  description: "Votre parcours professionnel, affiché en frise chronologique.",
  schema: experienceSchema,
  sortable: true,
  searchable: ["company", "role"],
  defaultSort: { field: "order", direction: "asc" },
  listInclude: { technologies: { include: { technology: true } }, highlights: true },

  nested: [
    { field: "highlights", model: "experienceHighlight", foreignKey: "experienceId" },
    {
      field: "technologies",
      model: "experienceTechnology",
      foreignKey: "experienceId",
      linkKey: "technologyId",
    },
  ],

  columns: [
    { key: "role", label: "Poste", render: "title" },
    { key: "company", label: "Entreprise", hideBelow: "sm" },
    { key: "startDate", label: "Début", render: "date", hideBelow: "md" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: {
    title: "Aucune expérience",
    description: "Ajoutez un poste, un stage ou un projet professionnel.",
  },

  fields: [
    { name: "role", label: "Poste occupé", type: "text", required: true, span: 6, group: "Poste", placeholder: "Développeur Full Stack" },
    { name: "company", label: "Entreprise", type: "text", required: true, span: 6, group: "Poste" },
    { name: "employmentType", label: "Type de contrat", type: "select", options: [...EMPLOYMENT_TYPES], span: 4, group: "Poste" },
    { name: "workMode", label: "Mode de travail", type: "select", options: [...WORK_MODES], span: 4, group: "Poste" },
    { name: "location", label: "Lieu", type: "text", span: 4, group: "Poste", placeholder: "Casablanca, Maroc" },

    { name: "startDate", label: "Date de début", type: "date", required: true, span: 4, group: "Période" },
    { name: "endDate", label: "Date de fin", type: "date", span: 4, group: "Période", hint: "Vide si le poste est en cours." },
    { name: "current", label: "Poste actuel", type: "switch", span: 4, group: "Période" },

    { name: "description", label: "Description", type: "textarea", rows: 4, span: 12, group: "Contenu" },
    {
      name: "highlights",
      label: "Missions et réalisations",
      type: "repeater",
      itemLabel: "Mission",
      max: 20,
      span: 12,
      group: "Contenu",
      hint: "Une ligne par mission — affichées en liste à puces.",
      fields: [{ name: "text", label: "Mission", type: "textarea", required: true, rows: 2, span: 12 }],
    },
    { name: "technologies", label: "Technologies", type: "relation", to: "technology", multiple: true, span: 12, group: "Contenu" },

    { name: "logoId", label: "Logo de l'entreprise", type: "image", folder: "logos", span: 6, group: "Complément" },
    { name: "companyUrl", label: "Site de l'entreprise", type: "url", span: 6, group: "Complément" },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 12, group: "Complément" },
  ],
});

/** Formations. */
export const educationResource = defineResource({
  key: "education",
  model: "education",
  label: { singular: "Formation", plural: "Formations" },
  icon: "GraduationCap",
  description: "Diplômes, cursus et distinctions académiques.",
  schema: educationSchema,
  sortable: true,
  searchable: ["school", "degree", "field"],
  defaultSort: { field: "order", direction: "asc" },

  columns: [
    { key: "degree", label: "Diplôme", render: "title" },
    { key: "school", label: "Établissement", hideBelow: "sm" },
    { key: "mention", label: "Mention", render: "badge", hideBelow: "md" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: { title: "Aucune formation", description: "Ajoutez votre parcours académique." },

  fields: [
    { name: "degree", label: "Diplôme", type: "text", required: true, span: 7, group: "Diplôme", placeholder: "Licence en Développement Web et Logiciel" },
    { name: "school", label: "Établissement", type: "text", required: true, span: 5, group: "Diplôme" },
    { name: "field", label: "Spécialité", type: "text", span: 6, group: "Diplôme" },
    { name: "status", label: "Statut", type: "select", options: [...EDUCATION_STATUSES], span: 6, group: "Diplôme" },

    { name: "grade", label: "Note obtenue", type: "text", span: 4, group: "Résultats", placeholder: "17/20" },
    { name: "mention", label: "Mention", type: "text", span: 4, group: "Résultats", placeholder: "Très Bien" },
    { name: "honors", label: "Distinction", type: "text", span: 4, group: "Résultats", placeholder: "Soutenance de PFE validée" },

    { name: "startDate", label: "Date de début", type: "date", span: 4, group: "Période" },
    { name: "endDate", label: "Date de fin", type: "date", span: 4, group: "Période" },
    { name: "location", label: "Lieu", type: "text", span: 4, group: "Période" },

    { name: "description", label: "Description", type: "textarea", rows: 3, span: 12, group: "Complément" },
    { name: "logoId", label: "Logo de l'établissement", type: "image", folder: "logos", span: 6, group: "Complément" },
    { name: "schoolUrl", label: "Site de l'établissement", type: "url", span: 6, group: "Complément" },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 12, group: "Complément" },
  ],
});

/** Certifications. */
export const certificationResource = defineResource({
  key: "certifications",
  model: "certification",
  label: { singular: "Certification", plural: "Certifications" },
  icon: "BadgeCheck",
  description: "Certifications et attestations obtenues.",
  schema: certificationSchema,
  sortable: true,
  searchable: ["name", "issuer"],
  defaultSort: { field: "order", direction: "asc" },
  listInclude: { image: true },

  columns: [
    { key: "image", label: "", render: "image" },
    { key: "name", label: "Certification", render: "title" },
    { key: "issuer", label: "Organisme", hideBelow: "sm" },
    { key: "issueDate", label: "Obtenue le", render: "date", hideBelow: "md" },
    { key: "featured", label: "Vedette", render: "toggle", align: "right" },
    { key: "visible", label: "Visible", render: "toggle", align: "right" },
  ],

  emptyState: {
    title: "Aucune certification",
    description: "Ajoutez vos certifications : elles rassurent les recruteurs.",
  },

  fields: [
    { name: "name", label: "Nom de la certification", type: "text", required: true, span: 7, group: "Certification" },
    { name: "issuer", label: "Organisme émetteur", type: "text", required: true, span: 5, group: "Certification" },
    { name: "issueDate", label: "Date d'obtention", type: "date", span: 4, group: "Certification" },
    { name: "expiryDate", label: "Date d'expiration", type: "date", span: 4, group: "Certification", hint: "Vide si sans expiration." },
    { name: "credentialId", label: "Identifiant", type: "text", span: 4, group: "Certification" },

    { name: "description", label: "Description", type: "textarea", rows: 3, span: 12, group: "Détails" },
    { name: "credentialUrl", label: "Lien de vérification", type: "url", span: 6, group: "Détails" },
    { name: "fileUrl", label: "Fichier PDF", type: "url", span: 6, group: "Détails", hint: "Téléversez le PDF depuis la médiathèque, puis collez son adresse." },
    { name: "imageId", label: "Image / badge", type: "image", folder: "certifications", span: 12, group: "Détails" },

    { name: "featured", label: "Mettre en vedette", type: "switch", span: 6, group: "Publication" },
    { name: "visible", label: "Visible sur le site", type: "switch", span: 6, group: "Publication" },
  ],
});
