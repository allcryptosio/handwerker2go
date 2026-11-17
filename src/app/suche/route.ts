import { NextResponse, type NextRequest } from "next/server";
import { matchCategory } from "@/lib/catalog";
import { site } from "@/lib/site";

/**
 * Freitextsuche aus dem Hero. Phase 1: leitet auf die passende Kategorie-Seite
 * der Startstadt weiter. Ab Phase 3 kommt hier die echte Umkreissuche mit Adresse.
 */
export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const match = matchCategory(q);
  const target = match ? `/${site.defaultCity}/${match.slug}` : `/${site.defaultCity}`;
  // Hinter nginx/Cloudflare kennt Next den echten Host nur aus den Headern.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : site.url;
  return NextResponse.redirect(new URL(target, base), 303);
}
