import "server-only";
import { legal } from "@/config/legal";
import { asSystem, audit } from "@/lib/db";
import { notifyBooking } from "@/lib/booking/notify";
import { refundBookingPayment } from "@/lib/stripe/payments";
import { decideCancellation } from "@/lib/booking/cancellation";
import { EFFECTIVE_BOOKING_MODE_SQL } from "@/lib/legal/instant-confirm";
import { contractConcludedAt, submitWithdrawal } from "@/lib/booking/withdrawal";

/**
 * Statusübergänge einer Buchung:
 *   pending_payment → confirmed | requested (bezahlt)  → expired (nicht bezahlt)
 *   requested → confirmed (Betrieb bestätigt) | declined (Betrieb lehnt ab, volle Erstattung)
 *   confirmed/requested → cancelled (Kunde ≥ 24 h vorher oder Betrieb sagt ab, volle Erstattung)
 * Alle Übergänge sind idempotent: ein zweiter Aufruf ändert nichts.
 */

async function load(id: string) {
  return asSystem(async (db) =>
    (await db.query(
      `select b.*, ${EFFECTIVE_BOOKING_MODE_SQL} booking_mode, p.stripe_account_id from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1`,
      [id],
    )).rows[0],
  );
}

/** Zahlung ist eingegangen (Webhook oder Rückkehr von Stripe) */
export async function markPaid(bookingId: string, payment: { sessionId: string; paymentIntentId: string | null }) {
  const b = await load(bookingId);
  if (!b || !["pending_payment", "expired"].includes(b.status)) return b?.status as string | undefined;
  // Aus einem angenommenen Angebot: Der Betrieb hat Preis und Termin schon festgelegt, also sofort bestätigt
  const next = b.offer_id ? "confirmed" : b.booking_mode === "confirm" ? "requested" : "confirmed";
  try {
    await asSystem(async (db) => {
      await db.query(
        `update bookings set status = $2, stripe_payment_intent_id = $3, hold_expires_at = null,
           confirmed_at = case when $2 = 'confirmed' then now() else null end
         where id = $1 and status in ('pending_payment', 'expired')`,
        [bookingId, next, payment.paymentIntentId],
      );
      await audit(db, { actorRole: "system", action: "booking.paid", entity: "bookings", entityId: bookingId, after: { status: next, session: payment.sessionId } });
      if (b.offer_id) {
        await db.query("update offers set status = 'accepted', accepted_booking_id = $2, accepted_at = now() where id = $1 and status = 'sent'", [b.offer_id, bookingId]);
      }
    });
  } catch (e) {
    // Reservierung war abgelaufen und der Termin ist inzwischen vergeben: Zahlung voll erstatten
    if ((e as { code?: string }).code === "23P01" && payment.paymentIntentId && b.stripe_account_id) {
      await refundBookingPayment({ providerAccountId: b.stripe_account_id, paymentIntentId: payment.paymentIntentId, reason: "slot_taken" });
      await asSystem((db) => db.query(`update bookings set status = 'cancelled', cancel_reason = 'Termin bereits vergeben', refunded_cents = price_cents, cancelled_at = now() where id = $1`, [bookingId]));
      await notifyBooking(bookingId, "cancelled_by_provider");
      return "cancelled";
    }
    throw e;
  }
  await notifyBooking(bookingId, next === "confirmed" ? "confirmed" : "requested");
  return next;
}

/** Bezahlseite abgelaufen oder abgebrochen: Termin wieder freigeben */
export async function expireUnpaid(bookingId: string) {
  await asSystem((db) => db.query(`update bookings set status = 'expired' where id = $1 and status = 'pending_payment'`, [bookingId]));
}

async function refundIfPaid(b: { price_type: string; stripe_payment_intent_id: string | null; stripe_account_id: string | null; price_cents: number | null }, reason: string) {
  if (b.price_type !== "fixed" || !b.stripe_payment_intent_id || !b.stripe_account_id) return 0;
  await refundBookingPayment({ providerAccountId: b.stripe_account_id, paymentIntentId: b.stripe_payment_intent_id, reason });
  return b.price_cents ?? 0;
}

export async function providerConfirm(bookingId: string, actorId: string) {
  const ok = await asSystem(async (db) => {
    const r = await db.query(`update bookings set status = 'confirmed', confirmed_at = now(), responded_at = now() where id = $1 and status = 'requested' returning id`, [bookingId]);
    if (r.rowCount) await audit(db, { actorId, actorRole: "provider", action: "booking.confirm", entity: "bookings", entityId: bookingId });
    return r.rowCount === 1;
  });
  if (ok) await notifyBooking(bookingId, "provider_confirmed");
  return ok;
}

export async function providerDecline(bookingId: string, actorId: string) {
  const b = await load(bookingId);
  if (!b || b.status !== "requested") return false;
  const refunded = await refundIfPaid(b, "declined");
  await asSystem(async (db) => {
    await db.query(`update bookings set status = 'declined', refunded_cents = $2, cancelled_at = now(), responded_at = now() where id = $1 and status = 'requested'`, [bookingId, refunded]);
    await audit(db, { actorId, actorRole: "provider", action: "booking.decline", entity: "bookings", entityId: bookingId, after: { refunded } });
  });
  await notifyBooking(bookingId, "declined");
  return true;
}

/** Kunde storniert: bis {freeCancellationHours} Stunden vorher kostenlos mit voller Erstattung */
export function freeCancellationUntil(startsAt: Date) {
  return new Date(startsAt.getTime() - legal.freeCancellationHours * 3_600_000);
}

/**
 * Kunde storniert (AGB für Kunden § 6):
 * - innerhalb der Widerrufsfrist als Widerruf (volle Erstattung vor Leistungsbeginn, egal wie kurzfristig; gespeichert in withdrawals),
 * - danach bis 24 Std. vorher kostenlos, später Pauschale min(25 %, Anfahrtskosten), Rest erstattet, Provision anteilig.
 */
export async function customerCancel(bookingId: string, actorId: string): Promise<{ ok: boolean; reason?: string; message?: string }> {
  const b = await load(bookingId);
  if (!b || b.customer_id !== actorId) return { ok: false, reason: "Buchung nicht gefunden." };
  if (!["confirmed", "requested", "pending_payment"].includes(b.status)) return { ok: false, reason: "Diese Buchung kann nicht mehr storniert werden." };
  if (b.status === "pending_payment") {
    await asSystem(async (db) => {
      await db.query(`update bookings set status = 'cancelled', refunded_cents = 0, cancelled_at = now(), cancel_reason = 'Storniert durch Kunden' where id = $1 and status = 'pending_payment'`, [bookingId]);
      await audit(db, { actorId, actorRole: "customer", action: "booking.cancel", entity: "bookings", entityId: bookingId, after: { refunded: 0 } });
    });
    return { ok: true };
  }
  const d = decideCancellation({
    priceType: b.price_type, priceCents: b.price_cents, anfahrtskostenCents: b.anfahrtskosten_cents,
    contractAt: contractConcludedAt(b), startsAt: new Date(b.starts_at), now: new Date(),
  });
  if (d.kind === "withdrawal") {
    await submitWithdrawal({ name: b.contact_name, bookingNumber: b.number, email: b.contact_email, userId: actorId, source: "cancel_flow" });
    return { ok: true, message: d.message };
  }
  let refunded = 0;
  if (b.price_type === "fixed" && b.stripe_payment_intent_id && b.stripe_account_id && d.refundCents > 0) {
    await refundBookingPayment({
      providerAccountId: b.stripe_account_id, paymentIntentId: b.stripe_payment_intent_id,
      amountCents: d.refundCents === b.price_cents ? undefined : d.refundCents, reason: d.kind === "free" ? "customer_cancel" : "customer_cancel_late",
    });
    refunded = d.refundCents;
  }
  await asSystem(async (db) => {
    await db.query(
      `update bookings set status = 'cancelled', refunded_cents = $2, cancellation_fee_cents = $3, cancelled_at = now(), cancel_reason = 'Storniert durch Kunden'
        where id = $1 and status in ('confirmed', 'requested')`,
      [bookingId, refunded, d.feeCents || null],
    );
    await audit(db, { actorId, actorRole: "customer", action: "booking.cancel", entity: "bookings", entityId: bookingId, after: { refunded, fee: d.feeCents, kind: d.kind } });
  });
  await notifyBooking(bookingId, "cancelled_by_customer");
  return { ok: true, message: d.message };
}

/**
 * Betrieb meldet: Kunde nicht angetroffen. Nach Ablauf der Widerrufsfrist Pauschale, Rest erstattet;
 * innerhalb der Frist keine automatische Pauschale, sondern Prüfung durch den Admin.
 */
export async function providerNoShow(bookingId: string, actorId: string): Promise<{ ok: boolean; message: string }> {
  const b = await load(bookingId);
  if (!b || b.status !== "confirmed" || new Date(b.starts_at) > new Date()) return { ok: false, message: "Nur bei bestätigten Terminen nach Beginn möglich." };
  const d = decideCancellation({
    priceType: b.price_type, priceCents: b.price_cents, anfahrtskostenCents: b.anfahrtskosten_cents,
    contractAt: contractConcludedAt(b), startsAt: new Date(b.starts_at), now: new Date(), noShow: true,
  });
  if (d.kind === "admin_case") {
    await asSystem(async (db) => {
      await db.query("update bookings set no_show_at = coalesce(no_show_at, now()) where id = $1", [bookingId]);
      await audit(db, { actorId, actorRole: "provider", action: "booking.no_show_reported", entity: "bookings", entityId: bookingId, after: { admin_case: true } });
    });
    if (process.env.ADMIN_EMAIL) {
      const { sendMail } = await import("@/lib/mail");
      await sendMail({ to: process.env.ADMIN_EMAIL, template: "no_show_admin", subject: `Nichterscheinen in der Widerrufsfrist: ${b.number}`, heading: "Bitte prüfen", paragraphs: [`Der Betrieb meldet, dass bei Buchung ${b.number} niemand angetroffen wurde. Die Widerrufsfrist läuft noch: keine automatische Pauschale.`] }).catch(console.error);
    }
    return { ok: true, message: d.message };
  }
  let refunded = 0;
  if (b.price_type === "fixed" && b.stripe_payment_intent_id && b.stripe_account_id && d.refundCents > 0) {
    await refundBookingPayment({ providerAccountId: b.stripe_account_id, paymentIntentId: b.stripe_payment_intent_id, amountCents: d.refundCents, reason: "no_show" });
    refunded = d.refundCents;
  }
  await asSystem(async (db) => {
    await db.query(
      `update bookings set status = 'cancelled', refunded_cents = $2, cancellation_fee_cents = $3, no_show_at = now(), cancelled_at = now(), cancel_reason = 'Kunde nicht angetroffen' where id = $1 and status = 'confirmed'`,
      [bookingId, refunded, d.feeCents || null],
    );
    await audit(db, { actorId, actorRole: "provider", action: "booking.no_show", entity: "bookings", entityId: bookingId, after: { refunded, fee: d.feeCents } });
  });
  await notifyBooking(bookingId, "cancelled_by_customer");
  return { ok: true, message: d.message };
}

export async function providerCancel(bookingId: string, actorId: string, reason: string) {
  const b = await load(bookingId);
  if (!b || !["confirmed", "requested"].includes(b.status)) return false;
  const refunded = await refundIfPaid(b, "provider_cancel");
  await asSystem(async (db) => {
    await db.query(`update bookings set status = 'cancelled', refunded_cents = $2, cancelled_at = now(), cancel_reason = $3 where id = $1`, [bookingId, refunded, reason.slice(0, 300)]);
    await audit(db, { actorId, actorRole: "provider", action: "booking.cancel", entity: "bookings", entityId: bookingId, after: { refunded, reason } });
  });
  await notifyBooking(bookingId, "cancelled_by_provider");
  return true;
}

/** Erledigt markieren (Betrieb, nach dem Termin) */
export async function providerComplete(bookingId: string, actorId: string) {
  return asSystem(async (db) => {
    const r = await db.query(`update bookings set status = 'completed' where id = $1 and status = 'confirmed' and starts_at < now() returning id`, [bookingId]);
    if (r.rowCount) await audit(db, { actorId, actorRole: "provider", action: "booking.complete", entity: "bookings", entityId: bookingId });
    return r.rowCount === 1;
  });
}
