import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { formatRelative } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  STATISTIQUES GITHUB — API publique, aucun secret
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Pourquoi aucun jeton n'est nécessaire ──────────────────────────────────
 *
 * L'API REST publique de GitHub répond sans authentification, avec une limite
 * de 60 requêtes par heure et par adresse IP. Cette fonction porte `use cache`
 * avec `cacheLife("hours")` : UNE requête sert TOUS les visiteurs pendant une
 * heure, quel que soit leur nombre. La limite ne peut donc pas être atteinte
 * par le trafic du site — aucun `GITHUB_TOKEN` n'a été ajouté, et il ne doit
 * pas l'être sans une raison qui dépasse ce simple widget.
 *
 * ── Pourquoi le nom d'utilisateur n'est pas un paramètre de langue ─────────
 *
 * Comme les technologies (`getTechnologies()`), les données GitHub ne sont
 * PAS traduites : noms de dépôts et descriptions appartiennent à GitHub, pas
 * au portfolio. Seuls les libellés de l'interface qui les entourent suivent
 * la locale — dans le dictionnaire, pas ici.
 *
 * ── Tolérance aux pannes ────────────────────────────────────────────────────
 *
 * Un profil introuvable, une limite de débit atteinte ou un réseau indisponible
 * ne doivent jamais faire échouer une page. Toute défaillance rend `null` ; le
 * composant masque alors la section entière — même principe que Certifications
 * quand la base est vide.
 */

const API_BASE = "https://api.github.com";

/**
 * En-tête obligatoire : l'API GitHub refuse (403) toute requête sans
 * `User-Agent` identifiable, authentifiée ou non.
 */
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-hamza-fanoune",
  "X-GitHub-Api-Version": "2022-11-28",
};

type GithubUserResponse = {
  login: string;
  html_url: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
};

type GithubRepoResponse = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

export type GithubLanguageStat = { name: string; count: number; percent: number };

export type GithubRepoStat = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type GithubStats = {
  login: string;
  profileUrl: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  topLanguages: GithubLanguageStat[];
  recentRepos: GithubRepoStat[];
};

/** Dépôt récent, sa date déjà mise en mots — voir `withActivityLabels`. */
export type GithubRepoDisplay = GithubRepoStat & { pushedAtLabel: string };
export type GithubStatsDisplay = Omit<GithubStats, "recentRepos"> & {
  recentRepos: GithubRepoDisplay[];
};

async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`, { headers: HEADERS });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function getGithubStats(username: string | null): Promise<GithubStats | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("github-stats", username ?? "none");

  if (!username) return null;

  try {
    const [user, repos] = await Promise.all([
      fetchJson<GithubUserResponse>(`/users/${encodeURIComponent(username)}`),
      // 100 est le maximum par page ; largement suffisant pour un profil
      // personnel, et une pagination supplémentaire n'apporterait rien à un
      // widget qui n'affiche jamais plus de cinq langages et quatre dépôts.
      fetchJson<GithubRepoResponse[]>(
        `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      ),
    ]);

    if (!user || !repos) return null;

    // Les forks gonflent artificiellement l'activité : ils sont exclus des
    // langages et de l'activité récente, mais PAS du nombre de dépôts publics
    // ni des abonnés, qui restent le décompte officiel de GitHub.
    const original = repos.filter((repo) => !repo.fork && !repo.archived);

    const totalStars = original.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const languageCounts = new Map<string, number>();
    for (const repo of original) {
      if (!repo.language) continue;
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }

    const languageTotal = [...languageCounts.values()].reduce((sum, n) => sum + n, 0);

    const topLanguages: GithubLanguageStat[] = [...languageCounts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: languageTotal > 0 ? Math.round((count / languageTotal) * 100) : 0,
      }));

    const recentRepos: GithubRepoStat[] = [...original]
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 4)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at,
      }));

    return {
      login: user.login,
      profileUrl: user.html_url,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      topLanguages,
      recentRepos,
    };
  } catch {
    // Réseau indisponible pendant le build, panne côté GitHub… la page ne
    // doit jamais échouer pour un widget accessoire.
    return null;
  }
}

/**
 * Met en mots la date de chaque dépôt récent, dans la langue courante.
 *
 * `formatRelative` lit `Date.now()` : appelée directement pendant le rendu
 * d'une page prérendue, Next.js la refuse — la valeur pourrait changer d'un
 * rendu à l'autre (même raisonnement que `getCurrentYear()` dans
 * `server/queries/now.ts`). Encapsulée ici sous `use cache`, elle devient une
 * valeur stable, régénérée avec le reste des statistiques GitHub.
 *
 * Séparée du fetch réseau : les dépôts ne varient pas avec la langue, seule
 * cette mise en mots en a besoin — inutile de multiplier les appels à l'API
 * GitHub par trois pour un simple libellé.
 */
async function relativeLabel(pushedAt: string, locale: Locale): Promise<string> {
  "use cache";
  cacheLife("hours");
  return formatRelative(pushedAt, locale);
}

export async function withActivityLabels(
  stats: GithubStats | null,
  locale: Locale,
): Promise<GithubStatsDisplay | null> {
  if (!stats) return null;

  const recentRepos = await Promise.all(
    stats.recentRepos.map(async (repo) => ({
      ...repo,
      pushedAtLabel: await relativeLabel(repo.pushedAt, locale),
    })),
  );

  return { ...stats, recentRepos };
}
