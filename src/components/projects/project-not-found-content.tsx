"use client";

import { ArrowLeft, FolderSearch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/use-locale";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

/**
 * Contenu de la page « projet introuvable ».
 *
 * ── Pourquoi un composant client ───────────────────────────────────────────
 *
 * `not-found.tsx` ne reçoit PAS de `params` : c'est une contrainte de Next.js,
 * le fichier étant rendu en réaction à `notFound()` et non à une URL résolue.
 * Impossible d'y lire la locale côté serveur. La liste des projets, elle, doit
 * venir du serveur. D'où ce découpage : le parent serveur charge les données,
 * ce composant relit la langue depuis l'URL — la même source de vérité que
 * partout ailleurs.
 *
 * Seule la tranche `caseStudy` des trois dictionnaires est retenue par le
 * bundler ; le reste est éliminé.
 */
const MESSAGES = { fr: fr.caseStudy, en: en.caseStudy, ar: ar.caseStudy };

export function ProjectNotFoundContent({
  projects,
}: {
  projects: { id: string; slug: string; title: string }[];
}) {
  const locale = useLocale();
  const t = MESSAGES[locale];

  return (
    <div className="container-content relative text-center">
      <span className="bg-elevated text-subtle mx-auto mb-6 grid size-14 place-items-center rounded-full">
        <FolderSearch className="size-6" />
      </span>

      <p className="text-subtle mb-3 font-mono text-xs tracking-[0.2em] uppercase">404</p>

      <h1 className="text-display-md font-display">{t.notFoundTitle}</h1>

      <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">{t.notFoundBody}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="md">
          <Link href={localizedPath(locale, "/projects")}>
            <ArrowLeft className="rtl:-scale-x-100" />
            {t.seeAllProjects}
          </Link>
        </Button>
        <Button asChild size="md" variant="ghost">
          <Link href={localizedPath(locale, "/")}>{t.backHome}</Link>
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="mt-12">
          <p className="text-subtle mb-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            {t.availableProjects}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={localizedPath(locale, `/projects/${project.slug}`)}
                  className="border-border text-muted hover:border-brand/40 hover:text-foreground inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors"
                >
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
