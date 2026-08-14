import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  VITEST — configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Portée volontairement limitée ──────────────────────────────────────────
 *
 * Ce projet ne teste QUE sa logique pure — parseurs, agrégateurs, formateurs,
 * fonctions de configuration — jamais le rendu de composants React. Chaque
 * module testé a été explicitement écrit sans JSX pour rester utilisable ici
 * (voir les en-têtes de `src/lib/terminal`, `src/lib/command`…). Aucun
 * `@testing-library/react`, aucun DOM simulé pour le rendu : ce n'est pas ce
 * que ces tests vérifient.
 *
 * ── Environnement ──────────────────────────────────────────────────────────
 *
 * `node` par défaut — la quasi-totalité des modules testés n'a besoin d'aucun
 * DOM. Seul `src/lib/command/recent.ts` touche `window.localStorage` ; son
 * fichier de test bascule sur `happy-dom` via une pragma `@vitest-environment`
 * en tête de fichier, sans alourdir tous les autres.
 *
 * ── Alias ───────────────────────────────────────────────────────────────────
 *
 * `@/*` recopié à la main depuis `tsconfig.json` plutôt qu'une dépendance
 * (`vite-tsconfig-paths`) supplémentaire pour une seule ligne de résolution.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Aucun fichier n'a besoin d'un `describe`/`it` global : les imports
    // explicites depuis `vitest` évitent une configuration ESLint dédiée.
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/config/**"],
      // Écrans et actions du back-office, routes Next et code React exclus :
      // ils ne sont pas couverts par cette suite (voir la note ci-dessus).
      exclude: [
        "src/generated/**",
        "**/*.d.ts",
        "**/*.test.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
