import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  /** En dev : pas de service worker (évite une vieille 404 mise en cache). */
  register: process.env.NODE_ENV === "production",
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  /** Image Docker optimisée : trace les dépendances serveur dans `.next/standalone`. */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  /**
   * Séparation cache / dynamique (complément des Ingress) :
   * — Bible : cache public long côté CDN / navigateur (contenu majoritairement statique).
   * — Academy : pas de cache de document HTML (données catalogue dynamiques Supabase).
   */
  async redirects() {
    return [
      { source: "/rejoindre", destination: "/join", permanent: false },
      { source: "/fr/rejoindre", destination: "/join", permanent: false },
      { source: "/en/rejoindre", destination: "/join", permanent: false },
      { source: "/nl/rejoindre", destination: "/join", permanent: false },
      { source: "/fr/join", destination: "/join", permanent: false },
      { source: "/en/join", destination: "/join", permanent: false },
      { source: "/nl/join", destination: "/join", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/bible-strong",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/bible-strong/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/academy",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/academy/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withPWA(withNextIntl(nextConfig));
