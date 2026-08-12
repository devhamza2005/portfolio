import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Manifeste d'application — /manifest.webmanifest
 *
 * Ce qu'il apporte concrètement : une icône et un nom corrects lorsqu'un
 * visiteur ajoute le portfolio à son écran d'accueil, et une couleur de barre
 * système cohérente avec le thème.
 *
 * Aucune URL absolue n'y figure : `start_url` est relatif, donc le manifeste
 * reste valable quel que soit le domaine servi. C'est aussi ce qui permet de
 * ne rien avoir à changer ici au moment du déploiement.
 *
 * Les couleurs proviennent de `siteConfig.themeColor`, les mêmes que celles
 * déclarées dans le `viewport` du layout racine : une seule source de vérité.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.fallback.name} — Portfolio`,
    short_name: siteConfig.fallback.name,
    description: siteConfig.fallback.description,
    lang: siteConfig.lang,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: siteConfig.themeColor.dark,
    theme_color: siteConfig.themeColor.dark,
    categories: ["portfolio", "developer", "business"],
    icons: [
      // Générées par app/icon.tsx et app/apple-icon.tsx : aucun fichier
      // binaire à maintenir, et le monogramme reste la seule source du logo.
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
