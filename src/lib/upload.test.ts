import { describe, expect, it } from "vitest";

import { MIME_EXTENSIONS, sanitizeFileBaseName } from "@/lib/upload";

/**
 * `sanitizeFileBaseName` est au cœur du correctif du bouton CV (§ diagnostic) :
 * un nom de fichier téléversé doit toujours produire une base stable et sûre,
 * pour que l'extension ajoutée ensuite par les fournisseurs de stockage
 * (Cloudinary, local) retombe sur un fichier réellement reconnu par le
 * navigateur qui le télécharge.
 */
describe("sanitizeFileBaseName", () => {
  it("retire l'extension d'origine", () => {
    expect(sanitizeFileBaseName("CV Hamza Fanoune.pdf")).toBe("cv-hamza-fanoune");
  });

  it("retire les diacritiques", () => {
    expect(sanitizeFileBaseName("Étude de cas — Été.pdf")).toBe("etude-de-cas-ete");
  });

  it("réduit tout caractère non alphanumérique à un tiret", () => {
    expect(sanitizeFileBaseName("mon fichier (v2)!!.png")).toBe("mon-fichier-v2");
  });

  it("retire les tirets en début et fin de chaîne", () => {
    expect(sanitizeFileBaseName("---fichier---.pdf")).toBe("fichier");
  });

  it("ne garde qu'une seule extension — un nom avec plusieurs points", () => {
    // `file.name` peut légitimement contenir des points ; seul le DERNIER
    // segment est traité comme extension.
    expect(sanitizeFileBaseName("rapport.v2.final.pdf")).toBe("rapport-v2-final");
  });

  it("rend une chaîne vide pour un nom sans caractère alphanumérique", () => {
    expect(sanitizeFileBaseName("____.pdf")).toBe("");
  });

  it("tronque à la longueur maximale demandée", () => {
    const long = "a".repeat(200) + ".pdf";
    expect(sanitizeFileBaseName(long, 48)).toHaveLength(48);
  });

  it("respecte la longueur par défaut de 48 caractères", () => {
    const long = "b".repeat(100) + ".pdf";
    expect(sanitizeFileBaseName(long)).toHaveLength(48);
  });
});

describe("MIME_EXTENSIONS", () => {
  it("associe le PDF à .pdf — la régression exacte du bouton CV", () => {
    expect(MIME_EXTENSIONS["application/pdf"]).toBe(".pdf");
  });

  it("couvre tous les formats d'image acceptés par le téléversement", () => {
    for (const mime of ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]) {
      expect(MIME_EXTENSIONS[mime]).toMatch(/^\.[a-z]+$/);
    }
  });

  it("rend undefined pour un type MIME non pris en charge", () => {
    expect(MIME_EXTENSIONS["application/zip"]).toBeUndefined();
  });
});
