import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, localizedPath, type Locale } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DONNÉES STRUCTURÉES (schema.org / JSON-LD)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Deux règles gouvernent ce fichier :
 *
 *  1. RIEN D'INVENTÉ. Chaque propriété est omise lorsque la donnée n'existe
 *     pas en base. Un JSON-LD qui affirme ce que la page ne montre pas est
 *     traité comme du spam par Google, et c'est de toute façon un mensonge.
 *
 *  2. AUCUN TYPE APPROXIMATIF. Les études de cas sont modélisées en
 *     `CreativeWork` — vrai pour tout projet réalisé — plutôt qu'en
 *     `SoftwareApplication`, qui suppose un logiciel distribué, installable et
 *     décrit par ses `offers` et son `operatingSystem`. Aucun de ces projets
 *     ne l'est.
 *
 * Les identités sont reliées par `@id` : la Person déclarée sur l'accueil est
 * référencée par le WebSite et par chaque étude de cas, si bien qu'un moteur
 * comprend qu'il s'agit d'une seule et même personne.
 */

export type JsonLdObject = Record<string, unknown>;

/** Identifiants stables, réutilisés d'une page à l'autre. */
export const PERSON_ID = `${siteConfig.url}/#person`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/** Retire les clés vides pour ne jamais publier `"jobTitle": null`. */
function compact(object: JsonLdObject): JsonLdObject {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== null && value !== undefined && value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

type PersonInput = {
  fullName: string;
  headline: string;
  bioShort: string | null;
  email: string;
  location: string | null;
  avatar: { url: string; alt: string } | null;
  socialUrls: string[];
  /** Sujets réellement maîtrisés — les technologies visibles du portfolio. */
  knowsAbout: string[];
  /** Langue de la page qui déclare ce nœud. */
  locale?: Locale;
};

/** La personne derrière le portfolio. */
export function personJsonLd(profile: PersonInput): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.fullName,
    url: siteConfig.url,
    jobTitle: profile.headline,
    description: profile.bioShort,
    email: profile.email ? `mailto:${profile.email}` : null,
    image: profile.avatar ? absoluteUrl(profile.avatar.url) : null,
    // `address` accepte du texte libre : découper « Casablanca, Maroc » en
    // champs postaux reviendrait à deviner ce que la base ne dit pas.
    address: profile.location,
    knowsAbout: profile.knowsAbout,
    // `sameAs` désigne d'AUTRES pages décrivant la même personne (GitHub,
    // LinkedIn…). Un lien social peut être un `mailto:` — déjà exprimé par
    // `email`, et invalide ici : on ne garde que le web.
    sameAs: profile.socialUrls.filter((url) => /^https?:\/\//.test(url)),
    inLanguage: profile.locale ?? DEFAULT_LOCALE,
  });
}

/** Le site lui-même, rattaché à son auteur. */
export function webSiteJsonLd(
  name: string,
  description: string,
  locale: Locale = DEFAULT_LOCALE,
): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: `${name} — Portfolio`,
    url: siteConfig.url,
    description,
    inLanguage: locale,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  });
}

/** Fil d'Ariane — améliore réellement l'affichage dans les résultats Google. */
export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
  locale: Locale = DEFAULT_LOCALE,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      // Le fil doit pointer vers les URL RÉELLES de la langue affichée,
      // sans quoi Google verrait un chemin qui n'existe pas.
      item: absoluteUrl(localizedPath(locale, step.path)),
    })),
  };
}

type ProjectInput = {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  year: number | null;
  startDate: Date | null;
  endDate: Date | null;
  cover: { url: string; alt: string } | null;
  repoUrl: string | null;
  demoUrl: string | null;
  category: { name: string } | null;
  technologies: string[];
  locale?: Locale;
};

/** Une étude de cas : l'œuvre décrite, pas la page qui la décrit. */
export function projectJsonLd(project: ProjectInput): JsonLdObject {
  // Les dates ne sont publiées qu'au format ISO complet quand elles existent ;
  // à défaut, l'année seule reste une date valide au sens de schema.org.
  const created = project.startDate?.toISOString() ?? (project.year ? String(project.year) : null);
  const published = project.endDate?.toISOString() ?? created;

  const locale = project.locale ?? DEFAULT_LOCALE;

  return compact({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteConfig.url}/projects/${project.slug}#work`,
    name: project.title,
    alternateName: project.subtitle,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(localizedPath(locale, `/projects/${project.slug}`)),
    image: project.cover ? absoluteUrl(project.cover.url) : null,
    dateCreated: created,
    datePublished: published,
    genre: project.category?.name ?? null,
    keywords: project.technologies,
    inLanguage: locale,
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    // `codeRepository` et `sameAs` n'apparaissent que si les liens existent.
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    ...(project.demoUrl ? { sameAs: [project.demoUrl] } : {}),
  });
}

/** La page qui liste les projets, et l'ordre réel dans lequel ils s'affichent. */
export function projectCollectionJsonLd(
  projects: { slug: string; title: string }[],
  description: string,
  locale: Locale = DEFAULT_LOCALE,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteConfig.url}/projects#collection`,
    name: "Projets",
    description,
    url: absoluteUrl(localizedPath(locale, "/projects")),
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: absoluteUrl(`/projects/${project.slug}`),
      })),
    },
  };
}
