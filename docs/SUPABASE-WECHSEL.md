# Wechsel von eigenem PostgreSQL zu Supabase

handwerker2go läuft auf einem eigenen PostgreSQL 18 mit PostGIS auf dem Server. Alles ist so gebaut, dass ein Umzug zu
Supabase ohne Codeänderung möglich ist.

## Warum das ohne Umbau geht

| Baustein | Heute | Mit Supabase |
| --- | --- | --- |
| Datenbank | PostgreSQL + PostGIS auf dem Server | Supabase-Postgres (gleiche Erweiterungen) |
| Schema | `supabase/migrations/*.sql`, verbucht in `supabase_migrations.schema_migrations` | identisch, die Supabase-CLI erkennt die Tabelle |
| Zugriffsschutz | RLS mit `app.user_id` / `app.role`, gesetzt pro Transaktion (`src/lib/db.ts`) | identisch |
| Konten und Login | Better Auth, Tabellen `user`, `session`, `account`, `verification` | bleiben, nur in der neuen Datenbank |
| Dateien | `STORAGE_DRIVER=local` (`/var/lib/handwerker2go/uploads`) | S3-Treiber für Supabase Storage (in `src/lib/storage.ts` ergänzen) |
| E-Mail | `MAIL_DRIVER` (outbox / resend) | unverändert |

## Ablauf

1. Supabase-Projekt anlegen (Region Frankfurt, `eu-central-1`).
2. Im SQL-Editor eine App-Rolle anlegen, die **nicht** Eigentümerin der Tabellen ist (damit RLS greift):
   ```sql
   create role h2g_app login password '…';
   ```
3. Daten übertragen (Wartungsfenster, Seite kurz in den Wartungsmodus):
   ```bash
   pg_dump --no-owner --no-privileges -d handwerker2go -n public -n app -n supabase_migrations > h2g.sql
   psql "<Supabase-URI als postgres>" -f h2g.sql
   ```
4. Die Migration `20261117090200_app_role_grants.sql` erneut ausführen, damit `h2g_app` ihre Rechte bekommt.
5. In `.env.local` umstellen:
   ```
   DATABASE_URL=postgres://h2g_app.<projekt>:<pw>@<pooler-host>:5432/postgres
   DATABASE_URL_MIGRATIONS=<Supabase-URI als postgres>
   ```
6. Nachweis-Dateien nach Supabase Storage kopieren (privater Bucket) und `STORAGE_DRIVER=s3` setzen.
7. `pnpm build && systemctl restart handwerker2go`, Login, Registrierung und Admin-Freigabe testen.

Die Konten ziehen mit. Passwörter sind von Better Auth gehasht und funktionieren in der neuen Datenbank weiter.
