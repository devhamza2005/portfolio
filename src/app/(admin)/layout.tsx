import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";

import "../globals.css";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LAYOUT RACINE — ZONE PRIVÉE (back-office, connexion, design system)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Pourquoi deux layouts racines ──────────────────────────────────────────
 *
 * `<html dir>` et `<html lang>` ne peuvent être décidés que par le composant
 * qui rend `<html>`. Pour que l'arabe soit un vrai RTL, le segment `[locale]`
 * doit donc se trouver AU-DESSUS du layout racine du site public.
 *
 * Or le back-office ne doit pas être multilingue. Plutôt que de lui imposer un
 * préfixe de langue inutile (`/fr/admin`), l'application a deux layouts
 * racines — un motif explicitement prévu par Next.js : « Any layout without a
 * layout.js above it is a root layout. »
 *
 * Conséquence assumée : passer du site au back-office provoque un rechargement
 * complet de page. Ce sont deux univers distincts, la navigation client entre
 * eux n'avait aucun intérêt.
 *
 * Cette zone reste EN FRANÇAIS et n'a aucune connaissance de l'i18n : ni
 * `next/root-params`, ni dictionnaire. Son fonctionnement est inchangé.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Administration — ${siteConfig.fallback.name}`,
    template: `%s — ${siteConfig.fallback.name}`,
  },
  // Aucune page de cette zone n'a vocation à être indexée : ni le back-office,
  // ni l'écran de connexion, ni le design system.
  robots: { index: false, follow: false },
  formatDetection: { telephone: false },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.lang}
      dir="ltr"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ className: "font-sans" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
