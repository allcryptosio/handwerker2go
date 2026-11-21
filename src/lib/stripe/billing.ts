import "server-only";
import type Stripe from "stripe";
import { asSystem, audit } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { ensureConnectAccount } from "@/lib/stripe/connect";
import { platformCheckoutBranding } from "@/lib/stripe/branding";

/**
 * Mitgliedschaft der Betriebe über Stripe Billing.
 * Kunde des Abos ist das v2-Konto des Betriebs (Konfiguration "customer"), kein separates Customer-Objekt.
 * Preise netto, Stripe Tax berechnet die Steuer; mit gültiger USt-IdNr. des Betriebs gilt Reverse Charge.
 * Ein Abo entsteht nur durch aktive Wahl des Betriebs; Abrechnung beginnt frühestens nach der Einführungsphase.
 */
export type Plan = "monthly" | "yearly";

const priceId = (plan: Plan) => {
  const id = plan === "monthly" ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_YEARLY;
  if (!id) throw new Error(`Preis für ${plan} fehlt (STRIPE_PRICE_${plan.toUpperCase()})`);
  return id;
};
const planOfPrice = (id: string | undefined): Plan | null =>
  id === process.env.STRIPE_PRICE_MONTHLY ? "monthly" : id === process.env.STRIPE_PRICE_YEARLY ? "yearly" : null;

const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";

/** IDs der eigenen USt-IdNr. (MT…) in Stripe, damit sie auf jeder Rechnung steht */
let ownTaxIds: string[] | undefined;
async function platformTaxIds(stripe: Stripe) {
  ownTaxIds ??= (await stripe.taxIds.list({ owner: { type: "self" }, limit: 10 })).data.filter((t) => t.type === "eu_vat").map((t) => t.id);
  return ownTaxIds;
}

/** Das Konto des Betriebs zusätzlich als Kunde der Plattform einrichten (idempotent) */
async function ensureCustomerConfiguration(stripe: Stripe, accountId: string) {
  const a = await stripe.v2.core.accounts.retrieve(accountId, { include: ["configuration.customer"] });
  if (a.configuration?.customer) return;
  await stripe.v2.core.accounts.update(accountId, {
    configuration: { customer: { capabilities: { automatic_indirect_tax: { requested: true } } } },
  });
}

/** Checkout-Seite für die Mitgliedschaft. Während der Einführungsphase startet die Abrechnung erst an deren Ende. */
export async function createMembershipCheckout(providerId: string, plan: Plan, introEnd: Date | null): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const accountId = await ensureConnectAccount(providerId);
  await ensureCustomerConfiguration(stripe, accountId);
  // Stripe verlangt für trial_end mindestens 48 Stunden Vorlauf
  const minTrial = Date.now() + 49 * 3600 * 1000;
  const trialEnd = introEnd && introEnd.getTime() > minTrial ? Math.floor(introEnd.getTime() / 1000) : undefined;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_account: accountId,
    branding_settings: platformCheckoutBranding(),
    // Eigene Zahlungsart-Konfiguration (Karte, Apple Pay, Google Pay), angelegt von scripts/stripe-setup.mjs
    ...(process.env.STRIPE_PAYMENT_METHOD_CONFIG ? { payment_method_configuration: process.env.STRIPE_PAYMENT_METHOD_CONFIG } : {}),
    line_items: [{ price: priceId(plan), quantity: 1 }],
    automatic_tax: { enabled: true },
    // USt-IdNr. freiwillig: Kleinunternehmer (§ 19 UStG) haben oft keine. Mit USt-IdNr. greift Reverse Charge.
    tax_id_collection: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    payment_method_collection: "always",
    billing_address_collection: "required",
    locale: "de",
    subscription_data: {
      ...(trialEnd ? { trial_end: trialEnd, trial_settings: { end_behavior: { missing_payment_method: "cancel" } } } : {}),
      invoice_settings: { account_tax_ids: await platformTaxIds(stripe) },
      metadata: { provider_id: providerId, plan },
    },
    metadata: { provider_id: providerId, purpose: "membership" },
    success_url: `${base()}/dashboard?abo=ok`,
    cancel_url: `${base()}/dashboard?abo=abbruch`,
  });
  if (!session.url) throw new Error("Stripe hat keine Checkout-URL geliefert");
  return session.url;
}

/** Stripe-Kundenportal: Zahlungsmethode, Rechnungen, Wechsel monatlich/jährlich, Kündigung zum Laufzeitende */
export async function createPortalSession(accountId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const session = await stripe.billingPortal.sessions.create({
    customer_account: accountId,
    return_url: `${base()}/dashboard`,
    ...(process.env.STRIPE_PORTAL_CONFIG ? { configuration: process.env.STRIPE_PORTAL_CONFIG } : {}),
    locale: "de",
  });
  return session.url;
}

/** Abo-Status von Stripe in provider_profiles übernehmen (aus Webhooks) */
export async function syncSubscription(sub: Stripe.Subscription) {
  const accountId = sub.customer_account ?? null;
  const item = sub.items.data[0];
  const plan = planOfPrice(item?.price.id) ?? (sub.metadata?.plan as Plan | undefined) ?? null;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;
  const status = sub.status === "canceled" ? "canceled" : sub.status;
  await asSystem(async (db) => {
    const r = await db.query(
      `update provider_profiles set membership_plan = $2, membership_status = $3, stripe_subscription_id = $4,
         membership_period_end = $5, membership_cancel_at_period_end = $6
       where ${accountId ? "stripe_account_id = $1" : "id = $1::uuid"}
       returning id`,
      [accountId ?? sub.metadata?.provider_id, plan, status, sub.id, periodEnd, Boolean(sub.cancel_at_period_end || sub.cancel_at)],
    );
    if (r.rows[0]) {
      await audit(db, { actorRole: "system", action: "stripe.subscription_synced", entity: "provider_profiles", entityId: r.rows[0].id, after: { subscription: sub.id, status, plan } });
    }
  });
}

/** Sichtbar in der Suche: in der Einführungsphase oder mit laufender Mitgliedschaft (gleiche Regel wie app.provider_listed) */
export function membershipCoversListing(p: { membership_status: string }, introEnd: Date | null, now = new Date()) {
  return (introEnd !== null && introEnd > now) || ["trialing", "active", "past_due"].includes(p.membership_status);
}
