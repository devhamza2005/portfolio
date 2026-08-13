import "server-only";

import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DICTIONNAIRES — chargement côté serveur
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Comment la locale circule, et pourquoi PAS `next/root-params` ──────────
 *
 * L'approche initiale reposait sur `next/root-params`, qui expose les segments
 * situés au-dessus du layout racine à tout composant serveur. Elle ne fonctionne
 * pas ici : l'application a DEUX layouts racines — `(public)/[locale]` pour le
 * site et `(admin)` pour le back-office francophone. `[locale]` n'étant pas
 * commun aux deux arbres, ce n'est pas un paramètre racine, et
 * `next/root-params` n'exporte alors rien du tout (« The module has no exports
 * at all » au build).
 *
 * On applique donc le repli que la documentation Next.js décrit explicitement :
 * lire `params` dans la page, puis passer la locale en ARGUMENT. C'est aussi
 * simple, et tout aussi sûr vis-à-vis de Cache Components — un argument d'une
 * fonction `"use cache"` entre naturellement dans sa clé de cache, exactement
 * comme l'aurait fait un paramètre racine.
 *
 * Ce qui compte, et qui reste vrai : la locale vient de l'URL, jamais d'un
 * en-tête ni d'un cookie. Aucune fonction `"use cache"` n'appelle `headers()`.
 *
 * ── Typage ────────────────────────────────────────────────────────────────
 *
 * `Messages` est dérivé de `fr.json`, la langue de référence. Les chargeurs
 * sont typés `Promise<Messages>` : si une clé manque dans `en.json` ou
 * `ar.json`, TypeScript le signale au `typecheck`, pas le visiteur en
 * production.
 */

/** Forme du dictionnaire, déduite du français — l'import est purement typé. */
export type Messages = typeof import("@/messages/fr.json");

/**
 * Un seul fichier est réellement chargé par requête : les deux autres ne sont
 * jamais évalués. Tout se passe côté serveur, donc rien n'atteint le bundle
 * client (voir la note « Client Components » de la doc Next.js sur l'i18n).
 */
const LOADERS: Record<Locale, () => Promise<Messages>> = {
  fr: () => import("@/messages/fr.json").then((module) => module.default),
  en: () => import("@/messages/en.json").then((module) => module.default),
  ar: () => import("@/messages/ar.json").then((module) => module.default),
};

/**
 * Valide le segment de route et restreint son type.
 *
 * Une valeur inconnue (`/de`, `/xx`) déclenche un 404 plutôt qu'un repli
 * silencieux : mieux vaut une page introuvable qu'une URL fantôme qui
 * répondrait 200 dans une langue non servie — et que Google indexerait.
 */
export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

/** Dictionnaire d'une locale déjà validée. */
export async function getDictionary(locale: Locale): Promise<Messages> {
  return LOADERS[locale]();
}

/**
 * Valide le segment ET charge le dictionnaire — le cas le plus fréquent.
 *
 * ```ts
 * const { locale, t } = await getI18n(await params);
 * ```
 */
export async function getI18n(params: { locale: string }): Promise<{
  locale: Locale;
  t: Messages;
}> {
  const locale = requireLocale(params.locale);
  return { locale, t: await LOADERS[locale]() };
}

/** Alias explicite, pour les appels qui disposent déjà d'une `Locale`. */
export const getDictionaryFor = getDictionary;
