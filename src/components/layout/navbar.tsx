"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Monogram } from "@/components/brand/monogram";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { SECTION_NAV, OBSERVED_SECTIONS } from "@/config/nav";
import { cn } from "@/lib/utils";

/**
 * Navigation principale — collante, avec verre dépoli au défilement et
 * indicateur de section active.
 *
 * La section courante est détectée par IntersectionObserver plutôt qu'en
 * écoutant l'événement `scroll` : le navigateur fait le calcul lui-même, hors
 * du fil principal, et aucune position n'est recalculée à chaque pixel.
 */
export function Navbar({ name, cvUrl }: { name: string; cvUrl: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";

  /**
   * Une entrée est active soit parce qu'on se trouve sur sa page, soit — sur
   * l'accueil uniquement — parce que sa section est à l'écran.
   */
  const isActive = (item: { id: string; isPage?: boolean }) =>
    item.isPage
      ? pathname.startsWith(`/${item.id}`)
      : isHome && active === item.id;

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
        className="bg-brand-solid text-brand-contrast focus:ring-ring sr-only rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:ring-2"
      >
        Aller au contenu principal
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[var(--ease-signature)]",
          scrolled ? "py-2" : "py-4",
        )}
      >
        <div className="container-content">
          <nav
            aria-label="Navigation principale"
            className={cn(
              "flex items-center gap-3 rounded-full transition-all duration-300 ease-[var(--ease-signature)]",
              scrolled
                ? "glass px-3 py-2 shadow-[var(--shadow-md)]"
                : "border border-transparent px-1 py-2",
            )}
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-full px-1"
              aria-label={`${name} — accueil`}
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
                      href={item.href}
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
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
              <ThemeToggle className="size-9" />

              {cvUrl ? (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <a href={cvUrl} download>
                    CV
                  </a>
                </Button>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
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
          aria-label="Navigation mobile"
          className="relative flex h-full flex-col justify-center px-8"
        >
          <ul className="space-y-1">
            {SECTION_NAV.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={item.href}
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
                  <span className="text-subtle mr-3 font-mono text-sm">0{index + 1}</span>
                  {item.label}
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
                  Télécharger mon CV
                </a>
              </Button>
            </div>
          ) : null}
        </nav>
      </div>
    </>
  );
}
