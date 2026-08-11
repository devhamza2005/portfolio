import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Rendu du texte long des études de cas.
 *
 * Les champs `overview`, `problem`, `solution`… sont saisis en Markdown léger
 * depuis le back-office. Plutôt que d'embarquer une bibliothèque Markdown
 * complète pour trois constructions, le texte est analysé ici et transformé
 * en éléments React.
 *
 * Aucun `dangerouslySetInnerHTML` : le contenu vient de la base et pourrait
 * un jour être saisi par quelqu'un d'autre. Tout est construit en nœuds React,
 * donc échappé par React lui-même.
 *
 * Constructions reconnues :
 *   • paragraphes  — séparés par une ligne vide
 *   • **gras**     — au fil du texte
 *   • • ou -       — en début de ligne, transformés en liste à puces
 *   • **Titre**    — seul sur sa ligne, transformé en sous-titre
 */

/** Découpe une ligne sur les segments `**gras**`. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

const BULLET = /^\s*[•\-–]\s+/;

export function Prose({ text, className }: { text: string | null; className?: string }) {
  if (!text?.trim()) return null;

  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter((line) => line.trim() !== "");
        const key = `b${blockIndex}`;

        // Bloc entièrement composé de puces → liste.
        if (lines.length > 0 && lines.every((line) => BULLET.test(line))) {
          return (
            <ul key={key} className="space-y-2.5">
              {lines.map((line, lineIndex) => (
                <li key={`${key}-${lineIndex}`} className="text-muted flex gap-3 leading-relaxed">
                  <span
                    className="bg-brand mt-[0.6rem] size-1.5 shrink-0 rounded-full"
                    aria-hidden
                  />
                  <span>{renderInline(line.replace(BULLET, ""), `${key}-${lineIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Ligne unique entièrement en gras → sous-titre.
        const single = lines[0];
        if (
          lines.length === 1 &&
          single &&
          /^\*\*[^*]+\*\*$/.test(single.trim())
        ) {
          return (
            <h3
              key={key}
              className="font-display text-foreground pt-2 text-base font-semibold"
            >
              {single.trim().slice(2, -2)}
            </h3>
          );
        }

        // Bloc mixte : puces isolées au milieu d'un paragraphe.
        if (lines.some((line) => BULLET.test(line))) {
          return (
            <div key={key} className="space-y-2.5">
              {lines.map((line, lineIndex) =>
                BULLET.test(line) ? (
                  <p
                    key={`${key}-${lineIndex}`}
                    className="text-muted flex gap-3 leading-relaxed"
                  >
                    <span
                      className="bg-brand mt-[0.6rem] size-1.5 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <span>{renderInline(line.replace(BULLET, ""), `${key}-${lineIndex}`)}</span>
                  </p>
                ) : (
                  <p key={`${key}-${lineIndex}`} className="text-muted leading-relaxed">
                    {renderInline(line, `${key}-${lineIndex}`)}
                  </p>
                ),
              )}
            </div>
          );
        }

        return (
          <p key={key} className="text-muted leading-relaxed">
            {renderInline(lines.join(" "), key)}
          </p>
        );
      })}
    </div>
  );
}
