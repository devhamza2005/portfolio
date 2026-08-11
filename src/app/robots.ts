import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Directives d'exploration — /robots.txt
 *
 * Le site public est ouvert à l'indexation ; tout ce qui touche à
 * l'administration en est exclu :
 *
 *   /admin  back-office complet
 *   /login  formulaire d'authentification
 *   /api    routes serveur (auth, upload) — jamais des pages
 *
 * `Disallow` n'est pas une mesure de sécurité : la vraie protection reste la
 * garde serveur de chaque route (§15). C'est une mesure de propreté SEO — ces
 * URLs n'ont rien à faire dans un index de recherche.
 *
 * L'URL du sitemap dérive de `NEXT_PUBLIC_SITE_URL`, jamais d'une valeur en
 * dur. En local, le fichier interdit tout : une préproduction indexée par
 * erreur ferait concurrence au vrai site.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/login", "/api/", "/design-system"];

  if (siteConfig.isLocal) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
