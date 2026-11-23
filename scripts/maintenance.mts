// Täglicher Wartungs-Job (systemd: handwerker2go-maintenance.timer).
//  1. Erinnerung an Betriebe 14 Tage vor dem Ende der Einführungsphase (AGB für Betriebe § 4 Abs. 2)
//  2. Speicherdauer nach Datenschutzerklärung Abschnitt 16: Fotos/Freitext nach 12 Monaten, Anonymisierung nach
//     3 Jahren ab Jahresende, Abrechnungsteil und Protokoll nach 9 Jahren. Buchungen mit legal_hold bleiben unberührt.
//     E-Mail-Ausgang nach 3 Jahren ab Jahresende, Gewerbenachweise 6 Monate nach Ablehnung
//  3. Abgelaufene Sitzungen und Bestätigungslinks entfernen
//  4. Verwaiste Dateien (Nachweise gelöschter Konten, ersetzte Logos) entfernen
//
// Nutzung: node --conditions=react-server --import tsx --env-file=.env.local scripts/maintenance.mts [--dry-run]
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { sendMail } from "@/lib/mail";

const dry = process.argv.includes("--dry-run");
// Aufgabe 17: Löschen und Anonymisieren nur, wenn RETENTION_DELETE_ENABLED=1 gesetzt ist (Standard: aus = Probelauf,
// der Job listet nur, was er löschen würde). Erinnerungen (Abschnitt 1) laufen unabhängig davon.
const deleteEnabled = process.env.RETENTION_DELETE_ENABLED === "1";
const dryRetention = dry || !deleteEnabled;
const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const storageDir = process.env.STORAGE_DIR ?? "/var/lib/handwerker2go/uploads";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
const log = (s: string, d = dry) => console.log(`${d ? "[Probelauf] " : ""}${s}`);
const rlog = (s: string) => log(s, dryRetention);

async function tx<T>(fn: () => Promise<T>, d = dry): Promise<T> {
  await db.query("begin");
  try {
    await db.query("select set_config('app.role', 'system', true)");
    const r = await fn();
    await db.query(d ? "rollback" : "commit");
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
    where p.status = 'approved' and p.intro_reminder_sent_at is null and p.membership_status in ('none', 'canceled') and p.partner_code is null
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
    if (!dryRetention) {
      const full = path.resolve(storageDir, ph.storage_key);
      if (full.startsWith(path.resolve(storageDir) + path.sep)) await unlink(full).catch(() => {});
      await db.query("delete from booking_photos where id = $1", [ph.id]);
    }
  }
  rlog(`Fotos gelöscht: ${photos.length}`);

  // (e) Freitext aus Angebotsanfragen 12 Monate nach Abschluss
  const notes = await db.query(
    `update bookings b set notes = null where b.price_type = 'quote' and b.notes is not null and ${closed}
       and not b.legal_hold and ${finished} < now() - interval '12 months'`,
  );
  rlog(`Freitexte aus Angebotsanfragen entfernt: ${notes.rowCount}`);

  // (b) Erklärungen zum vorzeitigen Leistungsbeginn mit der Anonymisierung der Buchung
  const consents = await db.query(
    `delete from consents c using bookings b where b.number = c.booking_ref and ${closed} and not b.legal_hold and ${after3y} < now()`,
  );
  rlog(`Erklärungen gelöscht: ${consents.rowCount}`);

  // (b) Buchungsdaten anonymisieren; Abrechnungsteil (Nummer, Datum, Betrag, Provision, Betrieb, Stripe-Kennungen) bleibt
  const anon = await db.query(
    `update bookings b set contact_name = '', contact_phone = '', contact_email = '', street = '', postal_code = '', city = '',
       notes = null, location = null, distance_km = null, customer_id = null, anonymized_at = now()
     where b.anonymized_at is null and ${closed} and not b.legal_hold and ${after3y} < now()`,
  );
  rlog(`Buchungen anonymisiert: ${anon.rowCount}`);

  // (c) Abrechnungsteil nach 9 Jahren
  const oldInvoices = await db.query(`delete from commission_invoices where created_at < now() - interval '9 years'`);
  const oldBookings = await db.query(
    `delete from bookings b where ${closed} and not b.legal_hold and ${finished} < now() - interval '9 years'
       and not exists (select 1 from reviews r where r.booking_id = b.id and r.visible)`,
  );
  rlog(`Abrechnungsdaten älter als 9 Jahre gelöscht: ${oldInvoices.rowCount} Rechnungen, ${oldBookings.rowCount} Buchungen`);

  // Protokoll nach 9 Jahren (Trigger erlaubt das nur dem System und nur für alte Einträge)
  const oldAudit = await db.query(`delete from audit_logs where created_at < now() - interval '9 years'`);
  rlog(`Protokolleinträge gelöscht: ${oldAudit.rowCount}`);

  // E-Mail-Ausgang: Inhalte versendeter Mails 3 Jahre ab Ende des Versandjahres
  const mails = await db.query(`delete from email_outbox where date_trunc('year', created_at) + interval '4 years' < now()`);
  rlog(`E-Mails aus dem Ausgang gelöscht: ${mails.rowCount}`);

  // Gewerbenachweise: 6 Monate nach Ablehnung des Betriebs (bei gelöschten Konten siehe verwaiste Dateien unten)
  const docs = (await db.query(
    `select d.id, d.storage_key from provider_documents d join provider_profiles p on p.id = d.provider_id
      where p.status = 'rejected'
        and coalesce((select max(a.created_at) from audit_logs a
                       where a.entity = 'provider_profiles' and a.entity_id = p.id::text and a.action = 'provider.reject'), p.updated_at)
            < now() - interval '6 months'`,
  )).rows;
  for (const d of docs) {
    if (!dryRetention) {
      const full = path.resolve(storageDir, d.storage_key);
      if (full.startsWith(path.resolve(storageDir) + path.sep)) await unlink(full).catch(() => {});
      await db.query("delete from provider_documents where id = $1", [d.id]);
    }
  }
  rlog(`Gewerbenachweise abgelehnter Betriebe gelöscht: ${docs.length}`);

  // Widerrufe (§ 356a BGB) wie Buchungsdaten: 3 Jahre ab Ende des Eingangsjahres, nicht bei anhängigem Streit
  const withdrawals = await db.query(
    `delete from withdrawals w where not w.legal_hold and w.status not in ('received', 'unmatched')
       and date_trunc('year', w.received_at) + interval '4 years' < now()
       and not exists (select 1 from bookings b where b.id = w.booking_id and b.legal_hold)`,
  );
  rlog(`Widerrufe gelöscht: ${withdrawals.rowCount}`);

  // Meldungen von Inhalten (DSA): 3 Jahre ab Ende des Jahres der Entscheidung
  const reports = await db.query(
    `delete from content_reports where not legal_hold and status <> 'received' and date_trunc('year', decided_at) + interval '4 years' < now()`,
  );
  rlog(`Meldungen von Inhalten gelöscht: ${reports.rowCount}`);

  // Einwilligungen zur Bewertungsmail wie Buchungsdaten (mit der Anonymisierung der Buchung)
  const optins = await db.query(
    `delete from legal_declarations d using bookings b where d.booking_id = b.id and d.kind = 'review_optin' and ${closed} and not b.legal_hold and ${after3y} < now()`,
  );
  rlog(`Einwilligungen zur Bewertungsmail gelöscht: ${optins.rowCount}`);

  // VIES-Ergebnisse und Unternehmer-Nachweise mit Abrechnungsbezug: 9 Jahre (Rechnungen selbst sind unveränderbar und werden nicht gelöscht)
  const vies = await db.query(`delete from vies_checks where checked_at < now() - interval '9 years'`);
  rlog(`VIES-Prüfungen älter als 9 Jahre gelöscht: ${vies.rowCount}`);

  // 3. Abgelaufene Sitzungen und Bestätigungslinks
  const sessions = await db.query(`delete from "session" where "expiresAt" < now() - interval '30 days'`);
  const verifications = await db.query(`delete from verification where "expiresAt" < now() - interval '30 days'`);
  rlog(`Abgelaufene Sitzungen: ${sessions.rowCount}, Bestätigungslinks: ${verifications.rowCount}`);
});

// ---------------------------------------------------------------- 4. Verwaiste Dateien
// Nachweise gelöschter Betriebskonten, ersetzte Logos, Fotos gelöschter Buchungen: Dateien ohne Datenbankeintrag,
// die älter als 1 Tag sind, werden entfernt.
const known = new Set(
  (await db.query(
    `select storage_key k from provider_documents union all select storage_key from booking_photos
     union all select logo_key from provider_profiles where logo_key is not null`,
  )).rows.map((r) => r.k as string),
);
let orphans = 0;
for (const dir of ["nachweise", "logos", "auftragsfotos"]) {
  const root = path.join(storageDir, dir);
  const months = await readdir(root).catch(() => [] as string[]);
  for (const m of months) {
    for (const f of await readdir(path.join(root, m)).catch(() => [] as string[])) {
      const key = `${dir}/${m}/${f}`;
      if (known.has(key)) continue;
      const full = path.join(root, m, f);
      const st = await stat(full).catch(() => null);
      if (!st || !st.isFile() || st.mtimeMs > Date.now() - 86_400_000) continue;
      orphans++;
      if (!dryRetention) await unlink(full).catch(() => {});
    }
  }
}
rlog(`Verwaiste Dateien entfernt: ${orphans}`);

await db.end();
process.exit(0);
