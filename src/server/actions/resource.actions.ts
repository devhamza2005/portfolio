"use server";

import { updateTag } from "next/cache";

import { db } from "@/server/db";
import { UnauthorizedError, requireAdminOrThrow } from "@/server/guards";
import { getResource } from "@/resources";
import type { NestedRelation, PrismaModelKey } from "@/resources/types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ACTIONS CRUD GÉNÉRIQUES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Une seule implémentation dessert toutes les ressources. Chaque action suit
 * systématiquement le même enchaînement (§15) :
 *
 *    requireAdminOrThrow()   ← authentification, avant toute autre chose
 *    schema.parse(input)     ← validation Zod : rien d'invalide n'atteint la base
 *    prisma.<model>.…        ← persistance
 *    updateTag(…)            ← le site public reflète le changement aussitôt
 *
 * Aucune de ces étapes ne peut être contournée en appelant l'action
 * directement : elles sont dans le corps de la fonction serveur, pas dans
 * l'interface.
 */

export type ActionResult<T = unknown> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Accès au delegate Prisma correspondant au modèle.
 *
 * C'est le seul endroit du projet où le typage est volontairement élargi :
 * le modèle est choisi dynamiquement à partir du descripteur de ressource.
 * La sécurité de type est rétablie juste avant par la validation Zod, qui
 * garantit la forme exacte des données transmises.
 */
type AnyDelegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findFirst: (args?: unknown) => Promise<Record<string, unknown> | null>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
  delete: (args: unknown) => Promise<Record<string, unknown>>;
  deleteMany: (args?: unknown) => Promise<{ count: number }>;
  createMany: (args: unknown) => Promise<{ count: number }>;
  count: (args?: unknown) => Promise<number>;
};

function delegate(model: PrismaModelKey): AnyDelegate {
  const client = db as unknown as Record<string, AnyDelegate>;
  const found = client[model];
  if (!found) throw new Error(`Modèle Prisma inconnu : ${model}`);
  return found;
}

/**
 * Invalide le cache du site public pour la ressource concernée.
 *
 * `updateTag` (Next 16) expire immédiatement le tag au lieu de servir une
 * version périmée : après un enregistrement dans le back-office, la page
 * publique affiche la nouvelle valeur dès le rechargement suivant.
 */
function revalidateResource(key: string) {
  updateTag(key);
  updateTag("portfolio");
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof UnauthorizedError) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  // Violation de contrainte d'unicité (slug déjà pris, email en double…)
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (code === "P2002") {
      return { ok: false, error: "Cette valeur existe déjà (identifiant ou slug en double)." };
    }
    if (code === "P2025") {
      return { ok: false, error: "Élément introuvable — il a peut-être déjà été supprimé." };
    }
    if (code === "P2003") {
      return {
        ok: false,
        error: "Impossible de supprimer : cet élément est encore utilisé ailleurs.",
      };
    }
  }

  console.error("[resource.actions]", error);
  return { ok: false, error: "Une erreur inattendue est survenue. Réessayez." };
}

/**
 * Sépare les valeurs du formulaire en deux groupes :
 *  • les champs scalaires, écrits directement sur le modèle,
 *  • les collections enfants (repeaters), recréées après l'enregistrement.
 */
function splitNested(values: Record<string, unknown>, nested: NestedRelation[] = []) {
  const scalars: Record<string, unknown> = { ...values };
  const children: { relation: NestedRelation; rows: Record<string, unknown>[] }[] = [];

  for (const relation of nested) {
    const rows = scalars[relation.field];
    delete scalars[relation.field];
    if (Array.isArray(rows)) {
      children.push({ relation, rows: rows as Record<string, unknown>[] });
    }
  }

  return { scalars, children };
}

/** Réécrit intégralement les collections enfants, en conservant l'ordre saisi. */
async function replaceNested(
  parentId: string,
  children: { relation: NestedRelation; rows: Record<string, unknown>[] }[],
) {
  for (const { relation, rows } of children) {
    const child = delegate(relation.model);
    await child.deleteMany({ where: { [relation.foreignKey]: parentId } });

    if (rows.length) {
      await child.createMany({
        data: rows.map((row, order) => ({ ...row, [relation.foreignKey]: parentId, order })),
      });
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  CRÉATION
// ───────────────────────────────────────────────────────────────────────────

export async function createResourceAction(
  resourceKey: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdminOrThrow();

    const resource = getResource(resourceKey);
    const parsed = resource.schema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      return { ok: false, error: "Certains champs sont invalides.", fieldErrors };
    }

    const { scalars, children } = splitNested(
      parsed.data as Record<string, unknown>,
      resource.nested,
    );

    // La nouvelle entrée se place en fin de liste.
    if (resource.sortable && scalars["order"] === undefined) {
      scalars["order"] = await delegate(resource.model).count();
    }

    const created = await delegate(resource.model).create({ data: scalars });
    const id = String(created["id"]);

    await replaceNested(id, children);
    revalidateResource(resource.key);

    return { ok: true, data: { id }, message: `${resource.label.singular} créé.` };
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  MISE À JOUR
// ───────────────────────────────────────────────────────────────────────────

export async function updateResourceAction(
  resourceKey: string,
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdminOrThrow();

    const resource = getResource(resourceKey);
    const parsed = resource.schema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      return { ok: false, error: "Certains champs sont invalides.", fieldErrors };
    }

    const { scalars, children } = splitNested(
      parsed.data as Record<string, unknown>,
      resource.nested,
    );

    await delegate(resource.model).update({ where: { id }, data: scalars });
    await replaceNested(id, children);
    revalidateResource(resource.key);

    return { ok: true, data: { id }, message: `${resource.label.singular} enregistré.` };
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  SUPPRESSION
// ───────────────────────────────────────────────────────────────────────────

export async function deleteResourceAction(
  resourceKey: string,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await requireAdminOrThrow();

    const resource = getResource(resourceKey);
    await delegate(resource.model).delete({ where: { id } });
    revalidateResource(resource.key);

    return { ok: true, data: null, message: `${resource.label.singular} supprimé.` };
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  BASCULE RAPIDE  (publié / en vedette / visible)
// ───────────────────────────────────────────────────────────────────────────

const TOGGLEABLE = new Set(["featured", "published", "visible", "current", "isRead", "highlighted"]);

export async function toggleResourceFieldAction(
  resourceKey: string,
  id: string,
  field: string,
  value: boolean,
): Promise<ActionResult<null>> {
  try {
    await requireAdminOrThrow();

    if (!TOGGLEABLE.has(field)) {
      return { ok: false, error: `Le champ « ${field} » n'est pas modifiable ainsi.` };
    }

    const resource = getResource(resourceKey);
    await delegate(resource.model).update({ where: { id }, data: { [field]: value } });
    revalidateResource(resource.key);

    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────────────────────────────────────────────────────
//  RÉORDONNANCEMENT  (glisser-déposer)
// ───────────────────────────────────────────────────────────────────────────

export async function reorderResourceAction(
  resourceKey: string,
  orderedIds: string[],
): Promise<ActionResult<null>> {
  try {
    await requireAdminOrThrow();

    const resource = getResource(resourceKey);
    const target = delegate(resource.model);

    // Transaction : un ordre partiellement écrit produirait un affichage
    // incohérent sur le site public.
    await db.$transaction(
      orderedIds.map((id, order) =>
        (target as unknown as { update: (args: unknown) => Promise<unknown> }).update({
          where: { id },
          data: { order },
        }),
      ) as never,
    );

    revalidateResource(resource.key);
    return { ok: true, data: null, message: "Ordre enregistré." };
  } catch (error) {
    return toActionError(error);
  }
}
