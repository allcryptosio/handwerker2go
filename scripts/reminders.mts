// Terminerinnerung (systemd: handwerker2go-reminders.timer, alle 15 Minuten).
// Kunde und Betrieb bekommen 24 Stunden vor einem bestätigten Termin eine E-Mail.
// Erinnert wird erst, wenn die Buchung mindestens 12 Stunden alt ist: Wer gerade gebucht hat, hat die Bestätigung noch frisch.
// Jede Buchung wird vor dem Versand markiert (reminder_sent_at), dadurch nie doppelt, auch wenn zwei Läufe überlappen.
//
// Nutzung: node --conditions=react-server --import tsx --env-file=.env.local scripts/reminders.mts [--dry-run]
import pg from "pg";
import { notifyBooking } from "@/lib/booking/notify";

const dry = process.argv.includes("--dry-run");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();

const due = `status = 'confirmed' and reminder_sent_at is null
  and starts_at > now() + interval '1 hour' and starts_at <= now() + interval '24 hours'
  and created_at <= now() - interval '12 hours'`;

let ids: string[];
if (dry) {
  ids = (await db.query(`select id from bookings where ${due} order by starts_at`)).rows.map((r) => r.id);
} else {
  await db.query("begin");
  await db.query("select set_config('app.role', 'system', true)");
  ids = (await db.query(`update bookings set reminder_sent_at = now() where ${due} returning id`)).rows.map((r) => r.id);
  await db.query("commit");
}
await db.end();

for (const id of ids) {
  if (dry) { console.log(`[Probelauf] Erinnerung fällig: ${id}`); continue; }
  try {
    await notifyBooking(id, "reminder");
    console.log(`Erinnerung gesendet: ${id}`);
  } catch (e) {
    console.error(`Erinnerung fehlgeschlagen: ${id}`, e);
  }
}
if (!ids.length) console.log("Keine Erinnerungen fällig");
process.exit(0);
