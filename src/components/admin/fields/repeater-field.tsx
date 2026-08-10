"use client";

import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, FieldHint } from "@/components/ui/input";
import type { FieldDef } from "@/resources/types";
import { cn } from "@/lib/utils";

import type { RelationOption } from "./relation-field";

export type RepeaterRow = Record<string, unknown>;

/**
 * Sous-formulaire répétable — c'est lui qui permet d'ajouter une fonctionnalité,
 * un défi ou une métrique à un projet sans jamais toucher au code (§12).
 *
 * L'ordre affiché est l'ordre enregistré : le moteur CRUD réécrit la collection
 * enfant en numérotant les lignes selon leur position.
 */
export function RepeaterFieldInput({
  name,
  label,
  hint,
  error,
  itemLabel = "Élément",
  fields,
  value,
  onChange,
  max = 40,
  disabled,
  renderField,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  itemLabel?: string;
  fields: FieldDef[];
  value: RepeaterRow[];
  onChange: (rows: RepeaterRow[]) => void;
  max?: number;
  disabled?: boolean;
  /** Rendu délégué au FieldRenderer parent : évite toute duplication. */
  renderField: (
    field: FieldDef,
    path: string,
    rowValue: unknown,
    setRowValue: (next: unknown) => void,
    rowValues: RepeaterRow,
  ) => React.ReactNode;
}) {
  const groupId = useId();
  const isFull = value.length >= max;

  function emptyRow(): RepeaterRow {
    const row: RepeaterRow = {};
    for (const field of fields) {
      row[field.name] =
        field.type === "switch" ? false : field.type === "tags" ? [] : "";
    }
    return row;
  }

  function update(index: number, key: string, next: unknown) {
    onChange(value.map((row, position) => (position === index ? { ...row, [key]: next } : row)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <fieldset className="grid gap-3" aria-describedby={hint ? `${groupId}-hint` : undefined}>
      <div className="flex items-center justify-between gap-2">
        <legend className="text-foreground text-sm font-medium">{label}</legend>
        <span className="text-subtle font-mono text-[0.6875rem] tabular-nums">
          {value.length}/{max}
        </span>
      </div>

      {hint ? <FieldHint id={`${groupId}-hint`}>{hint}</FieldHint> : null}
      <FieldError>{error}</FieldError>

      {value.length === 0 ? (
        <p className="border-border text-subtle rounded-[var(--radius-md)] border border-dashed px-4 py-6 text-center text-sm">
          Aucun élément pour l&apos;instant.
        </p>
      ) : (
        <ul className="grid gap-3">
          {value.map((row, index) => (
            <li
              key={index}
              className="border-border bg-surface rounded-[var(--radius-md)] border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-subtle flex items-center gap-2 font-mono text-xs">
                  <GripVertical className="size-3.5" aria-hidden />
                  {itemLabel} {index + 1}
                </span>

                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Monter ${itemLabel} ${index + 1}`}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || index === value.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Descendre ${itemLabel} ${index + 1}`}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled}
                    onClick={() => onChange(value.filter((_, position) => position !== index))}
                    aria-label={`Supprimer ${itemLabel} ${index + 1}`}
                    className="hover:text-danger"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={cn("col-span-12", SPAN_CLASSES[field.span ?? 12])}
                  >
                    {renderField(
                      field,
                      `${name}.${index}.${field.name}`,
                      row[field.name],
                      (next) => update(index, field.name, next),
                      row,
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || isFull}
          onClick={() => onChange([...value, emptyRow()])}
        >
          <Plus />
          Ajouter {itemLabel.toLowerCase()}
        </Button>
        {isFull ? (
          <span className="text-subtle ml-3 text-xs">Maximum de {max} éléments atteint.</span>
        ) : null}
      </div>
    </fieldset>
  );
}

/**
 * Classes de largeur écrites en toutes lettres : Tailwind scanne le source,
 * une classe construite dynamiquement ne serait jamais générée.
 */
export const SPAN_CLASSES: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
};

export type { RelationOption };
