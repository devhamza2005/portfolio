import { Inter, JetBrains_Mono, Noto_Sans_Arabic, Space_Grotesk } from "next/font/google";

/**
 * Polices auto-hébergées via next/font :
 * aucune requête vers un domaine tiers, aucun CLS, `font-display: swap`.
 */

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

/**
 * Arabe — Noto Sans Arabic.
 *
 * Inter, Space Grotesk et JetBrains Mono ne couvrent pas l'écriture arabe : sans
 * cette police, `/ar` retomberait sur une police système, avec un rendu et une
 * hauteur de ligne incohérents.
 *
 * Elle n'est PAS chargée sur `/fr` ni `/en` : sa variable n'est appliquée au
 * document que lorsque la locale est arabe (voir `fontVariables`). Les chaînes
 * `--font-sans` et `--font-display` la citent en repli, si bien que le latin
 * reste rendu par Inter et Space Grotesk même en page arabe — seuls les glyphes
 * arabes basculent sur Noto.
 */
export const fontArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
});

const LATIN_VARIABLES = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;

/**
 * Variables de police à poser sur `<html>`.
 *
 * `withArabic` n'est vrai que pour la locale arabe : c'est ce qui évite de
 * télécharger Noto Sans Arabic sur les pages française et anglaise.
 */
export function fontVariablesFor(withArabic: boolean): string {
  return withArabic ? `${LATIN_VARIABLES} ${fontArabic.variable}` : LATIN_VARIABLES;
}

/** Variables latines seules — back-office, page de connexion, écrans d'erreur. */
export const fontVariables = LATIN_VARIABLES;
