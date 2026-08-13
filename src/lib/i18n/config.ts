/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CONFIGURATION i18n — source unique de vérité
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ Ne pas confondre avec le modèle Prisma `Language`, qui décrit les LANGUES
 * PARLÉES affichées dans « À propos » (arabe, français, anglais). Ici il s'agit
 * de la langue de l'INTERFACE. Le mot « locale » est réservé à ce fichier.
 *
 * Ce module ne contient aucun `import "server-only"` : il est délibérément
 * isomorphe. Le sélecteur de langue, qui est un composant client, a besoin de
 * `LOCALES` et de `LOCALE_LABELS`. Rien de sensible n'y transite — seulement
 * trois codes de langue et leurs libellés.
 */

/** Locales servies par le site public, dans l'ordre d'affichage du sélecteur. */
export const LOCALES = ["fr", "en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Locale par défaut.
 *
 * C'est aussi la langue des colonnes de la base : le contenu éditorial
 * (projets, bio, expériences) est rédigé en français, et toute traduction
 * manquante y retombe.
 */
// `satisfies` plutôt qu'une annotation `: Locale` : le type reste le littéral
// « fr », ce qui permet à TypeScript de restreindre l'union après un test
// `locale === DEFAULT_LOCALE`. Avec l'annotation, `fr` restait dans l'union et
// les requêtes Prisma refusaient une locale qui ne peut valoir que `en` ou `ar`.
export const DEFAULT_LOCALE = "fr" satisfies Locale;

/** Sens d'écriture. Seul l'arabe est de droite à gauche. */
export const DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  ar: "rtl",
};

/**
 * Libellés du sélecteur.
 *
 * `native` est le nom de la langue DANS cette langue : un visiteur arabophone
 * cherche « العربية », pas « Arabe ». `short` sert à l'affichage compact.
 */
export const LOCALE_LABELS: Record<Locale, { native: string; short: string; english: string }> = {
  fr: { native: "Français", short: "FR", english: "French" },
  en: { native: "English", short: "EN", english: "English" },
  ar: { native: "العربية", short: "AR", english: "Arabic" },
};

/**
 * Étiquettes BCP 47 complètes.
 *
 * Utilisées pour `Intl` et pour `og:locale`. Le Maroc est le marché visé :
 * l'arabe est donc `ar-MA` et non `ar-SA`, et le français `fr-FR` pour le
 * formatage (les conventions de date y sont identiques à `fr-MA`, mais
 * `fr-FR` est bien plus largement pris en charge par les environnements).
 */
export const INTL_LOCALES: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-MA",
};

/** Format attendu par Open Graph : `langue_RÉGION`. */
export const OG_LOCALES: Record<Locale, string> = {
  fr: "fr_MA",
  en: "en_US",
  ar: "ar_MA",
};

/** Vrai si la valeur est une locale servie. Restreint le type au passage. */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Locales dont le CONTENU ÉDITORIAL est réellement traduit.
 *
 * En phase A, seule l'interface est traduite : les projets, la bio et les
 * expériences restent en français quelle que soit l'URL. Annoncer `/en` et
 * `/ar` à Google reviendrait à lui promettre trois versions distinctes alors
 * qu'il n'en existe qu'une — un signal `hreflang` mensonger, pénalisant.
 *
 * Ces locales sont donc `noindex` tant que la phase B (table `Translation`)
 * n'est pas livrée. Retirer une locale de cette liste suffira à l'ouvrir à
 * l'indexation, sans rien changer d'autre.
 */
export const NOINDEX_LOCALES: readonly Locale[] = ["en", "ar"];

/**
 * Seuils d'indexabilité — palier A et palier B.
 *
 * Un seuil unique serait trompeur : traduire 95 % des noms de compétences en
 * laissant le `<title>` en français produirait une page « indexable » et
 * pourtant inutilisable. D'où deux paliers, tous deux obligatoires.
 *
 *  • PALIER A — champs qui alimentent `<title>`, `<meta description>` et les
 *    titres de premier niveau (voir `seoCritical` du registre) : 100 % exigés.
 *  • PALIER B — tout le reste du contenu éditorial : 90 % exigés.
 *
 * ⚠️ Atteindre ces seuils ne lève PAS le `noindex` tout seul. Le tableau de
 * bord /admin/translations signale l'éligibilité ; l'ouverture à l'indexation
 * reste une décision humaine, qui consiste à retirer la locale de
 * `NOINDEX_LOCALES` ci-dessus. Ce choix est délibéré : publier trois versions
 * d'un même site est une décision de référencement, pas un effet de bord.
 */
export const INDEX_THRESHOLDS = { seoCritical: 1, body: 0.9 } as const;

/** Vrai tant que la locale ne doit pas être indexée (voir ci-dessus). */
export function isNoindexLocale(locale: Locale): boolean {
  return NOINDEX_LOCALES.includes(locale);
}

/**
 * Préfixe une route interne de sa locale.
 *
 * Toutes les URL publiques sont préfixées, y compris le français : `/fr` plutôt
 * que `/`. Une seule forme d'URL par page, donc pas de contenu dupliqué, et un
 * `canonical` évident.
 */
export function localizedPath(locale: Locale, path = "/"): string {
  if (path === "/" || path === "") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Remplace la locale d'un chemin déjà préfixé, en gardant la page courante.
 *
 * C'est le cœur du sélecteur de langue : `/fr/projects/parking` devient
 * `/ar/projects/parking`. Les slugs étant identiques dans les trois langues,
 * échanger le premier segment suffit toujours.
 */
export function switchLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0]!)) {
    segments[0] = next;
    return `/${segments.join("/")}`;
  }

  return localizedPath(next, pathname);
}
