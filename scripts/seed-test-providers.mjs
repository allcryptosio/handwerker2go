// Legt Test-Betriebe für die Verfügbarkeitssuche an: NUR für Test-Datenbanken.
// Szenario aus der Anforderung: 20 Elektriker in Hamburg, am Mi 25.11.2026 um 14 Uhr sind genau 6 verfügbar.
// Nutzung: node --env-file=.env.local scripts/seed-test-providers.mjs
import pg from "pg";

const url = process.env.DATABASE_URL_MIGRATIONS ?? "";
if (!/\/h2g_(branchtest|test)[a-z0-9_]*$/.test(url)) {
  console.error("Abbruch: Dieses Skript läuft nur gegen eine Test-Datenbank (h2g_branchtest/h2g_test…).");
  process.exit(1);
}
const db = new pg.Client({ connectionString: url });
await db.connect();
await db.query("begin");
await db.query("select set_config('app.role', 'system', true)");

// alte Testdaten entfernen
const old = (await db.query(`select id from "user" where email like 'seed-%@example.com'`)).rows.map((r) => r.id);
if (old.length) {
  await db.query("delete from bookings where customer_id = any($1) or provider_id in (select id from provider_profiles where user_id = any($1))", [old]);
  await db.query("delete from provider_profiles where user_id = any($1)", [old]);
  await db.query(`delete from "user" where id = any($1)`, [old]);
}

const cat = (await db.query("select id from service_categories where slug = 'elektriker'")).rows[0].id;
const tpl = (await db.query("select id from service_templates where slug = 'lampe-anschliessen'")).rows[0].id;
const tplQuote = (await db.query("select id from service_templates where slug = 'elektroinstallation'")).rows[0].id;
const point = async (plz) => (await db.query("select location from postal_codes where postal_code = $1 order by length(place) limit 1", [plz])).rows[0].location;

async function user(email, name, role) {
  const id = `seed_${Math.random().toString(36).slice(2, 12)}`;
  await db.query(`insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role) values ($1, $2, $3, true, now(), now(), $4)`, [id, name, email, role]);
  return id;
}

const customer = await user("seed-kunde@example.com", "Test Kunde", "customer");

// Gruppen: [Anzahl, Präfix, PLZ des Betriebs, Radius, Arbeitszeiten je Wochentag, belegt?]
const workdays = [1, 2, 3, 4, 5].map((wd) => [wd, "08:00", "17:00"]);
const groups = [
  [5, "Frei am Mittwoch", "22041", 25, [[1, "08:00", "17:00"], [2, "08:00", "17:00"]], false],
  [4, "Frühschicht", "22303", 25, [1, 2, 3, 4, 5].map((wd) => [wd, "07:00", "13:00"]), false],
  [2, "Außerhalb", "23552", 20, workdays, false], // Lübeck, 20 km Radius
  [3, "Ausgebucht", "20257", 25, workdays, true],
  [6, "Verfügbar", "20095", 25, workdays, false],
];
let n = 0;
for (const [count, prefix, plz, radius, hours, busy] of groups) {
  for (let i = 1; i <= count; i++) {
    n++;
    const uid = await user(`seed-betrieb-${n}@example.com`, `${prefix} ${i}`, "provider");
    const p = (await db.query(
      `insert into provider_profiles (user_id, company_name, contact_name, phone, street, postal_code, city, description, accepted_terms_at,
         status, approved_at, stripe_charges_enabled, stripe_payouts_enabled, buffer_minutes, min_notice_hours)
       values ($1, $2, 'Test', '+49 40 000000', 'Teststraße 1', $3, 'Hamburg', 'Testbetrieb', now(), 'approved', now() - interval '10 days', true, true, 30, 12)
       returning id`,
      [uid, `Elektro ${prefix} ${i}`, plz],
    )).rows[0].id;
    await db.query("insert into provider_categories (provider_id, category_id) values ($1, $2)", [p, cat]);
    await db.query("insert into service_areas (provider_id, label, radius_km, center) values ($1, $2, $3, $4)", [p, plz, radius, await point(plz)]);
    for (const [wd, s, e] of hours) await db.query("insert into provider_working_hours (provider_id, weekday, starts, ends) values ($1, $2, $3, $4)", [p, wd, s, e]);
    await db.query("insert into provider_services (provider_id, template_id, price_type, price_cents, duration_min) values ($1, $2, 'fixed', $3, 60)", [p, tpl, 6900 + n * 200]);
    await db.query("insert into provider_services (provider_id, template_id, price_type, duration_min) values ($1, $2, 'quote', 60)", [p, tplQuote]);
    if (busy) {
      await db.query(
        `insert into bookings (customer_id, provider_id, template_id, service_name, status, starts_at, ends_at, blocked, street, postal_code, city,
           contact_name, contact_phone, contact_email, price_type, price_cents, terms_version)
         values ($1, $2, $3, 'Lampe anschließen', 'confirmed', '2026-11-25 13:45+01', '2026-11-25 14:45+01', tstzrange('2026-11-25 13:20+01', '2026-11-25 15:15+01'),
           'Teststraße 2', '20095', 'Hamburg', 'Test Kunde', '+49 40 1', 'seed-kunde@example.com', 'fixed', 7900, '2026-11-18')`,
        [customer, p, tpl],
      );
    }
  }
}
await db.query("commit");
console.log(`${n} Test-Betriebe angelegt (Elektriker, Hamburg), Testkunde seed-kunde@example.com`);
await db.end();
