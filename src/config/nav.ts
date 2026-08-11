/**
 * Ancres de navigation du site public.
 *
 * Ce fichier décrit la STRUCTURE des sections, pas leur contenu : les libellés
 * sont des repères de navigation, les données affichées viennent toutes de la
 * base. Ajouter une section future revient à ajouter une ligne ici.
 */

export type NavItem = { href: string; label: string; id: string };

export const SECTION_NAV: NavItem[] = [
  { id: "about", href: "#about", label: "À propos" },
  { id: "services", href: "#services", label: "Services" },
  { id: "skills", href: "#skills", label: "Compétences" },
  { id: "experience", href: "#experience", label: "Parcours" },
  { id: "projects", href: "#projects", label: "Projets" },
  { id: "contact", href: "#contact", label: "Contact" },
];

/** Toutes les ancres suivies par l'indicateur de section active. */
export const OBSERVED_SECTIONS = [
  "about",
  "services",
  "skills",
  "technologies",
  "experience",
  "education",
  "projects",
  "certifications",
  "achievements",
  "contact",
] as const;
