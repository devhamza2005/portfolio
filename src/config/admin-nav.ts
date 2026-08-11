/**
 * Navigation du back-office.
 *
 * Les entrées de la section « Contenu » correspondent aux clés du registre
 * des ressources (src/resources) : ajouter une ressource la fait apparaître
 * ici automatiquement, sans modifier ce fichier.
 */

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  /** Clé de ressource — permet de compter les éléments dans la navigation. */
  resourceKey?: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_STATIC: AdminNavSection[] = [
  {
    title: "Pilotage",
    items: [{ href: "/admin", label: "Tableau de bord", icon: "LayoutDashboard" }],
  },
  {
    title: "Réglages",
    items: [
      { href: "/admin/media", label: "Médiathèque", icon: "Images" },
      { href: "/admin/messages", label: "Messages", icon: "Inbox" },
      { href: "/admin/profile", label: "Profil", icon: "UserRound" },
    ],
  },
];
