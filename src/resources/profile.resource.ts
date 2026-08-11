import { profileSchema } from "@/schemas/profile.schema";

import { defineResource } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PROFIL — ressource à ligne unique
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La table `profile` ne contient qu'un enregistrement, dont l'identifiant vaut
 * toujours « profile » (voir la valeur par défaut du schéma Prisma). Il n'y a
 * donc ni liste, ni création, ni suppression : un seul formulaire d'édition,
 * servi par /admin/profile.
 *
 * `key: "profile"` n'est pas anodin : les actions génériques appellent
 * `updateTag(resource.key)`, et `getProfile()` porte déjà le tag `profile`.
 * L'enregistrement rafraîchit donc le site public sans une ligne de code de
 * cache supplémentaire.
 *
 * `columns` reste vide : aucune liste n'est jamais rendue pour cette ressource.
 */
export const profileResource = defineResource({
  key: "profile",
  model: "profile",
  label: { singular: "Profil", plural: "Profil" },
  icon: "UserRound",
  description:
    "Votre identité telle qu'elle apparaît sur le site : nom, titre, biographie, contact et aperçu de partage.",
  schema: profileSchema,
  singleton: true,
  system: true,

  // Chargées pour afficher l'aperçu des médias déjà rattachés sans requête
  // supplémentaire (voir `collectPreview` dans server/queries/resource.ts).
  listInclude: { avatar: true, ogImage: true },

  columns: [],

  fields: [
    {
      name: "fullName",
      label: "Nom complet",
      type: "text",
      required: true,
      span: 6,
      group: "Identité",
      placeholder: "Hamza Fanoune",
      hint: "Affiché dans le Hero, la navigation et le pied de page.",
    },
    {
      name: "headline",
      label: "Titre professionnel",
      type: "text",
      required: true,
      span: 6,
      group: "Identité",
      placeholder: "Développeur Full Stack Java",
      hint: "La ligne juste sous votre nom.",
    },
    {
      name: "subline",
      label: "Sous-titre technique",
      type: "text",
      span: 6,
      group: "Identité",
      placeholder: "Java | Spring Boot | React",
    },
    {
      name: "tagline",
      label: "Phrase d'accroche",
      type: "text",
      span: 6,
      group: "Identité",
      placeholder: "Je conçois des applications web complètes.",
    },
    {
      name: "avatarId",
      label: "Photo de profil",
      type: "image",
      folder: "avatar",
      span: 12,
      group: "Identité",
      hint: "Sans photo, la section « À propos » affiche le monogramme.",
    },

    {
      name: "bioShort",
      label: "Biographie courte",
      type: "markdown",
      rows: 4,
      span: 12,
      group: "Biographie",
      hint: "Premier paragraphe de la section « À propos ». Sert aussi de description dans les données structurées.",
    },
    {
      name: "bioLong",
      label: "Biographie détaillée",
      type: "markdown",
      rows: 10,
      span: 12,
      group: "Biographie",
      hint: "Facultative. Gras avec **texte**, listes avec un tiret en début de ligne.",
    },

    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      span: 6,
      group: "Contact",
      placeholder: "vous@exemple.com",
      hint: "Affiché publiquement dans la section Contact.",
    },
    {
      name: "phone",
      label: "Téléphone",
      type: "text",
      span: 6,
      group: "Contact",
      hint: "Facultatif — non affiché tant qu'il est vide.",
    },
    {
      name: "location",
      label: "Localisation",
      type: "text",
      span: 6,
      group: "Contact",
      placeholder: "Casablanca, Maroc",
    },
    {
      name: "careerStartYear",
      label: "Début de carrière",
      type: "number",
      min: 1970,
      max: 2100,
      span: 6,
      group: "Contact",
      hint: "Sert à calculer les années d'expérience affichées dans les statistiques. Jamais saisies à la main.",
    },

    {
      name: "availability",
      label: "Disponibilité",
      type: "select",
      span: 6,
      group: "Disponibilité",
      options: [
        { value: "OPEN_TO_WORK", label: "Ouvert aux opportunités" },
        { value: "FREELANCE", label: "Disponible en freelance" },
        { value: "BUSY", label: "Indisponible actuellement" },
        { value: "HIDDEN", label: "Ne rien afficher" },
      ],
    },
    {
      name: "availabilityLabel",
      label: "Libellé personnalisé",
      type: "text",
      span: 6,
      group: "Disponibilité",
      placeholder: "Ouvert aux opportunités",
      hint: "Remplace le libellé par défaut du badge.",
    },

    {
      name: "cvUrl",
      label: "CV téléchargeable",
      type: "file",
      folder: "cv",
      span: 8,
      group: "CV",
      hint: "Téléversez le PDF : le bouton « CV » apparaît alors dans la navigation et le Hero.",
    },
    {
      name: "cvLabel",
      label: "Libellé du bouton",
      type: "text",
      span: 4,
      group: "CV",
      placeholder: "Télécharger mon CV",
    },

    {
      name: "seoTitle",
      label: "Titre SEO",
      type: "text",
      span: 12,
      group: "Référencement",
      placeholder: "Hamza Fanoune — Développeur Full Stack Java",
      hint: "Titre affiché dans Google et dans l'onglet du navigateur. À défaut : « Nom — Titre professionnel ». 60 à 70 caractères.",
    },
    {
      name: "seoDescription",
      label: "Description SEO",
      type: "textarea",
      rows: 3,
      max: 320,
      span: 12,
      group: "Référencement",
      hint: "Le paragraphe qu'un recruteur lit dans les résultats de recherche. À défaut : la biographie courte. Environ 150 à 160 caractères.",
    },
    {
      name: "ogImageId",
      label: "Image de partage",
      type: "image",
      folder: "og",
      span: 12,
      group: "Référencement",
      hint: "Aperçu affiché sur LinkedIn, WhatsApp ou X. Format 1200 × 630. Sans image, aucune balise n'est émise — jamais d'aperçu cassé.",
    },
  ],
});
