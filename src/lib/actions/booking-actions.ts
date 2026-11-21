"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { legal } from "@/config/legal";
import { currentUser } from "@/lib/auth";
import { asSystem, audit, withDb } from "@/lib/db";
import { customerCancel, markPaid, providerCancel, providerComplete, providerConfirm, providerDecline } from "@/lib/booking/lifecycle";
import { notifyBooking } from "@/lib/booking/notify";
import { resolvePlace, searchAvailability, templateBySlug } from "@/lib/booking/search";
import { isValidDate, isValidTime } from "@/lib/booking/time";
import { EARLY_START_CONSENT_TEXT, EARLY_START_TEXT_VERSION, needsEarlyStartConsent } from "@/lib/legal/early-start";
import { detectImageType, storage } from "@/lib/storage";
import { getStripe } from "@/lib/stripe/client";
import { applicationFeeCents, commissionBpsAt } from "@/lib/stripe/commission";
import { createBookingCheckout } from "@/lib/stripe/payments";

export interface BookingFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const schema = z.object({
  providerId: z.string().uuid(),
  leistung: z.string().regex(/^[a-z0-9-]{2,60}$/),
  datum: z.string().refine(isValidDate),
  zeit: z.string().refine(isValidTime),
  street: z.string().trim().min(3, "Bitte Straße und Hausnummer angeben").max(120),
  postal_code: z.string().trim().regex(/^\d{5}$/, "Bitte eine fünfstellige PLZ eingeben"),
  city: z.string().trim().min(2, "Bitte den Ort angeben").max(80),
  contact_name: z.string().trim().min(2, "Bitte deinen Namen angeben").max(100),
  contact_phone: z.string().trim().regex(/^[+0-9 ()/-]{6,30}$/, "Bitte eine gültige Telefonnummer angeben"),
  notes: z.string().trim().max(2000).optional(),
  terms: z.literal("on", { message: "Bitte akzeptiere die AGB" }),
});

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function createBooking(_: BookingFormState, form: FormData): Promise<BookingFormState> {
  const u = await currentUser();
  if (!u) return { error: "Bitte melde dich an, um zu buchen." };
  if (u.role !== "customer") return { error: "Buchen können nur Kundenkonten. Bitte melde dich mit einem Kundenkonto an." };

  const parsed = schema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    return { fieldErrors: fe, error: "Bitte prüfe die markierten Felder." };
  }
  const d = parsed.data;

  // Fotos prüfen (Inhalt, nicht Endung)
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PHOTOS) return { fieldErrors: { photos: `Höchstens ${MAX_PHOTOS} Fotos` } };
  const photos: { buf: Buffer; ext: string; mime: string }[] = [];
  for (const f of files) {
    if (f.size > MAX_PHOTO_BYTES) return { fieldErrors: { photos: "Ein Foto ist größer als 4 MB." } };
    const buf = Buffer.from(await f.arrayBuffer());
    const t = detectImageType(buf);
    if (!t) return { fieldErrors: { photos: "Bitte nur Fotos als JPG, PNG oder WebP hochladen." } };
    photos.push({ buf, ...t });
  }

  const [tpl, place] = await Promise.all([templateBySlug(d.leistung), resolvePlace(d.postal_code)]);
  if (!tpl) return { error: "Diese Leistung gibt es nicht." };
  if (!place) return { fieldErrors: { postal_code: "Diese Postleitzahl kennen wir nicht." } };

  // Verfügbarkeit auf dem Server erneut prüfen (Adresse kann von der Suche abweichen)
  const { hits } = await searchAvailability({ templateId: tpl.templateId, place, date: d.datum, time: d.zeit }, d.providerId);
  const hit = hits[0];
  if (!hit) return { error: "Dieser Termin ist leider nicht mehr frei. Bitte wähle eine andere Uhrzeit oder einen anderen Betrieb." };

  const start = new Date(hit.start);
  const end = new Date(hit.end);
  const now = new Date();
  const consentNeeded = needsEarlyStartConsent(now, start);
  if (consentNeeded && form.get("early_start_consent") !== "on") {
    return { fieldErrors: { early_start_consent: "Bitte bestätige den Beginn vor Ablauf der Widerrufsfrist." }, error: "Bitte prüfe die markierten Felder." };
  }

  const fixed = hit.priceType === "fixed";
  if (fixed && (!hit.priceCents || !hit.stripeAccountId)) return { error: "Dieser Betrieb kann gerade keine Zahlungen annehmen." };
  const bps = fixed ? commissionBpsAt(new Date(hit.approvedAt), now) : null;
  const fee = fixed && bps !== null ? applicationFeeCents(hit.priceCents!, bps) : null;
  const status = fixed ? "pending_payment" : hit.bookingMode === "confirm" ? "requested" : "confirmed";

  let booking: { id: string; number: string };
  try {
    booking = await asSystem(async (db) => {
      await db.query(`update bookings set status = 'expired' where status = 'pending_payment' and hold_expires_at < now()`);
      const r = await db.query(
        `insert into bookings (customer_id, provider_id, template_id, service_name, status, starts_at, ends_at, blocked, travel_minutes,
           street, postal_code, city, location, distance_km, contact_name, contact_phone, contact_email, notes,
           price_type, price_cents, commission_bps, application_fee_cents, early_start_consent_at, terms_version, hold_expires_at, confirmed_at)
         values ($1, $2, $3, $4, $5, $6, $7, tstzrange($8, $9), $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326)::geography, $16,
           $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
         returning id, number`,
        [
          u.id, d.providerId, tpl.templateId, tpl.name, status, start, end,
          new Date(start.getTime() - hit.travelMin * 60_000), new Date(end.getTime() + hit.bufferMin * 60_000), hit.travelMin,
          d.street, d.postal_code, d.city, place.lon, place.lat, hit.distanceKm,
          d.contact_name, d.contact_phone, u.email, d.notes || null,
          hit.priceType, fixed ? hit.priceCents : null, bps, fee,
          consentNeeded ? now : null, legal.termsVersion,
          fixed ? new Date(now.getTime() + 35 * 60_000) : null,
          status === "confirmed" ? now : null,
        ],
      );
      const b = r.rows[0] as { id: string; number: string };
      if (consentNeeded) {
        await db.query(
          `insert into consents (user_id, kind, terms_version, text_snapshot, booking_ref, accepted_at) values ($1, 'early_start_withdrawal', $2, $3, $4, $5)`,
          [u.id, `${legal.termsVersion}|${EARLY_START_TEXT_VERSION}`, EARLY_START_CONSENT_TEXT, b.number, now],
        );
      }
      await db.query(`insert into customer_profiles (user_id, phone, accepted_terms_at) values ($1, $2, now()) on conflict (user_id) do update set phone = excluded.phone`, [u.id, d.contact_phone]);
      await audit(db, { actorId: u.id, actorRole: "customer", action: "booking.create", entity: "bookings", entityId: b.id, after: { status, provider: d.providerId, start } });
      return b;
    });
  } catch (e) {
    if ((e as { code?: string }).code === "23P01") return { error: "Diesen Termin hat gerade jemand anderes gebucht. Bitte wähle eine andere Uhrzeit." };
    console.error(e);
    return { error: "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut." };
  }

  // Fotos ablegen (privat, nur Kunde und Betrieb sehen sie)
  for (const ph of photos) {
    const key = await storage.put("auftragsfotos", ph.buf, ph.ext);
    await asSystem((db) => db.query("insert into booking_photos (booking_id, storage_key, mime_type) values ($1, $2, $3)", [booking.id, key, ph.mime]));
  }

  if (!fixed) {
    await notifyBooking(booking.id, status === "confirmed" ? "confirmed" : "requested");
    redirect(`/buchung/${booking.id}`);
  }

  const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
  let url: string | null = null;
  try {
    const checkout = await createBookingCheckout({
      bookingRef: booking.number,
      bookingId: booking.id,
      amountCents: hit.priceCents!,
      serviceName: `${tpl.name}, ${hit.name}`,
      providerAccountId: hit.stripeAccountId!,
      providerApprovedAt: new Date(hit.approvedAt),
      customerEmail: u.email,
      successUrl: `${base}/buchung/${booking.id}?bezahlt=1`,
      cancelUrl: `${base}/buchung/${booking.id}?abgebrochen=1`,
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

/** Rückkehr von Stripe: falls der Webhook noch nicht da war, Zahlung direkt bei Stripe prüfen */
export async function syncCheckoutReturn(bookingId: string) {
  const b = await asSystem(async (db) =>
    (await db.query(
      `select b.status, b.stripe_checkout_session_id, p.stripe_account_id from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1`,
      [bookingId],
    )).rows[0],
  );
  if (!b || b.status !== "pending_payment" || !b.stripe_checkout_session_id || !b.stripe_account_id) return;
  const stripe = getStripe();
  if (!stripe) return;
  const s = await stripe.checkout.sessions.retrieve(b.stripe_checkout_session_id, {}, { stripeAccount: b.stripe_account_id });
  if (s.payment_status === "paid") {
    await markPaid(bookingId, { sessionId: s.id, paymentIntentId: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null) });
  }
}

// ---------------------------------------------------------------- Aktionen auf einer bestehenden Buchung
const idSchema = z.string().uuid();

async function ownBookingAsProvider(bookingId: string) {
  const u = await currentUser();
  if (!u || u.role !== "provider") throw new Error("Nicht berechtigt");
  const ok = await withDb({ userId: u.id, role: "provider" }, async (db) =>
    (await db.query("select 1 from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1 and p.user_id = $2", [bookingId, u.id])).rowCount === 1,
  );
  if (!ok) throw new Error("Nicht berechtigt");
  return u;
}

export async function providerBookingAction(form: FormData) {
  const id = idSchema.parse(form.get("id"));
  const action = String(form.get("action"));
  const u = await ownBookingAsProvider(id);
  if (action === "confirm") await providerConfirm(id, u.id);
  else if (action === "decline") await providerDecline(id, u.id);
  else if (action === "complete") await providerComplete(id, u.id);
  else if (action === "cancel") await providerCancel(id, u.id, String(form.get("reason") ?? "Vom Betrieb abgesagt"));
  redirect(String(form.get("back") ?? "/dashboard/termine").startsWith("/dashboard") ? String(form.get("back")) : "/dashboard/termine");
}

export async function customerCancelAction(_: { error?: string; ok?: boolean }, form: FormData): Promise<{ error?: string; ok?: boolean }> {
  const u = await currentUser();
  if (!u) return { error: "Bitte melde dich an." };
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Buchung nicht gefunden." };
  const r = await customerCancel(id.data, u.id);
  return r.ok ? { ok: true } : { error: r.reason };
}
