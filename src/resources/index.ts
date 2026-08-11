import {
  certificationResource,
  educationResource,
  experienceResource,
} from "./career.resource";
import { messageResource } from "./message.resource";
import { profileResource } from "./profile.resource";
import { projectResource } from "./project.resource";
import {
  achievementResource,
  categoryResource,
  languageResource,
  qualityResource,
  serviceResource,
  skillResource,
  socialLinkResource,
  statCardResource,
  technologyResource,
} from "./stack.resource";
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
 *   2. créer son schéma Zod dans src/schemas ;
 *   3. créer son descripteur dans ce dossier ;
 *   4. l'ajouter au tableau ci-dessous.
 * Aucun écran, aucun formulaire, aucune action, aucune route à écrire.
 *
 * L'ordre du tableau est celui de la navigation du back-office.
 */

const RESOURCES: ResourceDef[] = [
  projectResource,
  experienceResource,
  educationResource,
  certificationResource,
  achievementResource,
  skillResource,
  technologyResource,
  serviceResource,
  categoryResource,
  statCardResource,
  socialLinkResource,
  qualityResource,
  languageResource,

  /**
   * Ressources de service — enregistrées pour que `getResource` les trouve
   * (les actions génériques en dépendent), mais marquées `system` : elles ont
   * leur propre écran et n'apparaissent pas dans la navigation « Contenu ».
   */
  profileResource,
  messageResource,
];

/**
 * Ressources de contenu, dans l'ordre d'affichage de la navigation.
 *
 * Les ressources `system` en sont écartées : le profil et les messages ont
 * leur propre entrée dans la section « Réglages » et leur propre écran.
 */
export function listResources(): ResourceDef[] {
  return RESOURCES.filter((resource) => !resource.system);
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

/**
 * Vérifie qu'une ressource est servie par les routes CRUD génériques.
 *
 * Les ressources `system` (profil, messages) sont volontairement exclues :
 * elles disposent d'un écran dédié, et `/admin/profile/new` ou
 * `/admin/messages/<id>` n'auraient aucun sens.
 */
export function hasResource(key: string): boolean {
  return RESOURCES.some((item) => item.key === key && !item.system);
}

export type { ResourceDef, FieldDef, ColumnDef } from "./types";
