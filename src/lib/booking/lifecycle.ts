import "server-only";
import { legal } from "@/config/legal";
import { asSystem, audit } from "@/lib/db";
import { notifyBooking } from "@/lib/booking/notify";
import { refundBookingPayment } from "@/lib/stripe/payments";

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
      `select b.*, p.booking_mode, p.stripe_account_id from bookings b join provider_profiles p on p.id = b.provider_id where b.id = $1`,
      [id],
    )).rows[0],
  );
}

/** Zahlung ist eingegangen (Webhook oder Rückkehr von Stripe) */
export async function markPaid(bookingId: string, payment: { sessionId: string; paymentIntentId: string | null }) {
  const b = await load(bookingId);
  if (!b || !["pending_payment", "expired"].includes(b.status)) return b?.status as string | undefined;
  const next = b.booking_mode === "confirm" ? "requested" : "confirmed";
  try {
    await asSystem(async (db) => {
      await db.query(
        `update bookings set status = $2, stripe_payment_intent_id = $3, hold_expires_at = null,
           confirmed_at = case when $2 = 'confirmed' then now() else null end
         where id = $1 and status in ('pending_payment', 'expired')`,
        [bookingId, next, payment.paymentIntentId],
      );
      await audit(db, { actorRole: "system", action: "booking.paid", entity: "bookings", entityId: bookingId, after: { status: next, session: payment.sessionId } });
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
    const r = await db.query(`update bookings set status = 'confirmed', confirmed_at = now() where id = $1 and status = 'requested' returning id`, [bookingId]);
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
    await db.query(`update bookings set status = 'declined', refunded_cents = $2, cancelled_at = now() where id = $1 and status = 'requested'`, [bookingId, refunded]);
    await audit(db, { actorId, actorRole: "provider", action: "booking.decline", entity: "bookings", entityId: bookingId, after: { refunded } });
  });
  await notifyBooking(bookingId, "declined");
  return true;
}

/** Kunde storniert: bis {freeCancellationHours} Stunden vorher kostenlos mit voller Erstattung */
export function freeCancellationUntil(startsAt: Date) {
  return new Date(startsAt.getTime() - legal.freeCancellationHours * 3_600_000);
}

export async function customerCancel(bookingId: string, actorId: string): Promise<{ ok: boolean; reason?: string }> {
  const b = await load(bookingId);
  if (!b || b.customer_id !== actorId) return { ok: false, reason: "Buchung nicht gefunden." };
  if (!["confirmed", "requested", "pending_payment"].includes(b.status)) return { ok: false, reason: "Diese Buchung kann nicht mehr storniert werden." };
  if (b.status !== "pending_payment" && new Date() > freeCancellationUntil(new Date(b.starts_at))) {
    return { ok: false, reason: `Die kostenlose Stornierung ist nur bis ${legal.freeCancellationHours} Stunden vor dem Termin möglich. Bitte schreib uns an ${legal.email}.` };
  }
  const refunded = b.status === "pending_payment" ? 0 : await refundIfPaid(b, "customer_cancel");
  await asSystem(async (db) => {
    await db.query(
      `update bookings set status = 'cancelled', refunded_cents = $2, cancelled_at = now(), cancel_reason = 'Storniert durch Kunden' where id = $1 and status in ('confirmed', 'requested', 'pending_payment')`,
      [bookingId, refunded],
    );
    await audit(db, { actorId, actorRole: "customer", action: "booking.cancel", entity: "bookings", entityId: bookingId, after: { refunded } });
  });
  if (b.status !== "pending_payment") await notifyBooking(bookingId, "cancelled_by_customer");
  return { ok: true };
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
