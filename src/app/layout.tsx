import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import { publicRobots } from "@/lib/seo";

import "./globals.css";

/**
 * Métadonnées de repli, communes à tout le document.
 *
 * Chaque route publique les enrichit avec les données réelles du profil via
 * `generateMetadata` (voir src/lib/seo.ts). Ce qui reste ici est ce qui ne
 * dépend d'aucune donnée : la base des URLs, le gabarit de titre, l'identité
 * de l'auteur et les directives d'indexation.
 *
 * `metadataBase` est ce qui permet d'écrire des chemins relatifs partout
 * ailleurs — canonical, images Open Graph — et de n'avoir qu'une seule URL de
 * référence dans tout le projet (`NEXT_PUBLIC_SITE_URL`).
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fallback.title,
    template: `%s — ${siteConfig.fallback.name}`,
  },
  description: siteConfig.fallback.description,
  // Mots-clés volontairement peu nombreux et tous vrais : le bourrage est
  // ignoré par les moteurs depuis longtemps, et trahit un site amateur.
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.fallback.name, url: siteConfig.url }],
  creator: siteConfig.fallback.name,
  publisher: siteConfig.fallback.name,
  applicationName: `${siteConfig.fallback.name} — Portfolio`,
  robots: publicRobots,
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.lang}
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
