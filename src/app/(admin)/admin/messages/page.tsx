import type { Metadata } from "next";

import { MessageList } from "@/components/admin/message-list";
import { PageHeader } from "@/components/admin/page-header";
import { getMessages } from "@/server/queries/messages";

/**
 * Messages de contact — boîte de réception.
 *
 * Segment statique, prioritaire sur `/admin/[resource]`. La lecture n'est pas
 * mise en cache : un message arrivé il y a dix secondes doit apparaître au
 * rechargement, et la garde d'authentification du layout `/admin` s'applique
 * de toute façon à chaque requête.
 */
export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  const nonLus = messages.filter((message) => !message.isRead && !message.isArchived).length;

  return (
    <>
      <PageHeader
        title="Messages"
        description={
          messages.length === 0
            ? "Les messages envoyés depuis le formulaire de contact arrivent ici."
            : `${messages.length} message${messages.length > 1 ? "s" : ""} reçu${
                messages.length > 1 ? "s" : ""
              }${nonLus > 0 ? ` · ${nonLus} non lu${nonLus > 1 ? "s" : ""}` : ""}.`
        }
      />

      <MessageList messages={messages} />
    </>
  );
}
