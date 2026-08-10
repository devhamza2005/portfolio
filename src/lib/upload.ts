/**
 * Règles de validation des fichiers téléversés.
 *
 * Ce module est volontairement isolé et sans dépendance serveur : les mêmes
 * constantes servent à l'interface (message d'erreur immédiat) et à la route
 * d'upload (contrôle réel). L'interface n'est qu'un confort — seule la
 * vérification serveur fait autorité.
 */

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const DOCUMENT_MIME_TYPES = ["application/pdf"] as const;

export const ACCEPTED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

/** 5 Mo pour une image, 10 Mo pour un PDF. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/**
 * Le SVG est délibérément exclu : un SVG peut contenir du JavaScript, et servi
 * depuis le même domaine il ouvrirait une faille XSS stockée. Les logos de
 * technologies passent par `iconKey` (simple-icons), ce qui rend l'upload de
 * SVG inutile.
 */
export const REJECTED_MIME_NOTE =
  "Le format SVG n'est pas accepté pour des raisons de sécurité. Utilisez PNG ou WebP.";

export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(",");

/**
 * Signatures binaires (magic bytes) des formats acceptés.
 *
 * Le `Content-Type` annoncé par le navigateur est contrôlé par l'appelant et
 * peut donc être falsifié. Comparer les premiers octets du fichier au format
 * réellement attendu est la seule vérification fiable.
 */
const SIGNATURES: { mime: AcceptedMimeType; offset: number; bytes: number[] }[] = [
  { mime: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  // WebP et AVIF : conteneurs RIFF / ISO-BMFF, la marque est décalée.
  { mime: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // "WEBP"
  { mime: "image/avif", offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // "ftyp"
  { mime: "application/pdf", offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
];

/** Retourne le type réel du fichier d'après ses octets, ou `null` si inconnu. */
export function sniffMimeType(buffer: Uint8Array): AcceptedMimeType | null {
  for (const signature of SIGNATURES) {
    const slice = buffer.subarray(signature.offset, signature.offset + signature.bytes.length);
    if (slice.length !== signature.bytes.length) continue;
    if (signature.bytes.every((byte, index) => slice[index] === byte)) return signature.mime;
  }
  return null;
}

export function isImageMime(mime: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function maxBytesFor(mime: string): number {
  return isImageMime(mime) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export type UploadValidationError = { code: string; message: string };

/** Contrôle sans lire les octets — utilisé côté navigateur avant l'envoi. */
export function validateFileMeta(file: {
  type: string;
  size: number;
  name: string;
}): UploadValidationError | null {
  if (file.type === "image/svg+xml") {
    return { code: "SVG_REJECTED", message: REJECTED_MIME_NOTE };
  }

  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      code: "UNSUPPORTED_TYPE",
      message: `Format non accepté (${file.type || "inconnu"}). Formats autorisés : JPEG, PNG, WebP, AVIF, GIF, PDF.`,
    };
  }

  const max = maxBytesFor(file.type);
  if (file.size > max) {
    return {
      code: "TOO_LARGE",
      message: `Fichier trop volumineux (${formatBytes(file.size)}). Maximum : ${formatBytes(max)}.`,
    };
  }

  if (file.size === 0) {
    return { code: "EMPTY", message: "Le fichier est vide." };
  }

  return null;
}
