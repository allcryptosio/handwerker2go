import "server-only";
import Stripe from "stripe";

/**
 * Stripe-Client. Ohne STRIPE_SECRET_KEY sind Zahlungen deaktiviert (null).
 * Live-Schlüssel werden nur akzeptiert, wenn STRIPE_ALLOW_LIVE=1 ausdrücklich gesetzt ist.
 */
let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return (client = null);
  if (key.startsWith("sk_live_") && process.env.STRIPE_ALLOW_LIVE !== "1") {
    throw new Error("Stripe-Live-Schlüssel gesetzt, aber STRIPE_ALLOW_LIVE ist nicht 1. Zahlungen bleiben gesperrt.");
  }
  client = new Stripe(key, { appInfo: { name: "handwerker2go", url: "https://handwerker2go.com" } });
  return client;
}

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const stripeIsTestMode = () => (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
