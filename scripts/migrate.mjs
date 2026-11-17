// Wendet supabase/migrations/*.sql in Reihenfolge an. Verbucht sie in
// supabase_migrations.schema_migrations, der gleichen Tabelle wie die Supabase-CLI.
// Nutzung: node --env-file=.env.local scripts/migrate.mjs [--dry-run]
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const dir = path.join(import.meta.dirname, "..", "supabase", "migrations");
const url = process.env.DATABASE_URL_MIGRATIONS;
if (!url) { console.error("DATABASE_URL_MIGRATIONS fehlt"); process.exit(1); }
const dry = process.argv.includes("--dry-run");
const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query(`create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text)`);
const done = new Set((await client.query("select version from supabase_migrations.schema_migrations")).rows.map((r) => r.version));
const files = readdirSync(dir).filter((f) => /^\d{14}_.+\.sql$/.test(f)).sort();
let applied = 0;
for (const f of files) {
  const [version, ...rest] = f.replace(/\.sql$/, "").split("_");
  if (done.has(version)) continue;
  const sql = readFileSync(path.join(dir, f), "utf8");
  console.log(`${dry ? "[dry-run] " : ""}→ ${f}`);
  if (dry) continue;
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into supabase_migrations.schema_migrations (version, statements, name) values ($1, $2, $3)", [version, [sql], rest.join("_")]);
    await client.query("commit");
    applied++;
  } catch (e) {
    await client.query("rollback");
    console.error(`Fehler in ${f}: ${e.message}`);
    process.exit(1);
  }
}
console.log(applied ? `${applied} Migration(en) angewendet` : "Datenbank ist aktuell");
await client.end();
