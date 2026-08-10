import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/server/db";
import { getStorageStatus } from "@/server/storage";

export const metadata: Metadata = { title: "Médiathèque" };

export default async function MediaPage() {
  const [items, folderRows] = await Promise.all([
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
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
    db.media.groupBy({ by: ["folder"], orderBy: { folder: "asc" } }),
  ]);

  const storage = getStorageStatus();

  return (
    <>
      <PageHeader
        title="Médiathèque"
        description="Toutes vos images et documents. Un média téléversé ici est réutilisable partout."
      />

      {storage.degraded ? (
        <div
          role="status"
          className="border-warning/30 bg-warning/10 text-warning mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Cloudinary est demandé mais ses clés sont absentes : les fichiers sont écrits sur le
            disque local. Sur Vercel, ils disparaîtraient au prochain déploiement — renseignez
            <code className="mx-1 font-mono text-xs">CLOUDINARY_*</code> dans votre fichier
            <code className="mx-1 font-mono text-xs">.env</code>.
          </span>
        </div>
      ) : null}

      <MediaLibrary
        initialItems={items}
        folders={folderRows.map((row) => row.folder)}
      />
    </>
  );
}
