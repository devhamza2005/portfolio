import { describe, expect, it } from "vitest";

import { intlLocale, interpolate } from "@/lib/i18n/format";

describe("interpolate", () => {
  it("substitue une variable connue", () => {
    expect(interpolate("Bonjour {name}", { name: "Hamza" })).toBe("Bonjour Hamza");
  });

  it("substitue plusieurs variables", () => {
    expect(interpolate("{count} sur {total}", { count: 3, total: 10 })).toBe("3 sur 10");
  });

  it("laisse l'espace réservé intact quand la variable est absente", () => {
    // Comportement volontaire : un espace réservé orphelin doit rester visible
    // plutôt que disparaître silencieusement, sans quoi une clé de traduction
    // mal renseignée passerait inaperçue.
    expect(interpolate("Bonjour {name}", {})).toBe("Bonjour {name}");
  });

  it("n'altère pas un texte sans espace réservé", () => {
    expect(interpolate("Aucune variable ici.", { name: "Hamza" })).toBe("Aucune variable ici.");
  });
});

describe("intlLocale", () => {
  it("associe chaque locale à son étiquette BCP 47", () => {
    expect(intlLocale("fr")).toBe("fr-FR");
    expect(intlLocale("en")).toBe("en-US");
    expect(intlLocale("ar")).toBe("ar-MA");
  });

  it("retombe sur la locale par défaut sans argument", () => {
    expect(intlLocale()).toBe(intlLocale("fr"));
  });
});
