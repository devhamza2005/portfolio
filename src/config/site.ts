/**
 * Configuration statique du site.
 *
 * ⚠️ Ne contient QUE des valeurs techniques et publiques (URL canonique,
 * locale, mots-clés SEO de base). Tout le contenu éditorial — nom, titre,
 * bio, liens sociaux, CV — vit en base de données et s'édite depuis /admin.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  /** URL canonique, sans slash final. */
  url: rawSiteUrl.replace(/\/$/, ""),
  locale: "fr_MA",
  lang: "fr",
  /** Repli utilisé tant que la table Profile n'est pas encore renseignée. */
  fallback: {
    name: "Hamza Fanoune",
    title: "Hamza Fanoune — Développeur Full Stack Java | Spring Boot & React",
    description:
      "Développeur Full Stack Java spécialisé Spring Boot et React, basé à Casablanca. " +
      "Découvrez mes projets, mon expérience et mes compétences.",
  },
  keywords: [
    "Hamza Fanoune",
    "Développeur Full Stack",
    "Full Stack Developer",
    "Java Developer",
    "Spring Boot Developer",
    "React Developer",
    "Développeur Java Casablanca",
    "Casablanca",
    "Morocco",
    "Maroc",
    "PostgreSQL",
    "Docker",
    "DevOps",
  ],
  themeColor: {
    light: "#FBFBFD",
    dark: "#08090D",
  },
} as const;

export type SiteConfig = typeof siteConfig;
