// ENTWURF, NICHT AUSFÜHREND: gestaffelte Löschung nach Datenschutzerklärung Abschnitt 16 (Speicherdauer).
// Dieses Skript ÄNDERT NICHTS. Es zählt nur, welche Datensätze nach den Fristen betroffen wären, und zeigt die
// geplanten SQL-Befehle. Freischaltung erst nach rechtlicher Prüfung, siehe docs/LOESCHKONZEPT.md.
//
// Nutzung: node --env-file=.env.local scripts/retention-cleanup.mjs
import pg from "pg";

const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS ?? process.env.DATABASE_URL });
await db.connect();
await db.query("begin read only");
await db.query("select set_config('app.role', 'system', true)");

// Abschluss einer Buchung: Ende des Termins bzw. Zeitpunkt von Storno/Ablehnung/Ablauf
const finished = `coalesce(b.cancelled_at, case when b.status in ('completed', 'confirmed') then b.ends_at end, b.updated_at)`;
const closed = `b.status in ('completed', 'cancelled', 'declined', 'expired') or (b.status = 'confirmed' and b.ends_at < now())`;
// [prüfen: technische Umsetzung] Sperre bei anhängigem Streit fehlt noch (geplant: bookings.legal_hold_until)
const noHold = `true`;

const steps = [
  {
    key: "(e) Fotos 12 Monate nach Abschluss",
    count: `select count(*) from booking_photos ph join bookings b on b.id = ph.booking_id where (${closed}) and ${finished} < now() - interval '12 months' and ${noHold}`,
    plan: "Dateien im Speicher (storage_key) löschen, dann: delete from booking_photos where id = any($ids)",
  },
  {
    key: "(e) Freitext aus Angebotsanfragen (price_type = 'quote') 12 Monate nach Abschluss",
    count: `select count(*) from bookings b where b.price_type = 'quote' and b.notes is not null and (${closed}) and ${finished} < now() - interval '12 months' and ${noHold}`,
    plan: "update bookings set notes = null where id = any($ids)",
  },
  {
    key: "(b) Buchungsdaten anonymisieren: 3 Jahre ab Ende des Kalenderjahres des Abschlusses",
    count: `select count(*) from bookings b where (${closed}) and date_trunc('year', ${finished}) + interval '1 year' + interval '3 years' < now() and b.contact_email <> '' and ${noHold}`,
    plan:
      "update bookings set contact_name = '', contact_phone = '', contact_email = '', street = '', postal_code = '', notes = null, location = null " +
      "where id = any($ids)  -- Abrechnungsteil bleibt: number, starts_at, price_cents, commission_bps, application_fee_cents, provider_id, stripe_*",
  },
  {
    key: "(b) Erklärungen zum vorzeitigen Leistungsbeginn (consents) mit der Buchung",
    count: `select count(*) from consents c join bookings b on b.number = c.booking_ref where (${closed}) and date_trunc('year', ${finished}) + interval '1 year' + interval '3 years' < now()`,
    plan: "delete from consents where booking_ref = any($numbers)",
  },
  {
    key: "(c) Abrechnungsteil älter als 9 Jahre (Provisionsrechnungen, Buchungsbeträge)",
    count: `select (select count(*) from commission_invoices where created_at < now() - interval '9 years') + (select count(*) from bookings b where ${finished} < now() - interval '9 years')`,
    plan: "delete from commission_invoices … ; delete from bookings … (nur wenn keine Rechnung mehr darauf verweist)",
  },
];

console.log("ENTWURF: es wird nichts geändert (read only)\n");
for (const s of steps) {
  const row = (await db.query(s.count)).rows[0];
  const n = Number(Object.values(row)[0]);
  console.log(`${s.key}\n  betroffen: ${n}\n  geplant:   ${s.plan}\n`);
}
await db.query("rollback");
await db.end();
