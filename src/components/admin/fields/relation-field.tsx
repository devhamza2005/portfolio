"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FieldShell } from "./field-shell";
import { SelectFieldInput } from "./basic-fields";

export type RelationOption = { value: string; label: string; description?: string };

/**
 * Champ relation.
 *
 * • Simple   → réutilise le `<Select>` du design system.
 * • Multiple → liste filtrable à cocher, avec les sélections en badges.
 *
 * Le composant ne charge rien lui-même : les options sont préparées côté
 * serveur et transmises en props. Cela évite une requête par champ et garantit
 * que le formulaire s'affiche déjà complet au premier rendu.
 */
export function RelationFieldInput({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  options,
  multiple = false,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Chaîne si simple, tableau si multiple. */
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: RelationOption[];
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  if (!multiple) {
    return (
      <SelectFieldInput
        id={id}
        label={label}
        hint={hint}
        error={error}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        options={options}
      />
    );
  }

  return (
    <MultiRelation
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      value={Array.isArray(value) ? value : []}
      onChange={onChange}
      options={options}
    />
  );
}

function MultiRelation({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  options: RelationOption[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const byValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, query]);

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
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
          {value.length} sélectionnée{value.length > 1 ? "s" : ""}
        </span>
      }
    >
      {/* Sélections courantes */}
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <li key={item}>
              <Badge variant="brand" size="md" className="pr-1">
                {byValue.get(item)?.label ?? item}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(item)}
                  aria-label={`Retirer ${byValue.get(item)?.label ?? item}`}
                  className="hover:bg-brand/20 ml-0.5 rounded-full p-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Déclencheur */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        // `aria-invalid` n'est pas pris en charge par le rôle `button` :
        // l'erreur est annoncée par le message `role="alert"` du FieldShell.
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "border-border bg-surface text-muted hover:border-border-strong",
          "flex h-11 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3.5 text-sm",
          "transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-danger",
        )}
      >
        {value.length ? `Modifier la sélection` : "Sélectionner…"}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {/* Liste */}
      {open ? (
        <div
          id={`${id}-list`}
          ref={listRef}
          className="border-border bg-surface rounded-[var(--radius-md)] border p-2 shadow-[var(--shadow-md)]"
        >
          <div className="relative mb-2">
            <Search className="text-subtle pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrer…"
              aria-label={`Filtrer ${label}`}
              className="h-9 pl-8 text-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-subtle px-2 py-6 text-center text-sm">
              Aucun résultat pour « {query} ».
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto" role="listbox" aria-multiselectable>
              {filtered.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => toggle(option.value)}
                      className={cn(
                        "hover:bg-elevated flex w-full items-center gap-2.5 rounded-[var(--radius-sm)]",
                        "px-2.5 py-2 text-left text-sm transition-colors",
                        selected && "text-brand font-medium",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
                          selected ? "border-brand bg-brand" : "border-border-strong",
                        )}
                        aria-hidden
                      >
                        {selected ? <Check className="size-3 text-white" /> : null}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </FieldShell>
  );
}
