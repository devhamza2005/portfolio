import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/skeleton";
import { getResource } from "@/resources";
import { getResourceOptions } from "@/server/queries/options";
import { getResourceRecord, toSerializableResource } from "@/server/queries/resource";

/**
 * Profil — écran d'édition unique.
 *
 * Ce segment statique est prioritaire sur `/admin/[resource]` : la ressource
 * `profile` est marquée `system`, donc les routes génériques la refusent et
 * cette page est le seul chemin vers le formulaire.
 *
 * Il n'y a rien à créer : la ligne « profile » est posée par le seed et ne peut
 * être ni dupliquée ni supprimée. On charge donc directement son contenu.
 */

/** Identifiant fixe de l'unique ligne de la table `profile`. */
const PROFILE_ID = "profile";

export const metadata: Metadata = { title: "Profil" };

export default async function AdminProfilePage() {
  const resource = getResource("profile");

  const [record, options] = await Promise.all([
    getResourceRecord(resource, PROFILE_ID),
    getResourceOptions(resource),
  ]);

  // Base non amorcée : mieux vaut l'expliquer qu'afficher un formulaire vide
  // dont l'enregistrement échouerait sur un identifiant inexistant.
  if (!record) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Profil" description={resource.description} />
        <ErrorState
          title="Profil introuvable"
          description="La table « profile » est vide. Lancez `npm run db:seed` pour créer la ligne initiale, puis rechargez cette page."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Profil"
        description={resource.description}
        actions={
          <Button asChild variant="secondary" size="md">
            <Link href="/" target="_blank" rel="noreferrer noopener">
              <ExternalLink />
              <span className="hidden sm:inline">Voir le site</span>
              <span className="sr-only"> (nouvelle fenêtre)</span>
            </Link>
          </Button>
        }
      />

      <ResourceForm
        resource={toSerializableResource(resource)}
        mode="edit"
        recordId={PROFILE_ID}
        initialValues={record.values}
        options={options}
        previews={record.previews}
      />
    </div>
  );
}
