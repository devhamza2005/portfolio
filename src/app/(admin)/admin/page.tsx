import { AlertTriangle, ArrowUpRight, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/admin/icon";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/server/db";
import { getPortfolioCounts } from "@/server/queries/stats";
import { requireAdmin } from "@/server/guards";

export const metadata = { title: "Tableau de bord" };

/** Cartes de comptage — toutes alimentées par des requêtes réelles (§25). */
const TILES = [
  { key: "projects", label: "Projets", icon: "FolderKanban", href: "/admin/projects" },
  { key: "technologies", label: "Technologies", icon: "Boxes", href: "/admin/technologies" },
  { key: "skills", label: "Compétences", icon: "Gauge", href: "/admin/skills" },
  { key: "experiences", label: "Expériences", icon: "Briefcase", href: "/admin/experiences" },
  { key: "education", label: "Formations", icon: "GraduationCap", href: "/admin/education" },
  {
    key: "certifications",
    label: "Certifications",
    icon: "BadgeCheck",
    href: "/admin/certifications",
  },
  { key: "achievements", label: "Réalisations", icon: "Trophy", href: "/admin/achievements" },
  { key: "media", label: "Médias", icon: "Images", href: "/admin/media" },
] as const;

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const [counts, profile, recentMessages, draftProjects] = await Promise.all([
    getPortfolioCounts(),
    db.profile.findUnique({
      where: { id: "profile" },
      select: { fullName: true, cvUrl: true, avatarId: true, seoDescription: true },
    }),
    db.contactMessage.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, subject: true, isRead: true, createdAt: true },
    }),
    db.project.count({ where: { published: false } }),
  ]);

  // Éléments de contenu qu'il reste à compléter — évite d'oublier
  // un champ important avant de partager le portfolio.
  const todos = [
    { done: Boolean(profile?.cvUrl), label: "Téléverser le CV", href: "/admin/settings" },
    { done: Boolean(profile?.avatarId), label: "Ajouter une photo de profil", href: "/admin/settings" },
    {
      done: Boolean(profile?.seoDescription),
      label: "Renseigner la description SEO",
      href: "/admin/settings",
    },
    { done: counts.certifications > 0, label: "Ajouter une certification", href: "/admin/certifications" },
  ];
  const pending = todos.filter((item) => !item.done);

  return (
    <>
      <PageHeader
        title={`Bonjour, ${user.name.split(" ")[0]}`}
        description="Vue d'ensemble du contenu publié sur votre portfolio."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/" target="_blank" rel="noreferrer">
              Voir le site <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link key={tile.key} href={tile.href} className="group">
            <Card
              variant="default"
              className="hover:border-brand/40 h-full p-4 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-subtle group-hover:text-brand transition-colors">
                  <Icon name={tile.icon} className="size-[1.125rem]" />
                </span>
                <ArrowUpRight className="text-subtle size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="font-display mt-3 text-2xl font-semibold tabular-nums">
                {counts[tile.key]}
              </p>
              <p className="text-muted mt-0.5 text-xs">{tile.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* À compléter */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">À compléter</h2>
            {pending.length === 0 ? (
              <Badge variant="success">
                <CheckCircle2 /> Tout est prêt
              </Badge>
            ) : (
              <Badge variant="warning">
                <AlertTriangle /> {pending.length} en attente
              </Badge>
            )}
          </div>

          <ul className="space-y-1.5">
            {todos.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:bg-elevated flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors"
                >
                  <span
                    className={
                      item.done
                        ? "text-success flex size-5 items-center justify-center"
                        : "border-border-strong flex size-5 items-center justify-center rounded-full border border-dashed"
                    }
                  >
                    {item.done ? <CheckCircle2 className="size-4" /> : null}
                  </span>
                  <span className={item.done ? "text-subtle text-sm line-through" : "text-sm"}>
                    {item.label}
                  </span>
                  <ArrowUpRight className="text-subtle ml-auto size-3.5" />
                </Link>
              </li>
            ))}
          </ul>

          {draftProjects > 0 ? (
            <p className="text-muted border-border mt-4 border-t pt-4 text-sm">
              {draftProjects} projet{draftProjects > 1 ? "s" : ""} non publié
              {draftProjects > 1 ? "s" : ""} — invisible{draftProjects > 1 ? "s" : ""} sur le site.{" "}
              <Link href="/admin/projects" className="text-brand hover:underline">
                Gérer
              </Link>
            </p>
          ) : null}
        </Card>

        {/* Messages */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">Messages</h2>
            {counts.unreadMessages > 0 ? (
              <Badge variant="brand">{counts.unreadMessages} non lu(s)</Badge>
            ) : null}
          </div>

          {recentMessages.length === 0 ? (
            <div className="text-subtle flex flex-col items-center gap-2 py-8 text-center">
              <Inbox className="size-6" />
              <p className="text-sm">Aucun message pour l&apos;instant.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {recentMessages.map((message) => (
                <li key={message.id}>
                  <Link
                    href="/admin/messages"
                    className="hover:bg-elevated block rounded-[var(--radius-md)] px-3 py-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {!message.isRead && <span className="bg-brand size-1.5 rounded-full" />}
                      <span className="truncate text-sm font-medium">{message.name}</span>
                      <span className="text-subtle ml-auto shrink-0 text-xs">
                        {message.createdAt.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {message.subject ? (
                      <p className="text-muted mt-0.5 truncate text-xs">{message.subject}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
