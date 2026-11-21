import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AcceptOfferForm } from "@/components/booking/offer-forms";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { cancellationNotice } from "@/lib/booking/cancellation";
import { priceLine } from "@/lib/booking/price-label";
import { withDb } from "@/lib/db";
import { needsEarlyStartConsent } from "@/lib/legal/early-start";

export const metadata: Metadata = { title: "Angebot", robots: { index: false } };

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" }).format(d);

async function Offer({ params, searchParams }: PageProps<"/angebot/[id]">) {
  const { id } = await params;
  const sp = (await searchParams) as Record<string, string | undefined>;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const u = await currentUser();
  if (!u) redirect(`/anmelden?weiter=${encodeURIComponent(`/angebot/${id}`)}`);
  const o = await withDb({ userId: u.id, role: u.role }, async (db) => (await db.query(
    `select o.*, p.company_name, p.anfahrtskosten_cents, b.service_name, b.number booking_number, b.id booking_id
       from offers o join provider_profiles p on p.id = o.provider_id join bookings b on b.id = o.inspection_booking_id where o.id = $1`,
    [id],
  )).rows[0]);
  if (!o) notFound();
  const items = (o.items ?? []) as { text: string; cents: number }[];
  const open = o.status === "sent" && new Date(o.valid_until) > new Date();
  const isCustomer = o.customer_id === u.id;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-[13px] font-semibold text-muted">Angebot {o.number} zur Besichtigung {o.booking_number}</div>
        <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">{o.service_name}</h1>
        <p className="text-[15px] text-ink-soft">von {o.company_name}</p>
      </div>
      {sp.abgebrochen && <p className="rounded-card border border-line bg-soft p-4">Du hast die Bezahlung abgebrochen. Das Angebot ist noch nicht angenommen.</p>}
      <section className="flex flex-col gap-3 rounded-panel border border-line p-6">
        <ul className="flex flex-col divide-y divide-line">
          {items.map((x, i) => (
            <li key={i} className="flex justify-between gap-4 py-2 text-[15px]"><span>{x.text}</span><span className="font-semibold tabular-nums">{eur(x.cents)}</span></li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <span className="text-[15px] text-muted">Gesamt</span>
          <span className="text-right text-xl font-extrabold">{priceLine(o.price_cents, o.provider_tax_status)}</span>
        </div>
        <dl className="grid gap-2 text-[15px] sm:grid-cols-[180px_1fr]">
          <dt className="text-muted">Geplanter Termin</dt><dd className="font-semibold">{when(new Date(o.planned_start))} Uhr</dd>
          <dt className="text-muted">Gültig bis</dt><dd className="font-semibold">{when(new Date(o.valid_until))} Uhr</dd>
          {o.note && <><dt className="text-muted">Hinweis</dt><dd className="whitespace-pre-line">{o.note}</dd></>}
        </dl>
      </section>
      {open && isCustomer ? (
        <AcceptOfferForm offerId={o.id} needsConsent={needsEarlyStartConsent(new Date(), new Date(o.planned_start))} cancellationText={cancellationNotice("fixed", o.price_cents, o.anfahrtskosten_cents)} />
      ) : (
        <p className="rounded-panel border border-line bg-soft p-5 text-[15px]">
          {o.status === "accepted" ? <>Dieses Angebot ist angenommen. <Link className="underline" href={`/buchung/${o.accepted_booking_id}`}>Zur Buchung</Link></> : "Dieses Angebot kann nicht mehr angenommen werden."}
        </p>
      )}
    </div>
  );
}

export default function Page(props: PageProps<"/angebot/[id]">) {
  return (
    <Container className="max-w-[820px] py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}>
        <Offer {...props} />
      </Suspense>
    </Container>
  );
}
