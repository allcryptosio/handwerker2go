import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_NOINDEX === "1") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/suche", "/anmelden", "/registrieren", "/passwort-vergessen", "/passwort-neu", "/bewertungsmails-abbestellen", "/inhalt-melden", "/vertrag-widerrufen", "/angebot", "/konto", "/dashboard", "/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
