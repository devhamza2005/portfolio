import "server-only";

import { db } from "@/server/db";
import type { FieldDef, PrismaModelKey, ResourceDef } from "@/resources/types";

/**
 * Passerelle entre la base et les formulaires du back-office.
 *
 * Un enregistrement Prisma et un formulaire HTML ne représentent pas les
 * données de la même façon :
 *   • une `Date`  → une chaîne « AAAA-MM-JJ » pour `<input type="date">`
 *   • un `null`   → une chaîne vide, sinon React affiche « null »
 *   • une liaison N-N → une liste d'identifiants
 * Ces conversions sont centralisées ici, dans les deux sens.
 */

type AnyDelegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
};

function delegate(model: PrismaModelKey): AnyDelegate {
  const client = db as unknown as Record<string, AnyDelegate>;
  const found = client[model];
  if (!found) throw new Error(`Modèle Prisma inconnu : ${model}`);
  return found;
}

/** Construit la clause `include` : relations de liste + collections enfants. */
function buildInclude(resource: ResourceDef, withNested: boolean) {
  const include: Record<string, unknown> = { ...(resource.listInclude ?? {}) };

  if (withNested) {
    for (const relation of resource.nested ?? []) {
      include[relation.field] = relation.include
        ? { include: relation.include, orderBy: { order: "asc" } }
        : { orderBy: { order: "asc" } };
    }
  }

  return Object.keys(include).length ? include : undefined;
}

// ───────────────────────────────────────────────────────────────────────────
//  LECTURE — liste
// ───────────────────────────────────────────────────────────────────────────

export async function listResourceRows(resource: ResourceDef) {
  const orderBy = resource.defaultSort
    ? { [resource.defaultSort.field]: resource.defaultSort.direction }
    : { createdAt: "desc" as const };

  const rows = await delegate(resource.model).findMany({
    include: buildInclude(resource, false),
    orderBy,
  });

  // Les objets Prisma ne traversent pas la frontière serveur → client tels
  // quels (Date, Decimal…). On ne conserve que ce dont le tableau a besoin.
  return rows.map((row) => {
    const plain: Record<string, unknown> = { id: String(row["id"]) };

    for (const column of resource.columns) {
      plain[column.key] = toPlainValue(row[column.key]);
    }

    // Champs nécessaires à la recherche, même s'ils ne sont pas affichés.
    for (const key of resource.searchable ?? []) {
      if (!(key in plain)) plain[key] = toPlainValue(row[key]);
    }

    return plain as Record<string, unknown> & { id: string };
  });
}

function toPlainValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toPlainValue);

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    // Relations affichées en badge ou en vignette : seuls ces champs servent.
    const kept: Record<string, unknown> = {};
    for (const key of ["id", "name", "title", "label", "url", "alt"]) {
      if (key in record) kept[key] = toPlainValue(record[key]);
    }
    return Object.keys(kept).length ? kept : null;
  }

  return value ?? null;
}

// ───────────────────────────────────────────────────────────────────────────
//  LECTURE — enregistrement unique (formulaire d'édition)
// ───────────────────────────────────────────────────────────────────────────

export type MediaPreview = { url: string; alt: string };

export async function getResourceRecord(resource: ResourceDef, id: string) {
  const record = await delegate(resource.model).findUnique({
    where: { id },
    include: buildInclude(resource, true),
  });

  if (!record) return null;

  const previews: Record<string, MediaPreview> = {};
  const values = recordToFormValues(resource, record, previews);

  return { values, previews };
}

function recordToFormValues(
  resource: ResourceDef,
  record: Record<string, unknown>,
  previews: Record<string, MediaPreview>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  const nestedByField = new Map((resource.nested ?? []).map((item) => [item.field, item]));

  for (const field of resource.fields) {
    const nested = nestedByField.get(field.name);

    if (nested) {
      const rows = Array.isArray(record[field.name])
        ? (record[field.name] as Record<string, unknown>[])
        : [];

      if (nested.linkKey) {
        // Liaison N-N → simple liste d'identifiants.
        values[field.name] = rows
          .map((row) => row[nested.linkKey as string])
          .filter((item): item is string => typeof item === "string");
      } else if (field.type === "repeater") {
        values[field.name] = rows.map((row) => {
          const item: Record<string, unknown> = {};
          for (const child of field.fields) {
            item[child.name] = scalarToFormValue(child, row[child.name]);
            collectPreview(child, row, previews);
          }
          return item;
        });
      }
      continue;
    }

    values[field.name] = scalarToFormValue(field, record[field.name]);
    collectPreview(field, record, previews);
  }

  return values;
}

/** Mémorise l'aperçu d'un média déjà rattaché, pour l'afficher sans requête. */
function collectPreview(
  field: FieldDef,
  source: Record<string, unknown>,
  previews: Record<string, MediaPreview>,
) {
  if (field.type !== "image") return;

  const mediaId = source[field.name];
  if (typeof mediaId !== "string" || !mediaId) return;

  // La relation porte le nom du champ sans son suffixe « Id » :
  // coverId → cover, logoId → logo, mediaId → media.
  const relationName = field.name.replace(/Id$/, "");
  const relation = source[relationName];

  if (relation && typeof relation === "object" && "url" in relation) {
    const media = relation as { url?: unknown; alt?: unknown };
    if (typeof media.url === "string") {
      previews[mediaId] = {
        url: media.url,
        alt: typeof media.alt === "string" ? media.alt : "",
      };
    }
  }
}

function scalarToFormValue(field: FieldDef, value: unknown): unknown {
  switch (field.type) {
    case "switch":
      return value === true;

    case "date":
      // `<input type="date">` n'accepte que le format AAAA-MM-JJ.
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (typeof value === "string" && value) return value.slice(0, 10);
      return "";

    case "tags":
      return Array.isArray(value) ? value : [];

    case "relation":
      if (field.multiple) return Array.isArray(value) ? value : [];
      return typeof value === "string" ? value : "";

    case "number":
      return value == null ? "" : String(value);

    default:
      return value == null ? "" : String(value);
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  VALEURS INITIALES  (formulaire de création)
// ───────────────────────────────────────────────────────────────────────────

export function emptyFormValues(resource: ResourceDef): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of resource.fields) {
    switch (field.type) {
      case "switch":
        // `published` et `visible` sont activés par défaut : un contenu créé
        // doit apparaître sur le site sans manipulation supplémentaire.
        values[field.name] = field.name === "published" || field.name === "visible";
        break;
      case "tags":
      case "repeater":
        values[field.name] = [];
        break;
      case "relation":
        values[field.name] = field.multiple ? [] : "";
        break;
      case "select":
        values[field.name] = field.options[0]?.value ?? "";
        break;
      default:
        values[field.name] = "";
    }
  }

  return values;
}

/** Descripteur allégé transmis au composant client (sans fonctions). */
export function toSerializableResource(resource: ResourceDef) {
  return {
    key: resource.key,
    label: resource.label,
    fields: resource.fields,
  };
}
