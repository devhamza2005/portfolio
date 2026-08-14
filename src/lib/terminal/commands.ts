import { formatIndex, parseIndex } from "@/lib/terminal/parser";
import type {
  CommandContext,
  CommandResult,
  TerminalCommand,
  TerminalLine,
} from "@/lib/terminal/types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGISTRE DES COMMANDES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Chaque commande est une fonction PURE : même contexte, même sortie. Aucune
 * ne touche au DOM, au routeur ni au réseau — quand une navigation est
 * nécessaire, elle rend une `action` que le composant exécutera.
 *
 * ⚠️ Ce fichier est le SEUL point d'entrée des saisies du visiteur, et il ne
 * fait qu'y chercher un nom dans une table. Une saisie inconnue rend une
 * erreur ; elle n'est jamais interprétée, jamais évaluée, jamais transmise
 * ailleurs.
 *
 * Les données affichées proviennent du portfolio réel (profil, projets,
 * compétences, expériences, vues d'architecture, roadmap) : rien n'est
 * recopié à la main ici.
 */

const line = (kind: TerminalLine["kind"], text: string): TerminalLine => ({ kind, text });

/** Lien interne, préfixé de la langue courante. */
function internal(context: CommandContext, path: string): string {
  return `${context.localePrefix}${path}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   help
   ───────────────────────────────────────────────────────────────────────── */

const help: TerminalCommand = {
  name: "help",
  run: ({ t }) => {
    const lines: TerminalLine[] = [line("heading", t.availableCommands), line("text", "")];

    for (const command of COMMANDS) {
      if (command.hidden) continue;
      const description = t.descriptions[command.name] ?? "";
      lines.push(line("item", `${command.name.padEnd(14)}${description}`));
    }

    lines.push(line("text", ""));
    lines.push(line("muted", t.usage));
    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   about
   ───────────────────────────────────────────────────────────────────────── */

const about: TerminalCommand = {
  name: "about",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [
      line("heading", data.name),
      line("accent", data.headline),
      line("text", ""),
    ];

    if (data.techs.length > 0) lines.push(line("item", data.techs.join("  •  ")));
    if (data.location) lines.push(line("muted", data.location));

    lines.push(line("text", ""));
    lines.push(line("muted", t.hint));
    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   skills
   ───────────────────────────────────────────────────────────────────────── */

const skills: TerminalCommand = {
  name: "skills",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [line("heading", t.labels.skills), line("text", "")];

    for (const group of data.skillGroups) {
      lines.push(line("accent", group.name));
      lines.push(line("item", `  ${group.skills.join("  ·  ")}`));
      lines.push(line("text", ""));
    }

    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   projects
   ───────────────────────────────────────────────────────────────────────── */

const projects: TerminalCommand = {
  name: "projects",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [line("heading", t.labels.projects), line("text", "")];

    data.projects.forEach((project, index) => {
      lines.push(line("item", `[${formatIndex(index + 1)}]  ${project.title}`));
    });

    lines.push(line("text", ""));
    lines.push(line("muted", `open <n>  —  ${t.opening}`));
    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   experience
   ───────────────────────────────────────────────────────────────────────── */

const experience: TerminalCommand = {
  name: "experience",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [line("heading", t.labels.experience), line("text", "")];

    for (const item of data.experiences) {
      lines.push(line("accent", item.role));
      lines.push(line("item", `  ${item.company}${item.period ? `  —  ${item.period}` : ""}`));
      lines.push(line("text", ""));
    }

    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   architecture
   ───────────────────────────────────────────────────────────────────────── */

const architecture: TerminalCommand = {
  name: "architecture",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [
      line("heading", t.labels.architecture),
      line("text", ""),
      line("muted", t.labels.availableArchitectures),
    ];

    data.architectureViews.forEach((view, index) => {
      lines.push(line("item", `[${formatIndex(index + 1)}]  ${view.name}`));
    });

    lines.push(line("text", ""));
    lines.push(line("muted", `open architecture <n>`));
    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   roadmap
   ───────────────────────────────────────────────────────────────────────── */

const roadmap: TerminalCommand = {
  name: "roadmap",
  run: ({ data, t }) => {
    const lines: TerminalLine[] = [line("heading", t.labels.roadmap), line("text", "")];

    for (const project of data.roadmapProjects) {
      lines.push(
        line("item", `${project.name.padEnd(42)}${project.progress}%  ${t.labels.progress}`),
      );
    }

    lines.push(line("text", ""));
    lines.push(line("muted", "open roadmap"));
    return { lines };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   github · resume · contact
   ───────────────────────────────────────────────────────────────────────── */

const github: TerminalCommand = {
  name: "github",
  run: ({ data, t }) => {
    if (!data.githubUrl) return { lines: [line("error", t.noGithub)] };

    return {
      lines: [line("accent", data.githubUrl), line("muted", t.opening)],
      action: { type: "external", href: data.githubUrl },
    };
  },
};

const resume: TerminalCommand = {
  name: "resume",
  run: ({ data, t }) => {
    if (!data.cvUrl) return { lines: [line("error", t.noCv)] };

    return {
      lines: [line("accent", t.descriptions["resume"] ?? "CV"), line("muted", t.opening)],
      action: { type: "download", href: data.cvUrl },
    };
  },
};

const contact: TerminalCommand = {
  name: "contact",
  run: (context) => ({
    lines: [
      line("accent", context.data.email),
      ...(context.data.location ? [line("muted", context.data.location)] : []),
      line("muted", context.t.opening),
    ],
    action: { type: "navigate", href: internal(context, "/#contact") },
  }),
};

/* ─────────────────────────────────────────────────────────────────────────
   open — la seule commande à arguments
   ───────────────────────────────────────────────────────────────────────── */

const open: TerminalCommand = {
  name: "open",
  hidden: true,
  run: (context) => {
    const { args, data, t } = context;
    const [first, second] = args;

    if (!first) {
      return { lines: [line("error", t.usage)] };
    }

    // open roadmap
    if (first === "roadmap") {
      return {
        lines: [line("muted", t.opening)],
        action: { type: "navigate", href: internal(context, "/#roadmap") },
      };
    }

    // open architecture <n>
    if (first === "architecture") {
      const index = parseIndex(second);
      const view = index ? data.architectureViews[index - 1] : undefined;

      if (!view) {
        return {
          lines: [
            line("error", t.usage),
            line("muted", "open architecture <n>"),
          ],
        };
      }

      return {
        lines: [line("accent", view.name), line("muted", t.opening)],
        action: { type: "architecture", view: view.id },
      };
    }

    // open <n> — une étude de cas
    const index = parseIndex(first);
    const project = index ? data.projects[index - 1] : undefined;

    if (!project) {
      return { lines: [line("error", t.unknownProject)] };
    }

    // Un projet sans slug n'a pas d'étude de cas : on l'annonce plutôt que de
    // fabriquer un lien mort.
    if (!project.slug) {
      return { lines: [line("muted", t.comingSoon)] };
    }

    return {
      lines: [line("accent", project.title), line("muted", t.opening)],
      action: { type: "navigate", href: internal(context, `/projects/${project.slug}`) },
    };
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   clear · exit
   ───────────────────────────────────────────────────────────────────────── */

const clear: TerminalCommand = {
  name: "clear",
  run: () => ({ lines: [], action: { type: "clear" } }),
};

const exit: TerminalCommand = {
  name: "exit",
  run: () => ({ lines: [], action: { type: "close" } }),
};

/* ───────────────────────────────────────────────────────────────────────── */

export const COMMANDS: readonly TerminalCommand[] = [
  help,
  about,
  skills,
  projects,
  experience,
  architecture,
  roadmap,
  github,
  resume,
  contact,
  clear,
  exit,
  open,
];

/** Noms proposés par l'autocomplétion — `open` incluse, elle se tape souvent. */
export const COMMAND_NAMES: readonly string[] = COMMANDS.map((command) => command.name);

/**
 * Exécute une saisie déjà analysée.
 *
 * Une commande inconnue rend une erreur : elle n'est jamais interprétée
 * autrement, ni transmise à quoi que ce soit.
 */
export function runCommand(name: string, context: CommandContext): CommandResult {
  const command = COMMANDS.find((item) => item.name === name);

  if (!command) {
    return {
      lines: [
        line("error", `${context.t.notFound}: ${name}`),
        line("muted", context.t.notFoundHint),
      ],
    };
  }

  return command.run(context);
}
