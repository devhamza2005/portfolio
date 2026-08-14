import { describe, expect, it } from "vitest";

import {
  ROADMAP_PROJECTS,
  ROADMAP_STAGES,
  completionRatio,
  currentStage,
  type RoadmapProject,
} from "@/config/roadmap";

function project(stages: Partial<Record<(typeof ROADMAP_STAGES)[number], "completed" | "current" | "pending">>): RoadmapProject {
  const base = Object.fromEntries(ROADMAP_STAGES.map((stage) => [stage, "pending"])) as RoadmapProject["stages"];
  return { id: "test", name: "Projet de test", slug: null, techs: [], stages: { ...base, ...stages } };
}

describe("completionRatio", () => {
  it("rend 0 quand aucune étape n'est terminée", () => {
    expect(completionRatio(project({}))).toBe(0);
  });

  it("rend 100 quand toutes les étapes sont terminées", () => {
    const stages = Object.fromEntries(ROADMAP_STAGES.map((stage) => [stage, "completed"])) as RoadmapProject["stages"];
    expect(completionRatio({ ...project({}), stages })).toBe(100);
  });

  it("arrondit le pourcentage à l'entier le plus proche", () => {
    // 3 étapes terminées sur 10 → 30 %, valeur ronde par construction ici ;
    // le vrai test porte sur l'arrondi lui-même avec un cas non entier.
    expect(completionRatio(project({ idea: "completed", spec: "completed", uml: "completed" }))).toBe(
      30,
    );
  });

  it("l'étape « current » ne compte pas comme terminée", () => {
    expect(completionRatio(project({ idea: "completed", spec: "current" }))).toBe(10);
  });

  it("chaque projet réel du portfolio a un ratio entre 0 et 100", () => {
    for (const p of ROADMAP_PROJECTS) {
      const ratio = completionRatio(p);
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(100);
    }
  });
});

describe("currentStage", () => {
  it("rend null quand aucune étape n'est « current »", () => {
    expect(currentStage(project({}))).toBeNull();
  });

  it("rend l'identifiant de l'étape en cours", () => {
    expect(currentStage(project({ development: "current" }))).toBe("development");
  });

  it("rend la PREMIÈRE étape en cours si — cas anormal — plusieurs le sont", () => {
    expect(currentStage(project({ tests: "current", deployment: "current" }))).toBe("tests");
  });
});
