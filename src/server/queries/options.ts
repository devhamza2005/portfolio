import "server-only";

import { db } from "@/server/db";
import type { FieldDef, ResourceDef } from "@/resources/types";

export type RelationOption = { value: string; label: string; description?: string };

/**
 * Chargement des options des champs `relation`.
 *
 * Les options sont préparées côté serveur puis passées au formulaire : le
 * back-office affiche donc des listes déjà complètes au premier rendu, sans
 * requête supplémentaire au montage de chaque champ.
 *
 * La clé d'un champ relation suit le format `<source>` ou `<source>:<filtre>` :
 *   • "technology"        → toutes les technologies
 *   • "category:TECH"     → catégories de technologies et compétences
 *   • "category:PROJECT"  → catégories de projets
 */

/** Parcourt les champs, y compris ceux imbriqués dans les repeaters. */
function collectRelationKeys(fields: FieldDef[], found = new Set<string>()): Set<string> {
  for (const field of fields) {
    if (field.type === "relation") found.add(field.to);
    if (field.type === "repeater") collectRelationKeys(field.fields, found);
  }
  return found;
}

async function loadOptions(key: string): Promise<RelationOption[]> {
  const [source, filter] = key.split(":");

  switch (source) {
    case "technology": {
      const rows = await db.technology.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, category: { select: { name: true } } },
      });
      return rows.map((row) => ({
        value: row.id,
        label: row.name,
        ...(row.category ? { description: row.category.name } : {}),
      }));
    }

    case "category": {
      const rows = await db.category.findMany({
        where: filter === "TECH" || filter === "PROJECT" ? { kind: filter } : undefined,
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, kind: true },
      });
      return rows.map((row) => ({ value: row.id, label: row.name }));
    }

    default:
      // Clé inconnue : liste vide plutôt qu'une erreur — le formulaire reste
      // utilisable, seul ce champ apparaît sans option.
      console.warn(`[queries/options] source de relation inconnue : « ${key} »`);
      return [];
  }
}

/** Toutes les options nécessaires au formulaire d'une ressource. */
export async function getResourceOptions(
  resource: ResourceDef,
): Promise<Record<string, RelationOption[]>> {
  const keys = Array.from(collectRelationKeys(resource.fields));

  const entries = await Promise.all(
    keys.map(async (key) => [key, await loadOptions(key)] as const),
  );

  return Object.fromEntries(entries);
}
