"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { COMMAND_NAMES, runCommand } from "@/lib/terminal/commands";
import { complete, parseCommand } from "@/lib/terminal/parser";
import type {
  TerminalAction,
  TerminalData,
  TerminalLine,
  TerminalMessages,
} from "@/lib/terminal/types";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEVELOPER TERMINAL — interface
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ AUCUNE COMMANDE SYSTÈME N'EST EXÉCUTÉE. Ce composant lit une saisie,
 * la confie à un interpréteur de commandes prédéfinies (src/lib/terminal), et
 * affiche les lignes rendues. Le seul effet de bord possible est une
 * navigation vers une destination construite par le code.
 *
 * ── Répartition des responsabilités ───────────────────────────────────────
 *
 * Ce fichier ne connaît AUCUNE commande. Il gère l'affichage, l'historique,
 * le focus et le clavier ; la logique vit dans `src/lib/terminal`, sans JSX,
 * donc testable seule.
 *
 * ── Accessibilité ─────────────────────────────────────────────────────────
 *
 * `role="dialog"` + `aria-modal`, Échap ferme et rend le focus au bouton
 * d'ouverture, le focus est capturé dans le panneau (Tab boucle), et la sortie
 * est une région `aria-live` — sans quoi un lecteur d'écran ne saurait pas
 * qu'une commande a produit quelque chose.
 *
 * ── RTL ───────────────────────────────────────────────────────────────────
 *
 * Le panneau force `dir="ltr"` : un terminal se lit de gauche à droite, y
 * compris en arabe. Seuls les libellés d'accessibilité suivent la langue.
 */

type HistoryEntry = { input: string; lines: TerminalLine[] };

const LINE_CLASS: Record<TerminalLine["kind"], string> = {
  heading: "text-foreground font-semibold",
  text: "text-muted",
  muted: "text-subtle",
  accent: "text-brand",
  item: "text-muted",
  error: "text-danger",
  prompt: "text-brand",
};

export function DeveloperTerminal({
  data,
  t,
  localePrefix,
  onClose,
}: {
  data: TerminalData;
  t: TerminalMessages;
  localePrefix: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /** Saisies passées, de la plus ancienne à la plus récente. */
  const history = useMemo(
    () => entries.map((entry) => entry.input).filter(Boolean),
    [entries],
  );

  const prompt = `${data.name.split(" ")[0]?.toLowerCase() ?? "dev"}@portfolio:~$`;

  /* ── Exécution d'une action rendue par une commande ─────────────────── */
  const perform = useCallback(
    (action: TerminalAction) => {
      switch (action.type) {
        case "clear":
          setEntries([]);
          return;
        case "close":
          onClose();
          return;
        case "navigate":
          onClose();
          router.push(action.href);
          return;
        case "external":
          window.open(action.href, "_blank", "noopener,noreferrer");
          return;
        case "download":
          window.open(action.href, "_blank", "noopener,noreferrer");
          return;
        case "architecture":
          onClose();
          // L'Architecture Lab écoute cet évènement et bascule sur la vue
          // demandée. Un évènement plutôt qu'un paramètre d'URL : la section
          // reste prérendue et le SEO n'est pas touché.
          window.dispatchEvent(
            new CustomEvent("portfolio:architecture-view", { detail: action.view }),
          );
          document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" });
          return;
      }
    },
    [onClose, router],
  );

  /* ── Soumission ─────────────────────────────────────────────────────── */
  function submit() {
    const parsed = parseCommand(input);
    setInput("");
    setHistoryIndex(null);

    if (parsed.name.length === 0) {
      setEntries((current) => [...current, { input: "", lines: [] }]);
      return;
    }

    const result = runCommand(parsed.name, {
      args: parsed.args,
      data,
      t,
      localePrefix,
    });

    if (result.action?.type === "clear") {
      setEntries([]);
    } else {
      setEntries((current) => [...current, { input: parsed.raw, lines: result.lines }]);
    }

    if (result.action) perform(result.action);
  }

  /* ── Clavier ────────────────────────────────────────────────────────── */
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next] ?? "");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput("");
        return;
      }
      setHistoryIndex(next);
      setInput(history[next] ?? "");
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const { completion, candidates } = complete(input, COMMAND_NAMES);

      if (completion) {
        setInput(`${completion} `);
        return;
      }
      if (candidates.length > 1) {
        setEntries((current) => [
          ...current,
          { input: input.trim(), lines: [{ kind: "muted", text: candidates.join("   ") }] },
        ]);
      }
    }
  }

  /* ── Focus, Échap, capture du focus ─────────────────────────────────── */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Le focus reste dans le panneau tant qu'il est ouvert.
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>("button, input, [href]");
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Le défilement de la page derrière le terminal serait déroutant.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Toujours montrer la dernière ligne produite.
  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [entries]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.welcome}
    >
      <button
        type="button"
        aria-label={t.labels.close}
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        dir="ltr"
        className={cn(
          "border-border bg-surface relative flex w-full flex-col overflow-hidden",
          "h-[92dvh] rounded-t-[var(--radius-lg)] border sm:h-[34rem] sm:max-w-3xl sm:rounded-[var(--radius-lg)]",
          "shadow-[var(--shadow-xl)]",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-200",
        )}
        style={{ boxShadow: "var(--shadow-glow), var(--shadow-xl)" }}
      >
        {/* ── Barre de titre ──────────────────────────────────────────── */}
        <div className="border-border bg-elevated flex shrink-0 items-center gap-3 border-b px-4 py-2.5">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>

          <p className="text-subtle min-w-0 flex-1 truncate text-center font-mono text-xs">
            {prompt.replace(":~$", " ~")}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.labels.close}
            className="text-subtle hover:text-foreground hover:bg-sunken focus-visible:ring-ring rounded-[var(--radius-sm)] p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Sortie ──────────────────────────────────────────────────── */}
        <div
          ref={outputRef}
          className="relative flex-1 overflow-y-auto px-4 py-4 font-mono text-[0.8125rem] leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Scanline — très légère, purement décorative. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 3px)",
            }}
          />

          <p className="text-foreground relative font-semibold">{t.welcome}</p>
          <p className="text-subtle relative mb-4">{t.hint}</p>

          <div aria-live="polite" className="relative space-y-3">
            {entries.map((entry, index) => (
              <div key={index}>
                {entry.input ? (
                  <p className="break-all">
                    <span className="text-brand">{prompt}</span>{" "}
                    <span className="text-foreground">{entry.input}</span>
                  </p>
                ) : null}

                {entry.lines.map((item, position) => (
                  <p
                    key={position}
                    className={cn("break-words whitespace-pre-wrap", LINE_CLASS[item.kind])}
                  >
                    {item.text || " "}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* ── Invite de saisie ──────────────────────────────────────── */}
          <div className="relative mt-3 flex items-center gap-2">
            <label htmlFor="terminal-input" className="text-brand shrink-0">
              {prompt}
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              aria-label={t.labels.inputAria}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="text-foreground caret-brand min-w-0 flex-1 bg-transparent font-mono outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
