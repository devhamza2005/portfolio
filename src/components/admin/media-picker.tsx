"use client";

import { CloudUpload, ImageOff, Loader2, Search, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/skeleton";
import { ACCEPT_ATTRIBUTE, formatBytes, validateFileMeta } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { type MediaItem, listMediaAction } from "@/server/actions/media.actions";

export type PickedMedia = { id: string; url: string; alt: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: PickedMedia) => void;
  /** Dossier logique proposé par défaut au téléversement. */
  folder?: string;
};

/**
 * Sélecteur de médias : téléversement et bibliothèque dans une seule fenêtre.
 *
 * Le contrôle des fichiers est fait deux fois — ici pour un retour immédiat,
 * et surtout côté serveur dans /api/upload, qui inspecte les octets réels.
 * Le contrôle client n'est qu'un confort et n'a aucune valeur de sécurité.
 */
export function MediaPicker({ open, onOpenChange, onSelect, folder = "general" }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // L'état de chargement vient de la transition elle-même : aucun setState
  // synchrone dans l'effet, donc aucun rendu en cascade.
  const load = useCallback((term: string) => {
    startTransition(async () => {
      const result = await listMediaAction({ search: term, take: 60 });
      if (result.ok) {
        setItems(result.data.items);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    // La recherche est relancée par le bouton ou la touche Entrée, pas à chaque
    // frappe : cela déclencherait autant de requêtes que de caractères saisis.
    load(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, load]);

  const status = isLoading ? "loading" : failed ? "error" : "idle";

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;

    setUploading(true);
    let lastUploaded: PickedMedia | null = null;

    for (const file of list) {
      const invalid = validateFileMeta(file);
      if (invalid) {
        toast.error(`${file.name} — ${invalid.message}`);
        continue;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      // Repli utile pour l'accessibilité : le nom du fichier vaut mieux que rien.
      body.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));

      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const payload = (await response.json()) as {
          media?: MediaItem;
          error?: string;
        };

        if (!response.ok || !payload.media) {
          toast.error(`${file.name} — ${payload.error ?? "téléversement refusé"}`);
          continue;
        }

        lastUploaded = {
          id: payload.media.id,
          url: payload.media.url,
          alt: payload.media.alt,
        };
        setItems((current) => [payload.media as MediaItem, ...current]);
        toast.success(`${file.name} téléversé.`);
      } catch {
        toast.error(`${file.name} — le réseau a échoué.`);
      }
    }

    setUploading(false);

    // Un seul fichier téléversé : on le sélectionne directement, c'est
    // presque toujours l'intention.
    if (lastUploaded && list.length === 1) {
      onSelect(lastUploaded);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choisir une image</DialogTitle>
          <DialogDescription>
            Téléversez un nouveau fichier ou reprenez-en un de la médiathèque.
            JPEG, PNG, WebP, AVIF, GIF ou PDF — 5 Mo maximum pour une image.
          </DialogDescription>
        </DialogHeader>

        {/* Zone de dépôt */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void uploadFiles(event.dataTransfer.files);
          }}
          className={cn(
            "rounded-[var(--radius-lg)] border border-dashed p-6 text-center transition-colors",
            dragging ? "border-brand bg-brand-soft" : "border-border-strong",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {uploading ? (
            <div className="text-muted flex items-center justify-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Téléversement en cours…
            </div>
          ) : (
            <>
              <CloudUpload className="text-subtle mx-auto size-6" />
              <p className="mt-2 text-sm">
                Glissez un fichier ici, ou{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-brand font-medium hover:underline"
                >
                  parcourez vos fichiers
                </button>
              </p>
            </>
          )}
        </div>

        {/* Recherche */}
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            load(search);
          }}
        >
          <div className="relative flex-1">
            <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher dans la médiathèque…"
              className="pl-9"
              aria-label="Rechercher un média"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Rechercher
          </Button>
        </form>

        {/* Bibliothèque */}
        <div className="max-h-[22rem] overflow-y-auto">
          {status === "loading" ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full" />
              ))}
            </div>
          ) : status === "error" ? (
            <ErrorState
              icon={<TriangleAlert />}
              title="Chargement impossible"
              description="La médiathèque n'a pas pu être chargée."
              action={
                <Button size="sm" variant="secondary" onClick={() => load(search)}>
                  Réessayer
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ImageOff />}
              title="Médiathèque vide"
              description="Téléversez votre premier fichier avec la zone ci-dessus."
            />
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect({ id: item.id, url: item.url, alt: item.alt });
                      onOpenChange(false);
                    }}
                    className={cn(
                      "border-border hover:border-brand focus-visible:ring-ring group relative block w-full",
                      "overflow-hidden rounded-[var(--radius-md)] border transition-colors",
                      "focus-visible:ring-2 focus-visible:outline-none",
                    )}
                  >
                    <span className="bg-elevated block aspect-square">
                      {item.mime === "application/pdf" ? (
                        <span className="text-subtle flex h-full items-center justify-center font-mono text-xs">
                          PDF
                        </span>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.alt || ""}
                          width={200}
                          height={200}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <span className="text-subtle block truncate px-2 py-1.5 text-left text-[0.6875rem]">
                      {item.alt || item.folder}
                      {item.bytes ? ` · ${formatBytes(item.bytes)}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
