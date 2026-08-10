"use client";

import { AlertCircle, ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  FieldRenderer,
  type FieldRendererContext,
  type MediaPreview,
  SPAN_CLASSES,
} from "@/components/admin/fields/field-renderer";
import type { RelationOption } from "@/components/admin/fields/relation-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FieldDef, ResourceDef } from "@/resources/types";
import {
  createResourceAction,
  deleteResourceAction,
  updateResourceAction,
} from "@/server/actions/resource.actions";
import { cn } from "@/lib/utils";

type Props = {
  /** Descripteur allégé : les fonctions ne traversent pas la frontière serveur. */
  resource: SerializableResource;
  /** Schéma Zod côté client, pour une validation immédiate avant l'envoi. */
  mode: "create" | "edit";
  recordId?: string;
  initialValues: Record<string, unknown>;
  options: Record<string, RelationOption[]>;
  previews: Record<string, MediaPreview>;
};

export type SerializableResource = {
  key: string;
  label: ResourceDef["label"];
  fields: FieldDef[];
};

/**
 * Formulaire générique.
 *
 * Il n'existe qu'une seule implémentation pour les treize ressources : la
 * structure vient du descripteur, la validation du schéma Zod partagé, et la
 * persistance des actions CRUD génériques.
 *
 * Le serveur revalide systématiquement : la vérification côté client sert
 * uniquement à afficher les erreurs sans aller-retour réseau.
 */
export function ResourceForm({
  resource,
  mode,
  recordId,
  initialValues,
  options,
  previews: initialPreviews,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, MediaPreview>>(initialPreviews);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const context: FieldRendererContext = {
    options,
    previews,
    registerPreview: (id, preview) =>
      setPreviews((current) => ({ ...current, [id]: preview })),
    disabled: isPending || isDeleting,
  };

  // Champs regroupés par section, dans l'ordre de déclaration.
  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const field of resource.fields) {
      const key = field.group ?? "Informations";
      const list = map.get(key);
      if (list) list.push(field);
      else map.set(key, [field]);
    }
    return Array.from(map.entries());
  }, [resource.fields]);

  function setValue(name: string, next: unknown) {
    setValues((current) => ({ ...current, [name]: next }));
    // L'erreur disparaît dès la première correction : garder un message
    // obsolète à l'écran est plus déroutant qu'utile.
    setErrors((current) => {
      if (!current[name]) return current;
      const next_ = { ...current };
      delete next_[name];
      return next_;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createResourceAction(resource.key, values)
          : await updateResourceAction(resource.key, recordId!, values);

      if (result.ok) {
        toast.success(result.message ?? "Enregistré.");
        router.push(`/admin/${resource.key}`);
        router.refresh();
        return;
      }

      setFormError(result.error);
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        // Amène l'utilisateur au premier champ fautif : sur un formulaire
        // long comme celui d'un projet, l'erreur peut être hors écran.
        const firstKey = Object.keys(result.fieldErrors)[0];
        if (firstKey) {
          const element = document.getElementById(`field-${firstKey.replace(/\./g, "-")}`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
          element?.focus({ preventScroll: true });
        }
      }
      toast.error(result.error);
    });
  }

  function handleDelete() {
    if (!recordId) return;
    startDeleting(async () => {
      const result = await deleteResourceAction(resource.key, recordId);
      if (result.ok) {
        toast.success(result.message ?? "Supprimé.");
        router.push(`/admin/${resource.key}`);
        router.refresh();
      } else {
        toast.error(result.error);
        setConfirmOpen(false);
      }
    });
  }

  const busy = isPending || isDeleting;

  return (
    <form onSubmit={handleSubmit} noValidate className="pb-24">
      {formError ? (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-5">
        {groups.map(([groupName, groupFields]) => {
          const visible = groupFields.filter(
            (field) => !field.showIf || values[field.showIf.field] === field.showIf.equals,
          );
          if (visible.length === 0) return null;

          return (
            <Card key={groupName} className="p-5 sm:p-6">
              <h2 className="text-subtle mb-5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                {groupName}
              </h2>

              <div className="grid grid-cols-12 gap-x-4 gap-y-5">
                {visible.map((field) => (
                  <div
                    key={field.name}
                    className={cn("col-span-12", SPAN_CLASSES[field.span ?? 12])}
                  >
                    <FieldRenderer
                      field={field}
                      path={field.name}
                      value={values[field.name]}
                      onChange={(next) => setValue(field.name, next)}
                      error={errors[field.name]}
                      values={values}
                      context={context}
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Barre d'actions collante — toujours accessible sur les formulaires longs */}
      <div className="bg-surface/90 border-border fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-lg lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 lg:px-8">
          <Button asChild variant="ghost" size="sm" disabled={busy}>
            <Link href={`/admin/${resource.key}`}>
              <ArrowLeft />
              <span className="hidden sm:inline">Annuler</span>
            </Link>
          </Button>

          {mode === "edit" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}
              className="hover:text-danger"
            >
              <Trash2 />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          ) : null}

          <Button type="submit" size="md" disabled={busy} className="ml-auto">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" /> Enregistrement…
              </>
            ) : (
              <>
                <Save />
                {mode === "create" ? `Créer` : "Enregistrer"}
              </>
            )}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Supprimer « ${resource.label.singular} » ?`}
        description="Cette action est définitive. Le contenu disparaîtra immédiatement du site public."
        confirmLabel="Supprimer définitivement"
        destructive
        pending={isDeleting}
        onConfirm={handleDelete}
      />
    </form>
  );
}
