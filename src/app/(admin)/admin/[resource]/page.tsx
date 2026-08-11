import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DataTable, type TableRow } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { getResource, hasResource } from "@/resources";
import { listResourceRows } from "@/server/queries/resource";

/**
 * Liste d'une ressource — une seule route dessert les treize entités.
 *
 * Les segments statiques (/admin/media, /admin/profile, /admin/messages) sont
 * prioritaires sur ce segment dynamique : ils ne sont jamais interceptés ici.
 * Les ressources marquées `system` sont en outre refusées par `hasResource`.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource: key } = await params;
  if (!hasResource(key)) return { title: "Introuvable" };
  return { title: getResource(key).label.plural };
}

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  if (!hasResource(key)) notFound();

  const resource = getResource(key);
  const rows = await listResourceRows(resource);

  return (
    <>
      <PageHeader
        title={resource.label.plural}
        description={resource.description}
        actions={
          <Button asChild size="md">
            <Link href={`/admin/${resource.key}/new`}>
              <Plus />
              <span className="hidden sm:inline">Ajouter</span>
            </Link>
          </Button>
        }
      />

      <DataTable
        resourceKey={resource.key}
        columns={resource.columns}
        rows={rows as TableRow[]}
        searchable={resource.searchable}
        sortable={resource.sortable}
        emptyState={resource.emptyState}
        createHref={`/admin/${resource.key}/new`}
        createLabel={`Ajouter ${resource.label.singular.toLowerCase()}`}
      />
    </>
  );
}
