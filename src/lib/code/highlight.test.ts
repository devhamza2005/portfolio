import { describe, expect, it } from "vitest";

import { highlight } from "@/lib/code/highlight";

describe("highlight — sûreté", () => {
  it("ne fait jamais que découper le texte — jamais l'exécuter", () => {
    // Le code affiché contient volontairement des motifs dangereux : le test
    // vérifie que la sortie reste des JETONS DE TEXTE, jamais une évaluation.
    const lines = highlight('eval("alert(1)")', "javascript");
    const rebuilt = lines[0]?.map((token) => token.text).join("");
    expect(rebuilt).toBe('eval("alert(1)")');
  });

  it("ne perd et n'ajoute aucun caractère — chaque ligne se reconstruit à l'identique", () => {
    const source = "const x = 1;\nfunction f() { return x; }";
    const lines = highlight(source, "javascript");
    const rebuilt = lines.map((line) => line.map((token) => token.text).join("")).join("\n");
    expect(rebuilt).toBe(source);
  });
});

describe("highlight — ordre des alternatives (régression documentée)", () => {
  it("ne confond pas un « // » à l'intérieur d'une chaîne avec un commentaire", () => {
    // C'est exactement le cas que l'auteur du lexer a documenté : sans
    // l'ordre « chaînes avant commentaires », la moitié de la ligne bascule
    // en commentaire à partir du premier « // » rencontré dans l'URL.
    const [line] = highlight('const url = "http://example.com";', "javascript");
    const stringToken = line?.find((token) => token.tone === "string");
    expect(stringToken?.text).toBe('"http://example.com"');

    const commentToken = line?.find((token) => token.tone === "comment");
    expect(commentToken).toBeUndefined();
  });

  it("reconnaît bien un commentaire réel, hors chaîne", () => {
    const [line] = highlight("const x = 1; // un commentaire", "javascript");
    const commentToken = line?.find((token) => token.tone === "comment");
    expect(commentToken?.text).toBe("// un commentaire");
  });
});

describe("highlight — classification", () => {
  it("reconnaît les mots-clés du langage", () => {
    const [line] = highlight("const x = 1;", "javascript");
    const keyword = line?.find((token) => token.text === "const");
    expect(keyword?.tone).toBe("keyword");
  });

  it("classe un identifiant suivi d'une parenthèse comme un appel de fonction", () => {
    const [line] = highlight("maFonction();", "javascript");
    const call = line?.find((token) => token.text === "maFonction");
    expect(call?.tone).toBe("fn");
  });

  it("classe un identifiant commençant par une majuscule comme un type", () => {
    const [line] = highlight("const p: Profile = {};", "typescript");
    const type = line?.find((token) => token.text === "Profile");
    expect(type?.tone).toBe("type");
  });

  it("reconnaît les annotations pour les langages qui en ont", () => {
    const [line] = highlight("@Service", "java");
    expect(line?.[0]).toEqual({ text: "@Service", tone: "annotation" });
  });

  it("n'invente pas d'annotation pour un langage qui n'en a pas (SQL)", () => {
    const lines = highlight("SELECT * FROM users", "sql");
    const hasAnnotation = lines.flat().some((token) => token.tone === "annotation");
    expect(hasAnnotation).toBe(false);
  });

  it("respecte le marqueur de commentaire propre à chaque langage", () => {
    const [pythonLine] = highlight("# commentaire python", "python");
    expect(pythonLine?.[0]?.tone).toBe("comment");

    const [sqlLine] = highlight("-- commentaire sql", "sql");
    expect(sqlLine?.[0]?.tone).toBe("comment");
  });

  it("reconnaît les nombres", () => {
    const [line] = highlight("const n = 42;", "javascript");
    const number = line?.find((token) => token.text === "42");
    expect(number?.tone).toBe("number");
  });
});

describe("highlight — cas limites", () => {
  it("rend un tableau vide pour une ligne vide", () => {
    expect(highlight("", "javascript")).toEqual([[]]);
  });

  it("rend une ligne par ligne source, y compris les lignes blanches intermédiaires", () => {
    const lines = highlight("a\n\nb", "javascript");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toEqual([]);
  });
});
