import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_NAV_STATIC, type AdminNavSection } from "@/config/admin-nav";
import { listResources } from "@/resources";
import { requireAdmin } from "@/server/guards";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s — Back-office" },
  robots: { index: false, follow: false },
};

// `force-dynamic` n'est plus nécessaire : avec Cache Components, tout est
// dynamique par défaut et seul ce qui porte `use cache` est mis en cache.
// Le back-office ne cache rien — chaque requête revérifie la session.
//
// `instant = false` assume explicitement que ces routes sont bloquantes :
// une page d'administration doit lire la session et la base avant de
// s'afficher, il n'y a pas de coquille statique à prérendre. Le prérendu
// partiel reste actif là où il compte vraiment — sur le site public.
export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Garde serveur — la vraie protection (§15). `proxy.ts` ne fait que rediriger.
  const user = await requireAdmin();

  // La section « Contenu » est construite à partir du registre : ajouter une
  // ressource la fait apparaître dans le menu sans toucher à ce fichier.
  const contentSection: AdminNavSection = {
    title: "Contenu",
    items: listResources().map((resource) => ({
      href: `/admin/${resource.key}`,
      label: resource.label.plural,
      icon: resource.icon,
      resourceKey: resource.key,
    })),
  };

  const sections = [
    ADMIN_NAV_STATIC[0]!,
    ...(contentSection.items.length ? [contentSection] : []),
    ADMIN_NAV_STATIC[1]!,
  ];

  return (
    <AdminShell sections={sections} user={{ name: user.name, email: user.email }}>
      {children}
    </AdminShell>
  );
}
