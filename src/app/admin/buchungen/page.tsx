import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Admin: Buchungen", robots: { index: false } };

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format((c ?? 0) / 100);
const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);
const label: Record<string, string> = { pending_payment: "Zahlung offen", requested: "Anfrage", confirmed: "Bestätigt", declined: "Abgelehnt", cancelled: "Storniert", expired: "Nicht bezahlt", completed: "Erledigt" };

async function Bookings() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const { rows, sums } = await withDb({ userId: u.id, role: "admin" }, async (db) => ({
    rows: (await db.query(
      `select b.id, b.number, b.service_name, b.status, b.starts_at, b.created_at, b.price_type, b.price_cents, b.application_fee_cents, b.refunded_cents,
              p.company_name, b.contact_name
         from bookings b join provider_profiles p on p.id = b.provider_id order by b.created_at desc limit 300`,
    )).rows,
    sums: (await db.query(
      `select count(*) filter (where status in ('confirmed', 'requested', 'completed'))::int active,
              coalesce(sum(price_cents) filter (where status in ('confirmed', 'requested', 'completed') and price_type = 'fixed'), 0)::bigint gmv,
              coalesce(sum(application_fee_cents) filter (where status in ('confirmed', 'requested', 'completed') and price_type = 'fixed'), 0)::bigint fees
         from bookings`,
    )).rows[0],
  }));
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Buchungen</h1>
        <Link href="/admin" className="font-semibold text-brand underline">Zurück zu Admin</Link>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {[["Aktive Buchungen", String(sums.active)], ["Umsatz Festpreis", eur(Number(sums.gmv))], ["Provision", eur(Number(sums.fees))]].map(([k, v]) => (
          <div key={k} className="rounded-card border border-line p-4"><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{k}</dt><dd className="mt-1 text-2xl font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <div className="overflow-x-auto rounded-panel border border-line">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="bg-soft text-[12px] uppercase tracking-[0.04em] text-muted">
            <tr><th className="p-3">Nr.</th><th className="p-3">Termin</th><th className="p-3">Leistung</th><th className="p-3">Betrieb</th><th className="p-3">Kunde</th><th className="p-3">Status</th><th className="p-3 text-right">Preis</th><th className="p-3 text-right">Provision</th></tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-line">
                <td className="p-3 font-mono text-[12px]">{b.number}</td>
                <td className="p-3 tabular-nums">{when(new Date(b.starts_at))}</td>
                <td className="p-3">{b.service_name}</td>
                <td className="p-3">{b.company_name}</td>
                <td className="p-3">{b.contact_name}</td>
                <td className="p-3">{label[b.status]}</td>
                <td className="p-3 text-right tabular-nums">{b.price_type === "fixed" ? eur(b.price_cents) : "Angebot"}{b.refunded_cents > 0 ? ` (−${eur(b.refunded_cents)})` : ""}</td>
                <td className="p-3 text-right tabular-nums">{b.application_fee_cents ? eur(b.application_fee_cents) : ""}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted">Noch keine Buchungen.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex flex-col gap-6 py-12">
      <Suspense fallback={<p>Lädt …</p>}>
        <Bookings />
      </Suspense>
    </Container>
  );
}
