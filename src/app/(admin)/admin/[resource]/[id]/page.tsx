import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { getResource, hasResource } from "@/resources";
import { getResourceOptions } from "@/server/queries/options";
import { getResourceRecord, toSerializableResource } from "@/server/queries/resource";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}): Promise<Metadata> {
  const { resource: key } = await params;
  if (!hasResource(key)) return { title: "Introuvable" };
  return { title: `Modifier — ${getResource(key).label.singular}` };
}

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  if (!hasResource(key)) notFound();

  const resource = getResource(key);
  const [record, options] = await Promise.all([
    getResourceRecord(resource, id),
    getResourceOptions(resource),
  ]);

  // L'élément a pu être supprimé depuis un autre onglet.
  if (!record) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Modifier — ${resource.label.singular.toLowerCase()}`}
        description="Les changements sont visibles sur le site dès l'enregistrement."
      />

      <ResourceForm
        resource={toSerializableResource(resource)}
        mode="edit"
        recordId={id}
        initialValues={record.values}
        options={options}
        previews={record.previews}
      />
    </div>
  );
}
