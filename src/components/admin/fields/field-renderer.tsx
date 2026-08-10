"use client";

import type { FieldDef } from "@/resources/types";

import {
  ColorFieldInput,
  DateFieldInput,
  MarkdownFieldInput,
  NumberFieldInput,
  SelectFieldInput,
  SlugFieldInput,
  SwitchFieldInput,
  TextInputField,
  TextareaFieldInput,
} from "./basic-fields";
import { IconFieldInput } from "./icon-field";
import { ImageFieldInput } from "./image-field";
import { type RelationOption, RelationFieldInput } from "./relation-field";
import { type RepeaterRow, RepeaterFieldInput, SPAN_CLASSES } from "./repeater-field";
import { TagsFieldInput } from "./tags-field";

export type MediaPreview = { url: string; alt: string };

export type FieldRendererContext = {
  /** Options des champs relation, préparées côté serveur. */
  options: Record<string, RelationOption[]>;
  /** Aperçus des médias déjà rattachés, indexés par identifiant. */
  previews: Record<string, MediaPreview>;
  /** Enregistre un nouvel aperçu après sélection dans la médiathèque. */
  registerPreview: (id: string, preview: MediaPreview) => void;
  disabled?: boolean;
};

/**
 * Dispatcher unique : traduit un descripteur de champ en composant concret.
 *
 * C'est le point de passage obligé de tous les formulaires du back-office.
 * Ajouter un type de champ ici le rend immédiatement disponible pour les
 * treize ressources — et pour toutes celles ajoutées plus tard.
 */
export function FieldRenderer({
  field,
  path,
  value,
  onChange,
  error,
  values,
  context,
}: {
  field: FieldDef;
  /** Chemin complet, utilisé comme identifiant et clé d'erreur. */
  path: string;
  value: unknown;
  onChange: (next: unknown) => void;
  error?: string;
  /** Valeurs voisines — nécessaires aux champs `slug` et aux conditions `showIf`. */
  values: Record<string, unknown>;
  context: FieldRendererContext;
}) {
  const id = `field-${path.replace(/\./g, "-")}`;
  const disabled = context.disabled;

  const common = {
    id,
    label: field.label,
    hint: field.hint,
    error,
    required: field.required,
    placeholder: field.placeholder,
    disabled,
  };

  const asText = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return (
        <TextInputField
          {...common}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={asText}
          onChange={onChange}
        />
      );

    case "color":
      return <ColorFieldInput {...common} value={asText} onChange={onChange} />;

    case "textarea":
      return (
        <TextareaFieldInput
          {...common}
          rows={field.rows}
          max={field.max}
          value={asText}
          onChange={onChange}
        />
      );

    case "markdown":
      return (
        <MarkdownFieldInput {...common} rows={field.rows} value={asText} onChange={onChange} />
      );

    case "slug": {
      const source = values[field.from];
      return (
        <SlugFieldInput
          {...common}
          value={asText}
          sourceValue={typeof source === "string" ? source : ""}
          onChange={onChange}
        />
      );
    }

    case "number":
      return (
        <NumberFieldInput
          {...common}
          min={field.min}
          max={field.max}
          step={field.step}
          value={asText}
          onChange={onChange}
        />
      );

    case "date":
      return <DateFieldInput {...common} value={asText} onChange={onChange} />;

    case "switch":
      return <SwitchFieldInput {...common} value={value === true} onChange={onChange} />;

    case "select":
      return (
        <SelectFieldInput {...common} value={asText} onChange={onChange} options={[...field.options]} />
      );

    case "tags":
      return (
        <TagsFieldInput
          {...common}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );

    case "icon":
      return <IconFieldInput {...common} value={asText} onChange={onChange} />;

    case "image":
      return (
        <ImageFieldInput
          {...common}
          folder={field.folder}
          value={asText}
          preview={asText ? (context.previews[asText] ?? null) : null}
          onChange={(media) => {
            if (media) {
              context.registerPreview(media.id, { url: media.url, alt: media.alt });
              onChange(media.id);
            } else {
              onChange("");
            }
          }}
        />
      );

    case "gallery":
      // La galerie est modélisée comme un `repeater` d'images dans les
      // descripteurs : chaque entrée porte aussi son type et sa légende.
      return null;

    case "relation":
      return (
        <RelationFieldInput
          {...common}
          multiple={field.multiple}
          options={context.options[field.to] ?? []}
          value={
            field.multiple
              ? Array.isArray(value)
                ? (value as string[])
                : []
              : asText
          }
          onChange={onChange}
        />
      );

    case "repeater":
      return (
        <RepeaterFieldInput
          name={path}
          label={field.label}
          hint={field.hint}
          error={error}
          itemLabel={field.itemLabel}
          max={field.max}
          fields={field.fields}
          disabled={disabled}
          value={Array.isArray(value) ? (value as RepeaterRow[]) : []}
          onChange={onChange}
          renderField={(childField, childPath, childValue, setChildValue, rowValues) => (
            <FieldRenderer
              field={childField}
              path={childPath}
              value={childValue}
              onChange={setChildValue}
              values={rowValues}
              context={context}
            />
          )}
        />
      );

    default:
      return null;
  }
}

export { SPAN_CLASSES };
export type { RelationOption, RepeaterRow };
