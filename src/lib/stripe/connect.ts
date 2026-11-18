import "server-only";
import { asSystem, audit } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";

/**
 * Stripe Connect Express für Betriebe. Stripe übernimmt KYC, Bankverbindung und Auszahlungen.
 * Auszahlungen stehen auf "manual": Wir lösen sie nach Abschluss des Auftrags aus (releasePayout).
 */
export async function ensureConnectAccount(providerId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const p = await asSystem(async (db) =>
    (await db.query(
      `select p.id, p.stripe_account_id, p.company_name, u.email from provider_profiles p join "user" u on u.id = p.user_id where p.id = $1`,
      [providerId],
    )).rows[0],
  );
  if (!p) throw new Error("Betrieb nicht gefunden");
  if (p.stripe_account_id) return p.stripe_account_id as string;
  const account = await stripe.accounts.create(
    {
      type: "express",
      country: "DE",
      email: p.email,
      business_profile: { name: p.company_name, url: "https://handwerker2go.com" },
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      settings: { payouts: { schedule: { interval: "manual" } } },
      metadata: { provider_id: providerId },
    },
    { idempotencyKey: `connect-account-${providerId}` },
  );
  await asSystem(async (db) => {
    await db.query("update provider_profiles set stripe_account_id = $2 where id = $1", [providerId, account.id]);
    await audit(db, { actorRole: "system", action: "stripe.account_created", entity: "provider_profiles", entityId: providerId, after: { account: account.id } });
  });
  return account.id;
}

/** Link zum gehosteten Stripe-Onboarding (Identität, Unternehmen, Bankverbindung) */
export async function createOnboardingLink(accountId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${base}/dashboard?stripe=erneut`,
    return_url: `${base}/dashboard?stripe=zurueck`,
  });
  return link.url;
}

/** Status von Stripe übernehmen. Wird vom Webhook (account.updated) und beim Laden des Dashboards aufgerufen. */
export async function syncConnectAccount(accountId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const a = await stripe.accounts.retrieve(accountId);
  const flags = { charges: Boolean(a.charges_enabled), payouts: Boolean(a.payouts_enabled), details: Boolean(a.details_submitted) };
  await asSystem((db) =>
    db.query(
      `update provider_profiles set stripe_charges_enabled = $2, stripe_payouts_enabled = $3, stripe_details_submitted = $4,
         stripe_synced_at = now() where stripe_account_id = $1`,
      [accountId, flags.charges, flags.payouts, flags.details],
    ),
  );
  return flags;
}

/** Buchbar erst, wenn freigeschaltet und Stripe Zahlungen und Auszahlungen freigegeben hat */
export function isBookable(p: { status: string; stripe_charges_enabled: boolean; stripe_payouts_enabled: boolean }) {
  return p.status === "approved" && p.stripe_charges_enabled && p.stripe_payouts_enabled;
}
