import { describe, expect, it } from "vitest";

import { ARCHITECTURE_NODES, ARCHITECTURE_VIEWS, USED_NODE_IDS } from "@/config/architecture";

/**
 * `tiers` (dans `ARCHITECTURE_VIEWS`) n'est typé qu'en `string[]` — TypeScript
 * ne peut pas détecter un identifiant de nœud mal orthographié référencé dans
 * une vue. C'est exactement le genre d'erreur que seul un test à l'exécution
 * peut attraper avant qu'elle n'atteigne l'Architecture Lab.
 */
describe("cohérence des vues d'architecture", () => {
  it("chaque nœud référencé par une vue existe dans le catalogue", () => {
    for (const id of USED_NODE_IDS) {
      expect(ARCHITECTURE_NODES[id]).toBeDefined();
    }
  });

  it("USED_NODE_IDS ne contient aucun doublon", () => {
    expect(new Set(USED_NODE_IDS).size).toBe(USED_NODE_IDS.length);
  });

  it("chaque vue a au moins un étage, et chaque étage au moins un nœud", () => {
    for (const view of ARCHITECTURE_VIEWS) {
      expect(view.tiers.length).toBeGreaterThan(0);
      for (const tier of view.tiers) {
        expect(tier.length).toBeGreaterThan(0);
      }
    }
  });

  it("aucune vue ne porte un identifiant en double", () => {
    const ids = ARCHITECTURE_VIEWS.map((view) => view.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
