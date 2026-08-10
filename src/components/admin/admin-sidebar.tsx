"use client";

import { ExternalLink, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Monogram } from "@/components/brand/monogram";
import { Icon } from "@/components/admin/icon";
import { Button } from "@/components/ui/button";
import type { AdminNavSection } from "@/config/admin-nav";
import { logoutAction } from "@/server/actions/auth.actions";
import { cn } from "@/lib/utils";

type Props = {
  sections: AdminNavSection[];
  user: { name: string; email: string };
  /** Ferme le panneau après navigation sur mobile. */
  onNavigate?: () => void;
};

export function AdminSidebar({ sections, user, onNavigate }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div
      className={cn(
        "bg-surface border-border flex h-full flex-col border-r transition-[width] duration-300 ease-[var(--ease-signature)]",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      {/* En-tête */}
      <div className="border-border flex h-16 shrink-0 items-center gap-2.5 border-b px-4">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <Monogram className="size-8 shrink-0" />
          {!collapsed && (
            <span className="font-display truncate text-sm font-semibold">Back-office</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          className="text-subtle hover:text-foreground hover:bg-elevated ml-auto hidden rounded-[var(--radius-sm)] p-1.5 transition-colors lg:block"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation du back-office">
        {sections.map((section) => (
          <div key={section.title} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="text-subtle mb-2 px-2.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-sm transition-colors duration-200",
                        active
                          ? "bg-brand-soft text-brand font-medium"
                          : "text-muted hover:bg-elevated hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="bg-brand absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
                      )}
                      <Icon name={item.icon} className="size-[1.125rem] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pied */}
      <div className="border-border space-y-2 border-t p-3">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className={cn(
            "text-muted hover:bg-elevated hover:text-foreground flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-sm transition-colors",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Voir le site" : undefined}
        >
          <ExternalLink className="size-[1.125rem] shrink-0" />
          {!collapsed && <span>Voir le site</span>}
        </Link>

        {!collapsed && (
          <div className="bg-elevated rounded-[var(--radius-md)] px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-subtle truncate text-xs">{user.email}</p>
          </div>
        )}

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start", collapsed && "justify-center px-0")}
            title={collapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="size-[1.125rem]" />
            {!collapsed && "Déconnexion"}
          </Button>
        </form>
      </div>
    </div>
  );
}
