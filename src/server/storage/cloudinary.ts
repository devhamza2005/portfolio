import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";
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

export const cloudinaryProvider: StorageProvider = {
  name: "cloudinary",

  async upload(data: Uint8Array, options: UploadOptions): Promise<StoredFile> {
    configure();

    const folder = `${env.CLOUDINARY_FOLDER}/${options.folder}`;
    // Les PDF passent en `raw` : Cloudinary ne doit pas tenter de les traiter
    // comme des images.
    const resourceType = options.mime === "application/pdf" ? "raw" : "image";

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          // Cloudinary ajoute un suffixe aléatoire : deux fichiers de même nom
          // ne s'écrasent jamais.
          use_filename: true,
          unique_filename: true,
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
