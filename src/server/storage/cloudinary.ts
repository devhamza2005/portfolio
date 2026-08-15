import "server-only";

import { randomBytes } from "node:crypto";

import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";
import { MIME_EXTENSIONS, sanitizeFileBaseName } from "@/lib/upload";
import type { StorageProvider, StoredFile, UploadOptions } from "./types";

/**
 * Fournisseur Cloudinary.
 *
 * Les clés d'API vivent uniquement ici, dans un module `server-only` : elles
 * ne peuvent pas se retrouver dans le bundle envoyé au navigateur (§15).
 * Le téléversement est signé côté serveur — aucun `upload preset` public.
 */

let configured = false;

function configure() {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/**
 * Construit l'identifiant public envoyé à Cloudinary.
 *
 * ── Pourquoi pas `use_filename` ─────────────────────────────────────────────
 *
 * Le fichier arrive ici sous forme d'octets bruts (`upload_stream`), sans
 * métadonnée de nom attachée au flux : Cloudinary ne peut alors pas dériver
 * `use_filename` du nom d'origine et retombe sur un nom générique suivi d'un
 * suffixe aléatoire (« file_xxxxxx ») — c'est exactement le bug corrigé ici.
 * `options.filename` (le nom réel du fichier téléversé) est déjà transmis par
 * la route d'upload ; il suffit de s'en servir explicitement.
 *
 * ── Pourquoi l'extension seulement pour `raw` ───────────────────────────────
 *
 * Pour une image, Cloudinary ajoute LUI-MÊME l'extension du format détecté à
 * la fin de l'URL de livraison ; l'inclure aussi dans `public_id` produirait
 * une double extension (« photo.jpg.jpg »). Un fichier `raw` (PDF), à
 * l'inverse, ne reçoit AUCUN traitement de format : l'URL de livraison est
 * exactement `public_id`, extension comprise. Sans elle, aucun navigateur ni
 * système d'exploitation ne reconnaît le fichier téléchargé — c'est ce qui
 * cassait le bouton CV du portfolio public.
 */
function buildPublicId(filename: string, mime: string, resourceType: "raw" | "image"): string {
  const base = sanitizeFileBaseName(filename) || "fichier";
  const token = randomBytes(6).toString("hex");
  const extension = resourceType === "raw" ? (MIME_EXTENSIONS[mime] ?? "") : "";
  return `${base}-${token}${extension}`;
}

export const cloudinaryProvider: StorageProvider = {
  name: "cloudinary",

  async upload(data: Uint8Array, options: UploadOptions): Promise<StoredFile> {
    configure();

    const folder = `${env.CLOUDINARY_FOLDER}/${options.folder}`;
    // Les PDF passent en `raw` : Cloudinary ne doit pas tenter de les traiter
    // comme des images.
    const resourceType = options.mime === "application/pdf" ? "raw" : "image";
    const publicId = buildPublicId(options.filename, options.mime, resourceType);

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: publicId,
          // Le jeton aléatoire de `buildPublicId` évite déjà toute collision ;
          // `overwrite: false` reste une seconde barrière, sans effet en
          // pratique.
          overwrite: false,
        },
        (error, uploadResult) => {
          if (error) reject(new Error(error.message));
          else if (!uploadResult) reject(new Error("Cloudinary n'a retourné aucun résultat."));
          else resolve(uploadResult as unknown as Record<string, unknown>);
        },
      );
      stream.end(Buffer.from(data));
    });

    return {
      url: String(result["secure_url"]),
      publicId: result["public_id"] ? String(result["public_id"]) : null,
      width: typeof result["width"] === "number" ? result["width"] : null,
      height: typeof result["height"] === "number" ? result["height"] : null,
      bytes: typeof result["bytes"] === "number" ? result["bytes"] : data.byteLength,
      mime: options.mime,
    };
  },

  async remove(publicId: string, mime?: string | null): Promise<void> {
    configure();

    /*
      `destroy` cible `resource_type: "image"` par défaut. Or les PDF sont
      téléversés en `raw` (voir plus haut) : appeler la suppression sans le
      préciser renvoie « not found » SANS lever d'erreur, et le fichier reste
      accessible par son URL — un CV retiré du back-office resterait en ligne.

      Quand le type est connu, on vise directement la bonne catégorie. Sinon on
      essaie les deux : `destroy` est idempotent, une catégorie qui ne contient
      pas le fichier répond simplement « not found ».
    */
    const categories =
      mime === "application/pdf"
        ? (["raw"] as const)
        : mime
          ? (["image"] as const)
          : (["image", "raw"] as const);

    for (const resourceType of categories) {
      // `invalidate` purge aussi le CDN, sinon le fichier resterait en cache.
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      if (result.result === "ok") return;
    }
  },
};
