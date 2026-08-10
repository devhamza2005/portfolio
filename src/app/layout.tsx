import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

/**
 * Métadonnées de repli. Chaque route publique enrichit ces valeurs avec les
 * données réelles du profil via `generateMetadata` (voir src/lib/seo.ts).
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fallback.title,
    template: `%s — ${siteConfig.fallback.name}`,
  },
  description: siteConfig.fallback.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.fallback.name, url: siteConfig.url }],
  creator: siteConfig.fallback.name,
  formatDetection: { telephone: false },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
