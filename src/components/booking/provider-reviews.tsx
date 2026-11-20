import Link from "next/link";
import { asSystem } from "@/lib/db";

const date = (d: Date) => new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(d);

/** Öffentliche Bewertungen eines Betriebs: nur sichtbare, alle aus abgeschlossenen Buchungen über handwerker2go (§ 5b Abs. 3 UWG) */
export async function ProviderReviews({ providerId }: { providerId: string }) {
  const { stats, rows } = await asSystem(async (db) => ({
    stats: (await db.query(
      "select round(avg(rating)::numeric, 1) avg, count(*)::int n from reviews where provider_id = $1 and visible",
      [providerId],
    )).rows[0] as { avg: string | null; n: number },
    rows: (await db.query(
      `select r.id, r.rating, r.body, r.created_at, b.service_name from reviews r join bookings b on b.id = r.booking_id
        where r.provider_id = $1 and r.visible order by r.created_at desc limit 6`,
      [providerId],
    )).rows as { id: string; rating: number; body: string | null; created_at: Date; service_name: string }[],
  }));

  return (
    <section aria-labelledby="bewertungen-titel" className="flex flex-col gap-4 rounded-panel border border-line p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="bewertungen-titel" className="text-lg font-bold">Bewertungen</h2>
        {stats.n > 0 && (
          <span className="text-[15px]"><span className="text-star">★</span> <b>{Number(stats.avg).toLocaleString("de-DE")}</b> von 5 <span className="text-muted">({stats.n} {stats.n === 1 ? "Bewertung" : "Bewertungen"})</span></span>
        )}
      </div>
      {stats.n === 0 ? (
        <p className="text-[15px] text-ink-soft">Noch keine Bewertungen. Neue Betriebe prüfen wir vor der Freischaltung auf Gewerbeanmeldung und Versicherung.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[17px] leading-none text-star" aria-label={`${r.rating} von 5 Sternen`}>
                  {"★".repeat(r.rating)}<span className="text-line-strong">{"★".repeat(5 - r.rating)}</span>
                </span>
                <span className="text-[13px] text-muted">{r.service_name}, {date(new Date(r.created_at))}</span>
              </div>
              {r.body && <p className="whitespace-pre-line text-[15px] text-ink-soft">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[12px] text-muted">Bewerten kann nur, wer über handwerker2go gebucht hat und dessen Termin stattgefunden hat. <Link href="/agb#bewertungen" className="underline">So prüfen wir Bewertungen</Link></p>
    </section>
  );
}
