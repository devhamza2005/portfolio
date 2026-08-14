import { describe, expect, it } from "vitest";

import { COMMAND_NAMES, COMMANDS, runCommand } from "@/lib/terminal/commands";
import type { CommandContext, TerminalData, TerminalMessages } from "@/lib/terminal/types";

/**
 * Fixtures minimales mais réalistes — les mêmes formes que celles produites
 * par `getTerminalData()` (src/server/queries/terminal.ts), sans toucher au
 * serveur ni à la base : ces commandes sont des fonctions pures.
 */
const DATA: TerminalData = {
  name: "Hamza Fanoune",
  headline: "Développeur full-stack",
  location: "Casablanca",
  email: "hamza@example.com",
  cvUrl: "https://cdn.example.com/cv.pdf",
  githubUrl: "https://github.com/devhamza2005",
  techs: ["Next.js", "Spring Boot"],
  skillGroups: [{ name: "Backend", skills: ["Java", "Spring Boot"] }],
  projects: [
    { slug: "convention-management", title: "Gestion des conventions" },
    { slug: "", title: "Projet sans étude de cas" },
  ],
  experiences: [{ company: "ACME", role: "Développeur", period: "2024 — aujourd'hui" }],
  architectureViews: [
    { id: "monolith", name: "Monolithe" },
    { id: "rest", name: "API REST" },
  ],
  roadmapProjects: [{ name: "Portfolio", progress: 80 }],
};

const T: TerminalMessages = {
  welcome: "Terminal",
  hint: "Tapez help",
  availableCommands: "Commandes disponibles :",
  notFound: "Commande inconnue",
  notFoundHint: "Tapez help",
  usage: "Utilisation : open <n>",
  unknownProject: "Ce projet n'existe pas",
  comingSoon: "Étude de cas à venir",
  opening: "ouverture…",
  noCv: "Aucun CV disponible",
  noGithub: "Aucun profil GitHub",
  descriptions: {
    help: "liste les commandes",
    about: "qui je suis",
    skills: "mes compétences",
    projects: "mes projets",
    experience: "mon parcours",
    architecture: "les architectures",
    roadmap: "avancement",
    github: "mon GitHub",
    resume: "télécharger mon CV",
    contact: "me contacter",
    clear: "efface l'écran",
    exit: "ferme le terminal",
  },
  labels: {
    skills: "Compétences",
    projects: "Projets",
    experience: "Parcours",
    architecture: "Architecture Lab",
    roadmap: "Roadmap",
    availableArchitectures: "Architectures disponibles :",
    progress: "terminé",
    close: "Fermer",
    inputAria: "Saisie",
  },
};

function context(overrides: Partial<CommandContext> = {}): CommandContext {
  return { args: [], data: DATA, t: T, localePrefix: "/fr", ...overrides };
}

describe("runCommand — commande inconnue", () => {
  it("rend une erreur, jamais une interprétation", () => {
    const result = runCommand("sudo", context());
    expect(result.action).toBeUndefined();
    expect(result.lines[0]).toEqual({ kind: "error", text: `${T.notFound}: sudo` });
    expect(result.lines[1]?.text).toBe(T.notFoundHint);
  });

  it("rejette toute tentative de commande système", () => {
    for (const attempt of ["rm", "curl", "eval", "exec", "child_process"]) {
      const result = runCommand(attempt, context());
      expect(result.lines[0]?.kind).toBe("error");
      expect(result.action).toBeUndefined();
    }
  });
});

describe("runCommand — help", () => {
  it("liste toutes les commandes visibles avec leur description", () => {
    const result = runCommand("help", context());
    const text = result.lines.map((line) => line.text).join("\n");

    for (const command of COMMANDS) {
      if (command.hidden) continue;
      expect(text).toContain(command.name);
    }
  });

  it("n'expose jamais la commande cachée `open`", () => {
    const result = runCommand("help", context());
    const text = result.lines.map((line) => line.text).join("\n");
    // `open` ne doit apparaître nulle part en tête de ligne de la liste.
    expect(result.lines.some((line) => /^open\s/.test(line.text))).toBe(false);
    expect(COMMAND_NAMES).toContain("open");
    expect(text).toBeTruthy();
  });
});

describe("runCommand — about / skills / projects / experience / roadmap", () => {
  it("about affiche le nom et l'accroche", () => {
    const result = runCommand("about", context());
    expect(result.lines[0]).toEqual({ kind: "heading", text: DATA.name });
    expect(result.lines[1]).toEqual({ kind: "accent", text: DATA.headline });
  });

  it("skills ne casse pas sur une liste vide", () => {
    const result = runCommand("skills", context({ data: { ...DATA, skillGroups: [] } }));
    expect(result.lines).toEqual([{ kind: "heading", text: T.labels.skills }, { kind: "text", text: "" }]);
  });

  it("projects numérote à partir de 01", () => {
    const result = runCommand("projects", context());
    const items = result.lines.filter((line) => line.kind === "item").map((line) => line.text);
    expect(items[0]).toMatch(/^\[01\]/);
    expect(items[1]).toMatch(/^\[02\]/);
  });

  it("experience affiche chaque poste avec sa période", () => {
    const result = runCommand("experience", context());
    const text = result.lines.map((line) => line.text).join(" ");
    expect(text).toContain("ACME");
    expect(text).toContain("2024 — aujourd'hui");
  });

  it("roadmap affiche la progression de chaque projet", () => {
    const result = runCommand("roadmap", context());
    const text = result.lines.map((line) => line.text).join("\n");
    expect(text).toContain("80%");
    expect(text).toContain("Portfolio");
  });
});

describe("runCommand — architecture", () => {
  it("liste les vues disponibles, numérotées", () => {
    const result = runCommand("architecture", context());
    const text = result.lines.map((line) => line.text).join("\n");
    expect(text).toContain("[01]");
    expect(text).toContain("Monolithe");
    expect(text).toContain("[02]");
    expect(text).toContain("API REST");
  });
});

describe("runCommand — github", () => {
  it("rend une erreur si aucun profil n'est configuré", () => {
    const result = runCommand("github", context({ data: { ...DATA, githubUrl: null } }));
    expect(result.lines).toEqual([{ kind: "error", text: T.noGithub }]);
    expect(result.action).toBeUndefined();
  });

  it("rend une action externe vers l'URL du profil quand elle existe", () => {
    const result = runCommand("github", context());
    expect(result.action).toEqual({ type: "external", href: DATA.githubUrl });
  });
});

describe("runCommand — resume", () => {
  it("rend une erreur si aucun CV n'est disponible", () => {
    const result = runCommand("resume", context({ data: { ...DATA, cvUrl: null } }));
    expect(result.lines).toEqual([{ kind: "error", text: T.noCv }]);
    expect(result.action).toBeUndefined();
  });

  it("rend une action de téléchargement vers le CV existant", () => {
    const result = runCommand("resume", context());
    expect(result.action).toEqual({ type: "download", href: DATA.cvUrl });
  });
});

describe("runCommand — contact / clear / exit", () => {
  it("contact navigue vers l'ancre #contact, préfixée de la langue", () => {
    const result = runCommand("contact", context({ localePrefix: "/ar" }));
    expect(result.action).toEqual({ type: "navigate", href: "/ar/#contact" });
  });

  it("clear rend une action clear et aucune ligne", () => {
    const result = runCommand("clear", context());
    expect(result).toEqual({ lines: [], action: { type: "clear" } });
  });

  it("exit rend une action close et aucune ligne", () => {
    const result = runCommand("exit", context());
    expect(result).toEqual({ lines: [], action: { type: "close" } });
  });
});

describe("runCommand — open", () => {
  it("sans argument, rappelle l'usage", () => {
    const result = runCommand("open", context({ args: [] }));
    expect(result.lines[0]).toEqual({ kind: "error", text: T.usage });
  });

  it("open roadmap navigue vers l'ancre roadmap", () => {
    const result = runCommand("open", context({ args: ["roadmap"] }));
    expect(result.action).toEqual({ type: "navigate", href: "/fr/#roadmap" });
  });

  it("open architecture <n> valide bascule la vue correspondante", () => {
    const result = runCommand("open", context({ args: ["architecture", "2"] }));
    expect(result.action).toEqual({ type: "architecture", view: "rest" });
  });

  it("open architecture <n> hors plage rend une erreur, pas un crash", () => {
    const result = runCommand("open", context({ args: ["architecture", "99"] }));
    expect(result.action).toBeUndefined();
    expect(result.lines[0]?.kind).toBe("error");
  });

  it("open <n> vers un projet publié navigue vers son étude de cas", () => {
    const result = runCommand("open", context({ args: ["1"] }));
    expect(result.action).toEqual({
      type: "navigate",
      href: "/fr/projects/convention-management",
    });
  });

  it("open <n> vers un projet sans slug annonce « à venir » sans navigation", () => {
    const result = runCommand("open", context({ args: ["2"] }));
    expect(result.action).toBeUndefined();
    expect(result.lines).toEqual([{ kind: "muted", text: T.comingSoon }]);
  });

  it("open <n> hors plage rend l'erreur « projet inconnu »", () => {
    const result = runCommand("open", context({ args: ["99"] }));
    expect(result.action).toBeUndefined();
    expect(result.lines).toEqual([{ kind: "error", text: T.unknownProject }]);
  });

  it("open 0 est invalide (index à partir de 1)", () => {
    const result = runCommand("open", context({ args: ["0"] }));
    expect(result.lines).toEqual([{ kind: "error", text: T.unknownProject }]);
  });
});

describe("COMMAND_NAMES", () => {
  it("contient un nom par commande, sans doublon", () => {
    expect(new Set(COMMAND_NAMES).size).toBe(COMMAND_NAMES.length);
    expect(COMMAND_NAMES.length).toBe(COMMANDS.length);
  });
});
