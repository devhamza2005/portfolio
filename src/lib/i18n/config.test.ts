import { describe, expect, it } from "vitest";

import {
  isLocale,
  isNoindexLocale,
  localizedPath,
  switchLocalePath,
} from "@/lib/i18n/config";

describe("isLocale", () => {
  it("reconnaît les trois locales servies", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ar")).toBe(true);
  });

  it("rejette tout le reste", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale("FR")).toBe(false);
  });
});

describe("localizedPath", () => {
  it("préfixe la racine sans double slash", () => {
    expect(localizedPath("fr")).toBe("/fr");
    expect(localizedPath("fr", "/")).toBe("/fr");
  });

  it("préfixe un chemin déjà absolu", () => {
    expect(localizedPath("en", "/projects")).toBe("/en/projects");
  });

  it("ajoute la barre oblique manquante", () => {
    expect(localizedPath("en", "projects")).toBe("/en/projects");
  });
});

describe("switchLocalePath", () => {
  it("remplace le premier segment, en conservant le reste — y compris un slug d'étude de cas", () => {
    expect(switchLocalePath("/fr/projects/parking-rfid", "en")).toBe(
      "/en/projects/parking-rfid",
    );
  });

  it("retombe sur localizedPath quand le chemin n'a pas de préfixe de locale", () => {
    expect(switchLocalePath("/projects/parking-rfid", "en")).toBe(
      "/en/projects/parking-rfid",
    );
  });

  it("gère la racine sans lever d'exception", () => {
    expect(switchLocalePath("/", "ar")).toBe("/ar");
  });

  it("change bien de locale même quand la destination est identique à la source", () => {
    expect(switchLocalePath("/fr/contact", "fr")).toBe("/fr/contact");
  });
});

describe("isNoindexLocale", () => {
  it("marque l'anglais et l'arabe comme non indexables pour l'instant", () => {
    expect(isNoindexLocale("en")).toBe(true);
    expect(isNoindexLocale("ar")).toBe(true);
  });

  it("le français reste indexable — c'est la langue source", () => {
    expect(isNoindexLocale("fr")).toBe(false);
  });
});
