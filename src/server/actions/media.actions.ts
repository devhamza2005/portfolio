"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/server/db";
import { UnauthorizedError, requireAdminOrThrow } from "@/server/guards";
import { getStorage } from "@/server/storage";
import type { ActionResult } from "@/server/actions/resource.actions";

const updateMediaSchema = z.object({
  alt: z.string().max(200, "200 caractères maximum").optional(),
  caption: z.string().max(300, "300 caractères maximum").nullable().optional(),
});

/** Met à jour le texte alternatif et la légende d'un média. */
export async function updateMediaAction(
  id: string,
  input: unknown,
): Promise<ActionResult<null>> {
  try {
    await requireAdminOrThrow();

    const parsed = updateMediaSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Valeurs invalides." };
    }

    await db.media.update({ where: { id }, data: parsed.data });
    updateTag("media");
    updateTag("portfolio");

    return { ok: true, data: null, message: "Média mis à jour." };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Session expirée. Reconnectez-vous." };
    }
    console.error("[media.actions:update]", error);
    return { ok: false, error: "Mise à jour impossible." };
  }
}

/**
 * Compte les usages d'un média dans le contenu.
 * Empêche de supprimer une image encore affichée quelque part sur le site.
 */
export async function getMediaUsage(id: string) {
  const [projectCovers, projectImages, technologies, experiences, education, certifications, profileAvatar, profileOg] =
    await Promise.all([
      db.project.count({ where: { coverId: id } }),
      db.projectImage.count({ where: { mediaId: id } }),
      db.technology.count({ where: { logoId: id } }),
      db.experience.count({ where: { logoId: id } }),
      db.education.count({ where: { logoId: id } }),
      db.certification.count({ where: { imageId: id } }),
      db.profile.count({ where: { avatarId: id } }),
      db.profile.count({ where: { ogImageId: id } }),
    ]);

  const usages = [
    { label: "couverture de projet", count: projectCovers },
    { label: "galerie de projet", count: projectImages },
    { label: "logo de technologie", count: technologies },
    { label: "logo d'expérience", count: experiences },
    { label: "logo de formation", count: education },
    { label: "certification", count: certifications },
    { label: "photo de profil", count: profileAvatar },
    { label: "image de partage (OG)", count: profileOg },
  ].filter((usage) => usage.count > 0);

  return { total: usages.reduce((sum, usage) => sum + usage.count, 0), usages };
}

/**
 * Supprime un média — d'abord en base, puis chez le fournisseur.
 *
 * L'ordre compte : si la suppression distante échouait après avoir retiré la
 * ligne, on garderait un fichier orphelin (sans gravité). L'inverse laisserait
 * une ligne pointant vers un fichier disparu — donc une image cassée sur le site.
 */
export async function deleteMediaAction(id: string): Promise<ActionResult<null>> {
  try {
    await requireAdminOrThrow();

    const usage = await getMediaUsage(id);
    if (usage.total > 0) {
      const details = usage.usages.map((item) => `${item.count} ${item.label}`).join(", ");
      return {
        ok: false,
        error: `Ce média est utilisé (${details}). Retirez-le d'abord de ces contenus.`,
      };
    }

    const media = await db.media.findUnique({
      where: { id },
      select: { publicId: true, provider: true },
    });

    if (!media) return { ok: false, error: "Média introuvable." };

    await db.media.delete({ where: { id } });

    if (media.publicId) {
      // Un échec ici ne doit pas remonter comme une erreur à l'utilisateur :
      // la ligne est déjà supprimée, le fichier orphelin est sans impact.
      await getStorage()
        .remove(media.publicId)
        .catch((error: unknown) => {
          console.warn("[media.actions] fichier distant non supprimé :", error);
        });
    }

    updateTag("media");
    updateTag("portfolio");

    return { ok: true, data: null, message: "Média supprimé." };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Session expirée. Reconnectez-vous." };
    }
    console.error("[media.actions:delete]", error);
    return { ok: false, error: "Suppression impossible." };
  }
}

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  bytes: number | null;
  folder: string;
  createdAt: Date;
};

/** Liste paginée de la médiathèque, utilisée par le sélecteur d'images. */
export async function listMediaAction(options?: {
  folder?: string;
  search?: string;
  take?: number;
  skip?: number;
}): Promise<ActionResult<{ items: MediaItem[]; total: number }>> {
  try {
    await requireAdminOrThrow();

    const take = Math.min(options?.take ?? 48, 96);
    const skip = options?.skip ?? 0;
    const search = options?.search?.trim();

    const where = {
      ...(options?.folder && options.folder !== "all" ? { folder: options.folder } : {}),
      ...(search
        ? {
            OR: [
              { alt: { contains: search, mode: "insensitive" as const } },
              { url: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        select: {
          id: true,
          url: true,
          alt: true,
          caption: true,
          width: true,
          height: true,
          mime: true,
          bytes: true,
          folder: true,
          createdAt: true,
        },
      }),
      db.media.count({ where }),
    ]);

    return { ok: true, data: { items, total } };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Session expirée. Reconnectez-vous." };
    }
    console.error("[media.actions:list]", error);
    return { ok: false, error: "Chargement de la médiathèque impossible." };
  }
}
