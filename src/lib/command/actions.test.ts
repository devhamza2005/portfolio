import { describe, expect, it } from "vitest";

import { buildCommands, buildLocaleCommands, filterCommands, normalize } from "@/lib/command/actions";
import { COMMAND_CATEGORIES } from "@/lib/command/types";
import type { CommandData, CommandMessages } from "@/lib/command/types";

/** Dictionnaire français — miroir de `messages/fr.json.commandPalette`. */
const T_FR: CommandMessages = {
  open: "Rechercher",
  placeholder: "Rechercher dans le portfolio…",
  empty: "Aucun résultat.",
  recent: "Récent",
  categories: { navigation: "Navigation", actions: "Actions", preferences: "Préférences" },
  labels: {
    about: "À propos",
    projects: "Projets",
    skills: "Compétences",
    experience: "Expérience",
    architecture: "Architecture",
    roadmap: "Roadmap",
    contact: "Contact",
    github: "GitHub",
    resume: "Télécharger mon CV",
    terminal: "Ouvrir le terminal",
    language: "Changer de langue",
    theme: "Changer le thème",
  },
  hints: { navigate: "Naviguer", select: "Sélectionner", close: "Fermer" },
  aria: { dialog: "Palette", close: "Fermer", input: "Rechercher", back: "Retour" },
};

/** Dictionnaire arabe — sert à prouver que la recherche ne dépend PAS de la langue du libellé. */
const T_AR: CommandMessages = {
  ...T_FR,
  labels: {
    ...T_FR.labels,
    terminal: "فتح الطرفية",
    architecture: "البنية المعمارية",
    resume: "تحميل السيرة الذاتية",
  },
};

const DATA_FULL: CommandData = {
  githubUrl: "https://github.com/devhamza2005",
  cvUrl: "https://cdn.example.com/cv.pdf",
};
const DATA_EMPTY: CommandData = { githubUrl: null, cvUrl: null };

describe("buildCommands", () => {
  it("inclut toujours les 7 actions de navigation et les 2 préférences", () => {
    const commands = buildCommands(T_FR, DATA_EMPTY);
    const nav = commands.filter((c) => c.category === "navigation");
    const prefs = commands.filter((c) => c.category === "preferences");
    expect(nav).toHaveLength(7);
    expect(prefs).toHaveLength(2);
  });

  it("n'ajoute GitHub et le CV que si les données existent", () => {
    const withoutData = buildCommands(T_FR, DATA_EMPTY);
    expect(withoutData.some((c) => c.id === "action-github")).toBe(false);
    expect(withoutData.some((c) => c.id === "action-resume")).toBe(false);
    // Le terminal reste toujours disponible, lui n'a besoin d'aucune donnée.
    expect(withoutData.some((c) => c.id === "action-terminal")).toBe(true);

    const withData = buildCommands(T_FR, DATA_FULL);
    expect(withData.some((c) => c.id === "action-github")).toBe(true);
    expect(withData.some((c) => c.id === "action-resume")).toBe(true);
  });

  it("chaque action a un identifiant unique", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    expect(new Set(commands.map((c) => c.id)).size).toBe(commands.length);
  });

  it("chaque action appartient à une catégorie déclarée", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    for (const command of commands) {
      expect(COMMAND_CATEGORIES).toContain(command.category);
    }
  });

  it("aucune action ne porte d'URL fournie par l'utilisateur — seulement des effets décrits", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    for (const command of commands) {
      // Les seules `href` proviennent de `data`, jamais d'un champ de saisie.
      if (command.effect.type === "external" || command.effect.type === "download") {
        expect([DATA_FULL.githubUrl, DATA_FULL.cvUrl]).toContain(command.effect.href);
      }
    }
  });
});

describe("buildLocaleCommands", () => {
  it("rend exactement les trois langues du site", () => {
    const commands = buildLocaleCommands();
    expect(commands.map((c) => c.id).sort()).toEqual(["locale-ar", "locale-en", "locale-fr"]);
  });

  it("chaque commande porte l'effet locale correspondant", () => {
    const commands = buildLocaleCommands();
    for (const command of commands) {
      expect(command.effect).toEqual({ type: "locale", locale: command.id.replace("locale-", "") });
    }
  });
});

describe("normalize", () => {
  it("retire les diacritiques latins", () => {
    expect(normalize("Compétences")).toBe("competences");
    expect(normalize("café")).toBe("cafe");
  });

  it("met en minuscules et rogne les espaces", () => {
    expect(normalize("  ARCHITECTURE  ")).toBe("architecture");
  });

  it("laisse le texte arabe intact — sans diacritique latin à retirer", () => {
    expect(normalize("البنية المعمارية")).toBe("البنية المعمارية");
  });

  it("est idempotente sur une chaîne déjà normalisée", () => {
    expect(normalize(normalize("Été"))).toBe(normalize("Été"));
  });
});

describe("filterCommands", () => {
  it("rend tout le catalogue, dans l'ordre, quand la requête est vide", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    expect(filterCommands(commands, "")).toEqual(commands);
    expect(filterCommands(commands, "   ")).toEqual(commands);
  });

  it("trouve une action par un mot-clé absent de son libellé (recherche arabe)", () => {
    // Le libellé de l'action est en arabe pur : aucune lettre latine. Seule la
    // recherche par mot-clé technique (« term ») peut donc la faire remonter —
    // exactement le scénario qu'un développeur arabophone rencontre.
    const commands = buildCommands(T_AR, DATA_FULL);
    const results = filterCommands(commands, "term");
    expect(results.some((c) => c.id === "action-terminal")).toBe(true);
  });

  it("trouve GitHub par le mot-clé « git »", () => {
    const commands = buildCommands(T_AR, DATA_FULL);
    const results = filterCommands(commands, "git");
    expect(results.some((c) => c.id === "action-github")).toBe(true);
  });

  it("trouve le CV par le mot-clé « cv »", () => {
    const commands = buildCommands(T_AR, DATA_FULL);
    const results = filterCommands(commands, "cv");
    expect(results.some((c) => c.id === "action-resume")).toBe(true);
  });

  it("ignore les accents dans la recherche par libellé", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    const withoutAccent = filterCommands(commands, "competences");
    const withAccent = filterCommands(commands, "compétences");
    expect(withoutAccent.map((c) => c.id)).toEqual(withAccent.map((c) => c.id));
    expect(withoutAccent.some((c) => c.id === "nav-skills")).toBe(true);
  });

  it("est insensible à la casse", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    expect(filterCommands(commands, "ARCHITECTURE")).toEqual(filterCommands(commands, "architecture"));
  });

  it("rend un tableau vide quand rien ne correspond", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    expect(filterCommands(commands, "zzzqqqxxx")).toEqual([]);
  });

  it("conserve l'ordre du catalogue plutôt qu'un classement par pertinence", () => {
    const commands = buildCommands(T_FR, DATA_FULL);
    // « a » correspond à plusieurs libellés français (« À propos », « Architecture »…) :
    // l'ordre des résultats doit rester celui du catalogue d'origine.
    const filtered = filterCommands(commands, "a");
    const expectedOrder = commands.filter((c) => filtered.some((f) => f.id === c.id));
    expect(filtered).toEqual(expectedOrder);
  });
});
