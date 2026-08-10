import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Monogram } from "@/components/brand/monogram";
import { getCurrentUser } from "@/server/guards";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // Déjà connecté : inutile de réafficher le formulaire.
  if (await getCurrentUser()) redirect("/admin");

  const { from } = await searchParams;

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
      {/* Fond d'ambiance — purement décoratif */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="bg-grid mask-fade absolute inset-0" />
        <div
          className="animate-aurora absolute top-[-20%] left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-[110px]"
          style={{ background: "var(--aurora-1)" }}
        />
      </div>

      <div className="relative w-full max-w-[26rem]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Monogram className="size-14" />
          <div>
            <h1 className="font-display text-2xl font-semibold">Back-office</h1>
            <p className="text-muted mt-1.5 text-sm">
              Espace réservé à la gestion du contenu du portfolio.
            </p>
          </div>
        </div>

        <div className="glass rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <LoginForm from={from} />
        </div>

        <div className="text-subtle mt-6 flex flex-col items-center gap-3 text-xs">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Connexion chiffrée · session limitée à 8 heures
          </p>
          <Link
            href="/"
            className="hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Retour au portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
