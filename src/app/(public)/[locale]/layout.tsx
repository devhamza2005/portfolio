import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";
import { fontVariablesFor } from "@/lib/fonts";
import { DIRECTION, LOCALES, isLocale } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionaries";
import { alternatesFor, robotsFor } from "@/lib/seo";
import { getCurrentYear } from "@/server/queries/now";
import { getTerminalData } from "@/server/queries/terminal";
import { getProfile, getSocialLinks } from "@/server/queries/portfolio";

import "../../globals.css";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LAYOUT RACINE — SITE PUBLIC (une langue par segment)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce layout est SOUS le segment `[locale]`, ce qui en fait à la fois le layout
 * racine du site public et le point où `lang` et `dir` sont décidés. C'est la
 * seule position possible : `<html dir="rtl">` ne peut être posé que par le
 * composant qui rend `<html>`.
 *
 * `[locale]` étant au-dessus du layout racine, c'est un « root parameter » :
 * n'importe quel composant serveur peut le lire via `next/root-params`, sans
 * qu'il ait à descendre en props (voir src/lib/i18n/dictionaries.ts).
 *
 * La navbar et le footer lisent le profil depuis la base : changer son nom ou
 * ajouter un lien social depuis /admin les met à jour partout, sans toucher au
 * code (§12).
 */

/**
 * Les trois langues sont prérendues.
 *
 * Avec Cache Components, chaque paramètre racine DOIT avoir au moins une valeur
 * ici, sans quoi le build échoue.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return {
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
    alternates: alternatesFor(locale, "/"),
    robots: robotsFor(locale),
    formatDetection: { telephone: false },
    referrer: "strict-origin-when-cross-origin",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

export default async function PublicRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionaryFor(locale);

  const [profile, socialLinks, year, terminal] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getCurrentYear(),
    // Instantané pour le Developer Terminal — uniquement des lectures déjà
    // mises en cache, aucune requête supplémentaire.
    getTerminalData(locale, t),
  ]);

  // Repli si la base n'est pas encore amorcée : le site reste affichable.
  const name = profile?.fullName ?? siteConfig.fallback.name;
  const headline = profile?.headline ?? siteConfig.fallback.description;
  const email = profile?.email ?? "";
  const direction = DIRECTION[locale];

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      // Noto Sans Arabic n'est téléchargée que sur les pages arabes.
      className={`${fontVariablesFor(locale === "ar")} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <ScrollProgress />

          <Navbar
            locale={locale}
            name={name}
            cvUrl={profile?.cvUrl ?? null}
            t={t.nav}
            navItems={t.nav.items}
            localeStrings={t.locale}
            themeLabel={t.theme.toggle}
            terminal={{
              data: terminal,
              messages: t.terminal.messages,
              openLabel: t.terminal.open,
              shortcutHint: t.terminal.shortcut,
            }}
          />

          <main id="main" className="flex-1">
            {children}
          </main>

          <Footer
            locale={locale}
            name={name}
            headline={headline}
            location={profile?.location ?? null}
            email={email}
            socialLinks={socialLinks}
            year={year}
            t={t.footer}
            navItems={t.nav.items}
          />

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
