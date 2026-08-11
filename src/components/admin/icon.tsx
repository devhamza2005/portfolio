import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

import { BRAND_ICONS } from "@/components/brand/brand-icons";
import { cn } from "@/lib/utils";

/**
 * Rendu d'une icône à partir de son nom stocké en base (`iconKey`).
 *
 * Permet de choisir une icône depuis le back-office sans jamais toucher au
 * code : la valeur enregistrée est une simple chaîne (« Server », « Trophy »…).
 *
 * Ordre de résolution :
 *   1. icônes de marque (GitHub, LinkedIn, X) — absentes de Lucide v1 ;
 *   2. bibliothèque Lucide ;
 *   3. icône de repli — un nom inconnu ne doit jamais casser la page.
 */

const ICONS = Lucide as unknown as Record<string, React.ComponentType<LucideProps>>;

export function Icon({
  name,
  className,
  fallback = "Circle",
  ...props
}: { name?: string | null; fallback?: string } & LucideProps) {
  if (name && BRAND_ICONS[name]) {
    const Brand = BRAND_ICONS[name];
    return <Brand className={cn("size-4", className)} />;
  }

  const Component = (name && ICONS[name]) || ICONS[fallback] || Lucide.Circle;
  return <Component className={cn("size-4", className)} aria-hidden {...props} />;
}

/** Vérifie qu'un nom d'icône est utilisable — utilisé par le sélecteur. */
export function isValidIconName(name: string): boolean {
  if (BRAND_ICONS[name]) return true;
  const entry = ICONS[name];
  return typeof entry === "function" || typeof entry === "object";
}
