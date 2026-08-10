"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { FieldShell, a11yProps } from "./field-shell";

/**
 * Liste de chaînes libres (points détaillés d'un service, mots-clés…).
 *
 * Entrée valide la saisie ; Retour arrière sur un champ vide supprime la
 * dernière entrée — comportement attendu de ce type de champ.
 */
export function TagsFieldInput({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  placeholder = "Saisir puis appuyer sur Entrée",
  max = 40,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const isFull = value.length >= max;

  function commit() {
    const entry = draft.trim();
    if (!entry || isFull) return;
    if (value.includes(entry)) {
      setDraft("");
      return;
    }
    onChange([...value, entry]);
    setDraft("");
  }

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAddon={
        <span className="text-subtle font-mono text-[0.6875rem] tabular-nums">
          {value.length}/{max}
        </span>
      }
    >
      <div
        className={cn(
          "border-border bg-surface rounded-[var(--radius-md)] border p-2",
          "focus-within:border-brand focus-within:ring-brand/25 focus-within:ring-2",
          error && "border-danger",
        )}
      >
        {value.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {value.map((entry, index) => (
              <li key={`${entry}-${index}`}>
                <Badge variant="brand" size="md" className="pr-1">
                  {entry}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(value.filter((_, position) => position !== index))}
                    aria-label={`Retirer « ${entry} »`}
                    className="hover:bg-brand/20 ml-0.5 rounded-full p-0.5 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center gap-2">
          <input
            {...a11yProps(id, hint, error)}
            value={draft}
            disabled={disabled || isFull}
            placeholder={isFull ? `Maximum de ${max} entrées atteint` : placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // Sans cela, Entrée soumettrait le formulaire entier.
                event.preventDefault();
                commit();
              }
              if (event.key === "Backspace" && draft === "" && value.length > 0) {
                onChange(value.slice(0, -1));
              }
            }}
            onBlur={commit}
            className="text-foreground placeholder:text-subtle min-w-0 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={commit}
            disabled={disabled || isFull || draft.trim() === ""}
            aria-label="Ajouter"
            className="text-subtle hover:text-brand rounded-[var(--radius-sm)] p-1 transition-colors disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </FieldShell>
  );
}
