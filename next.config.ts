import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Betriebsbereich ist jetzt eigenständig unter /partner (wie die Händler-Seite bei Lieferplattformen)
  async redirects() {
    return [
      { source: "/fuer-handwerker", destination: "/partner", permanent: true },
      { source: "/fuer-handwerker/registrieren", destination: "/partner/registrieren", permanent: true },
    ];
  },
  experimental: {
    // Bis zu 3 Nachweise à 5 MB bzw. 5 Auftragsfotos à 4 MB plus Formularfelder (nginx: client_max_body_size 25m)
    serverActions: { bodySizeLimit: "24mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
