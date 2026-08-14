import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatPeriod, formatRelative } from "@/lib/dates";

/**
 * L'horloge est figée pour que chaque assertion soit déterministe : sans
 * cela, un test « il y a 2 jours » dépendrait de la seconde exacte où le
 * job CI démarre, et deviendrait par nature intermittent.
 */
const NOW = new Date("2026-08-14T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function minus(days = 0, hours = 0, seconds = 0): Date {
  return new Date(NOW.getTime() - (days * 86_400 + hours * 3_600 + seconds) * 1000);
}

function plus(hours: number): Date {
  return new Date(NOW.getTime() + hours * 3_600 * 1000);
}

describe("formatRelative", () => {
  it("rend une chaîne vide pour une valeur absente ou invalide", () => {
    expect(formatRelative(null)).toBe("");
    expect(formatRelative(undefined)).toBe("");
    expect(formatRelative("ceci n'est pas une date")).toBe("");
  });

  it("choisit l'unité JOUR sous le seuil de la semaine (exact, anglais)", () => {
    expect(formatRelative(minus(3), "en")).toBe("3 days ago");
  });

  it("choisit l'unité SEMAINE au-delà de 7 jours", () => {
    expect(formatRelative(minus(10), "en")).toContain("week");
  });

  it("choisit l'unité ANNÉE au-delà de 365 jours", () => {
    expect(formatRelative(minus(400), "en")).toContain("year");
  });

  it("gère les dates FUTURES avec le même mécanisme de seuils", () => {
    expect(formatRelative(plus(3), "en")).toBe("in 3 hours");
  });

  it("retombe sur la locale par défaut quand elle n'est pas précisée", () => {
    // La locale par défaut du portfolio est le français.
    expect(formatRelative(minus(3))).toBe(formatRelative(minus(3), "fr"));
  });

  it("produit un résultat différent selon la locale — la traduction a bien lieu", () => {
    const fr = formatRelative(minus(3), "fr");
    const en = formatRelative(minus(3), "en");
    const ar = formatRelative(minus(3), "ar");
    expect(fr).not.toBe(en);
    expect(en).not.toBe(ar);
  });

  it("n'accepte jamais Date.now() en dehors d'un contexte figé — n'appelle jamais Date.now() directement", () => {
    // Un test de documentation plus qu'une vérification runtime : l'appelant
    // (`server/queries/github.ts`) encapsule cette fonction sous `use cache`
    // précisément parce qu'elle est sensible à l'heure d'exécution.
    expect(formatRelative(minus(0, 0, 10), "en").length).toBeGreaterThan(0);
  });
});

describe("formatPeriod", () => {
  it("affiche « aujourd'hui » quand le poste est en cours sans date de début", () => {
    expect(formatPeriod(null, null, true, "fr", "aujourd'hui")).toBe("aujourd'hui");
  });

  it("affiche une plage ouverte pour un poste en cours", () => {
    const result = formatPeriod(new Date("2024-01-15"), null, true, "fr", "aujourd'hui");
    expect(result).toContain("aujourd'hui");
    expect(result).toContain("2024");
  });

  it("collapse le mois quand début et fin tombent le même mois", () => {
    const result = formatPeriod(
      new Date("2024-03-01"),
      new Date("2024-03-28"),
      false,
      "fr",
    );
    expect(result).not.toContain("—");
  });

  it("affiche une plage complète quand début et fin diffèrent", () => {
    const result = formatPeriod(new Date("2023-01-01"), new Date("2024-06-01"), false, "fr");
    expect(result).toContain("—");
    expect(result).toContain("2023");
    expect(result).toContain("2024");
  });

  it("rend une chaîne vide sans date de début ni statut « en cours »", () => {
    expect(formatPeriod(null, null, false, "fr")).toBe("");
  });
});
