import "server-only";

import { env, isCloudinaryConfigured } from "@/lib/env";
import { cloudinaryProvider } from "./cloudinary";
import { localProvider } from "./local";
import type { StorageProvider } from "./types";

export type { StorageProvider, StoredFile, UploadOptions } from "./types";

/**
 * Sélection du fournisseur de stockage — unique point de bascule.
 *
 * Repli automatique : si `STORAGE_PROVIDER=cloudinary` mais que les clés sont
 * absentes, on utilise le disque local plutôt que d'échouer au démarrage.
 * Cela permet de développer sans compte Cloudinary.
 */
export function getStorage(): StorageProvider {
  if (env.STORAGE_PROVIDER === "cloudinary") {
    return isCloudinaryConfigured ? cloudinaryProvider : localProvider;
  }
  return localProvider;
}

/** Indique au back-office quel fournisseur est réellement actif. */
export function getStorageStatus() {
  const requested = env.STORAGE_PROVIDER;
  const active = getStorage().name;
  return {
    requested,
    active,
    degraded: requested === "cloudinary" && active === "local",
  };
}

/** Correspondance avec l'enum Prisma `MediaProvider`. */
export function toMediaProvider(name: StorageProvider["name"]): "CLOUDINARY" | "LOCAL" {
  return name === "cloudinary" ? "CLOUDINARY" : "LOCAL";
}
