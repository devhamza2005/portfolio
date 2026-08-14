"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Monogram } from "@/components/brand/monogram";
import { CommandPaletteLauncher } from "@/components/command-palette/command-palette-launcher";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { TerminalLauncher } from "@/components/terminal/terminal-launcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { SECTION_NAV, OBSERVED_SECTIONS, navHref, type NavId } from "@/config/nav";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  name: string;
  cvUrl: string | null;
  /** Tranche `nav` du dictionnaire — résolue côté serveur. */
  t: {
    skipToContent: string;
    primaryAria: string;
    mobileAria: string;
    homeAria: string;
    openMenu: string;
    closeMenu: string;
    cvShort: string;
    downloadCv: string;
  };
  navItems: Record<NavId, string>;
  localeStrings: { label: string; ariaLabel: string; currentAria: string };
  themeLabel: string;
  /** Developer Terminal — données et libellés préparés côté serveur. */
  terminal: {
    data: React.ComponentProps<typeof TerminalLauncher>["data"];
    messages: React.ComponentProps<typeof TerminalLauncher>["t"];
    openLabel: string;
    shortcutHint: string;
  };
  /**
   * Command Palette. Les données réutilisent l'instantané du terminal — le CV
   * et le profil GitHub n'ont pas à être relus une seconde fois.
   */
  command: React.ComponentProps<typeof CommandPaletteLauncher>["t"];
};

/**
 * Navigation principale — collante, avec verre dépoli au défilement et
 * indicateur de section active.
 *
 * La section courante est détectée par IntersectionObserver plutôt qu'en
 * écoutant l'événement `scroll` : le navigateur fait le calcul lui-même, hors
 * du fil principal, et aucune position n'est recalculée à chaque pixel.
 *
 * ── i18n ──────────────────────────────────────────────────────────────────
 *
 * Ce composant est client : il ne peut pas lire `next/root-params`. Les textes
 * lui arrivent donc en props depuis le layout racine, déjà résolus. Seules les
 * chaînes dont il a besoin sont transmises — le dictionnaire complet ne part
 * jamais dans le bundle.
 */
export function Navbar({
  locale,
  name,
  cvUrl,
  t,
  navItems,
  localeStrings,
  themeLabel,
  terminal,
  command,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();

  const home = localizedPath(locale, "/");

  /**
   * L'accueil est désormais `/fr`, `/en` ou `/ar` — et non plus `/`. La barre
   * oblique finale est tolérée : Next peut servir les deux formes.
   */
  const isHome = pathname === home || pathname === `${home}/`;

  /**
   * Une entrée est active soit parce qu'on se trouve sur sa page, soit — sur
   * l'accueil uniquement — parce que sa section est à l'écran.
   */
  const isActive = (item: { id: NavId; isPage?: boolean }) =>
    item.isPage ? pathname.startsWith(localizedPath(locale, `/${item.id}`)) : isHome && active === item.id;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // La section la plus visible l'emporte : au milieu d'un défilement,
        // deux sections se chevauchent souvent.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const id of OBSERVED_SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Le menu mobile ouvert ne doit pas laisser défiler la page derrière lui.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="bg-brand-solid text-brand-contrast focus:ring-ring sr-only rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[70] focus:ring-2"
      >
        {t.skipToContent}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[var(--ease-signature)]",
          scrolled ? "py-2" : "py-4",
        )}
      >
        <div className="container-content">
          <nav
            aria-label={t.primaryAria}
            className={cn(
              "flex items-center gap-3 rounded-full transition-all duration-300 ease-[var(--ease-signature)]",
              scrolled
                ? "glass px-3 py-2 shadow-[var(--shadow-md)]"
                : "border border-transparent px-1 py-2",
            )}
          >
            <Link
              href={home}
              className="flex shrink-0 items-center gap-2.5 rounded-full px-1"
              aria-label={t.homeAria.replace("{name}", name)}
            >
              <Monogram className="size-8" title={name} />
              <span className="font-display hidden text-sm font-semibold tracking-tight sm:block">
                {name}
              </span>
            </Link>

            <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
              {SECTION_NAV.map((item) => {
                const current = isActive(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={navHref(locale, item.path)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
                        current
                          ? "text-foreground font-medium"
                          : "text-muted hover:text-foreground",
                      )}
                    >
                      {current ? (
                        <span
                          className="bg-brand absolute inset-x-3.5 -bottom-0.5 h-px"
                          aria-hidden
                        />
                      ) : null}
                      {navItems[item.id]}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
              {/* Volontairement visible à toutes les largeurs — voir le
                  commentaire du lanceur. */}
              <CommandPaletteLauncher
                locale={locale}
                data={{ githubUrl: terminal.data.githubUrl, cvUrl: terminal.data.cvUrl }}
                t={command}
              />

              <LocaleSwitcher
                locale={locale}
                label={localeStrings.label}
                ariaLabel={localeStrings.ariaLabel}
                currentAria={localeStrings.currentAria}
              />

              <TerminalLauncher
                data={terminal.data}
                t={terminal.messages}
                localePrefix={home}
                openLabel={terminal.openLabel}
                shortcutHint={terminal.shortcutHint}
                className="hidden sm:inline-flex"
              />

              <ThemeToggle className="size-9" label={themeLabel} />

              {cvUrl ? (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <a href={cvUrl} download>
                    {t.cvShort}
                  </a>
                </Button>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? t.closeMenu : t.openMenu}
                aria-expanded={open}
                aria-controls="menu-mobile"
                className="border-border text-muted hover:text-foreground grid size-9 place-items-center rounded-full border transition-colors lg:hidden"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Menu mobile plein écran */}
      <div
        id="menu-mobile"
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "bg-background/95 absolute inset-0 backdrop-blur-xl transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />

        <nav
          aria-label={t.mobileAria}
          className="relative flex h-full flex-col justify-center px-8"
        >
          <ul className="space-y-1">
            {SECTION_NAV.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={navHref(locale, item.path)}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive(item) ? "page" : undefined}
                  style={{ transitionDelay: open ? `${index * 45}ms` : "0ms" }}
                  className={cn(
                    "font-display block py-3 text-3xl font-semibold transition-all duration-400 ease-[var(--ease-signature)]",
                    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                    isActive(item) ? "text-brand" : "text-foreground",
                  )}
                >
                  <span className="text-subtle me-3 font-mono text-sm">0{index + 1}</span>
                  {navItems[item.id]}
                </Link>
              </li>
            ))}
          </ul>

          {cvUrl ? (
            <div
              className={cn(
                "mt-10 transition-all duration-400",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: open ? "280ms" : "0ms" }}
            >
              <Button asChild size="lg" tabIndex={open ? 0 : -1}>
                <a href={cvUrl} download onClick={() => setOpen(false)}>
                  {t.downloadCv}
                </a>
              </Button>
            </div>
          ) : null}
        </nav>
      </div>
    </>
  );
}
