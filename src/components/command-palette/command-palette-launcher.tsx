"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { CommandData, CommandMessages } from "@/lib/command/types";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  OUVERTURE DE LA COMMAND PALETTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Chargement différé ────────────────────────────────────────────────────
 *
 * Seul ce bouton est présent au chargement ; la palette n'est téléchargée
 * qu'au premier appel. `ssr: false` va de soi — une palette de recherche n'a
 * rien à faire dans le HTML prérendu.
 *
 * ── Raccourci ─────────────────────────────────────────────────────────────
 *
 * `Ctrl + K`, et `⌘ + K` sur macOS. Les deux modificateurs sont acceptés à
 * l'écoute (un clavier Mac branché sur un PC reste utilisable) ; seul
 * l'AFFICHAGE de l'indication dépend de la plateforme.
 *
 * `preventDefault` est indispensable : Firefox et Chrome affectent déjà
 * Ctrl/⌘ + K à leur barre d'adresse.
 *
 * ── Différence assumée avec le Developer Terminal ─────────────────────────
 *
 * Le bouton du terminal est masqué sous 640 px. Celui-ci ne l'est PAS : sans
 * clavier physique, la palette ne serait plus atteignable du tout — alors
 * qu'elle est précisément le moyen d'accès rapide du site, et le seul chemin
 * vers le terminal sur mobile.
 */

const CommandPalette = dynamic(
  () => import("@/components/command-palette/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Vrai sur un appareil Apple.
 *
 * `useSyncExternalStore` plutôt qu'un état posé dans un effet : le serveur
 * répond « faux » et le client sa vraie valeur, sans écart d'hydratation et
 * sans rendu intermédiaire à corriger.
 */
const subscribeNothing = () => () => {};
const isApplePlatform = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function CommandPaletteLauncher({
  locale,
  data,
  t,
  className,
}: {
  locale: Locale;
  data: CommandData;
  t: CommandMessages;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isApple = useSyncExternalStore(subscribeNothing, isApplePlatform, () => false);
  const shortcut = isApple ? "⌘K" : "Ctrl K";

  /** Fermer rend le focus au bouton : sinon il repartirait au document. */
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.altKey) return;
      // `code` en secours : sur un clavier AZERTY ou cyrillique, `key` n'est
      // pas toujours « k ».
      if (event.key.toLowerCase() !== "k" && event.code !== "KeyK") return;

      // Une frappe dans un champ appartient à ce champ. La palette ouverte est
      // la seule exception : le raccourci doit alors pouvoir la refermer, or le
      // focus s'y trouve justement dans un champ de recherche.
      if (!open) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
          return;
        }
      }

      event.preventDefault();
      setOpen((value) => !value);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // La page derrière la palette ne doit pas défiler.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t.open} — ${shortcut}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`${t.open} — ${shortcut}`}
        className={cn(
          "border-border text-muted hover:text-foreground hover:border-brand/40",
          "focus-visible:ring-ring inline-flex h-9 shrink-0 items-center gap-2 rounded-full border",
          "px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
      >
        <Search className="size-3.5 shrink-0" aria-hidden />

        {/* Le libellé et le raccourci ne s'affichent qu'à partir de `md` : la
            barre de navigation est déjà chargée sur les petits écrans. */}
        <span className="hidden md:inline">{t.open}</span>
        <kbd
          className="border-border bg-elevated text-subtle hidden rounded-[var(--radius-sm)] border px-1.5 py-0.5 font-mono text-[0.625rem] md:inline"
          dir="ltr"
        >
          {shortcut}
        </kbd>
      </button>

      {open ? <CommandPalette locale={locale} data={data} t={t} onClose={close} /> : null}
    </>
  );
}
