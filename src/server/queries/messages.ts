import "server-only";

import { db } from "@/server/db";

/**
 * Lecture des messages de contact.
 *
 * Volontairement SANS `use cache` : le back-office doit montrer l'état réel de
 * la base à chaque affichage. Un message reçu il y a dix secondes doit
 * apparaître, et une bascule « lu » doit se voir immédiatement.
 *
 * `ipHash` et `userAgent` ne sont pas remontés : ils servent uniquement à la
 * limitation de débit et à la lutte anti-spam, pas à la lecture d'un message.
 */
export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  /** ISO — les objets `Date` ne traversent pas la frontière serveur → client. */
  createdAt: string;
  /**
   * Date déjà mise en forme côté serveur.
   *
   * Formater dans le composant client ferait diverger le rendu du serveur
   * (fuseau et locale du navigateur) et provoquerait une erreur d'hydratation.
   */
  createdAtLabel: string;
};

const DATE_TIME = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export async function getMessages(): Promise<AdminMessage[]> {
  const rows = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      isRead: true,
      isArchived: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    createdAtLabel: DATE_TIME.format(row.createdAt),
  }));
}
