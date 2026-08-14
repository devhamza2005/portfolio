import { describe, expect, it } from "vitest";

import { complete, formatIndex, parseCommand, parseIndex } from "@/lib/terminal/parser";

describe("parseCommand", () => {
  it("rend un résultat vide pour une saisie vide ou faite d'espaces", () => {
    expect(parseCommand("")).toEqual({ name: "", args: [], raw: "" });
    expect(parseCommand("   ")).toEqual({ name: "", args: [], raw: "" });
  });

  it("met le nom en minuscules et découpe les arguments", () => {
    expect(parseCommand("HELP")).toEqual({ name: "help", args: [], raw: "HELP" });
    expect(parseCommand("open architecture 2")).toEqual({
      name: "open",
      args: ["architecture", "2"],
      raw: "open architecture 2",
    });
  });

  it("met aussi les arguments en minuscules", () => {
    expect(parseCommand("open ARCHITECTURE").args).toEqual(["architecture"]);
  });

  it("collapse les espaces multiples et rogne les extrémités", () => {
    expect(parseCommand("  open    01  ")).toEqual({
      name: "open",
      args: ["01"],
      raw: "open 01",
    });
  });

  it("plafonne la longueur de la saisie à 200 caractères", () => {
    const parsed = parseCommand("a".repeat(500));
    expect(parsed.raw.length).toBeLessThanOrEqual(200);
  });

  it("plafonne le nombre d'arguments retenus à 4", () => {
    const parsed = parseCommand("cmd un deux trois quatre cinq six");
    expect(parsed.args).toHaveLength(4);
    expect(parsed.args).toEqual(["un", "deux", "trois", "quatre"]);
  });

  it("n'interprète jamais la saisie — un shell factice resterait du texte", () => {
    // Le seul comportement attendu : découpage et casse, rien d'autre.
    // Un `;` ou un `|` ne doivent jamais produire plusieurs commandes.
    expect(parseCommand("rm -rf / ; echo pwned")).toEqual({
      name: "rm",
      args: ["-rf", "/", ";", "echo"],
      raw: "rm -rf / ; echo pwned",
    });
  });
});

describe("complete", () => {
  const NAMES = ["help", "about", "architecture", "achievements", "roadmap"] as const;

  it("rend null pour une saisie vide", () => {
    expect(complete("", NAMES)).toEqual({ completion: null, candidates: [] });
  });

  it("complète directement quand une seule commande correspond", () => {
    expect(complete("hel", NAMES)).toEqual({ completion: "help", candidates: [] });
  });

  it("liste les candidates sans compléter en cas d'ambiguïté", () => {
    const result = complete("a", NAMES);
    expect(result.completion).toBeNull();
    expect(result.candidates.sort()).toEqual(["about", "achievements", "architecture"]);
  });

  it("ne complète jamais après un espace — l'argument n'est pas une commande", () => {
    expect(complete("open a", NAMES)).toEqual({ completion: null, candidates: [] });
  });

  it("est insensible à la casse", () => {
    expect(complete("HEL", NAMES)).toEqual({ completion: "help", candidates: [] });
  });

  it("ne rend rien quand aucune commande ne correspond", () => {
    expect(complete("zzz", NAMES)).toEqual({ completion: null, candidates: [] });
  });
});

describe("parseIndex", () => {
  it("accepte des index à un, deux ou trois chiffres", () => {
    expect(parseIndex("1")).toBe(1);
    expect(parseIndex("01")).toBe(1);
    expect(parseIndex("003")).toBe(3);
    expect(parseIndex("999")).toBe(999);
  });

  it("rejette zéro et les valeurs non numériques", () => {
    expect(parseIndex("0")).toBeNull();
    expect(parseIndex("00")).toBeNull();
    expect(parseIndex("abc")).toBeNull();
    expect(parseIndex("-1")).toBeNull();
    expect(parseIndex("1.5")).toBeNull();
  });

  it("rejette les entrées trop longues (4 chiffres et plus)", () => {
    expect(parseIndex("1234")).toBeNull();
  });

  it("rend null pour une valeur absente", () => {
    expect(parseIndex(undefined)).toBeNull();
    expect(parseIndex("")).toBeNull();
  });
});

describe("formatIndex", () => {
  it("complète sur deux chiffres", () => {
    expect(formatIndex(1)).toBe("01");
    expect(formatIndex(9)).toBe("09");
  });

  it("ne tronque pas au-delà de deux chiffres", () => {
    expect(formatIndex(123)).toBe("123");
  });

  it("est l'inverse de parseIndex sur la plage valide", () => {
    for (const n of [1, 7, 42, 99]) {
      expect(parseIndex(formatIndex(n))).toBe(n);
    }
  });
});
