import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import type { CommandAction, CommandData, CommandMessages } from "@/lib/command/types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CATALOGUE DES ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Liste FERMÉE, construite ici et nulle part ailleurs. La palette ne peut
 * déclencher que ce qui figure dans ce fichier : la saisie du visiteur sert
 * uniquement à filtrer, jamais à fabriquer une action ou une URL.
 *
 * Les entrées dont la donnée manque (pas de CV, pas de profil GitHub) sont
 * simplement absentes : mieux vaut ne rien proposer qu'un lien mort.
 */
export function buildCommands(t: CommandMessages, data: CommandData): CommandAction[] {
  const commands: CommandAction[] = [
    /* ── Navigation ─────────────────────────────────────────────────── */
    {
      id: "nav-about",
      label: t.labels.about,
      category: "navigation",
      icon: "user",
      keywords: ["about", "profil", "bio", "propos"],
      effect: { type: "section", section: "about" },
    },
    {
      id: "nav-projects",
      label: t.labels.projects,
      category: "navigation",
      icon: "folder",
      keywords: ["projects", "projets", "work", "case", "studies"],
      effect: { type: "route", path: "/projects" },
    },
    {
      id: "nav-skills",
      label: t.labels.skills,
      category: "navigation",
      icon: "sparkles",
      keywords: ["skills", "competences", "stack", "tech"],
      effect: { type: "section", section: "skills" },
    },
    {
      id: "nav-experience",
      label: t.labels.experience,
      category: "navigation",
      icon: "briefcase",
      keywords: ["experience", "parcours", "career", "work"],
      effect: { type: "section", section: "experience" },
    },
    {
      id: "nav-architecture",
      label: t.labels.architecture,
      category: "navigation",
      icon: "network",
      keywords: ["architecture", "arc", "lab", "diagram", "system"],
      effect: { type: "section", section: "architecture" },
    },
    {
      id: "nav-roadmap",
      label: t.labels.roadmap,
      category: "navigation",
      icon: "route",
      keywords: ["roadmap", "timeline", "progress", "stages"],
      effect: { type: "section", section: "roadmap" },
    },
    {
      id: "nav-contact",
      label: t.labels.contact,
      category: "navigation",
      icon: "mail",
      keywords: ["contact", "mail", "email", "message"],
      effect: { type: "section", section: "contact" },
    },
  ];

  /* ── Actions ──────────────────────────────────────────────────────── */
  if (data.githubUrl) {
    commands.push({
      id: "action-github",
      label: t.labels.github,
      category: "actions",
      icon: "github",
      keywords: ["github", "git", "code", "repo", "source"],
      effect: { type: "external", href: data.githubUrl },
    });
  }

  if (data.cvUrl) {
    commands.push({
      id: "action-resume",
      label: t.labels.resume,
      category: "actions",
      icon: "download",
      keywords: ["cv", "resume", "curriculum", "pdf", "download"],
      effect: { type: "download", href: data.cvUrl },
    });
  }

  commands.push({
    id: "action-terminal",
    label: t.labels.terminal,
    category: "actions",
    icon: "terminal",
    keywords: ["terminal", "term", "console", "shell", "cli"],
    effect: { type: "terminal" },
  });

  /* ── Préférences ──────────────────────────────────────────────────── */
  commands.push(
    {
      id: "pref-language",
      label: t.labels.language,
      category: "preferences",
      icon: "languages",
      keywords: ["language", "langue", "locale", "lang", "i18n", "fr", "en", "ar"],
      effect: { type: "submenu", view: "language" },
    },
    {
      id: "pref-theme",
      label: t.labels.theme,
      category: "preferences",
      icon: "palette",
      keywords: ["theme", "dark", "light", "mode", "sombre", "clair"],
      effect: { type: "theme" },
    },
  );

  return commands;
}

/**
 * Les trois langues, en sous-menu.
 *
 * Chacune est libellée DANS sa langue — un visiteur arabophone cherche
 * « العربية », pas « Arabe ». La destination n'est pas calculée ici : elle
 * dépend du chemin courant, que seul le composant connaît.
 */
export function buildLocaleCommands(): CommandAction[] {
  return LOCALES.map((locale) => ({
    id: `locale-${locale}`,
    label: LOCALE_LABELS[locale].native,
    hint: LOCALE_LABELS[locale].short,
    category: "preferences" as const,
    icon: "languages" as const,
    keywords: [locale, LOCALE_LABELS[locale].english.toLowerCase()],
    effect: { type: "locale" as const, locale },
  }));
}

/**
 * Normalisation pour la recherche.
 *
 * Les diacritiques sont retirés dans les deux sens : « competences » doit
 * trouver « Compétences », et « Compétences » doit se trouver lui-même. La
 * décomposition NFD retire du même geste les signes de vocalisation arabes,
 * qui ne sont presque jamais tapés.
 */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Filtre les actions sur la saisie.
 *
 * Le libellé traduit ET les mots-clés techniques sont examinés : « arc » trouve
 * « البنية المعمارية » comme « Architecture ». L'ordre du catalogue est
 * conservé — un classement par pertinence ferait sauter les entrées d'une
 * frappe à l'autre, ce qui rend la sélection au clavier imprévisible.
 */
export function filterCommands(commands: CommandAction[], query: string): CommandAction[] {
  const needle = normalize(query);
  if (needle.length === 0) return commands;

  return commands.filter((command) => {
    if (normalize(command.label).includes(needle)) return true;
    return command.keywords.some((keyword) => normalize(keyword).includes(needle));
  });
}
