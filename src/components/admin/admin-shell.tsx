"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Monogram } from "@/components/brand/monogram";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { AdminNavSection } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

type Props = {
  sections: AdminNavSection[];
  user: { name: string; email: string };
  children: React.ReactNode;
};

/**
 * Ossature du back-office : barre latérale fixe sur grand écran, panneau
 * coulissant sur mobile. Le contenu est rendu côté serveur ; seul l'état
 * d'ouverture du panneau vit ici.
 */
export function AdminShell({ sections, user, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Le panneau mobile se referme à chaque navigation, y compris via les
  // boutons précédent/suivant du navigateur. L'ajustement se fait pendant le
  // rendu plutôt que dans un effet : React relance immédiatement le rendu,
  // sans passe d'affichage intermédiaire avec le panneau encore ouvert.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Empêche le défilement de l'arrière-plan quand le panneau est ouvert.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="bg-sunken flex min-h-dvh">
      {/* Barre latérale — écrans larges */}
      <aside className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <AdminSidebar sections={sections} user={user} />
      </aside>

      {/* Panneau coulissant — mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 transition-transform duration-300 ease-[var(--ease-signature)]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal={mobileOpen}
          aria-label="Menu du back-office"
        >
          <AdminSidebar
            sections={sections}
            user={user}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Zone de contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-surface/80 border-border sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-lg lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="text-muted hover:text-foreground hover:bg-elevated rounded-[var(--radius-sm)] p-2 transition-colors lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Monogram className="size-7 lg:hidden" />

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="size-9" />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
