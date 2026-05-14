import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  /** Image Docker optimisée : trace les dépendances serveur dans `.next/standalone`. */
  output: "standalone",
  /**
   * Séparation cache / dynamique (complément des Ingress) :
   * — Bible : cache public long côté CDN / navigateur (contenu majoritairement statique).
   * — Academy : pas de cache de document HTML (données catalogue dynamiques Supabase).
   */
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
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default withPWA(withNextIntl(nextConfig));
