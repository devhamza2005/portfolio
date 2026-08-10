"use client";

import { Wand2 } from "lucide-react";

import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

import { FieldShell, a11yProps } from "./field-shell";

type Common = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

// ───────────────────────────────────────────────────────────────────────────

export function TextInputField({
  value,
  onChange,
  type = "text",
  ...common
}: Common & { value: string; onChange: (value: string) => void; type?: "text" | "email" | "url" }) {
  return (
    <FieldShell {...common}>
      <Input
        {...a11yProps(common.id, common.hint, common.error)}
        type={type}
        value={value}
        placeholder={common.placeholder}
        disabled={common.disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function TextareaFieldInput({
  value,
  onChange,
  rows = 3,
  max,
  ...common
}: Common & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  max?: number;
}) {
  const remaining = max ? max - value.length : null;

  return (
    <FieldShell
      {...common}
      labelAddon={
        remaining !== null ? (
          <span
            className={cn(
              "font-mono text-[0.6875rem] tabular-nums",
              remaining < 0 ? "text-danger" : "text-subtle",
            )}
          >
            {value.length}/{max}
          </span>
        ) : null
      }
    >
      <Textarea
        {...a11yProps(common.id, common.hint, common.error)}
        rows={rows}
        value={value}
        placeholder={common.placeholder}
        disabled={common.disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

/**
 * Champ Markdown — même contrôle qu'un textarea, avec un rappel de la syntaxe
 * acceptée. Volontairement sans éditeur riche : le contenu reste du texte
 * portable, réutilisable ailleurs (flux RSS, export, version anglaise).
 */
export function MarkdownFieldInput({
  value,
  onChange,
  rows = 5,
  ...common
}: Common & { value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <FieldShell
      {...common}
      labelAddon={
        <span className="text-subtle font-mono text-[0.6875rem]">
          **gras** · retour ligne = paragraphe
        </span>
      }
    >
      <Textarea
        {...a11yProps(common.id, common.hint, common.error)}
        rows={rows}
        value={value}
        placeholder={common.placeholder}
        disabled={common.disabled}
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-[0.8125rem] leading-relaxed"
      />
    </FieldShell>
  );
}

/**
 * Champ slug — se génère depuis un autre champ tant que l'utilisateur ne l'a
 * pas modifié manuellement, et reste ensuite figé pour ne pas casser une URL
 * déjà partagée.
 */
export function SlugFieldInput({
  value,
  onChange,
  sourceValue,
  ...common
}: Common & { value: string; onChange: (value: string) => void; sourceValue: string }) {
  const suggestion = slugify(sourceValue);
  const canSuggest = Boolean(suggestion) && suggestion !== value;

  return (
    <FieldShell
      {...common}
      labelAddon={
        canSuggest ? (
          <button
            type="button"
            onClick={() => onChange(suggestion)}
            className="text-brand hover:text-brand-hover flex items-center gap-1 text-[0.6875rem] font-medium transition-colors"
          >
            <Wand2 className="size-3" />
            Générer
          </button>
        ) : null
      }
    >
      <Input
        {...a11yProps(common.id, common.hint, common.error)}
        value={value}
        placeholder={suggestion || common.placeholder}
        disabled={common.disabled}
        onChange={(event) => onChange(slugify(event.target.value, { keepTrailingDash: true }))}
        className="font-mono text-[0.8125rem]"
      />
    </FieldShell>
  );
}

export function NumberFieldInput({
  value,
  onChange,
  min,
  max,
  step,
  ...common
}: Common & {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <FieldShell {...common}>
      <Input
        {...a11yProps(common.id, common.hint, common.error)}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={common.placeholder}
        disabled={common.disabled}
        onChange={(event) => onChange(event.target.value)}
        className="tabular-nums"
      />
    </FieldShell>
  );
}

export function DateFieldInput({
  value,
  onChange,
  ...common
}: Common & { value: string; onChange: (value: string) => void }) {
  return (
    <FieldShell {...common}>
      <Input
        {...a11yProps(common.id, common.hint, common.error)}
        type="date"
        value={value}
        disabled={common.disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function SwitchFieldInput({
  value,
  onChange,
  ...common
}: Common & { value: boolean; onChange: (value: boolean) => void }) {
  const hintId = common.hint ? `${common.id}-hint` : undefined;

  return (
    <div className="border-border bg-surface flex items-start justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3">
      <div className="min-w-0">
        <label htmlFor={common.id} className="cursor-pointer text-sm font-medium">
          {common.label}
        </label>
        {common.hint ? (
          <p id={hintId} className="text-subtle mt-0.5 text-xs">
            {common.hint}
          </p>
        ) : null}
        {common.error ? (
          <p role="alert" className="text-danger mt-1 text-xs font-medium">
            {common.error}
          </p>
        ) : null}
      </div>
      <Switch
        id={common.id}
        checked={value}
        disabled={common.disabled}
        aria-describedby={hintId}
        onCheckedChange={onChange}
      />
    </div>
  );
}

export function SelectFieldInput({
  value,
  onChange,
  options,
  allowEmpty = true,
  ...common
}: Common & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  allowEmpty?: boolean;
}) {
  // Radix Select interdit la valeur "" : on utilise un jeton interne pour
  // représenter « aucune sélection ».
  const NONE = "__none__";

  return (
    <FieldShell {...common}>
      <Select
        value={value === "" ? NONE : value}
        onValueChange={(next) => onChange(next === NONE ? "" : next)}
        disabled={common.disabled}
      >
        <SelectTrigger {...a11yProps(common.id, common.hint, common.error)}>
          <SelectValue placeholder={common.placeholder ?? "Sélectionner…"} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty && !common.required ? (
            <SelectItem value={NONE}>
              <span className="text-subtle">Aucun</span>
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex flex-col items-start">
                <span>{option.label}</span>
                {option.description ? (
                  <span className="text-subtle text-xs">{option.description}</span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function ColorFieldInput({
  value,
  onChange,
  ...common
}: Common & { value: string; onChange: (value: string) => void }) {
  const isValid = /^#[0-9a-f]{6}$/i.test(value);

  return (
    <FieldShell {...common}>
      <div className="flex items-center gap-2">
        <span
          className="border-border size-11 shrink-0 rounded-[var(--radius-md)] border"
          style={{ backgroundColor: isValid ? value : "transparent" }}
          aria-hidden
        />
        <Input
          {...a11yProps(common.id, common.hint, common.error)}
          value={value}
          placeholder="#6DB33F"
          disabled={common.disabled}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono text-[0.8125rem] uppercase"
        />
        <input
          type="color"
          aria-label={`${common.label} — sélecteur de couleur`}
          value={isValid ? value : "#5b8cff"}
          disabled={common.disabled}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="border-border size-11 shrink-0 cursor-pointer rounded-[var(--radius-md)] border bg-transparent p-1"
        />
      </div>
    </FieldShell>
  );
}
