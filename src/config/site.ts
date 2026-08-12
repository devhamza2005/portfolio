/**
 * Configuration statique du site.
 *
 * ⚠️ Ne contient QUE des valeurs techniques et publiques (URL canonique,
 * locale, mots-clés SEO de base). Tout le contenu éditorial — nom, titre,
 * bio, liens sociaux, CV — vit en base de données et s'édite depuis /admin.
 */

/**
 * URL publique du site — SOURCE DE VÉRITÉ UNIQUE.
 *
 * Elle vient de `NEXT_PUBLIC_SITE_URL` et de nulle part ailleurs : canonical,
 * Open Graph, sitemap et robots la dérivent tous d'ici. Aucune autre URL n'est
 * écrite en dur dans le projet.
 *
 *   • développement → http://localhost:3000 (repli)
 *   • production    → l'URL réelle, définie dans l'environnement de déploiement
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) return "http://localhost:3000";

  try {
    // `new URL` normalise (protocole, casse de l'hôte) et rejette une saisie
    // malformée plutôt que de la propager silencieusement dans tout le SEO.
    return new URL(raw).origin;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL n'est pas une URL absolue valide. ` +
        `Attendu : « https://votre-domaine.com ».`,
    );
  }
}

const siteUrl = resolveSiteUrl();

export const siteConfig = {
  /** URL canonique, sans slash final. */
  url: siteUrl,
  /** Vrai tant que le site tourne en local : robots.ts s'en sert pour ne pas exposer un environnement de dev. */
  isLocal: siteUrl.startsWith("http://localhost") || siteUrl.startsWith("http://127."),
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
    dark: "#050505",
  },
} as const;

export type SiteConfig = typeof siteConfig;
