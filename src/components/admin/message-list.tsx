"use client";

import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Reply,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/skeleton";
import type { AdminMessage } from "@/server/queries/messages";
import {
  deleteResourceAction,
  toggleResourceFieldAction,
} from "@/server/actions/resource.actions";
import { cn } from "@/lib/utils";

/** Clé de ressource du descripteur `messageResource`. */
const RESOURCE = "messages";

type Filtre = "boite" | "non-lus" | "archives";

/**
 * Boîte de réception du back-office.
 *
 * Deux principes gouvernent cet écran :
 *
 *  1. LE CONTENU EST DU TEXTE. Le message vient d'un visiteur anonyme et
 *     n'est jamais interprété : il est rendu comme texte brut dans un bloc
 *     `whitespace-pre-wrap`. Aucun `dangerouslySetInnerHTML`, aucun Markdown.
 *     Un `<script>` envoyé par un robot s'affiche tel quel, inerte.
 *
 *  2. RIEN N'EST MODIFIABLE. Un message reçu ne s'édite pas — seuls son statut
 *     de lecture et son archivage changent. La suppression passe par une
 *     confirmation explicite, car elle est définitive.
 *
 * Le filtrage et la recherche se font en mémoire : les messages d'un portfolio
 * se comptent en dizaines, un aller-retour serveur par frappe serait absurde.
 */
export function MessageList({ messages: initial }: { messages: AdminMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [filtre, setFiltre] = useState<Filtre>("boite");
  const [recherche, setRecherche] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<AdminMessage | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const nonLus = messages.filter((m) => !m.isRead && !m.isArchived).length;
  const archives = messages.filter((m) => m.isArchived).length;

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return messages
      .filter((m) => {
        if (filtre === "archives") return m.isArchived;
        if (filtre === "non-lus") return !m.isRead && !m.isArchived;
        return !m.isArchived;
      })
      .filter((m) => {
        if (!terme) return true;
        return [m.name, m.email, m.subject ?? "", m.message]
          .join(" ")
          .toLowerCase()
          .includes(terme);
      });
  }, [messages, filtre, recherche]);

  /** Applique une bascule en base, puis reflète le résultat localement. */
  function basculer(message: AdminMessage, champ: "isRead" | "isArchived", valeur: boolean) {
    setEnCours(message.id);
    startTransition(async () => {
      const result = await toggleResourceFieldAction(RESOURCE, message.id, champ, valeur);
      setEnCours(null);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setMessages((liste) =>
        liste.map((m) => (m.id === message.id ? { ...m, [champ]: valeur } : m)),
      );
      toast.success(
        champ === "isRead"
          ? valeur
            ? "Marqué comme lu."
            : "Marqué comme non lu."
          : valeur
            ? "Message archivé."
            : "Message restauré.",
      );
    });
  }

  /** Ouvrir un message le marque lu — c'est le geste qui le rend « traité ». */
  function ouvrir(message: AdminMessage) {
    const suivant = ouvert === message.id ? null : message.id;
    setOuvert(suivant);
    if (suivant && !message.isRead) basculer(message, "isRead", true);
  }

  function supprimer() {
    const cible = aSupprimer;
    if (!cible) return;

    startDeleting(async () => {
      const result = await deleteResourceAction(RESOURCE, cible.id);
      if (result.ok) {
        setMessages((liste) => liste.filter((m) => m.id !== cible.id));
        setASupprimer(null);
        toast.success("Message supprimé.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const onglets: { cle: Filtre; label: string; compte: number }[] = [
    { cle: "boite", label: "Boîte de réception", compte: messages.filter((m) => !m.isArchived).length },
    { cle: "non-lus", label: "Non lus", compte: nonLus },
    { cle: "archives", label: "Archivés", compte: archives },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="group" aria-label="Filtrer les messages" className="flex flex-wrap gap-2">
          {onglets.map((onglet) => (
            <button
              key={onglet.cle}
              type="button"
              aria-pressed={filtre === onglet.cle}
              onClick={() => setFiltre(onglet.cle)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium",
                "transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                filtre === onglet.cle
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              {onglet.label}
              <span className="font-mono text-[0.6875rem] tabular-nums">{onglet.compte}</span>
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto sm:w-64">
          <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher dans les messages"
            className="pl-9"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={
            recherche
              ? "Aucun résultat"
              : filtre === "non-lus"
                ? "Aucun message non lu"
                : filtre === "archives"
                  ? "Aucun message archivé"
                  : "Aucun message"
          }
          description={
            recherche
              ? "Essayez un autre terme de recherche."
              : "Les messages envoyés depuis le formulaire de contact du site apparaîtront ici."
          }
        />
      ) : (
        <ul className="grid gap-2.5">
          {visibles.map((message) => {
            const estOuvert = ouvert === message.id;
            const occupe = enCours === message.id && isPending;

            return (
              <li key={message.id}>
                <Card
                  className={cn(
                    "overflow-hidden p-0 transition-colors",
                    !message.isRead && !message.isArchived && "border-brand/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => ouvrir(message)}
                    aria-expanded={estOuvert}
                    aria-controls={`message-${message.id}`}
                    className={cn(
                      "flex w-full items-start gap-3 p-4 text-left transition-colors",
                      "hover:bg-elevated focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:-outline-offset-2",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                        message.isRead ? "bg-elevated text-subtle" : "bg-brand-soft text-brand",
                      )}
                    >
                      {occupe ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : message.isRead ? (
                        <MailOpen className="size-4" />
                      ) : (
                        <Mail className="size-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={cn(
                            "truncate text-sm",
                            message.isRead ? "font-medium" : "font-semibold",
                          )}
                        >
                          {message.name}
                        </span>
                        {!message.isRead && !message.isArchived ? (
                          <Badge variant="brand" size="sm">
                            Nouveau
                          </Badge>
                        ) : null}
                        {message.isArchived ? (
                          <Badge variant="default" size="sm">
                            Archivé
                          </Badge>
                        ) : null}
                      </span>

                      <span className="text-muted mt-0.5 block truncate text-sm">
                        {message.subject || "(sans sujet)"}
                      </span>

                      <span className="text-subtle mt-1 block truncate font-mono text-[0.6875rem]">
                        {message.email} · {message.createdAtLabel}
                      </span>
                    </span>

                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "text-subtle mt-1 size-4 shrink-0 transition-transform",
                        estOuvert && "rotate-180",
                      )}
                    />
                  </button>

                  {estOuvert ? (
                    <div id={`message-${message.id}`} className="border-border border-t">
                      {/*
                        Le message est rendu comme TEXTE. React échappe le
                        contenu : du HTML ou du JavaScript envoyé par un robot
                        s'affiche littéralement et ne s'exécute jamais.
                      */}
                      <p className="text-muted px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap">
                        {message.message}
                      </p>

                      <div className="border-border bg-elevated/40 flex flex-wrap items-center gap-2 border-t px-4 py-3">
                        <Button asChild size="sm">
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                              `Re: ${message.subject || "votre message"}`,
                            )}`}
                          >
                            <Reply />
                            Répondre
                          </a>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={occupe}
                          onClick={() => basculer(message, "isRead", !message.isRead)}
                        >
                          {message.isRead ? <Mail /> : <MailOpen />}
                          {message.isRead ? "Marquer non lu" : "Marquer lu"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={occupe}
                          onClick={() => basculer(message, "isArchived", !message.isArchived)}
                        >
                          {message.isArchived ? <ArchiveRestore /> : <Archive />}
                          {message.isArchived ? "Restaurer" : "Archiver"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={occupe}
                          onClick={() => setASupprimer(message)}
                          className="hover:text-danger ml-auto"
                        >
                          <Trash2 />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {recherche ? (
        <p aria-live="polite" className="text-subtle mt-5 text-sm">
          {visibles.length} résultat{visibles.length > 1 ? "s" : ""}
          <button
            type="button"
            onClick={() => setRecherche("")}
            className="hover:text-foreground ml-2 inline-flex items-center gap-1 underline underline-offset-2"
          >
            <X className="size-3" />
            effacer
          </button>
        </p>
      ) : null}

      <ConfirmDialog
        open={aSupprimer !== null}
        onOpenChange={(open) => {
          if (!open) setASupprimer(null);
        }}
        title="Supprimer ce message ?"
        description={
          aSupprimer
            ? `Le message de ${aSupprimer.name} sera définitivement effacé. Archivez-le plutôt si vous souhaitez seulement le retirer de la boîte.`
            : undefined
        }
        confirmLabel="Supprimer définitivement"
        destructive
        pending={isDeleting}
        onConfirm={supprimer}
      />
    </>
  );
}
