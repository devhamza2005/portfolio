import { z } from "zod";

import { defineResource } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MESSAGES DE CONTACT — ressource en lecture seule
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Un message reçu n'est ni créé ni modifié depuis le back-office : il arrive
 * du formulaire public, et son contenu doit rester exactement tel que son
 * auteur l'a écrit. Le seul écran est donc une boîte de réception, servie par
 * /admin/messages — d'où `system: true`, qui écarte cette ressource des routes
 * CRUD génériques et de la navigation « Contenu ».
 *
 * Le descripteur existe malgré tout pour une raison précise : les actions
 * génériques `toggleResourceFieldAction` et `deleteResourceAction` résolvent
 * leur modèle Prisma par `getResource(clé)`. L'enregistrer ici donne donc
 * « marquer comme lu », « archiver » et « supprimer » sans écrire une seule
 * action supplémentaire — avec la même garde d'authentification que le reste.
 *
 * `schema` n'est jamais employé : aucune écriture ne passe par le formulaire
 * générique. La validation qui compte est celle du formulaire public
 * (src/schemas/contact.schema.ts). Il est déclaré parce que le contrat de
 * `ResourceDef` l'exige.
 */
export const messageResource = defineResource({
  key: "messages",
  model: "contactMessage",
  label: { singular: "Message", plural: "Messages" },
  icon: "Inbox",
  description: "Les messages reçus depuis le formulaire de contact du site.",
  system: true,

  schema: z.object({}),
  fields: [],
  columns: [],

  defaultSort: { field: "createdAt", direction: "desc" },
  emptyState: {
    title: "Aucun message",
    description: "Les messages envoyés depuis le formulaire de contact apparaîtront ici.",
  },
});
