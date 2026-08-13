"use client";

import { usePathname } from "next/navigation";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Locale courante, côté client, déduite de l'URL.
 *
 * `next/root-params` est réservé aux composants serveur. Or `error.tsx` est
 * obligatoirement un composant client et ne reçoit aucun `params` : c'est le
 * seul endroit du site public où la locale doit être relue à la main.
 *
 * L'URL reste la source de vérité — ni cookie, ni en-tête, ni `localStorage` —
 * donc rien ne peut diverger de ce que le serveur a rendu.
 */
export function useLocale(): Locale {
  const pathname = usePathname();
  const first = pathname.split("/").filter(Boolean)[0];

  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}
