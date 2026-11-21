import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Container } from "@/components/ui/container";
import { providerBookingAction } from "@/lib/actions/booking-actions";
import { providerDecideWertersatz } from "@/lib/actions/withdrawal-admin-actions";
import { OFFER_ONLINE_HINT } from "@/lib/legal/offer-hint";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Termine", robots: { index: false } };

const day = (d: Date) => new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(d);
const hm = (d: Date) => new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const label: Record<string, string> = { requested: "Bitte bestätigen", confirmed: "Bestätigt", pending_payment: "Zahlung läuft", completed: "Erledigt", cancelled: "Storniert", declined: "Abgelehnt" };

async function Appointments() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "provider") redirect("/konto");
  const rows = await withDb({ userId: u.id, role: "provider" }, async (db) =>
    (await db.query(
      `select b.id, b.number, b.service_name, b.status, b.starts_at, b.ends_at, b.travel_minutes, b.street, b.postal_code, b.city, b.contact_name, b.price_type, b.price_cents
         from bookings b join provider_profiles p on p.id = b.provider_id
        where p.user_id = $1 and b.status in ('requested', 'confirmed', 'pending_payment', 'completed', 'cancelled', 'declined')
          and b.starts_at > now() - interval '30 days'
        order by b.starts_at`,
      [u.id],
    )).rows,
  );
  const withdrawals = await withDb({ userId: u.id, role: "provider" }, async (db) =>
    (await db.query(
      `select w.id, w.received_at, w.status, w.case_kind, w.wertersatz_amount_cents, b.number, b.service_name, b.price_cents, b.early_start_consent_at
         from withdrawals w join bookings b on b.id = w.booking_id join provider_profiles p on p.id = b.provider_id
        where p.user_id = $1 and w.received_at > now() - interval '60 days' order by w.received_at desc`,
      [u.id],
    )).rows,
  );
  const now = new Date();
  const open = rows.filter((r) => r.status === "requested");
  const upcoming = rows.filter((r) => ["confirmed", "pending_payment"].includes(r.status) && new Date(r.ends_at) > now);
  const past = rows.filter((r) => !open.includes(r) && !upcoming.includes(r)).reverse();
  const groups = new Map<string, typeof rows>();
  for (const r of upcoming) groups.set(day(new Date(r.starts_at)), [...(groups.get(day(new Date(r.starts_at))) ?? []), r]);

  const Item = ({ r }: { r: (typeof rows)[number] }) => (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-line bg-white p-4">
      <div className="w-[92px] shrink-0">
        <div className="text-[17px] font-bold tabular-nums">{hm(new Date(r.starts_at))}</div>
        <div className="text-[13px] text-muted">bis {hm(new Date(r.ends_at))}</div>
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/buchung/${r.id}`} className="font-bold hover:underline">{r.service_name}</Link>
        <div className="truncate text-[14px] text-ink-soft">{r.contact_name}, {r.street}, {r.postal_code} {r.city}</div>
        <div className="text-[13px] text-muted">Anfahrt eingeplant: {r.travel_minutes} Min.{r.price_type === "fixed" ? `, ${eur(r.price_cents)}` : ", Besichtigung"}</div>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${r.status === "requested" ? "bg-[#fff8e1] text-[#7a5b00]" : r.status === "confirmed" ? "bg-mint text-brand-dark" : "bg-soft text-muted"}`}>{label[r.status]}</span>
      {r.status === "requested" && (
        <div className="flex w-full gap-2 sm:w-auto">
          {(["confirm", "decline"] as const).map((a) => (
            <form key={a} action={providerBookingAction}>
              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value={a} /><input type="hidden" name="back" value="/dashboard/termine" />
              <button type="submit" className={a === "confirm" ? "rounded-full bg-brand px-4 py-2 font-bold text-white" : "rounded-full border-[1.5px] border-line-strong px-4 py-2 font-bold"}>
                {a === "confirm" ? "Bestätigen" : "Ablehnen"}
              </button>
            </form>
          ))}
        </div>
      )}
    </li>
  );

  return (
    <>
      <AutoRefresh seconds={30} />
      <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">Termine</h1>
      <DashboardNav active="/dashboard/termine" />
      <p className="rounded-card border-[1.5px] border-[#e0a800] bg-[#fff8e1] p-4 text-[14px]"><b>Angebote:</b> {OFFER_ONLINE_HINT}</p>
      {withdrawals.length > 0 && (
        <section className="flex flex-col gap-3 rounded-panel border-[1.5px] border-[#b42318] bg-[#fef3f2] p-5">
          <h2 className="text-lg font-bold">Widerrufe von Kunden</h2>
          <ul className="flex flex-col gap-3">
            {withdrawals.map((w) => (
              <li key={w.id} className="flex flex-col gap-2 rounded-card bg-white p-4 text-[15px]">
                <div><b>{w.service_name}</b>, Buchung {w.number}, eingegangen {day(new Date(w.received_at))} {hm(new Date(w.received_at))} Uhr</div>
                <div className="text-ink-soft">
                  {w.status === "refunded" ? "Voll erstattet." : w.status === "partially_refunded" ? `Erstattet, Wertersatz ${eur(w.wertersatz_amount_cents)} einbehalten.` : w.case_kind === "wertersatz" ? "Der Termin hatte schon begonnen. Bitte Wertersatz für die bis zum Widerruf erbrachte Leistung mitteilen (innerhalb von 10 Tagen, sonst volle Erstattung am 14. Tag)." : "Wird von handwerker2go bearbeitet."}
                </div>
                {w.status === "received" && w.case_kind === "wertersatz" && w.early_start_consent_at && (
                  <form action={providerDecideWertersatz} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={w.id} />
                    <label className="text-[14px]">Wertersatz in € (höchstens {eur(w.price_cents)}){" "}
                      <input name="wertersatz" inputMode="decimal" defaultValue="0" className="ml-1 min-h-10 w-28 rounded-xl border border-line-strong px-3" />
                    </label>
                    <button className="rounded-full bg-brand px-4 py-2 text-[14px] font-bold text-white">Mitteilen und Rest erstatten</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Offene Anfragen ({open.length})</h2>
          <ul className="flex flex-col gap-2">{open.map((r) => <Item key={r.id} r={r} />)}</ul>
        </section>
      )}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Kommende Termine</h2>
        {upcoming.length === 0 ? <p className="text-[15px] text-muted">Noch keine kommenden Termine. Neue Buchungen erscheinen hier automatisch.</p> : (
          [...groups.entries()].map(([d, items]) => (
            <div key={d} className="flex flex-col gap-2">
              <div className="text-[14px] font-bold text-muted">{d}</div>
              <ul className="flex flex-col gap-2">{items.map((r) => <Item key={r.id} r={r} />)}</ul>
            </div>
          ))
        )}
      </section>
      {past.length > 0 && (
        <details className="flex flex-col gap-2">
          <summary className="cursor-pointer text-lg font-bold">Vergangene und stornierte ({past.length})</summary>
          <ul className="mt-3 flex flex-col gap-2">{past.map((r) => <Item key={r.id} r={r} />)}</ul>
        </details>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex max-w-[900px] flex-col gap-6 py-12">
      <Suspense fallback={<p>Lädt …</p>}>
        <Appointments />
      </Suspense>
    </Container>
  );
}
