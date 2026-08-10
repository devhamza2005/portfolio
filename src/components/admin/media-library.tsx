"use client";

import { CloudUpload, FileText, ImageOff, Loader2, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/skeleton";
import { ACCEPT_ATTRIBUTE, formatBytes, validateFileMeta } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
  type MediaItem,
  deleteMediaAction,
  updateMediaAction,
} from "@/server/actions/media.actions";

/**
 * Médiathèque — téléversement, texte alternatif et suppression.
 *
 * Le texte alternatif est mis en avant plutôt que relégué : c'est lui qui rend
 * les images accessibles aux lecteurs d'écran et exploitables par les moteurs
 * de recherche (§18, §20).
 */
export function MediaLibrary({
  initialItems,
  folders,
}: {
  initialItems: MediaItem[];
  folders: string[];
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) => {
    const matchesFolder = folder === "all" || item.folder === folder;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term || item.alt.toLowerCase().includes(term) || item.url.toLowerCase().includes(term);
    return matchesFolder && matchesQuery;
  });

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);

    for (const file of list) {
      const invalid = validateFileMeta(file);
      if (invalid) {
        toast.error(`${file.name} — ${invalid.message}`);
        continue;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder === "all" ? "general" : folder);
      body.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));

      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const payload = (await response.json()) as { media?: MediaItem; error?: string };

        if (!response.ok || !payload.media) {
          toast.error(`${file.name} — ${payload.error ?? "téléversement refusé"}`);
          continue;
        }

        setItems((current) => [payload.media as MediaItem, ...current]);
        toast.success(`${file.name} téléversé.`);
      } catch {
        toast.error(`${file.name} — le réseau a échoué.`);
      }
    }

    setUploading(false);
  }

  function saveAlt(item: MediaItem, alt: string, caption: string) {
    startSaving(async () => {
      const result = await updateMediaAction(item.id, { alt, caption: caption || null });
      if (result.ok) {
        setItems((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, alt, caption } : entry)),
        );
        setSelected(null);
        toast.success("Média mis à jour.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;

    startDeleting(async () => {
      const result = await deleteMediaAction(target.id);
      if (result.ok) {
        setItems((current) => current.filter((entry) => entry.id !== target.id));
        setPendingDelete(null);
        setSelected(null);
        toast.success("Média supprimé.");
      } else {
        // Le message précise dans quels contenus le média est encore utilisé.
        toast.error(result.error, { duration: 6000 });
        setPendingDelete(null);
      }
    });
  }

  return (
    <div className="grid gap-5">
      {/* Téléversement */}
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
          "rounded-[var(--radius-lg)] border border-dashed px-6 py-8 text-center transition-colors",
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
          <p className="text-muted flex items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Téléversement en cours…
          </p>
        ) : (
          <>
            <CloudUpload className="text-subtle mx-auto size-7" />
            <p className="mt-3 text-sm">
              Glissez vos fichiers ici, ou{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-brand font-medium hover:underline"
              >
                parcourez vos fichiers
              </button>
            </p>
            <p className="text-subtle mt-1.5 text-xs">
              JPEG, PNG, WebP, AVIF, GIF (5 Mo max) · PDF (10 Mo max) — le SVG est refusé pour des
              raisons de sécurité.
            </p>
          </>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher un média"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FolderChip label="Tous" active={folder === "all"} onClick={() => setFolder("all")} />
          {folders.map((name) => (
            <FolderChip
              key={name}
              label={name}
              active={folder === name}
              onClick={() => setFolder(name)}
            />
          ))}
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ImageOff />}
          title={items.length === 0 ? "Médiathèque vide" : "Aucun résultat"}
          description={
            items.length === 0
              ? "Téléversez vos captures d'écran, logos et certificats."
              : "Aucun média ne correspond à ce filtre."
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="border-border hover:border-brand focus-visible:ring-ring group block w-full overflow-hidden rounded-[var(--radius-md)] border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="bg-elevated relative block aspect-square">
                  {item.mime === "application/pdf" ? (
                    <span className="text-subtle flex h-full flex-col items-center justify-center gap-1">
                      <FileText className="size-6" />
                      <span className="font-mono text-[0.625rem]">PDF</span>
                    </span>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt || ""}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover"
                    />
                  )}
                  {!item.alt ? (
                    <Badge variant="warning" size="sm" className="absolute top-1.5 left-1.5">
                      Sans alt
                    </Badge>
                  ) : null}
                </span>

                <span className="block px-2.5 py-2">
                  <span className="block truncate text-xs font-medium">
                    {item.alt || "Sans texte alternatif"}
                  </span>
                  <span className="text-subtle block truncate text-[0.6875rem]">
                    {item.folder}
                    {item.bytes ? ` · ${formatBytes(item.bytes)}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-subtle text-xs">
        {filtered.length} média{filtered.length > 1 ? "s" : ""}
        {filtered.length !== items.length ? ` sur ${items.length}` : ""}
      </p>

      {/* Panneau de détail */}
      {selected ? (
        <MediaDetails
          item={selected}
          saving={isSaving}
          onClose={() => setSelected(null)}
          onSave={saveAlt}
          onDelete={() => setPendingDelete(selected)}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Supprimer ce média ?"
        description="Le fichier sera retiré de la médiathèque et du stockage. Un média encore utilisé dans un contenu ne peut pas être supprimé."
        confirmLabel="Supprimer"
        destructive
        pending={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────

function FolderChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-border text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function MediaDetails({
  item,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  item: MediaItem;
  saving: boolean;
  onClose: () => void;
  onSave: (item: MediaItem, alt: string, caption: string) => void;
  onDelete: () => void;
}) {
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption ?? "");

  return (
    <div className="border-border bg-surface rounded-[var(--radius-lg)] border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-display text-base font-semibold">Détails du média</h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fermer le panneau">
          <X />
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
        <div className="bg-elevated relative aspect-square overflow-hidden rounded-[var(--radius-md)]">
          {item.mime === "application/pdf" ? (
            <span className="text-subtle flex h-full items-center justify-center font-mono text-sm">
              PDF
            </span>
          ) : (
            <Image
              src={item.url}
              alt={item.alt || ""}
              fill
              unoptimized
              sizes="192px"
              className="object-contain"
            />
          )}
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="media-alt">Texte alternatif</Label>
            <Input
              id="media-alt"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Décrivez l'image en quelques mots"
            />
            <p className="text-subtle text-xs">
              Lu par les lecteurs d&apos;écran et indexé par les moteurs de recherche.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="media-caption">Légende</Label>
            <Input
              id="media-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Facultatif"
            />
          </div>

          <dl className="text-subtle grid grid-cols-2 gap-2 font-mono text-[0.6875rem]">
            <div>
              <dt className="inline">Dossier : </dt>
              <dd className="inline">{item.folder}</dd>
            </div>
            <div>
              <dt className="inline">Taille : </dt>
              <dd className="inline">{item.bytes ? formatBytes(item.bytes) : "—"}</dd>
            </div>
            <div>
              <dt className="inline">Dimensions : </dt>
              <dd className="inline">
                {item.width && item.height ? `${item.width}×${item.height}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="inline">Type : </dt>
              <dd className="inline">{item.mime ?? "—"}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => onSave(item, alt.trim(), caption.trim())}
            >
              {saving ? <Loader2 className="animate-spin" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="hover:text-danger">
              <Trash2 />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
