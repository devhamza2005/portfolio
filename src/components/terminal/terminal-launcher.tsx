"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import type { TerminalData, TerminalMessages } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  OUVERTURE DU DEVELOPER TERMINAL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Chargement différé ────────────────────────────────────────────────────
 *
 * Seul ce bouton est présent au chargement. Le terminal lui-même n'est
 * téléchargé qu'au premier appel — un visiteur qui ne l'ouvre jamais n'en paie
 * pas le coût. `ssr: false` est cohérent : un terminal interactif n'a rien à
 * faire dans le HTML prérendu, et cela évite tout écart d'hydratation.
 *
 * ── Raccourci clavier ─────────────────────────────────────────────────────
 *
 * `Ctrl + ù` (touche backquote) — retenu parce qu'il n'est réservé par aucun
 * navigateur. `Ctrl + Shift + T` a été ÉCARTÉ : Chrome et Firefox l'utilisent
 * pour rouvrir un onglet fermé, le raccourci n'aurait jamais atteint la page.
 *
 * Le raccourci est ignoré pendant une saisie (champ de contact, recherche du
 * back-office) : intercepter une frappe dans un formulaire serait hostile.
 */

const DeveloperTerminal = dynamic(
  () => import("@/components/terminal/developer-terminal").then((m) => m.DeveloperTerminal),
  { ssr: false },
);

export function TerminalLauncher({
  data,
  t,
  localePrefix,
  openLabel,
  shortcutHint,
  className,
}: {
  data: TerminalData;
  t: TerminalMessages;
  localePrefix: string;
  openLabel: string;
  shortcutHint: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /** Fermer rend le focus au bouton : sans cela il repartirait au document. */
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.code !== "Backquote") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      event.preventDefault();
      setOpen((value) => !value);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${openLabel} — ${shortcutHint}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={shortcutHint}
        className={cn(
          "border-border text-muted hover:text-foreground hover:border-brand/40",
          "focus-visible:ring-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3",
          "text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
      >
        {/* Le chevron d'invite est un signe, pas du texte : il reste tel quel
            dans les trois langues et ne doit pas être inversé en RTL. */}
        <span className="text-brand font-mono" aria-hidden dir="ltr">
          {">_"}
        </span>
        <span className="hidden sm:inline">{openLabel}</span>
      </button>

      {open ? (
        <DeveloperTerminal data={data} t={t} localePrefix={localePrefix} onClose={close} />
      ) : null}
    </>
  );
}
