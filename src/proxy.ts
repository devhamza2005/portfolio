import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

/**
 * Proxy (ex-middleware, renommé dans Next.js 16).
 *
 * Deux rôles, strictement séparés et traités dans cet ordre :
 *
 *  1. AUTHENTIFICATION (`/admin/*`) — rediriger vers /login les visiteurs sans
 *     cookie de session, pour éviter un aller-retour inutile. INCHANGÉ.
 *  2. LANGUE (site public) — préfixer d'une locale toute URL publique qui n'en
 *     a pas : `/` → `/fr`, `/projects` → `/fr/projects`.
 *
 * ⚠️ Ce fichier n'est PAS la sécurité de l'application. Le cookie n'y est pas
 * vérifié cryptographiquement — un cookie falsifié passerait ce filtre.
 * L'autorisation réelle est faite par `requireAdmin()` dans le layout /admin
 * et au début de chaque Server Action (voir src/server/guards.ts).
 */

/** Noms de cookie utilisés par Auth.js selon l'environnement. */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

/**
 * Chemins qui ne relèvent JAMAIS du site public localisé.
 *
 * `/admin` et `/login` sont francophones et vivent sous leur propre layout
 * racine ; `/api` sert des données ; le reste est technique. Les préfixer
 * d'une langue casserait l'authentification et les téléversements.
 */
const NON_LOCALISES = ["/admin", "/login", "/api", "/design-system", "/_next", "/_vercel"];

/** Fichiers servis tels quels : robots.txt, sitemap.xml, icônes, manifeste… */
const FICHIERS = /\.[a-z0-9]+$/i;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Zone privée : la logique d'origine, inchangée ─────────────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

    if (hasSession) return NextResponse.next();

    /**
     * Les invocations de Server Action passent SANS redirection.
     *
     * Rediriger un POST d'action vers /login remplace silencieusement l'écran :
     * l'utilisateur clique « Enregistrer », sa saisie disparaît, et rien
     * n'explique pourquoi. En laissant la requête aller au serveur,
     * `requireAdminOrThrow()` la refuse et renvoie « Session expirée.
     * Reconnectez-vous. », que le formulaire affiche.
     *
     * Aucune permissivité ici : ce fichier ne protège rien (le cookie n'y est
     * pas vérifié cryptographiquement). La garde côté serveur reste la seule
     * autorisation, et elle s'applique de la même façon.
     */
    if (request.headers.has("next-action")) return NextResponse.next();

    const loginUrl = new URL("/login", request.url);
    // Mémorise la destination pour y revenir après connexion.
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Site public : garantir un préfixe de langue ────────────────────────

  // Route technique, francophone ou fichier : on ne touche à rien.
  if (NON_LOCALISES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }
  if (FICHIERS.test(pathname)) return NextResponse.next();

  /**
   * Déjà préfixé → laisser passer.
   *
   * C'est ce test qui rend toute boucle impossible : la cible d'une
   * redirection commence forcément par une locale connue, donc la requête
   * suivante ressort ici sans être redirigée une seconde fois.
   */
  const first = pathname.split("/")[1];
  if (first && isLocale(first)) return NextResponse.next();

  /**
   * Sinon, préfixer par le français.
   *
   * La langue vient de l'URL et de rien d'autre — ni cookie, ni en-tête
   * `Accept-Language`. Une négociation par en-tête rendrait la réponse
   * dépendante de la requête, ce qui est incompatible avec le prérendu
   * statique de Cache Components : `/` doit pouvoir être servi depuis le cache.
   *
   * Redirection 307 (temporaire) et non 308 : le jour où la négociation de
   * langue sera souhaitée, un 308 resterait gravé dans le cache des
   * navigateurs qui ont vu la première réponse.
   */
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  /**
   * Tout le site sauf les ressources internes de Next et les fichiers
   * statiques — le filtrage fin est fait dans la fonction ci-dessus.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
