// Täglicher Wartungs-Job (systemd: handwerker2go-maintenance.timer).
//  1. Erinnerung an Betriebe 14 Tage vor dem Ende der Einführungsphase (AGB für Betriebe § 4 Abs. 2)
//  2. Speicherdauer nach Datenschutzerklärung Abschnitt 16: Fotos/Freitext nach 12 Monaten, Anonymisierung nach
//     3 Jahren ab Jahresende, Abrechnungsteil und Protokoll nach 9 Jahren. Buchungen mit legal_hold bleiben unberührt.
//  3. Abgelaufene Sitzungen und Bestätigungslinks entfernen
//
// Nutzung: node --conditions=react-server --import tsx --env-file=.env.local scripts/maintenance.mts [--dry-run]
import { unlink } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { sendMail } from "@/lib/mail";

const dry = process.argv.includes("--dry-run");
const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const storageDir = process.env.STORAGE_DIR ?? "/var/lib/handwerker2go/uploads";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
const log = (s: string) => console.log(`${dry ? "[Probelauf] " : ""}${s}`);

async function tx<T>(fn: () => Promise<T>): Promise<T> {
  await db.query("begin");
  try {
    await db.query("select set_config('app.role', 'system', true)");
    const r = await fn();
    await db.query(dry ? "rollback" : "commit");
    return r;
  } catch (e) {
    await db.query("rollback");
    throw e;
  }
}

// ---------------------------------------------------------------- 1. Erinnerung Einführungsphase
const intro = (await db.query(
  `select p.id, p.company_name, u.email, p.approved_at + make_interval(months => ps.intro_months) intro_end
     from provider_profiles p join "user" u on u.id = p.user_id,
          lateral (select intro_months from pricing_settings where valid_from <= now() order by valid_from desc limit 1) ps
    where p.status = 'approved' and p.intro_reminder_sent_at is null and p.membership_status in ('none', 'canceled')
      and p.approved_at + make_interval(months => ps.intro_months) between now() and now() + interval '14 days'`,
)).rows;
for (const p of intro) {
  const end = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(p.intro_end));
  log(`Erinnerung Einführungsphase an ${p.company_name} (endet ${end})`);
  if (dry) continue;
  await sendMail({
    to: p.email,
    template: "intro_ending_provider",
    subject: `Deine Einführungsphase endet am ${end}`,
    heading: "Deine Einführungsphase endet bald",
    paragraphs: [
      `Hallo ${p.company_name}, deine kostenlose Einführungsphase bei handwerker2go endet am ${end}.`,
      "Damit dein Profil danach weiter in der Suche erscheint, wähle im Dashboard eine Mitgliedschaft, monatlich oder jährlich. Wenn du nichts tust, entstehen keine Kosten; dein Profil wird dann nur nicht mehr angezeigt. Bereits gebuchte Aufträge laufen normal weiter.",
    ],
    button: { label: "Mitgliedschaft wählen", url: `${base}/dashboard` },
  });
  await db.query("update provider_profiles set intro_reminder_sent_at = now() where id = $1", [p.id]);
}

// ---------------------------------------------------------------- 2. Speicherdauer
const finished = `coalesce(b.cancelled_at, case when b.status in ('completed', 'confirmed') then b.ends_at end, b.updated_at)`;
const closed = `(b.status in ('completed', 'cancelled', 'declined', 'expired') or (b.status = 'confirmed' and b.ends_at < now()))`;
const after3y = `date_trunc('year', ${finished}) + interval '4 years'`; // Ende des Abschlussjahres + 3 Jahre

await tx(async () => {
  // (e) Fotos 12 Monate nach Abschluss: Datei und Eintrag löschen
  const photos = (await db.query(
    `select ph.id, ph.storage_key from booking_photos ph join bookings b on b.id = ph.booking_id
      where ${closed} and not b.legal_hold and ${finished} < now() - interval '12 months'`,
  )).rows;
  for (const ph of photos) {
    if (!dry) {
      const full = path.resolve(storageDir, ph.storage_key);
      if (full.startsWith(path.resolve(storageDir) + path.sep)) await unlink(full).catch(() => {});
      await db.query("delete from booking_photos where id = $1", [ph.id]);
    }
  }
  log(`Fotos gelöscht: ${photos.length}`);

  // (e) Freitext aus Angebotsanfragen 12 Monate nach Abschluss
  const notes = await db.query(
    `update bookings b set notes = null where b.price_type = 'quote' and b.notes is not null and ${closed}
       and not b.legal_hold and ${finished} < now() - interval '12 months'`,
  );
  log(`Freitexte aus Angebotsanfragen entfernt: ${notes.rowCount}`);

  // (b) Erklärungen zum vorzeitigen Leistungsbeginn mit der Anonymisierung der Buchung
  const consents = await db.query(
    `delete from consents c using bookings b where b.number = c.booking_ref and ${closed} and not b.legal_hold and ${after3y} < now()`,
  );
  log(`Erklärungen gelöscht: ${consents.rowCount}`);

  // (b) Buchungsdaten anonymisieren; Abrechnungsteil (Nummer, Datum, Betrag, Provision, Betrieb, Stripe-Kennungen) bleibt
  const anon = await db.query(
    `update bookings b set contact_name = '', contact_phone = '', contact_email = '', street = '', postal_code = '', city = '',
       notes = null, location = null, distance_km = null, customer_id = null, anonymized_at = now()
     where b.anonymized_at is null and ${closed} and not b.legal_hold and ${after3y} < now()`,
  );
  log(`Buchungen anonymisiert: ${anon.rowCount}`);

  // (c) Abrechnungsteil nach 9 Jahren
  const oldInvoices = await db.query(`delete from commission_invoices where created_at < now() - interval '9 years'`);
  const oldBookings = await db.query(
    `delete from bookings b where ${closed} and not b.legal_hold and ${finished} < now() - interval '9 years'
       and not exists (select 1 from reviews r where r.booking_id = b.id and r.visible)`,
  );
  log(`Abrechnungsdaten älter als 9 Jahre gelöscht: ${oldInvoices.rowCount} Rechnungen, ${oldBookings.rowCount} Buchungen`);

  // Protokoll nach 9 Jahren (Trigger erlaubt das nur dem System und nur für alte Einträge)
  const oldAudit = await db.query(`delete from audit_logs where created_at < now() - interval '9 years'`);
  log(`Protokolleinträge gelöscht: ${oldAudit.rowCount}`);

  // 3. Abgelaufene Sitzungen und Bestätigungslinks
  const sessions = await db.query(`delete from "session" where "expiresAt" < now() - interval '30 days'`);
  const verifications = await db.query(`delete from verification where "expiresAt" < now() - interval '30 days'`);
  log(`Abgelaufene Sitzungen: ${sessions.rowCount}, Bestätigungslinks: ${verifications.rowCount}`);
});

await db.end();
process.exit(0);
