import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { getResource, hasResource } from "@/resources";
import { getResourceOptions } from "@/server/queries/options";
import { emptyFormValues, toSerializableResource } from "@/server/queries/resource";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource: key } = await params;
  if (!hasResource(key)) return { title: "Introuvable" };
  return { title: `Nouveau — ${getResource(key).label.singular}` };
}

export default async function CreateResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  if (!hasResource(key)) notFound();

  const resource = getResource(key);
  const options = await getResourceOptions(resource);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Nouveau — ${resource.label.singular.toLowerCase()}`}
        description="Le contenu apparaîtra sur le portfolio dès l'enregistrement."
      />

      <ResourceForm
        resource={toSerializableResource(resource)}
        mode="create"
        initialValues={emptyFormValues(resource)}
        options={options}
        previews={{}}
      />
    </div>
  );
}
