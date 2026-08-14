"use client";

import {
  Briefcase,
  ChevronLeft,
  Download,
  Folder,
  Languages,
  Mail,
  Network,
  Palette,
  Route,
  Search,
  Sparkles,
  Terminal,
  User,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useRef, useState } from "react";

import { GithubIcon } from "@/components/brand/brand-icons";
import { buildCommands, buildLocaleCommands, filterCommands } from "@/lib/command/actions";
import { pushRecent, readRecent } from "@/lib/command/recent";
import type {
  CommandAction,
  CommandData,
  CommandIcon,
  CommandMessages,
} from "@/lib/command/types";
import { COMMAND_CATEGORIES } from "@/lib/command/types";
import { navHref } from "@/config/nav";
import { localizedPath, switchLocalePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COMMAND PALETTE — interface
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ Ce composant n'exécute que des effets DÉCRITS par le catalogue
 * (src/lib/command/actions.ts). La saisie ne sert qu'à filtrer cette liste
 * fermée : aucune URL saisie n'est suivie, aucun code n'est évalué.
 *
 * ── Ce qui est réutilisé, et non réécrit ──────────────────────────────────
 *
 *  • le changement de langue  → `switchLocalePath`, la même fonction que le
 *    sélecteur de la navbar ; la page courante est donc conservée à
 *    l'identique, slug d'étude de cas compris ;
 *  • le thème                 → `useTheme` de next-themes, comme le bouton ;
 *  • le terminal              → un évènement, jamais une seconde instance ;
 *  • les routes               → `navHref` / `localizedPath`, jamais recopiées.
 *
 * ── Accessibilité ─────────────────────────────────────────────────────────
 *
 * Motif « combobox + listbox » : le focus ne quitte JAMAIS le champ de
 * recherche, et l'élément courant est désigné par `aria-activedescendant`.
 * C'est ce que les lecteurs d'écran attendent d'une palette — déplacer le
 * focus réel dans la liste couperait la saisie à chaque flèche.
 */

const ICONS: Record<CommandIcon, React.ComponentType<{ className?: string }>> = {
  user: User,
  folder: Folder,
  sparkles: Sparkles,
  briefcase: Briefcase,
  network: Network,
  route: Route,
  mail: Mail,
  // Lucide v1 ne fournit plus les icônes de marque — le portfolio a les siennes.
  github: GithubIcon,
  download: Download,
  terminal: Terminal,
  languages: Languages,
  palette: Palette,
};

type Props = {
  locale: Locale;
  data: CommandData;
  t: CommandMessages;
  onClose: () => void;
};

export function CommandPalette({ locale, data, t, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [view, setView] = useState<"root" | "language">("root");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  // Lu une seule fois à l'ouverture : la liste ne doit pas se réordonner sous
  // les doigts du visiteur pendant qu'il la parcourt.
  const [recentIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readRecent(),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const catalogue = useMemo(() => buildCommands(t, data), [t, data]);
  const locales = useMemo(() => buildLocaleCommands(), []);

  /** Liste affichée, à plat — c'est elle que les flèches parcourent. */
  const visible = useMemo(
    () => filterCommands(view === "language" ? locales : catalogue, query),
    [view, locales, catalogue, query],
  );

  /**
   * Actions récentes — seulement à la racine, sans recherche en cours, et
   * uniquement celles qui existent encore dans le catalogue.
   */
  const recent = useMemo(() => {
    if (view !== "root" || query.length > 0) return [];
    return recentIds
      .map((id) => catalogue.find((command) => command.id === id))
      .filter((command): command is CommandAction => command !== undefined);
  }, [view, query, recentIds, catalogue]);

  /**
   * Ordre de parcours au clavier : les récentes d'abord, puis le catalogue
   * groupé — exactement l'ordre visuel, sans quoi les flèches sauteraient.
   *
   * Une même action figure à deux endroits quand elle est récente. Chaque
   * position reçoit donc sa propre CLÉ : sans cela, la surbrillance
   * s'allumerait sur les deux copies à la fois.
   */
  const ordered = useMemo(() => {
    const groups = COMMAND_CATEGORIES.flatMap((category) =>
      visible.filter((command) => command.category === category),
    );

    return [
      ...recent.map((command) => ({ key: `recent-${command.id}`, command })),
      ...groups.map((command) => ({ key: `cat-${command.id}`, command })),
    ];
  }, [recent, visible]);

  const indexOfKey = useCallback(
    (key: string) => ordered.findIndex((entry) => entry.key === key),
    [ordered],
  );

  const isHome = pathname === localizedPath(locale, "/") || pathname === `${localizedPath(locale, "/")}/`;

  /* ── Exécution ──────────────────────────────────────────────────────── */
  const execute = useCallback(
    (command: CommandAction) => {
      // Seules les entrées du catalogue sont mémorisables. Le sous-menu n'est
      // pas une action, et une langue n'y figure pas : les enregistrer
      // consommerait des places d'historique pour des identifiants que la
      // relecture écarterait de toute façon.
      if (command.effect.type !== "submenu" && command.effect.type !== "locale") {
        pushRecent(command.id);
      }

      switch (command.effect.type) {
        case "submenu":
          setView(command.effect.view);
          setQuery("");
          setSelected(0);
          inputRef.current?.focus();
          return;

        case "section": {
          const { section } = command.effect;
          onClose();

          // Sur l'accueil, un défilement doux vaut mieux qu'un saut d'URL ;
          // ailleurs, il faut d'abord revenir à l'accueil de la MÊME langue.
          if (isHome) {
            const target = document.getElementById(section);
            if (target) {
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
              window.history.replaceState(null, "", `#${section}`);
              return;
            }
          }

          router.push(navHref(locale, `/#${section}`));
          return;
        }

        case "route":
          onClose();
          router.push(localizedPath(locale, command.effect.path));
          return;

        case "external":
        case "download":
          // `noopener` : la page ouverte ne doit pas pouvoir manipuler celle-ci.
          window.open(command.effect.href, "_blank", "noopener,noreferrer");
          onClose();
          return;

        case "terminal":
          onClose();
          // Le terminal de la phase 4 s'ouvre par évènement : une seconde
          // instance dupliquerait son état et son piège à focus.
          window.dispatchEvent(new CustomEvent("portfolio:open-terminal"));
          return;

        case "theme":
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          onClose();
          return;

        case "locale":
          onClose();
          router.push(switchLocalePath(pathname, command.effect.locale));
          return;
      }
    },
    [isHome, locale, onClose, pathname, resolvedTheme, router, setTheme],
  );

  /* ── Clavier ────────────────────────────────────────────────────────── */
  const move = useCallback(
    (delta: number) => {
      if (ordered.length === 0) return;
      const next = (selected + delta + ordered.length) % ordered.length;
      setSelected(next);

      const option = listRef.current?.querySelector(`#cmd-${CSS.escape(ordered[next]!.key)}`);
      option?.scrollIntoView({ block: "nearest" });
    },
    [ordered, selected],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        // Depuis le sous-menu, Échap revient d'abord à la racine.
        if (view === "language") {
          setView("root");
          setQuery("");
          setSelected(0);
          return;
        }
        onClose();
        return;

      case "ArrowDown":
        event.preventDefault();
        move(1);
        return;

      case "ArrowUp":
        event.preventDefault();
        move(-1);
        return;

      case "Home":
        event.preventDefault();
        setSelected(0);
        return;

      case "End":
        event.preventDefault();
        setSelected(Math.max(0, ordered.length - 1));
        return;

      case "Enter": {
        event.preventDefault();
        const entry = ordered[selected];
        if (entry) execute(entry.command);
        return;
      }

      case "Tab": {
        // Le focus reste dans le panneau : deux éléments focalisables
        // seulement, le champ et la croix.
        event.preventDefault();
        const panel = panelRef.current;
        if (!panel) return;

        const focusable = panel.querySelectorAll<HTMLElement>("input, button");
        if (focusable.length === 0) return;

        const list = [...focusable];
        const index = list.indexOf(document.activeElement as HTMLElement);
        const next = list[(index + (event.shiftKey ? -1 : 1) + list.length) % list.length];
        next?.focus();
        return;
      }
    }
  }

  const activeKey = ordered[selected]?.key;

  /** Rend une entrée à sa position — la clé décide de la surbrillance. */
  const renderOption = (key: string, command: CommandAction) => (
    <Option
      key={key}
      optionKey={key}
      command={command}
      locale={locale}
      selected={activeKey === key}
      onSelect={() => execute(command)}
      onHover={() => {
        const index = indexOfKey(key);
        if (index >= 0) setSelected(index);
      }}
    />
  );

  /* ── Rendu ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[8vh] pb-6 sm:px-6 sm:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label={t.aria.dialog}
    >
      <button
        type="button"
        aria-label={t.aria.close}
        onClick={onClose}
        tabIndex={-1}
        className="bg-background/70 absolute inset-0 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        onKeyDown={onKeyDown}
        className={cn(
          "glass border-border relative flex w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-lg)] border",
          "max-h-[80vh] shadow-[var(--shadow-xl)]",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150",
        )}
      >
        {/* ── Champ de recherche ──────────────────────────────────────── */}
        <div className="border-border flex shrink-0 items-center gap-3 border-b px-4">
          {view === "language" ? (
            <button
              type="button"
              onClick={() => {
                setView("root");
                setQuery("");
                setSelected(0);
                inputRef.current?.focus();
              }}
              aria-label={t.aria.back}
              className="text-muted hover:text-foreground focus-visible:ring-ring -ms-1 shrink-0 rounded-[var(--radius-sm)] p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {/* L'icône pointe vers le début de la ligne, quel que soit le sens. */}
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>
          ) : (
            <Search className="text-subtle size-4 shrink-0" aria-hidden />
          )}

          <input
            ref={inputRef}
            // Un dialogue de recherche doit recevoir la frappe immédiatement :
            // sans cela, le raccourci n'aurait aucun intérêt.
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            placeholder={t.placeholder}
            aria-label={t.aria.input}
            role="combobox"
            aria-expanded
            aria-controls="command-list"
            aria-activedescendant={activeKey ? `cmd-${activeKey}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="text-foreground placeholder:text-subtle min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={t.aria.close}
            className="text-subtle hover:text-foreground hover:bg-elevated focus-visible:ring-ring -me-1 shrink-0 rounded-[var(--radius-sm)] p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Résultats ───────────────────────────────────────────────── */}
        <div
          ref={listRef}
          id="command-list"
          role="listbox"
          aria-label={t.aria.dialog}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {ordered.length === 0 ? (
            <p className="text-subtle px-3 py-8 text-center text-sm">{t.empty}</p>
          ) : null}

          {recent.length > 0 ? (
            <Group label={t.recent}>
              {recent.map((command) => renderOption(`recent-${command.id}`, command))}
            </Group>
          ) : null}

          {view === "language" ? (
            <Group label={t.labels.language}>
              {visible.map((command) => renderOption(`cat-${command.id}`, command))}
            </Group>
          ) : (
            COMMAND_CATEGORIES.map((category) => {
              const items = visible.filter((command) => command.category === category);
              if (items.length === 0) return null;

              return (
                <Group key={category} label={t.categories[category]}>
                  {items.map((command) => renderOption(`cat-${command.id}`, command))}
                </Group>
              );
            })
          )}
        </div>

        {/* ── Pied : rappel des touches ───────────────────────────────── */}
        <div className="border-border text-subtle hidden shrink-0 items-center gap-4 border-t px-4 py-2.5 text-[0.6875rem] sm:flex">
          <Hint keys="↑↓" label={t.hints.navigate} />
          <Hint keys="↵" label={t.hints.select} />
          <Hint keys="Esc" label={t.hints.close} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Sous-composants
   ───────────────────────────────────────────────────────────────────────── */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="mb-1 last:mb-0">
      <p className="text-subtle px-3 pt-2 pb-1.5 text-[0.6875rem] font-medium tracking-wide uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function Option({
  optionKey,
  command,
  locale,
  selected,
  onSelect,
  onHover,
}: {
  /** Identité de POSITION : une action récente figure aussi dans son groupe. */
  optionKey: string;
  command: CommandAction;
  locale: Locale;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const Icon = ICONS[command.icon];

  return (
    <div
      id={`cmd-${optionKey}`}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      // `mousemove` et non `mouseenter` : quand la liste défile sous un curseur
      // immobile, `mouseenter` volerait la sélection faite au clavier.
      onMouseMove={onHover}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm",
        "transition-colors duration-100",
        selected ? "bg-brand/10 text-foreground" : "text-muted",
      )}
    >
      {/* Barre de sélection : un repère de position, pas seulement une teinte —
          la couleur seule ne suffirait pas en cas de daltonisme. */}
      <span
        aria-hidden
        className={cn(
          "h-5 w-0.5 shrink-0 rounded-full transition-colors",
          selected ? "bg-brand" : "bg-transparent",
        )}
      />

      <Icon className={cn("size-4 shrink-0", selected ? "text-brand" : "text-subtle")} />

      <span className="min-w-0 flex-1 truncate">{command.label}</span>

      {command.hint ? (
        <span className="text-subtle shrink-0 font-mono text-[0.6875rem]" dir="ltr">
          {command.hint}
        </span>
      ) : (
        <DestinationHint command={command} locale={locale} />
      )}
    </div>
  );
}

/**
 * Rappel de la destination, calculé au rendu.
 *
 * Volontairement dérivé de l'effet plutôt que stocké dans le catalogue : la
 * route n'existe ainsi qu'à un seul endroit.
 */
function DestinationHint({ command, locale }: { command: CommandAction; locale: Locale }) {
  const text =
    command.effect.type === "section"
      ? `#${command.effect.section}`
      : command.effect.type === "route"
        ? localizedPath(locale, command.effect.path)
        : null;

  if (!text) return null;

  return (
    // Un chemin d'URL se lit de gauche à droite, y compris sur une page arabe.
    <span className="text-subtle hidden shrink-0 font-mono text-[0.6875rem] sm:block" dir="ltr">
      {text}
    </span>
  );
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="border-border bg-elevated rounded-[var(--radius-sm)] border px-1.5 py-0.5 font-mono" dir="ltr">
        {keys}
      </kbd>
      {label}
    </span>
  );
}
