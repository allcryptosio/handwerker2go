// Terminerinnerung und Bitte um Bewertung (systemd: handwerker2go-reminders.timer, alle 15 Minuten).
// 1. Kunde und Betrieb bekommen 24 Stunden vor einem bestätigten Termin eine E-Mail.
// 2. Der Kunde bekommt 3 Stunden nach dem Ende des Termins (zwischen 9 und 20 Uhr) eine Bitte um Bewertung, höchstens 7 Tage danach.
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

// Bitte um Bewertung: Termin vorbei, nicht abgesagt, noch keine Bewertung, nur tagsüber (Berliner Zeit)
const reviewDue = `review_request_sent_at is null and status in ('confirmed', 'completed')
  and ends_at <= now() - interval '3 hours' and ends_at > now() - interval '7 days'
  and not exists (select 1 from reviews r where r.booking_id = bookings.id)
  and not exists (select 1 from customer_profiles cp where cp.user_id = bookings.customer_id and cp.review_mails_opt_out_at is not null)
  and extract(hour from now() at time zone 'Europe/Berlin') between 9 and 19`;

async function claim(where: string, column: string): Promise<string[]> {
  if (dry) return (await db.query(`select id from bookings where ${where} order by starts_at`)).rows.map((r) => r.id);
  await db.query("begin");
  await db.query("select set_config('app.role', 'system', true)");
  const ids = (await db.query(`update bookings set ${column} = now() where ${where} returning id`)).rows.map((r) => r.id);
  await db.query("commit");
  return ids;
}

const jobs: [string, "reminder" | "review_request", string[]][] = [
  ["Erinnerung", "reminder", await claim(due, "reminder_sent_at")],
  ["Bitte um Bewertung", "review_request", await claim(reviewDue, "review_request_sent_at")],
];
await db.end();

for (const [label, event, ids] of jobs) {
  for (const id of ids) {
    if (dry) { console.log(`[Probelauf] ${label} fällig: ${id}`); continue; }
    try {
      await notifyBooking(id, event);
      console.log(`${label} gesendet: ${id}`);
    } catch (e) {
      console.error(`${label} fehlgeschlagen: ${id}`, e);
    }
  }
  if (!ids.length) console.log(`${label}: nichts fällig`);
}
process.exit(0);
