import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Page d'accueil provisoire (Phase 0/1).
 * Sera remplacée en Phase 5 par la composition des 13 sections publiques
 * alimentées par la base de données.
 */
export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-content relative flex flex-col items-center gap-6 py-24 text-center">
        <Badge variant="brand">Portfolio en construction — Phase 1</Badge>
        <h1 className="text-display-xl font-display">
          <span className="text-gradient">HAMZA FANOUNE</span>
        </h1>
        <p className="text-muted font-mono text-sm tracking-wide sm:text-base">
          Full Stack Developer — Java | Spring Boot | React
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/design-system">Voir le design system</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
