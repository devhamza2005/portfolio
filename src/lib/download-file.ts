/**
 * Force un téléchargement réel, y compris pour une ressource cross-origin.
 *
 * ── Le problème que ceci résout ─────────────────────────────────────────────
 *
 * L'attribut HTML `download` d'un `<a>` n'est PAS fiable pour une ressource
 * d'un autre domaine (ici Cloudinary) : le navigateur suit le
 * `Content-Disposition` renvoyé par le SERVEUR distant plutôt que l'intention
 * de la page — constaté en conditions réelles sur ce projet (le bouton CV
 * ouvrait le PDF dans l'onglet au lieu de le télécharger dès que Cloudinary
 * cessait de forcer `attachment`). Le comportement dépend donc d'un réglage
 * chez un tiers, hors du contrôle du portfolio, et peut changer sans prévenir.
 *
 * ── Le principe ──────────────────────────────────────────────────────────────
 *
 * Un lien vers un `blob:` créé par la page est TOUJOURS same-origin : son nom
 * de fichier (`link.download`) est alors systématiquement respecté, quel que
 * soit ce que renvoie le serveur distant. Le fichier est donc récupéré une
 * fois en mémoire, puis « redistribué » localement via ce blob.
 *
 * Cloudinary expose `Access-Control-Allow-Origin: *` sur ses ressources
 * publiques (vérifié), ce qui autorise `fetch()` à en lire le contenu.
 */
export async function downloadFile(url: string, suggestedFilename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Le nom de fichier retombe sur le dernier segment de l'URL : depuis la
    // correction de l'upload (§ storage/cloudinary.ts), ce segment porte déjà
    // un nom lisible et la bonne extension — aucune duplication de logique ici.
    const filename = suggestedFilename || url.split("/").pop() || "fichier";

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Différé : révoquer immédiatement empêcherait parfois le téléchargement
    // de démarrer sur certains navigateurs.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    // Repli : réseau indisponible, CORS inattendu… le fichier reste au moins
    // atteignable directement, dans un nouvel onglet plutôt que nulle part.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
