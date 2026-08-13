import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALES,
  isNoindexLocale,
  localizedPath,
  type Locale,
} from "@/lib/i18n/config";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CONSTRUCTION DES MÉTADONNÉES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Un seul endroit décide de ce que voient Google, LinkedIn et les aperçus de
 * partage. Les valeurs viennent de la base — `Profile.seoTitle`,
 * `seoDescription` et `ogImage` sont éditables depuis /admin (§12) — et ne
 * retombent sur `siteConfig.fallback` que tant que la base n'est pas remplie.
 *
 * Règle absolue : aucune image n'est déclarée si elle n'existe pas réellement.
 * Une balise `og:image` pointant vers un fichier absent produit un aperçu cassé,
 * pire que pas d'aperçu du tout.
 */

/** Image telle que la renvoie `MEDIA_SELECT` dans les requêtes du portfolio. */
export type SeoImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

/** Sous-ensemble du profil utilisé par le SEO — volontairement structurel. */
export type SeoProfile = {
  fullName: string;
  headline: string;
  bioShort: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: SeoImage | null;
} | null;

/** Transforme un chemin relatif en URL absolue basée sur `siteConfig.url`. */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Identité SEO du site, résolue une fois pour toutes.
 *
 * `seoTitle` / `seoDescription` permettent au propriétaire de piloter son
 * référencement sans que le contenu affiché à l'écran ne change.
 */
export function resolveSeoIdentity(profile: SeoProfile) {
  const name = profile?.fullName ?? siteConfig.fallback.name;

  return {
    name,
    /** Titre de la page d'accueil — complet, il ne passe pas par le template. */
    title: profile?.seoTitle ?? (profile ? `${name} — ${profile.headline}` : siteConfig.fallback.title),
    description:
      profile?.seoDescription ??
      profile?.bioShort ??
      profile?.headline ??
      siteConfig.fallback.description,
    ogImage: profile?.ogImage ?? null,
  };
}

/**
 * Traduit un média en tableau `openGraph.images`, ou `undefined` s'il n'y en a
 * pas — `undefined` fait disparaître la clé, là où un tableau vide produirait
 * une balise inutile.
 */
export function openGraphImages(image: SeoImage | null | undefined) {
  if (!image) return undefined;

  return [
    {
      url: image.url,
      alt: image.alt,
      ...(image.width ? { width: image.width } : {}),
      ...(image.height ? { height: image.height } : {}),
    },
  ];
}

/**
 * Bloc `twitter` cohérent avec l'Open Graph.
 *
 * La carte passe en `summary_large_image` uniquement quand une image existe :
 * X réserve le grand format aux publications qui en ont une, et rétrograde
 * silencieusement les autres.
 */
export function twitterCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: SeoImage | null | undefined;
}): NonNullable<Metadata["twitter"]> {
  return {
    card: image ? "summary_large_image" : "summary",
    title,
    description,
    ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
  };
}

/**
 * Bloc `openGraph` complet pour une page publique.
 *
 * Next.js REMPLACE les objets imbriqués au lieu de les fusionner : une page qui
 * déclare son propre `openGraph` perd `siteName` et `locale` hérités du layout
 * racine. Ce constructeur garantit qu'aucune page ne les oublie.
 */
export function openGraph({
  title,
  description,
  path,
  siteName,
  type = "website",
  image,
  locale = DEFAULT_LOCALE,
}: {
  title: string;
  description: string;
  /** Chemin SANS préfixe de langue : « / », « /projects »… */
  path: string;
  siteName: string;
  type?: "website" | "article";
  image?: SeoImage | null;
  locale?: Locale;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url: absoluteUrl(localizedPath(locale, path)),
    siteName,
    locale: OG_LOCALES[locale],
    // Les deux autres versions sont annoncées : LinkedIn et Facebook s'en
    // servent pour proposer l'aperçu dans la langue du lecteur.
    alternateLocale: LOCALES.filter((item) => item !== locale).map((item) => OG_LOCALES[item]),
    type,
    ...(openGraphImages(image) ? { images: openGraphImages(image) } : {}),
  };
}

/**
 * Bloc `alternates` d'une page publique : canonical + hreflang.
 *
 * `path` est le chemin NU, sans préfixe de langue (« /projects »). Les trois
 * versions localisées et `x-default` en sont dérivées, si bien qu'aucune URL
 * n'est écrite en dur et qu'ajouter une locale dans `LOCALES` suffira à la
 * faire apparaître partout.
 *
 * `x-default` pointe vers le français : c'est la langue de référence du site et
 * celle du contenu éditorial en base.
 */
export function alternatesFor(locale: Locale, path = "/"): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};

  for (const item of LOCALES) {
    languages[item] = absoluteUrl(localizedPath(item, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));

  return {
    canonical: absoluteUrl(localizedPath(locale, path)),
    languages,
  };
}

/**
 * Directives d'indexation d'une page publique, selon sa langue.
 *
 * En phase A, seule l'INTERFACE est traduite : projets, biographie et
 * expériences restent en français quelle que soit l'URL. Laisser Google
 * indexer `/en` et `/ar` reviendrait à lui annoncer trois versions distinctes
 * là où il n'en existe qu'une — du contenu dupliqué, doublé d'un `hreflang`
 * mensonger. Ces deux langues sont donc `noindex` jusqu'à la phase B.
 *
 * `follow` reste actif : les moteurs peuvent suivre les liens et découvrir la
 * version française, qui, elle, est indexable.
 */
export function robotsFor(locale: Locale): NonNullable<Metadata["robots"]> {
  if (isNoindexLocale(locale)) return { index: false, follow: true };
  return publicRobots;
}

/** Coupe une description au plus près d'une limite, sans casser un mot. */
export function truncate(text: string, max = 300): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Directives d'indexation du site public.
 *
 * En local, tout est bloqué : une préproduction indexée par erreur duplique le
 * vrai site et lui fait concurrence dans les résultats de recherche.
 */
export const publicRobots: NonNullable<Metadata["robots"]> = siteConfig.isLocal
  ? { index: false, follow: false }
  : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    };
