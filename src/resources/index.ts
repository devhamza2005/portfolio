import type { ResourceDef } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGISTRE DES RESSOURCES ADMINISTRABLES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Chaque entrée décrit une entité gérable depuis /admin. Les écrans de liste
 * et de formulaire sont générés à partir de ces descripteurs.
 *
 * Pour ajouter une nouvelle entité au back-office (blog, témoignages…) :
 *   1. ajouter le modèle dans prisma/schema.prisma puis migrer ;
 *   2. créer <entité>.resource.ts dans ce dossier ;
 *   3. l'ajouter au tableau ci-dessous.
 * Aucun composant, aucune action, aucune route à écrire.
 */

const RESOURCES: ResourceDef[] = [];

/** Toutes les ressources, dans l'ordre d'affichage de la navigation. */
export function listResources(): ResourceDef[] {
  return RESOURCES;
}

/** Récupère un descripteur par sa clé d'URL. */
export function getResource(key: string): ResourceDef {
  const resource = RESOURCES.find((item) => item.key === key);
  if (!resource) {
    throw new Error(
      `Ressource inconnue : « ${key} ». Vérifiez son enregistrement dans src/resources/index.ts.`,
    );
  }
  return resource;
}

/** Vérifie l'existence d'une ressource sans lever d'erreur (routes dynamiques). */
export function hasResource(key: string): boolean {
  return RESOURCES.some((item) => item.key === key);
}
