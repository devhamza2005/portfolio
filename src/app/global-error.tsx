"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ERREUR GLOBALE — dernier filet de sécurité
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce composant remplace le layout RACINE. Il se déclenche quand l'erreur
 * survient si haut qu'aucune autre limite ne peut la rattraper : il doit donc
 * rendre lui-même `<html>` et `<body>`.
 *
 * ── Pourquoi tout est en style en ligne ────────────────────────────────────
 *
 * À ce niveau, on ne peut plus rien tenir pour acquis : ni la feuille de
 * styles, ni les polices, ni les variables CSS du thème — la chaîne qui les
 * produit fait peut-être partie du problème. Des styles en ligne et une pile
 * de polices système garantissent un rendu correct quoi qu'il arrive.
 *
 * Aucune dépendance : ni Prisma, ni Auth.js, ni requête réseau, ni composant
 * du projet. Un import cassé ici laisserait le visiteur devant une page
 * blanche.
 *
 * ── Ce qui n'est jamais affiché ───────────────────────────────────────────
 *
 * Ni `error.message`, ni pile d'appels, ni erreur Prisma, ni variable
 * d'environnement. Seul `digest` — un identifiant opaque produit par Next —
 * est montré, afin que le visiteur puisse citer une référence.
 *
 * Note : cette limite ne s'active qu'en production. En développement, Next
 * affiche sa propre surcouche d'erreur.
 */

const COULEUR_FOND = "#08090d";
const COULEUR_TEXTE = "#ecedf2";
const COULEUR_ATTENUEE = "#9aa0ae";
const COULEUR_MARQUE = "#5b8cff";
const COULEUR_ACCENT = "#22d3ee";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          background: COULEUR_FOND,
          color: COULEUR_TEXTE,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main style={{ maxWidth: "30rem", width: "100%", textAlign: "center" }}>
          {/* Monogramme « HF », retracé ici pour ne dépendre d'aucun import. */}
          <svg
            viewBox="0 0 48 48"
            width="52"
            height="52"
            fill="none"
            role="img"
            aria-label="Hamza Fanoune"
            style={{ marginBottom: "1.75rem" }}
          >
            <defs>
              <linearGradient id="ge-hf" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor={COULEUR_MARQUE} />
                <stop offset="1" stopColor={COULEUR_ACCENT} />
              </linearGradient>
            </defs>
            <rect
              x="1.25"
              y="1.25"
              width="45.5"
              height="45.5"
              rx="12"
              stroke="url(#ge-hf)"
              strokeWidth="1.5"
              opacity="0.55"
            />
            <path d="M12 13v22M12 24h9M21 13v22" stroke="url(#ge-hf)" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M28 35V13h9M28 24h7"
              stroke="url(#ge-hf)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h1
            style={{
              margin: "0 0 0.75rem",
              fontSize: "1.5rem",
              lineHeight: 1.25,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Une erreur inattendue est survenue
          </h1>

          <p style={{ margin: "0 0 1.75rem", fontSize: "0.9375rem", lineHeight: 1.6, color: COULEUR_ATTENUEE }}>
            Le site n&apos;a pas pu s&apos;afficher correctement. Réessayez — si le problème
            persiste, revenez dans quelques instants.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                borderRadius: "0.625rem",
                padding: "0.6875rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                fontFamily: "inherit",
                background: COULEUR_MARQUE,
                color: "#0b1020",
              }}
            >
              Réessayer
            </button>

            {/*
              `<a>` et non `<Link>`, volontairement : à ce niveau le layout
              racine a échoué et le routeur client fait peut-être partie du
              problème. Une navigation document complète repart d'une page
              neuve, là où une navigation client rejouerait l'erreur.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "0.625rem",
                padding: "0.6875rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.14)",
                color: COULEUR_TEXTE,
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>

          {error.digest ? (
            <p
              style={{
                margin: "1.75rem 0 0",
                fontSize: "0.75rem",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                color: COULEUR_ATTENUEE,
              }}
            >
              Référence : {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
