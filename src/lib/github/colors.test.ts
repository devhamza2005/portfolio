import { describe, expect, it } from "vitest";

import { FALLBACK_LANGUAGE_COLOR, LANGUAGE_COLORS, languageColor } from "@/lib/github/colors";

describe("languageColor", () => {
  it("rend la couleur conventionnelle d'un langage connu", () => {
    expect(languageColor("TypeScript")).toBe("#3178c6");
    expect(languageColor("Python")).toBe("#3572A5");
  });

  it("rend une couleur neutre — un jeton existant, pas une teinte inventée — pour un langage inconnu", () => {
    expect(languageColor("COBOL")).toBe(FALLBACK_LANGUAGE_COLOR);
    expect(languageColor("")).toBe(FALLBACK_LANGUAGE_COLOR);
  });

  it("respecte la casse exacte du nom GitHub — comportement documenté, pas une normalisation", () => {
    expect(languageColor("typescript")).toBe(FALLBACK_LANGUAGE_COLOR);
  });

  it("chaque couleur déclarée est un code hexadécimal valide", () => {
    for (const color of Object.values(LANGUAGE_COLORS)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
