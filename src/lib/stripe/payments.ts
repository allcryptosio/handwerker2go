import "server-only";
import { getStripe } from "@/lib/stripe/client";
import { applicationFeeCents, commissionBpsAt } from "@/lib/stripe/commission";

/**
 * Zahlungen für Buchungen (Destination Charge im Namen des Betriebs).
 * Das Geld geht über Stripe auf das Konto des Betriebs, die Provision wird als application_fee_amount einbehalten.
 * Die Plattform nimmt keine Kundengelder auf eigene Konten. Wird ab Phase 3 vom Buchungsablauf genutzt.
 */
export async function createBookingPayment(input: {
  bookingRef: string;
  amountCents: number;
  providerAccountId: string;
  providerApprovedAt: Date;
  customerEmail: string;
  description: string;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const bps = commissionBpsAt(input.providerApprovedAt);
  const fee = applicationFeeCents(input.amountCents, bps);
  const intent = await stripe.paymentIntents.create(
    {
      amount: input.amountCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: fee,
      on_behalf_of: input.providerAccountId,
      transfer_data: { destination: input.providerAccountId },
      receipt_email: input.customerEmail,
      description: input.description,
      metadata: { booking_ref: input.bookingRef, commission_bps: String(bps) },
    },
    { idempotencyKey: `booking-payment-${input.bookingRef}` },
  );
  return { clientSecret: intent.client_secret, paymentIntentId: intent.id, commissionBps: bps, applicationFeeCents: fee };
}

/**
 * Erstattung, z. B. bei Stornierung in der kostenlosen Frist (voller Betrag) oder abzüglich Pauschale.
 * Provision wird anteilig zurückgegeben, der Betrag vom Konto des Betriebs zurückgeholt.
 */
export async function refundBookingPayment(input: { paymentIntentId: string; amountCents?: number; reason: string }) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  return stripe.refunds.create(
    {
      payment_intent: input.paymentIntentId,
      amount: input.amountCents,
      refund_application_fee: true,
      reverse_transfer: true,
      metadata: { reason: input.reason },
    },
    { idempotencyKey: `refund-${input.paymentIntentId}-${input.amountCents ?? "voll"}` },
  );
}

/** Auszahlung an den Betrieb nach Abschluss des Auftrags (Auszahlungen stehen auf "manual") */
export async function releasePayout(input: { providerAccountId: string; amountCents: number; bookingRef: string }) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  return stripe.payouts.create(
    { amount: input.amountCents, currency: "eur", metadata: { booking_ref: input.bookingRef } },
    { stripeAccount: input.providerAccountId, idempotencyKey: `payout-${input.bookingRef}` },
  );
}
