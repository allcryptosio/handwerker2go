# handwerker2go

Marktplatz für lokale Handwerksbetriebe. Start in Hamburg, ausgelegt für ganz Deutschland.
Kunden geben ihre Adresse ein, vergleichen geprüfte Betriebe, buchen zum Festpreis oder holen Angebote ein und bezahlen online.

Stand: **Phase 2** (Datenbank, Konten, Registrierung für Kunden und Betriebe, Admin-Freigabe) auf Basis von Phase 1. Plan und Architektur: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md).
Offene rechtliche Prüfungen: [docs/RECHTLICHE-PRUEFUNGEN.md](docs/RECHTLICHE-PRUEFUNGEN.md).
Bild-Prompts und Dateinamen: [docs/BILDER-PROMPTS.md](docs/BILDER-PROMPTS.md). Fotos in `public/bilder/` erscheinen nach dem nächsten Build automatisch.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript
- Tailwind CSS 4 mit eigenen Design-Tokens in `src/app/globals.css`
- PostgreSQL 18 + PostGIS auf dem Server, Row Level Security, Migrationen im Supabase-Format (`supabase/migrations`)
- Better Auth (E-Mail und Passwort, E-Mail-Bestätigung Pflicht), Konten in der eigenen Datenbank
- Jederzeit auf Supabase umstellbar: [docs/SUPABASE-WECHSEL.md](docs/SUPABASE-WECHSEL.md)
- Geplant: Stripe Connect und Billing, Resend, Mapbox

> Diese Next-Version weicht von älteren Versionen ab. Vor Code-Änderungen die mitgelieferte Doku in
> `node_modules/next/dist/docs/` lesen (siehe AGENTS.md). Beispiele: `dynamicParams` gibt es mit Cache Components nicht mehr,
> unbekannte Parameter werden über `ensureStatic = "navigation"` plus `notFound()` zu echten 404-Antworten.

## Entwicklung

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen
pnpm db:migrate              # Migrationen anwenden
pnpm dev                     # http://localhost:3012
pnpm admin:create <email> "<Name>"   # Admin-Konto anlegen
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

- Dienst: `systemctl status handwerker2go` (Port 3012, nur 127.0.0.1, eigener Systembenutzer). Seit 18.11.2026 für Suchmaschinen freigegeben.
- Deploy: `pnpm install --frozen-lockfile && pnpm build && systemctl restart handwerker2go` (erst bauen, dann neu starten)
- Noch keine Domain und kein nginx-vhost. Öffentlich erreichbar wird die Seite erst mit Domain und Cloudflare.
- Datenbank: lokal auf 127.0.0.1:5432, Rollen `h2g_owner` (Migrationen) und `h2g_app` (App, an RLS gebunden).
- Nachweise: `/var/lib/handwerker2go/uploads` (privat, StateDirectory des Dienstes).
- E-Mails landen in `email_outbox`. Versand startet mit `MAIL_DRIVER=resend` + `RESEND_API_KEY` + `EMAIL_FROM`.
- Backups: täglich über `server-backup` (siehe `/etc/server-backup/README.md`), inklusive `pg_dumpall` und Uploads.

## Fotos

Alle Bilder sind derzeit Platzhalter (`PhotoSlot`). Für den Livegang werden echte Fotos benötigt, eingebunden über `next/image`
in derselben Größe und Rundung.

## Git

- Privates Repository auf GitHub: `allcryptosio/handwerker2go`, Zugriff über den Deploy-Key `/root/.ssh/handwerker2go_github`
  (SSH-Host-Alias `github-handwerker2go` in `/root/.ssh/config`).
- `.env*`-Dateien werden nie eingecheckt.
