import { ImageResponse } from "next/og";

/**
 * Icône Apple Touch — /apple-icon
 *
 * 180 × 180, la taille attendue par iOS. Deux différences assumées avec
 * `icon.tsx` : iOS applique lui-même le masque arrondi, donc aucun cadre n'est
 * dessiné, et le monogramme est légèrement réduit pour respecter la marge de
 * sécurité imposée par ce masque.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARQUE = "#ff3b30";
const ACCENT = "#e50914";
const FOND = "#050505";

export default function AppleIcon() {
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
        <svg width="124" height="124" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="hf-ios" x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor={MARQUE} />
              <stop offset="1" stopColor={ACCENT} />
            </linearGradient>
          </defs>
          {/* H */}
          <path
            d="M13 14v20M13 24h8M21 14v20"
            stroke="url(#hf-ios)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* F */}
          <path
            d="M28 34V14h8M28 24h6.5"
            stroke="url(#hf-ios)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
