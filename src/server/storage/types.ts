/**
 * Contrat d'un fournisseur de stockage.
 *
 * Toute la partie applicative ne connaît que cette interface. Changer de
 * fournisseur (Cloudinary → Vercel Blob → S3 → disque local) revient à écrire
 * une nouvelle implémentation et à modifier une ligne dans `index.ts` :
 * aucun composant, aucune action, aucun modèle n'est concerné (§16).
 */

export type StoredFile = {
  url: string;
  /** Identifiant chez le fournisseur — requis pour supprimer le fichier distant. */
  publicId: string | null;
  width: number | null;
  height: number | null;
  bytes: number;
  mime: string;
};

export type UploadOptions = {
  /** Dossier logique : projects, certifications, avatar, cv… */
  folder: string;
  /** Nom d'origine, utilisé pour construire un nom de fichier lisible. */
  filename: string;
  mime: string;
};

export interface StorageProvider {
  readonly name: "cloudinary" | "local";
  upload(data: Uint8Array, options: UploadOptions): Promise<StoredFile>;
  /** La suppression ne doit jamais faire échouer l'opération appelante. */
  remove(publicId: string): Promise<void>;
}
