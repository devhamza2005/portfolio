import { describe, expect, it } from "vitest";

import { extractGithubUsername } from "@/lib/github/username";

describe("extractGithubUsername", () => {
  it("extrait le nom d'utilisateur d'une URL de profil valide", () => {
    expect(extractGithubUsername("https://github.com/devhamza2005")).toBe("devhamza2005");
  });

  it("tolère une barre oblique finale", () => {
    expect(extractGithubUsername("https://github.com/devhamza2005/")).toBe("devhamza2005");
  });

  it("accepte le sous-domaine www", () => {
    expect(extractGithubUsername("https://www.github.com/devhamza2005")).toBe("devhamza2005");
  });

  it("ne retient que le premier segment — pas un chemin vers un dépôt", () => {
    expect(extractGithubUsername("https://github.com/devhamza2005/portfolio")).toBe(
      "devhamza2005",
    );
  });

  it("rejette un hôte qui n'est pas github.com", () => {
    expect(extractGithubUsername("https://gitlab.com/devhamza2005")).toBeNull();
    expect(extractGithubUsername("https://not-github.com/devhamza2005")).toBeNull();
  });

  it("rejette les chemins réservés de GitHub, jamais des profils personnels", () => {
    expect(extractGithubUsername("https://github.com/sponsors")).toBeNull();
    expect(extractGithubUsername("https://github.com/orgs")).toBeNull();
    expect(extractGithubUsername("https://github.com/marketplace")).toBeNull();
  });

  it("rejette une valeur qui n'est pas une URL", () => {
    expect(extractGithubUsername("devhamza2005")).toBeNull();
    expect(extractGithubUsername("pas une url du tout")).toBeNull();
  });

  it("rejette null, undefined et la chaîne vide", () => {
    expect(extractGithubUsername(null)).toBeNull();
    expect(extractGithubUsername(undefined)).toBeNull();
    expect(extractGithubUsername("")).toBeNull();
  });

  it("rejette un nom d'utilisateur avec des caractères invalides", () => {
    expect(extractGithubUsername("https://github.com/dev_hamza")).toBeNull();
    expect(extractGithubUsername("https://github.com/dev.hamza")).toBeNull();
  });

  it("rejette les tirets consécutifs, invalides côté GitHub", () => {
    expect(extractGithubUsername("https://github.com/dev--hamza")).toBeNull();
  });

  it("rejette un nom d'utilisateur de plus de 39 caractères", () => {
    expect(extractGithubUsername(`https://github.com/${"a".repeat(40)}`)).toBeNull();
  });

  it("accepte un nom d'utilisateur à la longueur maximale (39 caractères)", () => {
    const username = "a".repeat(39);
    expect(extractGithubUsername(`https://github.com/${username}`)).toBe(username);
  });
});
