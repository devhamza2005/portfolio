import type { JsonLdObject } from "@/lib/structured-data";

/**
 * Insertion d'un graphe JSON-LD dans le document.
 *
 * ── Pourquoi `dangerouslySetInnerHTML` ici, et nulle part ailleurs ──────────
 *
 * Le contenu d'une balise `<script>` est du texte brut au sens HTML : le
 * navigateur n'y décode aucune entité. Passer l'objet en enfant React
 * (`<script>{JSON.stringify(data)}</script>`) le ferait échapper en entités
 * HTML, et `&amp;` arriverait littéralement dans le JSON — un document
 * structuré invalide.
 *
 * L'injection contrôlée est donc techniquement nécessaire. La seule faille
 * qu'elle ouvre est la fermeture prématurée de la balise : une donnée
 * contenant `</script>` sortirait du bloc et le reste serait exécuté comme du
 * code. On neutralise ce vecteur à la source en échappant `<` en `<` —
 * séquence que `JSON.parse` relit à l'identique, mais que l'analyseur HTML ne
 * peut plus interpréter comme le début d'une balise.
 *
 * Le contenu vient de toute façon de la base, alimentée uniquement par
 * l'administrateur authentifié : c'est une défense en profondeur, pas la seule.
 */
function serialize(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
