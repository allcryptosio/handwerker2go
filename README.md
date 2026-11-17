# handwerker2go

Marktplatz für lokale Handwerksbetriebe. Start in Hamburg, ausgelegt für ganz Deutschland.
Kunden geben ihre Adresse ein, vergleichen geprüfte Betriebe, buchen zum Festpreis oder holen Angebote ein und bezahlen online.

Stand: **Phase 1** (Architektur, Designsystem, Startseite, Navigation, SEO-Grundgerüst). Plan und Architektur: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md).
Offene rechtliche Prüfungen: [docs/RECHTLICHE-PRUEFUNGEN.md](docs/RECHTLICHE-PRUEFUNGEN.md).
Bild-Prompts und Dateinamen: [docs/BILDER-PROMPTS.md](docs/BILDER-PROMPTS.md). Fotos in `public/bilder/` erscheinen nach dem nächsten Build automatisch.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript
- Tailwind CSS 4 mit eigenen Design-Tokens in `src/app/globals.css`
- Geplant: Supabase (Postgres, Auth, Storage, RLS), Stripe Connect und Billing, Resend, Mapbox

> Diese Next-Version weicht von älteren Versionen ab. Vor Code-Änderungen die mitgelieferte Doku in
> `node_modules/next/dist/docs/` lesen (siehe AGENTS.md). Beispiele: `dynamicParams` gibt es mit Cache Components nicht mehr,
> unbekannte Parameter werden über `ensureStatic = "navigation"` plus `notFound()` zu echten 404-Antworten.

## Entwicklung

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen
pnpm dev                     # http://localhost:3012
pnpm typecheck && pnpm lint && pnpm build
```

## Struktur

```
src/app/                    Seiten (App Router)
  page.tsx                  Startseite (Design G „Zuhause“)
  [stadt]/page.tsx          Stadtseite, z. B. /hamburg
  [stadt]/[kategorie]/      SEO-Landingpage, z. B. /hamburg/elektriker
  suche/route.ts            Freitextsuche aus dem Hero (leitet auf Kategorie weiter)
  fuer-handwerker/          Landingpage und Konditionen für Betriebe
  impressum, datenschutz, agb, widerruf   Rechtstexte (Entwürfe mit Platzhaltern)
  robots.ts, sitemap.ts     SEO
src/components/             UI-Bausteine (layout, home, ui, legal)
src/lib/catalog.ts          Kategorien, Leistungen, Städte (Phase 2: aus der Datenbank)
src/lib/pricing.ts          Konditionen für Betriebe (Phase 5: aus der Datenbank, im Admin änderbar)
src/lib/site.ts             Grundeinstellungen
docs/                       Architektur, Plan, rechtliche Prüfliste
```

## Betrieb auf dem Server

- Dienst: `systemctl status handwerker2go` (Port 3012, nur 127.0.0.1, eigener Systembenutzer, `NEXT_PUBLIC_NOINDEX=1`)
- Deploy: `pnpm install --frozen-lockfile && pnpm build && systemctl restart handwerker2go` (erst bauen, dann neu starten)
- Noch keine Domain und kein nginx-vhost. Öffentlich erreichbar wird die Seite erst mit Domain und Cloudflare.

## Fotos

Alle Bilder sind derzeit Platzhalter (`PhotoSlot`). Für den Livegang werden echte Fotos benötigt, eingebunden über `next/image`
in derselben Größe und Rundung.

## Git

- Privates Repository auf GitHub: `allcryptosio/handwerker2go`, Zugriff über den Deploy-Key `/root/.ssh/handwerker2go_github`
  (SSH-Host-Alias `github-handwerker2go` in `/root/.ssh/config`).
- `.env*`-Dateien werden nie eingecheckt.
