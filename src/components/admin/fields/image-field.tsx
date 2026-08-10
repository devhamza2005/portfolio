"use client";

import { ImagePlus, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FieldShell } from "./field-shell";

/**
 * Champ image — stocke un identifiant de média, jamais un chemin de fichier.
 *
 * C'est ce qui permet de changer de fournisseur de stockage sans toucher au
 * contenu : l'URL réelle est résolue à l'affichage depuis la table Media (§16).
 */
export function ImageFieldInput({
  id,
  label,
  hint,
  error,
  required,
  value,
  preview,
  onChange,
  folder = "general",
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Identifiant du média sélectionné. */
  value: string;
  /** Aperçu connu (chargé côté serveur à l'édition). */
  preview?: { url: string; alt: string } | null;
  onChange: (media: PickedMedia | null) => void;
  folder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PickedMedia | null>(null);

  const shown = local ?? (value && preview ? { id: value, ...preview } : null);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      {shown ? (
        <div className="border-border bg-surface flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
          <span className="bg-elevated relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
            <Image
              src={shown.url}
              alt={shown.alt || ""}
              fill
              unoptimized
              sizes="64px"
              className="object-cover"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{shown.alt || "Sans texte alternatif"}</p>
            <p className="text-subtle truncate font-mono text-xs">{shown.url}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => setOpen(true)}
              aria-label="Remplacer l'image"
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => {
                setLocal(null);
                onChange(null);
              }}
              aria-label="Retirer l'image"
              className="hover:text-danger"
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setOpen(true)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(
            "border-border-strong text-muted hover:border-brand hover:text-foreground",
            "flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)]",
            "border border-dashed px-4 py-5 text-sm transition-colors",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-danger",
          )}
        >
          <ImagePlus className="size-4" />
          Choisir une image
        </button>
      )}

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        folder={folder}
        onSelect={(media) => {
          setLocal(media);
          onChange(media);
        }}
      />
    </FieldShell>
  );
}
