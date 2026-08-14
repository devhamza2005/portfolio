import { describe, expect, it } from "vitest";

import { navHref } from "@/config/nav";

describe("navHref", () => {
  it("préfixe une ancre de la locale, en gardant le croisillon en fin d'URL", () => {
    expect(navHref("fr", "/#about")).toBe("/fr#about");
  });

  it("préfixe une page ordinaire, sans croisillon", () => {
    expect(navHref("en", "/projects")).toBe("/en/projects");
  });

  it("traite la racine comme l'accueil de la locale", () => {
    expect(navHref("ar", "/")).toBe("/ar");
  });

  it("ne produit pas de croisillon final quand le fragment est vide", () => {
    expect(navHref("fr", "/#")).toBe("/fr");
  });
});
