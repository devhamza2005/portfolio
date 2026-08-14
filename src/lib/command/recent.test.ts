// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pushRecent, readRecent } from "@/lib/command/recent";

const KEY = "portfolio:recent-commands";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readRecent", () => {
  it("rend un tableau vide quand rien n'est stocké", () => {
    expect(readRecent()).toEqual([]);
  });

  it("rend un tableau vide sur un JSON invalide, sans lever d'exception", () => {
    window.localStorage.setItem(KEY, "{ceci n'est pas du JSON");
    expect(readRecent()).toEqual([]);
  });

  it("rend un tableau vide si la valeur stockée n'est pas un tableau", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ id: "nav-about" }));
    expect(readRecent()).toEqual([]);
  });

  it("filtre les entrées qui ne sont pas des chaînes", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["nav-about", 42, null, "action-github"]));
    expect(readRecent()).toEqual(["nav-about", "action-github"]);
  });
});

describe("pushRecent", () => {
  it("place l'identifiant en tête", () => {
    pushRecent("nav-about");
    expect(readRecent()).toEqual(["nav-about"]);
  });

  it("ne stocke jamais autre chose qu'un identifiant d'action — aucune saisie, aucune donnée personnelle", () => {
    pushRecent("nav-about");
    pushRecent("action-github");
    const stored = window.localStorage.getItem(KEY);
    expect(stored).not.toBeNull();
    const parsed: unknown = JSON.parse(stored ?? "[]");
    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as unknown[]).every((entry) => typeof entry === "string")).toBe(true);
  });

  it("déplace un identifiant déjà présent en tête, sans doublon", () => {
    pushRecent("nav-about");
    pushRecent("action-github");
    pushRecent("nav-about");
    expect(readRecent()).toEqual(["nav-about", "action-github"]);
  });

  it("borne l'historique à 3 entrées, les plus récentes en premier", () => {
    pushRecent("id-1");
    pushRecent("id-2");
    pushRecent("id-3");
    pushRecent("id-4");
    expect(readRecent()).toEqual(["id-4", "id-3", "id-2"]);
  });

  it("reste utilisable même si le stockage échoue (quota, mode privé…)", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    expect(() => pushRecent("nav-about")).not.toThrow();
    expect(pushRecent("nav-about")).toEqual(["nav-about"]);

    setItem.mockRestore();
  });
});
