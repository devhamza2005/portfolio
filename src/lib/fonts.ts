import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

/**
 * Polices auto-hébergées via next/font :
 * aucune requête vers un domaine tiers, aucun CLS, `font-display: swap`.
 */

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;
