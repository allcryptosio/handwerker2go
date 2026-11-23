import "server-only";
import { getStripe } from "@/lib/stripe/client";
import { bookingCheckoutBranding } from "@/lib/stripe/branding";
import { applicationFeeCents } from "@/lib/stripe/commission";

/**
 * Zahlung einer Buchung als Direct Charge auf dem Stripe-Konto des Betriebs (Variante A, Managed Risk).
 * Der Betrieb ist Händler; die Provision wird als application_fee_amount einbehalten.
 * Die Plattform nimmt keine Kundengelder auf eigene Konten. Bezahlseite: Stripe Checkout (gehostet).
 */
export async function createBookingCheckout(input: {
  bookingRef: string;
  bookingId: string;
  amountCents: number;
  serviceName: string;
  providerAccountId: string;
  /** Provisionssatz der Buchung (bereits mit commissionBpsAt berechnet) */
  commissionBps: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const bps = input.commissionBps;
  const fee = applicationFeeCents(input.amountCents, bps);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      locale: "de",
      branding_settings: bookingCheckoutBranding(),
      customer_email: input.customerEmail,
      line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: input.amountCents, product_data: { name: input.serviceName } } }],
      payment_intent_data: {
        application_fee_amount: fee,
        description: input.serviceName,
        metadata: { booking_ref: input.bookingRef, booking_id: input.bookingId, commission_bps: String(bps) },
      },
      metadata: { booking_ref: input.bookingRef, booking_id: input.bookingId },
      // Stripe-Minimum: 30 Minuten; so lange bleibt der Termin reserviert
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    },
    { stripeAccount: input.providerAccountId, idempotencyKey: `booking-checkout-${input.bookingRef}` },
  );
  return { url: session.url, sessionId: session.id, commissionBps: bps, applicationFeeCents: fee };
}

/**
 * Erstattung auf dem Konto des Betriebs, z. B. Stornierung in der kostenlosen Frist (voller Betrag)
 * oder Restbetrag nach Pauschale. Die Provision wird anteilig mit erstattet.
 */
export async function refundBookingPayment(input: { providerAccountId: string; paymentIntentId: string; amountCents?: number; reason: string }) {
  // Nur für Tests: STRIPE_MOCK=1 (wird mit Live-Schlüssel ignoriert) protokolliert den Aufruf statt ihn an Stripe zu senden
  if (process.env.STRIPE_MOCK === "1" && !/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "")) {
    console.log("[STRIPE_MOCK] refunds.create", JSON.stringify({ ...input, refund_application_fee: true }));
    return { id: `re_mock_${input.paymentIntentId}_${input.amountCents ?? "voll"}` } as { id: string };
  }
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  return stripe.refunds.create(
    { payment_intent: input.paymentIntentId, amount: input.amountCents, refund_application_fee: true, metadata: { reason: input.reason } },
    { stripeAccount: input.providerAccountId, idempotencyKey: `refund-${input.paymentIntentId}-${input.amountCents ?? "voll"}` },
  );
}
