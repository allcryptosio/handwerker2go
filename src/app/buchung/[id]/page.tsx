import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CustomerCancelButton } from "@/components/booking/cancel-button";
import { ReviewForm } from "@/components/booking/review-form";
import { WithdrawButton } from "@/components/legal/withdraw-button";
import { Container } from "@/components/ui/container";
import { legal } from "@/config/legal";
import { providerBookingAction, syncCheckoutReturn } from "@/lib/actions/booking-actions";
import { currentUser } from "@/lib/auth";
import { freeCancellationUntil } from "@/lib/booking/lifecycle";
import { withDb } from "@/lib/db";
import { earlyStartConfirmationParagraph } from "@/lib/legal/early-start";

export const metadata: Metadata = { title: "Buchung", robots: { index: false } };

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);

const statusInfo: Record<string, { label: string; tone: string; text: string }> = {
  pending_payment: { label: "Zahlung offen", tone: "bg-[#fff8e1] border-[#e0a800]", text: "Der Termin ist für 30 Minuten für dich reserviert. Schließe die Bezahlung ab, damit die Buchung gilt." },
  requested: { label: "Wartet auf Bestätigung", tone: "bg-[#fff8e1] border-[#e0a800]", text: "Der Betrieb bestätigt den Termin in der Regel innerhalb weniger Stunden. Du bekommst eine E-Mail." },
  confirmed: { label: "Bestätigt", tone: "bg-mint border-brand", text: "Dein Termin steht. Der Betrieb kommt zur vereinbarten Zeit." },
  declined: { label: "Abgelehnt", tone: "bg-[#fef3f2] border-[#b42318]", text: "Der Betrieb kann den Termin nicht übernehmen." },
  cancelled: { label: "Storniert", tone: "bg-soft border-line-strong", text: "Diese Buchung ist storniert." },
  expired: { label: "Nicht bezahlt", tone: "bg-soft border-line-strong", text: "Die Bezahlung wurde nicht abgeschlossen. Der Termin ist wieder frei." },
  completed: { label: "Erledigt", tone: "bg-mint border-brand", text: "Der Auftrag ist abgeschlossen." },
};

async function Detail({ params, searchParams }: PageProps<"/buchung/[id]">) {
  const { id } = await params;
  const sp = (await searchParams) as Record<string, string | undefined>;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const u = await currentUser();
  if (!u) redirect(`/anmelden?weiter=${encodeURIComponent(`/buchung/${id}`)}`);
  if (sp.bezahlt) await syncCheckoutReturn(id).catch(console.error);

  const data = await withDb({ userId: u.id, role: u.role }, async (db) => {
    const b = (await db.query(
      `select b.*, p.company_name, p.street p_street, p.postal_code p_postal, p.city p_city, p.phone p_phone, p.user_id p_user
         from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1`,
      [id],
    )).rows[0];
    if (!b) return null;
    const photos = (await db.query("select id from booking_photos where booking_id = $1 order by created_at", [id])).rows.map((r) => r.id as string);
    const review = (await db.query("select rating, body, created_at, visible from reviews where booking_id = $1", [id])).rows[0] as
      | { rating: number; body: string | null; created_at: Date; visible: boolean }
      | undefined;
    return { b, photos, review };
  });
  if (!data) notFound();
  const { b, photos, review } = data;
  const isProvider = b.p_user === u.id;
  const isCustomer = b.customer_id === u.id;
  const start = new Date(b.starts_at);
  const s = statusInfo[b.status];
  const freeUntil = freeCancellationUntil(start);
  const canReview = isCustomer && !review && (b.status === "completed" || (b.status === "confirmed" && new Date(b.ends_at) < new Date()));
  const canCancelFree = isCustomer && ["confirmed", "requested"].includes(b.status) && new Date() < freeUntil;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-muted">Buchung {b.number}</div>
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">{b.service_name}</h1>
        </div>
        <Link href={isProvider ? "/dashboard/termine" : "/konto"} className="text-[15px] font-semibold text-brand underline">
          {isProvider ? "Alle Termine" : "Meine Buchungen"}
        </Link>
      </div>

      {sp.abgebrochen && b.status === "pending_payment" && (
        <p className="rounded-card border border-line bg-soft p-4">Du hast die Bezahlung abgebrochen. Der Termin wird in Kürze wieder freigegeben.</p>
      )}
      <section className={`rounded-panel border-[1.5px] p-6 ${s.tone}`}>
        <h2 className="text-lg font-bold">Status: {s.label}</h2>
        <p className="mt-1 text-[15px]">{s.text}{b.cancel_reason ? ` Grund: ${b.cancel_reason}` : ""}</p>
        {b.refunded_cents > 0 && <p className="mt-1 text-[15px]">Erstattet: {eur(b.refunded_cents)} über Stripe auf das ursprüngliche Zahlungsmittel.</p>}
      </section>

      <section className="grid gap-4 rounded-panel border border-line p-6 sm:grid-cols-2">
        <div><div className="text-[13px] text-muted">Termin</div><div className="font-semibold">{when(start)} Uhr</div></div>
        <div><div className="text-[13px] text-muted">Einsatzort</div><div className="font-semibold">{b.street}, {b.postal_code} {b.city}</div></div>
        <div><div className="text-[13px] text-muted">Preis</div><div className="font-semibold">{b.price_type === "fixed" ? `${eur(b.price_cents)} Festpreis` : "Besichtigung kostenlos, Preis nach Angebot"}</div></div>
        {isProvider ? (
          <div><div className="text-[13px] text-muted">Kunde</div><div className="font-semibold">{b.contact_name}, <a className="underline" href={`tel:${b.contact_phone}`}>{b.contact_phone}</a></div></div>
        ) : (
          <div><div className="text-[13px] text-muted">Betrieb (Vertragspartner)</div><div className="font-semibold">{b.company_name}, {b.p_street}, {b.p_postal} {b.p_city}</div>
            {["confirmed", "requested"].includes(b.status) && <div className="text-[14px]">Telefon <a className="underline" href={`tel:${b.p_phone}`}>{b.p_phone}</a></div>}</div>
        )}
        {isProvider && b.price_type === "fixed" && b.application_fee_cents !== null && (
          <div><div className="text-[13px] text-muted">Provision handwerker2go</div><div className="font-semibold">{eur(b.application_fee_cents)} ({(b.commission_bps / 100).toLocaleString("de-DE")} %)</div></div>
        )}
        {b.notes && <div className="sm:col-span-2"><div className="text-[13px] text-muted">Hinweise</div><p className="whitespace-pre-line">{b.notes}</p></div>}
        {photos.length > 0 && (
          <div className="sm:col-span-2">
            <div className="mb-2 text-[13px] text-muted">Fotos</div>
            <div className="flex flex-wrap gap-2">
              {photos.map((p: string) => (
                <a key={p} href={`/api/buchung/foto/${p}`} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/buchung/foto/${p}`} alt="Foto zum Auftrag" className="h-24 w-24 rounded-xl border border-line object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {isCustomer && b.status !== "pending_payment" && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line p-5">
          <p className="text-[15px] text-ink-soft">Sie möchten diesen Vertrag widerrufen? Ein Grund ist nicht nötig.</p>
          <WithdrawButton bookingNumber={b.number} />
        </section>
      )}

      {isCustomer && b.early_start_consent_at && (
        <p className="text-[13px] text-muted">{earlyStartConfirmationParagraph(new Date(b.early_start_consent_at))}</p>
      )}

      {canReview && (
        <section id="bewerten" className="flex scroll-mt-6 flex-col gap-3 rounded-panel border-[1.5px] border-brand p-6">
          <h2 className="text-lg font-bold">Wie war&apos;s? Bewerte den Betrieb</h2>
          <ReviewForm bookingId={b.id} companyName={b.company_name} />
        </section>
      )}

      {review && (isCustomer || isProvider) && (
        <section id="bewerten" className="flex scroll-mt-6 flex-col gap-2 rounded-panel border border-line p-6">
          <h2 className="text-lg font-bold">{isCustomer ? "Deine Bewertung" : "Bewertung des Kunden"}</h2>
          <div className="text-[22px] leading-none text-star" aria-label={`${review.rating} von 5 Sternen`}>
            {"★".repeat(review.rating)}<span className="text-line-strong">{"★".repeat(5 - review.rating)}</span>
          </div>
          {review.body && <p className="whitespace-pre-line text-[15px]">{review.body}</p>}
          {!review.visible && <p className="text-[13px] text-muted">Diese Bewertung ist derzeit nicht öffentlich sichtbar.</p>}
          {isCustomer && review.visible && <p className="text-[13px] text-muted">Danke! Deine Bewertung hilft anderen Kunden bei der Wahl.</p>}
        </section>
      )}

      {isCustomer && ["confirmed", "requested"].includes(b.status) && (
        <section className="flex flex-col gap-3 rounded-panel border border-line p-6">
          <h2 className="text-lg font-bold">Stornieren</h2>
          {canCancelFree ? (
            <>
              <p className="text-[15px] text-ink-soft">Bis {when(freeUntil)} Uhr kostenlos{b.price_type === "fixed" ? ", du bekommst den vollen Betrag zurück" : ""}.</p>
              <CustomerCancelButton id={b.id} refundText={b.price_type === "fixed" ? "Die Erstattung ist veranlasst." : ""} />
            </>
          ) : (
            <p className="text-[15px] text-ink-soft">
              Die kostenlose Stornierung war bis {legal.freeCancellationHours} Stunden vor dem Termin möglich. Bitte schreib uns an{" "}
              <a className="underline" href={`mailto:${legal.email}?subject=Stornierung ${b.number}`}>{legal.email}</a>.
            </p>
          )}
        </section>
      )}

      {isProvider && (
        <section className="flex flex-wrap gap-3">
          {b.status === "requested" && (
            <>
              <ProviderButton id={b.id} action="confirm" label="Termin bestätigen" primary />
              <ProviderButton id={b.id} action="decline" label="Ablehnen" />
            </>
          )}
          {b.status === "confirmed" && start > new Date() && <ProviderButton id={b.id} action="cancel" label="Termin absagen" />}
          {b.status === "confirmed" && start <= new Date() && <ProviderButton id={b.id} action="complete" label="Als erledigt markieren" primary />}
        </section>
      )}
    </div>
  );
}

function ProviderButton({ id, action, label, primary = false }: { id: string; action: string; label: string; primary?: boolean }) {
  return (
    <form action={providerBookingAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="back" value={`/dashboard/termine`} />
      <button type="submit" className={primary ? "rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark" : "rounded-full border-[1.5px] border-line-strong px-5 py-3 font-bold hover:bg-soft"}>
        {label}
      </button>
    </form>
  );
}

export default function Page(props: PageProps<"/buchung/[id]">) {
  return (
    <Container className="max-w-[860px] py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}>
        <Detail {...props} />
      </Suspense>
    </Container>
  );
}
