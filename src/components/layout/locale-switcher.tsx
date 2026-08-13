"use client";

import { Check, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LOCALES, LOCALE_LABELS, switchLocalePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  label: string;
  ariaLabel: string;
  currentAria: string;
  className?: string;
};

/**
 * Sélecteur de langue.
 *
 * ── Pourquoi des liens et non des boutons ─────────────────────────────────
 *
 * Changer de langue change d'URL. Un `<a>` est donc la sémantique juste : le
 * lien est copiable, ouvrable dans un nouvel onglet, et surtout suivi par les
 * moteurs — ce qui, avec les balises `hreflang`, leur fait découvrir les trois
 * versions. Un `<button>` déclenchant une navigation programmatique aurait
 * privé le référencement de ce signal.
 *
 * La page courante est conservée : `switchLocalePath` ne remplace que le
 * premier segment. Les slugs de projets étant identiques dans les trois
 * langues, `/fr/projects/x` mène toujours à `/ar/projects/x`.
 *
 * ── Accessibilité ─────────────────────────────────────────────────────────
 *
 * Le déclencheur porte `aria-expanded` et `aria-controls`. Échap referme et
 * rend le focus au déclencheur, un clic à l'extérieur referme aussi. La langue
 * active est annoncée par `aria-current="true"`, pas seulement par la coche.
 * `hrefLang` sur chaque lien renseigne les technologies d'assistance — et les
 * moteurs — sur la langue de destination.
 */
export function LocaleSwitcher({ locale, label, ariaLabel, currentAria, className }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${ariaLabel} — ${currentAria.replace("{language}", LOCALE_LABELS[locale].native)}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="locale-menu"
        className={cn(
          "border-border text-muted hover:text-foreground focus-visible:ring-ring",
          "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
          "transition-colors focus-visible:ring-2 focus-visible:outline-none",
          open && "text-foreground border-border-strong",
        )}
      >
        <Globe className="size-3.5 shrink-0" aria-hidden />
        <span className="font-mono tracking-wide">{LOCALE_LABELS[locale].short}</span>
      </button>

      <div
        id="locale-menu"
        role="menu"
        aria-label={label}
        // `hidden` plutôt qu'un démontage : le menu garde sa position et son
        // animation d'ouverture, et reste hors du parcours de tabulation.
        hidden={!open}
        className={cn(
          "glass absolute end-0 top-11 z-50 min-w-[11rem] overflow-hidden",
          "rounded-[var(--radius-md)] p-1 shadow-[var(--shadow-lg)]",
        )}
      >
        <ul>
          {LOCALES.map((item) => {
            const current = item === locale;
            return (
              <li key={item}>
                <Link
                  href={switchLocalePath(pathname, item)}
                  hrefLang={item}
                  role="menuitem"
                  aria-current={current ? "true" : undefined}
                  // La langue de destination doit être annoncée dans SA langue :
                  // sans cet attribut, un lecteur d'écran francophone lirait
                  // « العربية » avec des règles de prononciation françaises.
                  lang={item}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm",
                    "transition-colors",
                    current
                      ? "text-brand font-medium"
                      : "text-muted hover:bg-elevated hover:text-foreground",
                  )}
                >
                  <span className="text-subtle w-6 shrink-0 font-mono text-[0.6875rem] tracking-wide">
                    {LOCALE_LABELS[item].short}
                  </span>
                  <span className="flex-1">{LOCALE_LABELS[item].native}</span>
                  {current ? <Check className="text-brand size-3.5 shrink-0" aria-hidden /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
