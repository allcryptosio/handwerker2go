"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { legal } from "@/config/legal";
import { currentUser } from "@/lib/auth";
import { asSystem, audit } from "@/lib/db";
import { priceLine } from "@/lib/booking/price-label";
import { berlinToDate, isValidDate, isValidTime } from "@/lib/booking/time";
import { EARLY_START_CONSENT_TEXT, EARLY_START_TEXT_VERSION, needsEarlyStartConsent } from "@/lib/legal/early-start";
import { REVIEW_OPTIN_TEXT, REVIEW_OPTIN_VERSION } from "@/lib/legal/review-optin";
import { sendMail } from "@/lib/mail";
import { findContactData } from "@/lib/partner/guard";
import { applicationFeeCents, commissionBpsAt } from "@/lib/stripe/commission";
import { createBookingCheckout } from "@/lib/stripe/payments";

export type OfferState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const euroToCents = (v: string) => Math.round(Number(v.replace(/\./g, "").replace(",", ".")) * 100);

/**
 * Betrieb erstellt nach der Besichtigung ein Angebot (Aufgabe 5). Nur über die Plattform, Annahme nur online durch den Kunden.
 */
export async function createOffer(_: OfferState, form: FormData): Promise<OfferState> {
  const u = await currentUser();
  if (!u || u.role !== "provider") return { error: "Nicht berechtigt." };
  const p = z.object({
    bookingId: z.string().uuid(),
    datum: z.string().refine(isValidDate, "Bitte ein Datum wählen"),
    zeit: z.string().refine(isValidTime, "Bitte eine Uhrzeit wählen"),
    dauer: z.coerce.number().min(0.5, "Mindestens 0,5 Stunden").max(80, "Höchstens 80 Stunden"),
    gueltig: z.coerce.number().int().min(1).max(60),
    note: z.string().trim().max(1000).optional().default(""),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) {
    const fe: Record<string, string> = {};
    for (const i of p.error.issues) fe[String(i.path[0])] ??= i.message;
    return { fieldErrors: fe, error: "Bitte prüfe die Angaben." };
  }
  const items: { text: string; cents: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const text = String(form.get(`pos_text_${i}`) ?? "").trim();
    const amount = String(form.get(`pos_eur_${i}`) ?? "").trim();
    if (!text && !amount) continue;
    const cents = euroToCents(amount);
    if (!text || !Number.isFinite(cents) || cents <= 0) return { fieldErrors: { [`pos_${i}`]: "Bitte Beschreibung und Betrag angeben" }, error: "Bitte prüfe die Positionen." };
    if (findContactData(text)) return { error: "Bitte keine Kontaktdaten in die Positionen schreiben." };
    items.push({ text: text.slice(0, 200), cents });
  }
  if (items.length === 0) return { error: "Bitte mindestens eine Position angeben." };
  if (p.data.note && findContactData(p.data.note)) return { error: "Bitte keine Kontaktdaten in den Hinweis schreiben." };
  const total = items.reduce((a, x) => a + x.cents, 0);
  const start = berlinToDate(p.data.datum, p.data.zeit);
  if (start.getTime() < Date.now() + 60 * 60_000) return { fieldErrors: { datum: "Der Termin muss in der Zukunft liegen" } };
  const end = new Date(start.getTime() + p.data.dauer * 3_600_000);

  const res = await asSystem(async (db) => {
    const b = (await db.query(
      `select b.id, b.number, b.customer_id, b.contact_email, b.contact_name, b.service_name, b.price_type, p.id pid, p.company_name, p.tax_status, p.user_id
         from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1`,
      [p.data.bookingId],
    )).rows[0];
    if (!b || b.user_id !== u.id) return { error: "Buchung nicht gefunden." as const };
    if (b.price_type !== "quote") return { error: "Angebote gibt es nur nach einem Besichtigungstermin." as const };
    const o = (await db.query(
      `insert into offers (inspection_booking_id, provider_id, customer_id, items, price_cents, provider_tax_status, planned_start, planned_end, valid_until, note)
       values ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(days => $9), nullif($10, '')) returning id, number, valid_until`,
      [b.id, b.pid, b.customer_id, JSON.stringify(items), total, b.tax_status, start, end, p.data.gueltig, p.data.note],
    )).rows[0];
    await audit(db, { actorId: u.id, actorRole: "provider", action: "offer.create", entity: "offers", entityId: o.id, after: { total, items: items.length } });
    return { b, o };
  });
  if ("error" in res) return { error: res.error };
  const { b, o } = res;
  const when = new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" }).format(start);
  await sendMail({
    to: b.contact_email,
    template: "offer_customer",
    subject: `Dein Angebot von ${b.company_name}: ${b.service_name}`,
    heading: "Dein Angebot ist da",
    paragraphs: [
      `${b.company_name} hat dir nach der Besichtigung ein Angebot geschickt (${o.number}).`,
      ...items.map((x) => `${x.text}: ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(x.cents / 100)}`),
      `Gesamt: ${priceLine(total, b.tax_status)}`,
      `Geplanter Termin: ${when} Uhr`,
      `Gültig bis ${new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(o.valid_until))}.`,
      "Annehmen kannst du das Angebot nur online über handwerker2go. Danach bekommst du die Vertragsbestätigung mit Widerrufsbelehrung.",
    ],
    button: { label: "Angebot ansehen", url: `${base()}/angebot/${o.id}` },
  }).catch(console.error);
  return { ok: true };
}

/** Kunde nimmt das Angebot online an: neue Buchung zum Festpreis, Zahlung über Stripe wie bei Festpreis-Buchungen */
export async function acceptOffer(_: OfferState, form: FormData): Promise<OfferState> {
  const u = await currentUser();
  if (!u || u.role !== "customer") return { error: "Bitte melde dich mit deinem Kundenkonto an." };
  const id = z.string().uuid().safeParse(form.get("offerId"));
  if (!id.success) return { error: "Angebot nicht gefunden." };
  if (form.get("terms") !== "on") return { fieldErrors: { terms: "Bitte akzeptiere die AGB" } };

  const o = await asSystem(async (db) => (await db.query(
    `select o.*, b.template_id, b.street, b.postal_code, b.city, b.location, b.distance_km, b.contact_name, b.contact_phone, b.contact_email, b.service_name,
            b.travel_minutes, p.stripe_account_id, p.approved_at, p.company_name, p.anfahrtskosten_cents, p.buffer_minutes,
            (p.stripe_charges_enabled and p.stripe_payouts_enabled) payable
       from offers o join bookings b on b.id = o.inspection_booking_id join provider_profiles p on p.id = o.provider_id where o.id = $1`,
    [id.data],
  )).rows[0]);
  if (!o || o.customer_id !== u.id) return { error: "Angebot nicht gefunden." };
  if (o.status !== "sent" || new Date(o.valid_until) < new Date()) return { error: "Dieses Angebot kann nicht mehr angenommen werden." };
  if (!o.payable || !o.stripe_account_id) return { error: "Der Betrieb kann gerade keine Zahlungen annehmen. Bitte versuche es später." };
  const now = new Date();
  const start = new Date(o.planned_start);
  const end = new Date(o.planned_end);
  const consentNeeded = needsEarlyStartConsent(now, start);
  if (consentNeeded && form.get("early_start_consent") !== "on") return { fieldErrors: { early_start_consent: "Bitte bestätige den Beginn vor Ablauf der Widerrufsfrist." } };
  const reviewOptin = form.get("review_optin") === "on";
  const bps = commissionBpsAt(new Date(o.approved_at), now);
  const fee = applicationFeeCents(o.price_cents, bps);

  let booking: { id: string; number: string };
  try {
    booking = await asSystem(async (db) => {
      const r = await db.query(
        `insert into bookings (customer_id, provider_id, template_id, service_name, status, starts_at, ends_at, blocked, travel_minutes,
           street, postal_code, city, location, distance_km, contact_name, contact_phone, contact_email, notes,
           price_type, price_cents, commission_bps, application_fee_cents, early_start_consent_at, terms_version, hold_expires_at,
           anfahrtskosten_cents, provider_tax_status, offer_id, review_optin, review_optin_at, review_optin_text_version)
         values ($1, $2, $3, $4, 'pending_payment', $5, $6, tstzrange($7, $8), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
           'fixed', $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) returning id, number`,
        [
          u.id, o.provider_id, o.template_id, `${o.service_name} (Angebot ${o.number})`, start, end,
          new Date(start.getTime() - (o.travel_minutes ?? 0) * 60_000), new Date(end.getTime() + (o.buffer_minutes ?? 0) * 60_000), o.travel_minutes ?? 0,
          o.street, o.postal_code, o.city, o.location, o.distance_km, o.contact_name, o.contact_phone, o.contact_email, o.note,
          o.price_cents, bps, fee, consentNeeded ? now : null, legal.termsVersion, new Date(now.getTime() + 35 * 60_000),
          o.anfahrtskosten_cents, o.provider_tax_status, o.id, reviewOptin, reviewOptin ? now : null, reviewOptin ? REVIEW_OPTIN_VERSION : null,
        ],
      );
      const b = r.rows[0] as { id: string; number: string };
      if (consentNeeded) {
        await db.query(`insert into consents (user_id, kind, terms_version, text_snapshot, booking_ref, accepted_at) values ($1, 'early_start_withdrawal', $2, $3, $4, $5)`,
          [u.id, `${legal.termsVersion}|${EARLY_START_TEXT_VERSION}`, EARLY_START_CONSENT_TEXT, b.number, now]);
      }
      if (reviewOptin) {
        await db.query(`insert into legal_declarations (user_id, booking_id, kind, text_version, text_snapshot, legal_version) values ($1, $2, 'review_optin', $3, $4, $5)`,
          [u.id, b.id, REVIEW_OPTIN_VERSION, REVIEW_OPTIN_TEXT, legal.termsVersion]);
      }
      await audit(db, { actorId: u.id, actorRole: "customer", action: "offer.accept_started", entity: "offers", entityId: o.id, after: { booking: b.number } });
      return b;
    });
  } catch (e) {
    if ((e as { code?: string }).code === "23P01") return { error: "Der geplante Termin ist beim Betrieb inzwischen belegt. Bitte schreib dem Betrieb über deine Buchung, damit er ein neues Angebot schickt." };
    console.error(e);
    return { error: "Das Angebot konnte nicht angenommen werden. Bitte versuche es erneut." };
  }
  let url: string | null = null;
  try {
    const checkout = await createBookingCheckout({
      bookingRef: booking.number, bookingId: booking.id, amountCents: o.price_cents, serviceName: `${o.service_name}, ${o.company_name} (Angebot ${o.number})`,
      providerAccountId: o.stripe_account_id, providerApprovedAt: new Date(o.approved_at), customerEmail: u.email,
      successUrl: `${base()}/buchung/${booking.id}?bezahlt=1`, cancelUrl: `${base()}/angebot/${o.id}?abgebrochen=1`,
    });
    url = checkout.url;
    await asSystem((db) => db.query("update bookings set stripe_checkout_session_id = $2 where id = $1", [booking.id, checkout.sessionId]));
  } catch (e) {
    console.error(e);
    await asSystem((db) => db.query(`update bookings set status = 'expired' where id = $1 and status = 'pending_payment'`, [booking.id]));
    return { error: "Die Bezahlseite konnte nicht geöffnet werden. Bitte versuche es gleich noch einmal." };
  }
  redirect(url!);
}
