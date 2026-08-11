"use client";

import { FileUp, Pencil, X } from "lucide-react";
import { useState } from "react";

import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FieldShell } from "./field-shell";

/**
 * Champ fichier — même médiathèque que le champ image, valeur différente.
 *
 * Certaines colonnes portent une ADRESSE et non une relation : `Profile.cvUrl`
 * est un `String`, pas un `mediaId`. Ce champ réutilise donc intégralement le
 * `MediaPicker` — donc le téléversement authentifié, la vérification des
 * octets réels, la limite de taille et le refus du SVG — mais conserve l'URL
 * du média au lieu de son identifiant.
 *
 * Aucun second système de téléversement n'est introduit : c'est le même
 * `/api/upload` et la même médiathèque.
 */
export function FileFieldInput({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  folder = "general",
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** URL du fichier sélectionné. */
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState<string | null>(null);

  const nomFichier = value ? (value.split("/").pop() ?? value) : "";

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      {value ? (
        <div className="border-border bg-surface flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
          <span className="bg-elevated text-subtle grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)]">
            <FileUp className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{alt || nomFichier}</p>
            <a
              href={value}
              target="_blank"
              rel="noreferrer noopener"
              className="text-subtle hover:text-brand truncate font-mono text-xs transition-colors"
            >
              {value}
              <span className="sr-only"> (nouvelle fenêtre)</span>
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => setOpen(true)}
              aria-label="Remplacer le fichier"
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => {
                setAlt(null);
                onChange("");
              }}
              aria-label="Retirer le fichier"
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
          <FileUp className="size-4" />
          Choisir un fichier
        </button>
      )}

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        folder={folder}
        title="Choisir un fichier"
        onSelect={(media: PickedMedia) => {
          setAlt(media.alt || null);
          onChange(media.url);
        }}
      />
    </FieldShell>
  );
}
