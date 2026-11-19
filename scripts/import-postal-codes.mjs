// Lädt die deutschen Postleitzahlen mit Koordinaten in die Tabelle postal_codes.
// Quelle: GeoNames (https://www.geonames.org), Lizenz CC BY 4.0. Datei: data/geonames-DE-postal-codes.txt
// Nutzung: node --env-file=.env.local scripts/import-postal-codes.mjs   (ersetzt den Inhalt vollständig)
import { readFileSync } from "node:fs";
import pg from "pg";

const file = new URL("../data/geonames-DE-postal-codes.txt", import.meta.url);
const rows = readFileSync(file, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => l.split("\t"))
  .filter((c) => /^[0-9]{5}$/.test(c[1]) && c[9] && c[10])
  .map((c) => ({ code: c[1], place: c[2], state: c[3], lat: Number(c[9]), lon: Number(c[10]) }));

const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
await db.query("begin");
await db.query("delete from postal_codes");
for (let i = 0; i < rows.length; i += 1000) {
  const chunk = rows.slice(i, i + 1000);
  const values = chunk
    .map((_, j) => {
      const b = j * 5;
      return `($${b + 1}, $${b + 2}, $${b + 3}, ST_SetSRID(ST_MakePoint($${b + 5}, $${b + 4}), 4326)::geography)`;
    })
    .join(",");
  await db.query(
    `insert into postal_codes (postal_code, place, state, location) values ${values}`,
    chunk.flatMap((r) => [r.code, r.place, r.state, r.lat, r.lon]),
  );
}
await db.query("commit");
console.log(`${rows.length} Einträge geladen`);
await db.end();
