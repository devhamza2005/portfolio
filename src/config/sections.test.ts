import { describe, expect, it } from "vitest";

import { HOME_SECTIONS, sectionIndex } from "@/config/sections";

/**
 * Ce fichier existe précisément pour supprimer une classe de bug déjà vécue :
 * des numéros de section écrits en dur, désynchronisés dès qu'une section
 * s'insère au milieu (voir l'en-tête de `sections.ts`). Le test vérifie donc
 * la PROPRIÉTÉ, pas une valeur figée — il continue de protéger le prochain
 * ajout de section sans jamais devenir lui-même le point qu'il faut retoucher.
 */
describe("sectionIndex", () => {
  it("correspond exactement à la position de chaque section dans HOME_SECTIONS", () => {
    HOME_SECTIONS.forEach((id, position) => {
      expect(sectionIndex(id)).toBe(String(position + 1).padStart(2, "0"));
    });
  });

  it("rend toujours deux chiffres, même pour la première section", () => {
    expect(sectionIndex(HOME_SECTIONS[0]!)).toBe("01");
  });
});

describe("HOME_SECTIONS", () => {
  it("ne contient aucun identifiant en double", () => {
    expect(new Set(HOME_SECTIONS).size).toBe(HOME_SECTIONS.length);
  });

  it("n'est jamais vide", () => {
    expect(HOME_SECTIONS.length).toBeGreaterThan(0);
  });
});
