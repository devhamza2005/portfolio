import { ImageResponse } from "next/og";

/**
 * Icône applicative — /icon
 *
 * Le monogramme « HF » redessiné pour un rendu bitmap : le tracé SVG du
 * composant `Monogram` s'appuie sur les variables CSS du thème, qui n'existent
 * pas dans le contexte de génération d'image. Les couleurs sont donc reprises
 * en dur depuis la palette de globals.css (`--hf-brand-500`, `--hf-accent-500`).
 *
 * 192 × 192 : la taille attendue par le manifeste, et suffisante pour tous les
 * usages modernes. `favicon.ico` reste en place pour les navigateurs anciens.
 *
 * Généré à la compilation, sans police externe ni appel réseau — donc
 * déterministe : deux builds produisent la même image.
 */
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

const MARQUE = "#5b8cff";
const ACCENT = "#22d3ee";
const FOND = "#08090d";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: FOND,
        }}
      >
        <svg width="192" height="192" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="hf" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor={MARQUE} />
              <stop offset="1" stopColor={ACCENT} />
            </linearGradient>
          </defs>
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="11"
            stroke="url(#hf)"
            strokeWidth="2"
            opacity="0.6"
          />
          {/* H */}
          <path d="M13 14v20M13 24h8M21 14v20" stroke="url(#hf)" strokeWidth="3.4" strokeLinecap="round" />
          {/* F */}
          <path
            d="M28 34V14h8M28 24h6.5"
            stroke="url(#hf)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
