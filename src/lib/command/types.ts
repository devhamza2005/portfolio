import type { Locale } from "@/lib/i18n/config";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COMMAND PALETTE — contrats
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ Une action ne porte JAMAIS de fonction fournie par le visiteur, ni d'URL
 * qu'il aurait saisie. Elle décrit un EFFET — « aller à la section X »,
 * « ouvrir ce lien externe » — que le composant traduit ensuite en appel
 * concret. La saisie ne sert qu'à FILTRER cette liste fermée ; elle n'est
 * jamais interprétée, jamais évaluée.
 *
 * Même parti pris que le Developer Terminal (`src/lib/terminal/types.ts`) :
 * la logique reste sans JSX, donc lisible et testable seule.
 */

/** Regroupement affiché. L'ordre ci-dessous est l'ordre de rendu. */
export const COMMAND_CATEGORIES = ["navigation", "actions", "preferences"] as const;

export type CommandCategory = (typeof COMMAND_CATEGORIES)[number];

/**
 * Icône, désignée par un nom et non par un composant.
 *
 * Ce module ne doit rien importer de React : garder une chaîne ici laisse la
 * correspondance nom → composant Lucide au seul calque d'affichage.
 */
export type CommandIcon =
  | "user"
  | "folder"
  | "sparkles"
  | "briefcase"
  | "network"
  | "route"
  | "mail"
  | "github"
  | "download"
  | "terminal"
  | "languages"
  | "palette";

/**
 * Ce qu'une action DÉCLENCHE.
 *
 * `section` et `route` portent un chemin NU, sans préfixe de langue : la locale
 * est ajoutée à l'exécution par `navHref`, ce qui rend impossible d'oublier la
 * langue courante — et évite de recopier les routes dans plusieurs fichiers.
 */
export type CommandEffect =
  /** Ancre de la page d'accueil : `about`, `skills`… (sans le croisillon). */
  | { type: "section"; section: string }
  /** Page interne, chemin nu : `/projects`. */
  | { type: "route"; path: string }
  /** Lien externe — provient toujours des données du portfolio. */
  | { type: "external"; href: string }
  /** Téléchargement — le CV déjà enregistré, jamais un nouveau fichier. */
  | { type: "download"; href: string }
  /** Ouvre le Developer Terminal de la phase 4 (évènement global). */
  | { type: "terminal" }
  /** Bascule dark ↔ light via next-themes. */
  | { type: "theme" }
  /** Affiche la liste des langues DANS la palette. */
  | { type: "submenu"; view: "language" }
  /** Change de langue en conservant la page courante. */
  | { type: "locale"; locale: Locale };

export type CommandAction = {
  /** Stable : il sert de clé de rendu ET de mémoire des actions récentes. */
  id: string;
  label: string;
  /** Ligne secondaire — chemin, langue de destination, rappel du raccourci. */
  hint?: string;
  category: CommandCategory;
  icon: CommandIcon;
  /**
   * Termes de recherche EN PLUS du libellé.
   *
   * Volontairement latins et techniques (« arc », « cv », « git »…) : un
   * développeur arabophone tape « term » aussi vite qu'un francophone, et le
   * libellé arabe ne l'aurait jamais laissé trouver l'action.
   */
  keywords: string[];
  effect: CommandEffect;
};

/** Ce que la palette a besoin de savoir du portfolio — rien de plus. */
export type CommandData = {
  githubUrl: string | null;
  cvUrl: string | null;
};

/** Textes de l'interface, résolus côté serveur depuis le dictionnaire. */
export type CommandMessages = {
  open: string;
  placeholder: string;
  empty: string;
  recent: string;
  categories: Record<CommandCategory, string>;
  labels: Record<
    | "about"
    | "projects"
    | "skills"
    | "experience"
    | "architecture"
    | "roadmap"
    | "contact"
    | "github"
    | "resume"
    | "terminal"
    | "language"
    | "theme",
    string
  >;
  hints: { navigate: string; select: string; close: string };
  aria: { dialog: string; close: string; input: string; back: string };
};
