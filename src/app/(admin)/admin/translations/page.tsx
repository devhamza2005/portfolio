import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { TranslationManager } from "@/components/admin/translation-manager";
import { getTranslationDashboard } from "@/server/queries/translation-admin";

/**
 * Traductions du contenu — phase B.
 *
 * Segment statique, prioritaire sur `/admin/[resource]`, au même titre que
 * `/admin/media` et `/admin/messages`. La lecture n'est pas mise en cache :
 * l'écran doit refléter l'état réel de la base, et la garde
 * d'authentification du layout `/admin` s'applique à chaque requête.
 *
 * Le back-office reste FRANCOPHONE : cet écran gère les traductions, il n'est
 * pas traduit lui-même.
 */
export const metadata: Metadata = { title: "Traductions" };

export default async function AdminTranslationsPage() {
  const data = await getTranslationDashboard();

  const restantEn = data.totals.total - data.totals.en;
  const restantAr = data.totals.total - data.totals.ar;

  return (
    <>
      <PageHeader
        title="Traductions"
        description={
          data.totals.total === 0
            ? "Aucun contenu éditorial à traduire pour le moment."
            : `${data.totals.total} champs éditoriaux · ${restantEn} à traduire en anglais, ${restantAr} en arabe. ` +
              "Le français reste la source ; tout champ non traduit y retombe automatiquement."
        }
      />

      <TranslationManager data={data} />
    </>
  );
}
