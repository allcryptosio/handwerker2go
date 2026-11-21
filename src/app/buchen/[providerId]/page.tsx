import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { ProviderReviews } from "@/components/booking/provider-reviews";
import { cancellationNotice } from "@/lib/booking/cancellation";
import { taxNote } from "@/lib/booking/price-label";
import { formatDateLong } from "@/lib/booking/format";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { resolvePlace, searchAvailability, templateBySlug } from "@/lib/booking/search";
import { isValidDate, isValidTime } from "@/lib/booking/time";
import { asSystem } from "@/lib/db";
import { needsEarlyStartConsent } from "@/lib/legal/early-start";

export const metadata: Metadata = { title: "Termin buchen", robots: { index: false } };

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const durationText = (m: number) => (m < 60 ? `${m} Minuten` : m % 60 ? `${Math.floor(m / 60)} Std. ${m % 60} Min.` : `${m / 60} ${m === 60 ? "Stunde" : "Stunden"}`);

async function Booking({ params, searchParams }: PageProps<"/buchen/[providerId]">) {
  const { providerId } = await params;
  const sp = (await searchParams) as Record<string, string | undefined>;
  const leistung = sp.leistung ?? "";
  const ort = sp.ort ?? "";
  const datum = sp.datum ?? "";
  const zeit = sp.zeit ?? "";
  const back = `/termin?${new URLSearchParams({ leistung, ort, datum, zeit })}`;
  const invalid = !/^[0-9a-f-]{36}$/.test(providerId) || !isValidDate(datum) || !isValidTime(zeit) || !ort;
  const [tpl, place] = invalid ? [null, null] : await Promise.all([templateBySlug(leistung), resolvePlace(ort)]);
  const result = tpl && place ? await searchAvailability({ templateId: tpl.templateId, place, date: datum, time: zeit }, providerId) : null;
  const hit = result?.hits[0];

  if (!hit || !tpl || !place) {
    return (
      <div className="flex flex-col gap-4 rounded-panel border border-line bg-soft p-8">
        <h1 className="text-2xl font-extrabold text-brand-dark">Dieser Termin ist nicht mehr frei</h1>
        <p className="text-ink-soft">Der Betrieb hat zu dieser Zeit inzwischen keinen Platz mehr, oder der Link ist unvollständig.</p>
        <Link href={back} className="self-start rounded-full bg-brand px-5 py-3 font-bold text-white">Andere freie Betriebe ansehen</Link>
      </div>
    );
  }

  const u = await currentUser();
  const fixed = hit.priceType === "fixed";
  const priceText = fixed && hit.priceCents ? eur(hit.priceCents) : "kostenlos";
  const self = `/buchen/${providerId}?${new URLSearchParams({ leistung, ort, datum, zeit })}`;
  const profile = u?.role === "customer"
    ? await asSystem(async (db) => (await db.query("select phone from customer_profiles where user_id = $1", [u.id])).rows[0] as { phone?: string } | undefined)
    : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="order-2 flex flex-col gap-6 lg:order-1">
        <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">Termin buchen</h1>
        {!u ? (
          <div className="flex flex-col gap-4 rounded-panel border border-line p-6">
            <p className="text-[16px]">Um zu buchen, melde dich an oder lege kostenlos ein Kundenkonto an. Deine Auswahl bleibt erhalten.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/anmelden?weiter=${encodeURIComponent(self)}`} className="rounded-full bg-brand px-5 py-3 font-bold text-white">Anmelden</Link>
              <Link href="/registrieren" className="rounded-full border-[1.5px] border-brand px-5 py-3 font-bold text-brand">Konto anlegen</Link>
            </div>
          </div>
        ) : u.role !== "customer" ? (
          <p className="rounded-panel border border-line p-6">Du bist als Betrieb oder Admin angemeldet. Buchen können nur Kundenkonten.</p>
        ) : (
          <BookingForm
            hidden={{ providerId, leistung, datum, zeit }}
            defaults={{ postal_code: place.postalCode, city: place.place.replace(/^Hamburg .*/, "Hamburg"), contact_name: u.name, contact_phone: profile?.phone }}
            needsConsent={needsEarlyStartConsent(new Date(), new Date(hit.start))}
            fixed={fixed}
            priceText={priceText}
            taxText={fixed ? `${taxNote(hit.taxStatus)}, Anfahrt inklusive` : "Preis"}
            cancellationText={cancellationNotice(hit.priceType, hit.priceCents, hit.anfahrtskostenCents)}
          />
        )}
        <ProviderReviews providerId={providerId} />
      </div>

      <aside className="order-1 lg:order-2">
        <div className="sticky top-6 flex flex-col gap-4 rounded-panel border border-line bg-white p-6 shadow-[0_10px_30px_rgba(11,46,31,0.06)]">
          <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">Zusammenfassung</div>
          <div>
            <div className="text-xl font-extrabold">{tpl.name}</div>
            <div className="text-[15px] text-ink-soft">{hit.name}</div>
          </div>
          <dl className="grid gap-3 text-[15px]">
            <div className="flex justify-between gap-3"><dt className="text-muted">Tag</dt><dd className="font-semibold">{formatDateLong(datum)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Ankunft</dt><dd className="font-semibold">{hit.arrival} Uhr</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Dauer</dt><dd className="font-semibold">ca. {durationText(hit.durationMin)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Ort</dt><dd className="text-right font-semibold">{place.postalCode} {place.place}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Bestätigung</dt><dd className="font-semibold">{hit.bookingMode === "instant" ? "sofort" : "durch den Betrieb"}</dd></div>
          </dl>
          <div className="flex items-end justify-between border-t border-line pt-4">
            <span className="text-[15px] text-muted">{fixed ? `Festpreis, ${taxNote(hit.taxStatus)}` : "Besichtigung"}</span>
            <span className="text-2xl font-extrabold">{priceText}</span>
          </div>
          {fixed && <p className="-mt-2 text-right text-[13px] text-muted">Anfahrt inklusive</p>}
          {!fixed && <p className="text-[13px] text-muted">Der Betrieb schaut sich den Auftrag vor Ort an und macht dir danach ein Angebot. Du entscheidest dann, ob du es annimmst.</p>}
          <p className="text-[13px] text-muted">{cancellationNotice(hit.priceType, hit.priceCents, hit.anfahrtskostenCents)}</p>
          <Link href={back} className="text-[14px] font-semibold text-brand underline">Andere Zeit oder anderen Betrieb wählen</Link>
        </div>
      </aside>
    </div>
  );
}

export default function Page(props: PageProps<"/buchen/[providerId]">) {
  return (
    <Container className="py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}>
        <Booking {...props} />
      </Suspense>
    </Container>
  );
}
