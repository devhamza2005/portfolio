/**
 * Ancres de navigation du site public.
 *
 * Ce fichier décrit la STRUCTURE des sections, jamais leur libellé : les textes
 * vivent dans les dictionnaires (`messages/*.json`, clé `nav.items`) et les
 * données affichées viennent toutes de la base.
 *
 * Ajouter une section future revient à ajouter une ligne ici, puis la clé
 * correspondante dans les trois dictionnaires — TypeScript signale l'oubli.
 */

import { localizedPath, type Locale } from "@/lib/i18n/config";

/** Identifiants des entrées de navigation — doivent exister dans `nav.items`. */
export type NavId = "about" | "services" | "skills" | "experience" | "projects" | "contact";

export type NavItem = {
  id: NavId;
  /** Chemin NU, sans préfixe de langue. Localisé par `navHref()`. */
  path: string;
  /** Vraie page plutôt qu'une ancre de la page d'accueil. */
  isPage?: boolean;
};

/**
 * Les ancres sont ABSOLUES (`/#about`) et non relatives (`#about`) : la navbar
 * est partagée par toutes les pages du site. Depuis une étude de cas, un lien
 * `#about` ne mènerait nulle part — `/fr/#about` ramène à l'accueil puis défile.
 */
export const SECTION_NAV: NavItem[] = [
  { id: "about", path: "/#about" },
  { id: "services", path: "/#services" },
  { id: "skills", path: "/#skills" },
  { id: "experience", path: "/#experience" },
  { id: "projects", path: "/projects", isPage: true },
  { id: "contact", path: "/#contact" },
];

/**
 * Préfixe une entrée de navigation de sa langue.
 *
 * L'ancre doit rester en fin d'URL : `/fr/#about`, jamais `/#about/fr`. D'où la
 * séparation du fragment avant préfixage.
 */
export function navHref(locale: Locale, path: string): string {
  const [route = "/", hash] = path.split("#");
  const base = localizedPath(locale, route === "" ? "/" : route);
  return hash ? `${base}#${hash}` : base;
}

/** Toutes les ancres suivies par l'indicateur de section active. */
export const OBSERVED_SECTIONS = [
  "about",
  "services",
  "skills",
  "technologies",
  "lab",
  "architecture",
  "experience",
  "education",
  "projects",
  "certifications",
  "achievements",
  "contact",
] as const;
