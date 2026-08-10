import { NextResponse } from "next/server";

import {
  ACCEPTED_MIME_TYPES,
  formatBytes,
  maxBytesFor,
  sniffMimeType,
  validateFileMeta,
} from "@/lib/upload";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/guards";
import { getStorage, toMediaProvider } from "@/server/storage";

/**
 * Téléversement de fichiers — réservé au back-office.
 *
 * Chaîne de contrôle, dans cet ordre :
 *   1. session valide             → un visiteur ne peut rien téléverser
 *   2. métadonnées annoncées      → type et taille déclarés
 *   3. OCTETS RÉELS du fichier    → la vérification qui compte
 *   4. écriture chez le fournisseur
 *   5. enregistrement en médiathèque
 *
 * L'étape 3 est la seule fiable : le `Content-Type` d'un formulaire est
 * fourni par l'appelant et peut être falsifié. Un exécutable renommé en .png
 * passerait l'étape 2 mais échoue à l'étape 3.
 */

export const runtime = "nodejs";
/** Le corps peut atteindre 10 Mo : pas de mise en cache possible. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const file = formData.get("file");
  const folderRaw = formData.get("folder");
  const altRaw = formData.get("alt");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  // ── 2. Métadonnées annoncées ─────────────────────────────────────────────
  const metaError = validateFileMeta({ type: file.type, size: file.size, name: file.name });
  if (metaError) {
    return NextResponse.json({ error: metaError.message, code: metaError.code }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  // ── 3. Octets réels ──────────────────────────────────────────────────────
  const actualMime = sniffMimeType(buffer);

  if (!actualMime) {
    return NextResponse.json(
      {
        error:
          "Le contenu du fichier ne correspond à aucun format autorisé " +
          "(JPEG, PNG, WebP, AVIF, GIF, PDF).",
        code: "SIGNATURE_UNKNOWN",
      },
      { status: 400 },
    );
  }

  if (actualMime !== file.type) {
    return NextResponse.json(
      {
        error: `Le fichier est annoncé comme « ${file.type} » mais son contenu est « ${actualMime} ».`,
        code: "MIME_MISMATCH",
      },
      { status: 400 },
    );
  }

  // Contrôle de taille refait sur les octets reçus, pas sur la taille déclarée.
  const max = maxBytesFor(actualMime);
  if (buffer.byteLength > max) {
    return NextResponse.json(
      {
        error: `Fichier trop volumineux (${formatBytes(buffer.byteLength)}). Maximum : ${formatBytes(max)}.`,
        code: "TOO_LARGE",
      },
      { status: 413 },
    );
  }

  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(actualMime)) {
    return NextResponse.json({ error: "Format non autorisé." }, { status: 400 });
  }

  // ── 4 & 5. Stockage puis médiathèque ─────────────────────────────────────
  const folder = typeof folderRaw === "string" && folderRaw ? folderRaw : "general";
  const alt = typeof altRaw === "string" ? altRaw.slice(0, 200) : "";

  try {
    const storage = getStorage();
    const stored = await storage.upload(buffer, {
      folder,
      filename: file.name,
      mime: actualMime,
    });

    const media = await db.media.create({
      data: {
        url: stored.url,
        provider: toMediaProvider(storage.name),
        publicId: stored.publicId,
        alt,
        width: stored.width,
        height: stored.height,
        mime: stored.mime,
        bytes: stored.bytes,
        folder,
      },
      select: {
        id: true,
        url: true,
        alt: true,
        width: true,
        height: true,
        mime: true,
        bytes: true,
        folder: true,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("[api/upload]", error);
    return NextResponse.json(
      { error: "Le téléversement a échoué. Réessayez." },
      { status: 500 },
    );
  }
}
