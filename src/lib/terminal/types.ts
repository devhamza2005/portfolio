/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEVELOPER TERMINAL — contrat
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ SÉCURITÉ — LE TERMINAL N'EXÉCUTE RIEN.
 *
 * C'est un interpréteur de commandes PRÉDÉFINIES. Une saisie inconnue produit
 * un message d'erreur, jamais un appel. Aucun `eval`, aucun `new Function`,
 * aucun `child_process`, aucune requête serveur déclenchée par la saisie.
 * Le seul effet de bord possible est une NAVIGATION, et uniquement vers des
 * destinations construites par le code — jamais vers une chaîne saisie par le
 * visiteur.
 *
 * ── Séparation logique / interface ────────────────────────────────────────
 *
 * Ce dossier ne contient aucun JSX. Une commande est une fonction pure qui
 * reçoit un contexte et rend des lignes plus, éventuellement, une action. Le
 * composant React se contente d'afficher les lignes et d'exécuter l'action.
 * Conséquence pratique : les commandes sont testables sans rendu.
 */

/** Nature d'une ligne — pilote uniquement sa mise en forme. */
export type LineKind = "heading" | "text" | "muted" | "accent" | "item" | "error" | "prompt";

export type TerminalLine = {
  kind: LineKind;
  text: string;
};

/**
 * Effet de bord demandé par une commande.
 *
 * Toutes les destinations sont fabriquées par le code à partir de données du
 * portfolio. Aucune n'est construite depuis la saisie brute du visiteur.
 */
export type TerminalAction =
  | { type: "navigate"; href: string }
  | { type: "external"; href: string }
  | { type: "download"; href: string }
  | { type: "architecture"; view: string }
  | { type: "clear" }
  | { type: "close" };

export type CommandResult = {
  lines: TerminalLine[];
  action?: TerminalAction;
};

/** Instantané des données du portfolio, préparé côté serveur. */
export type TerminalData = {
  name: string;
  headline: string;
  location: string | null;
  email: string;
  cvUrl: string | null;
  githubUrl: string | null;
  /** Technologies mises en avant — noms de marques, jamais traduits. */
  techs: string[];
  skillGroups: { name: string; skills: string[] }[];
  projects: { slug: string; title: string }[];
  experiences: { company: string; role: string; period: string }[];
  architectureViews: { id: string; name: string }[];
  roadmapProjects: { name: string; progress: number }[];
};

/** Libellés traduits que les commandes peuvent afficher. */
export type TerminalMessages = {
  welcome: string;
  hint: string;
  availableCommands: string;
  notFound: string;
  notFoundHint: string;
  usage: string;
  unknownProject: string;
  comingSoon: string;
  opening: string;
  noCv: string;
  noGithub: string;
  descriptions: Record<string, string>;
  labels: {
    skills: string;
    projects: string;
    experience: string;
    architecture: string;
    roadmap: string;
    availableArchitectures: string;
    progress: string;
    /** Libellé accessible du bouton de fermeture. */
    close: string;
    /** Libellé accessible du champ de saisie. */
    inputAria: string;
  };
};

export type CommandContext = {
  args: string[];
  data: TerminalData;
  t: TerminalMessages;
  /** Préfixe de langue à appliquer aux liens internes — « /fr », « /ar »… */
  localePrefix: string;
};

export type TerminalCommand = {
  name: string;
  /** Non listée dans `help`, mais reconnue — `open` par exemple. */
  hidden?: boolean;
  run: (context: CommandContext) => CommandResult;
};
