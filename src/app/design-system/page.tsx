import { notFound } from "next/navigation";
import { Sparkles, Rocket, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Référence vivante du design system « HF ».
 * Accessible uniquement en développement : sert à vérifier la cohérence des
 * tokens dans les deux thèmes sans polluer le site public.
 */
export const metadata = { title: "Design System", robots: { index: false, follow: false } };

// Classes écrites en toutes lettres : Tailwind scanne le source, les noms
// construits dynamiquement (`bg-${x}`) ne seraient jamais générés.
const SURFACES = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["elevated", "bg-elevated"],
  ["sunken", "bg-sunken"],
] as const;

const SEMANTIC = [
  ["brand", "bg-brand"],
  ["accent", "bg-accent"],
  ["ember", "bg-ember"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
] as const;
const BADGES = ["default", "brand", "accent", "ember", "success", "warning", "danger", "outline"] as const;
const BUTTONS = ["primary", "secondary", "outline", "ghost", "danger", "glass"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-border border-t py-12 first:border-t-0">
      <h2 className="text-subtle mb-6 font-mono text-xs tracking-[0.2em] uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="container-content py-16">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-gradient">Design System HF</h1>
          <p className="text-muted mt-2 text-sm">
            Référence des tokens. Basculez le thème pour vérifier les contrastes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="01 — Typographie">
        <div className="space-y-4">
          <p className="text-display-xl font-display">Hamza Fanoune</p>
          <p className="text-display-lg font-display">Développeur Full Stack</p>
          <p className="text-display-md font-display">Spring Boot &amp; React</p>
          <p className="text-display-sm font-display">Titre de section</p>
          <p className="text-muted max-w-prose text-base leading-relaxed">
            Corps de texte en Inter. Le contraste est validé WCAG AA dans les deux thèmes.
          </p>
          <p className="text-subtle font-mono text-sm">// 01 — label monospace</p>
        </div>
      </Section>

      <Section title="02 — Surfaces">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SURFACES.map(([name, bg]) => (
            <div key={name} className="border-border overflow-hidden rounded-[var(--radius-md)] border">
              <div className={`h-16 ${bg}`} />
              <p className="text-muted p-3 font-mono text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="03 — Couleurs sémantiques">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SEMANTIC.map(([name, bg]) => (
            <div key={name} className="border-border overflow-hidden rounded-[var(--radius-md)] border">
              <div className={`h-16 ${bg}`} />
              <p className="text-muted p-3 font-mono text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="04 — Boutons">
        <div className="space-y-4">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              {BUTTONS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  <Sparkles /> {variant}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon" variant="secondary" aria-label="Action">
              <Rocket />
            </Button>
            <Button variant="link">Lien</Button>
            <Button disabled>Désactivé</Button>
          </div>
        </div>
      </Section>

      <Section title="05 — Badges">
        <div className="flex flex-wrap gap-2">
          {BADGES.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="06 — Cartes">
        <div className="grid gap-4 md:grid-cols-3">
          {(["default", "glass", "gradient"] as const).map((variant) => (
            <Card key={variant} variant={variant} interactive className="spotlight">
              <CardHeader>
                <CardTitle>Carte « {variant} »</CardTitle>
                <CardDescription>
                  Survolez : élévation, bordure et halo réagissent ensemble.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="brand">Spring Boot</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="07 — Formulaires">
        <div className="grid max-w-xl gap-5">
          <div className="grid gap-2">
            <Label htmlFor="ds-name">Nom</Label>
            <Input id="ds-name" placeholder="Votre nom" />
            <FieldHint>Texte d&apos;aide sous le champ.</FieldHint>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-mail">Email</Label>
            <Input id="ds-mail" type="email" aria-invalid defaultValue="invalide" />
            <FieldError>Adresse email invalide.</FieldError>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-msg">Message</Label>
            <Textarea id="ds-msg" placeholder="Votre message…" />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ds-featured" defaultChecked />
            <Label htmlFor="ds-featured">Mettre en vedette</Label>
          </div>
        </div>
      </Section>

      <Section title="08 — Onglets">
        <Tabs defaultValue="backend">
          <TabsList>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
          </TabsList>
          <TabsContent value="backend" className="text-muted text-sm">
            Spring Boot, Spring Security, JEE, Express.js
          </TabsContent>
          <TabsContent value="frontend" className="text-muted text-sm">
            React.js, HTML5, CSS3
          </TabsContent>
          <TabsContent value="devops" className="text-muted text-sm">
            Docker, Jenkins, Ansible, Terraform, SonarQube
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="09 — États (loading / empty / error)">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <EmptyState
            icon={<Sparkles />}
            title="Aucun projet"
            description="Ajoutez votre premier projet depuis le back-office."
            action={<Button size="sm">Ajouter un projet</Button>}
          />
          <ErrorState
            icon={<AlertTriangle />}
            title="Chargement impossible"
            description="Une erreur est survenue. Réessayez dans un instant."
            action={
              <Button size="sm" variant="secondary">
                Réessayer
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="10 — Effets">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-border bg-grid mask-fade h-32 rounded-[var(--radius-lg)] border" />
          <div className="glass flex h-32 items-center justify-center rounded-[var(--radius-lg)] text-sm">
            glass
          </div>
          <div className="border-gradient bg-surface flex h-32 items-center justify-center rounded-[var(--radius-lg)] text-sm">
            border-gradient
          </div>
        </div>
      </Section>
    </main>
  );
}
