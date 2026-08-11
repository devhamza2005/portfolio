import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (ex-middleware, renommé dans Next.js 16).
 *
 * Rôle volontairement limité : rediriger vers /login les visiteurs qui
 * n'ont aucun cookie de session, afin d'éviter un aller-retour inutile.
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

export default function proxy(request: NextRequest) {
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
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
