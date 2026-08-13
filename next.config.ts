import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Cache Components — active `use cache`, `cacheTag` et le prérendu partiel.
   *
   * C'est ce qui donne son sens à `updateTag()` appelé par les actions du
   * back-office : les pages publiques sont servies depuis un cache balisé, et
   * un enregistrement dans /admin l'invalide immédiatement. Le visiteur reçoit
   * du HTML prérendu, pas une requête base de données (§19).
   */
  cacheComponents: true,

  images: {
    // Cloudinary est le fournisseur par défaut. Les autres hôtes sont déclarés
    // ici pour que le passage à un autre StorageProvider ne casse rien.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "date-fns"],

    /**
     * 404 globale — indispensable avec plusieurs layouts racines.
     *
     * Le site public vit sous `(public)/[locale]` et le back-office sous
     * `(admin)` : chacun rend son propre `<html>`. Next.js n'a donc plus de
     * layout unique pour composer une 404 « hors route », et c'est ce drapeau
     * qui active `app/global-not-found.tsx` à la place.
     */
    globalNotFound: true,

    /**
     * Un seul processus de prérendu.
     *
     * Par défaut, Next.js répartit la génération statique sur autant de
     * workers que de cœurs — chacun ouvrant son propre pool de connexions.
     * Sur un portfolio d'une douzaine de pages, la parallélisation ne fait
     * gagner qu'une poignée de secondes, mais multiplie les connexions
     * simultanées à la base. Un worker unique suffit largement et rend le
     * build reproductible quelle que soit la machine.
     */
    staticGenerationMinPagesPerWorker: 100,
    staticGenerationRetryCount: 2,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Le back-office ne doit jamais être indexé ni mis en cache.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
