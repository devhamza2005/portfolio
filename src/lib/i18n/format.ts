import { DEFAULT_LOCALE, INTL_LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Utilitaires de formatage i18n — ISOMORPHES.
 *
 * Volontairement séparés de `dictionaries.ts`, qui ne s'exécute que côté
 * serveur : `error.tsx` est un composant client obligatoire et a besoin de
 * `interpolate`. Les mélanger ferait entrer le chargeur de dictionnaires dans
 * le bundle du navigateur.
 */

/**
 * Substitution de variables : « {count} projets » → « 7 projets ».
 *
 * Volontairement minimal — ni pluriel, ni genre, ni date. Les rares pluriels du
 * site sont écrits de façon neutre dans les dictionnaires (« projet(s) »), ce
 * qui évite d'embarquer une bibliothèque ICU pour trois chaînes.
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Étiquette `Intl` correspondant à une locale (`fr` → `fr-FR`). */
export function intlLocale(current: Locale = DEFAULT_LOCALE): string {
  return INTL_LOCALES[current];
}
