import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { MIME_EXTENSIONS, sanitizeFileBaseName } from "@/lib/upload";

import type { StorageProvider, StoredFile, UploadOptions } from "./types";

/**
 * Fournisseur local — écrit dans `public/uploads`.
 *
 * Destiné au développement, ou à un hébergement disposant d'un disque
 * persistant (VPS, Docker avec volume).
 *
 * ⚠️ Inutilisable sur Vercel : le système de fichiers y est éphémère, les
 * fichiers disparaîtraient au premier redéploiement. En production sur Vercel,
 * garder STORAGE_PROVIDER=cloudinary.
 */

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Construit un nom de fichier sûr.
 * Le nom d'origine est réduit à des caractères inoffensifs (`sanitizeFileBaseName`,
 * partagée avec le fournisseur Cloudinary), puis suffixé d'un jeton aléatoire :
 * cela neutralise toute tentative de traversée de répertoire (« ../../ ») et
 * évite les collisions.
 */
function safeFilename(original: string, mime: string): string {
  const base = sanitizeFileBaseName(original);
  const token = randomBytes(6).toString("hex");
  const extension = MIME_EXTENSIONS[mime] ?? "";
  return `${base || "fichier"}-${token}${extension}`;
}

/** Le dossier logique ne doit jamais permettre de sortir de public/uploads. */
function safeFolder(folder: string): string {
  return folder.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "general";
}

export const localProvider: StorageProvider = {
  name: "local",

  async upload(data: Uint8Array, options: UploadOptions): Promise<StoredFile> {
    const folder = safeFolder(options.folder);
    const directory = path.join(UPLOAD_ROOT, folder);
    await mkdir(directory, { recursive: true });

    const filename = safeFilename(options.filename, options.mime);
    await writeFile(path.join(directory, filename), data);

    const publicPath = `/uploads/${folder}/${filename}`;

    return {
      url: publicPath,
      // Le chemin public sert d'identifiant : il suffit à retrouver le fichier.
      publicId: publicPath,
      width: null,
      height: null,
      bytes: data.byteLength,
      mime: options.mime,
    };
  },

  // `mime` fait partie du contrat mais ne sert pas ici : sur disque, le chemin
  // suffit à retrouver le fichier quel que soit son type.
  async remove(publicId: string): Promise<void> {
    // `publicId` est le chemin public : on le reconstruit puis on vérifie qu'il
    // reste bien à l'intérieur de public/uploads avant toute suppression.
    const relative = publicId.replace(/^\/uploads\//, "");
    const target = path.join(UPLOAD_ROOT, relative);
    const normalized = path.normalize(target);

    if (!normalized.startsWith(UPLOAD_ROOT)) {
      throw new Error("Chemin de fichier invalide.");
    }

    await unlink(normalized).catch(() => {
      // Fichier déjà absent : ce n'est pas une erreur bloquante.
    });
  },
};
