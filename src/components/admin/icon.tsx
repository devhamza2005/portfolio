import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Rendu d'une icône Lucide à partir de son nom stocké en base (`iconKey`).
 *
 * Permet de choisir une icône depuis le back-office sans jamais toucher au
 * code : la valeur enregistrée est une simple chaîne (« Server », « Trophy »…).
 * Un nom inconnu retombe silencieusement sur une icône neutre plutôt que de
 * faire planter la page.
 */

const ICONS = Lucide as unknown as Record<string, React.ComponentType<LucideProps>>;

export function Icon({
  name,
  className,
  fallback = "Circle",
  ...props
}: { name?: string | null; fallback?: string } & LucideProps) {
  const Component = (name && ICONS[name]) || ICONS[fallback] || Lucide.Circle;
  return <Component className={cn("size-4", className)} aria-hidden {...props} />;
}

/** Vérifie qu'un nom d'icône existe — utilisé par le sélecteur d'icônes. */
export function isValidIconName(name: string): boolean {
  return typeof ICONS[name] === "function" || typeof ICONS[name] === "object";
}
