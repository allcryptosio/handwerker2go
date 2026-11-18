import "server-only";
import { asSystem, audit } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";

/**
 * Betriebskonten über Stripe Accounts v2 mit Managed Risk:
 * Stripe trägt Gebühren- und Verlustrisiko (fees_collector/losses_collector = stripe),
 * der Betrieb ist Händler seiner Zahlungen (Direct Charges) und nutzt das Stripe-Dashboard.
 * Stripe übernimmt KYC, Bankverbindung und Auszahlungen.
 */
export async function ensureConnectAccount(providerId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe ist nicht konfiguriert");
  const p = await asSystem(async (db) =>
    (await db.query(
      `select p.id, p.stripe_account_id, p.company_name, p.legal_form, u.email from provider_profiles p join "user" u on u.id = p.user_id where p.id = $1`,
      [providerId],
    )).rows[0],
  );
  if (!p) throw new Error("Betrieb nicht gefunden");
  if (p.stripe_account_id) return p.stripe_account_id as string;
  const account = await stripe.v2.core.accounts.create(
    {
      contact_email: p.email,
      display_name: p.company_name,
      dashboard: "full",
      identity: { country: "de", business_details: { registered_name: p.company_name } },
      defaults: {
        currency: "eur",
        locales: ["de-DE"],
        responsibilities: { fees_collector: "stripe", losses_collector: "stripe" },
      },
      configuration: {
        merchant: {
          capabilities: { card_payments: { requested: true } },
        },
      },
      metadata: { provider_id: providerId },
    },
    { idempotencyKey: `connect-account-v2-${providerId}` },
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
  const link = await stripe.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        collection_options: { fields: "eventually_due" },
        refresh_url: `${base}/dashboard?stripe=erneut`,
        return_url: `${base}/dashboard?stripe=zurueck`,
      },
    },
  });
  return link.url;
}

/** Status von Stripe übernehmen: Zahlungen (card_payments) und Auszahlungen (stripe_balance.payouts) */
export async function syncConnectAccount(accountId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const a = await stripe.v2.core.accounts.retrieve(accountId, { include: ["configuration.merchant", "requirements"] });
  const caps = a.configuration?.merchant?.capabilities;
  const flags = {
    charges: caps?.card_payments?.status === "active",
    payouts: caps?.stripe_balance?.payouts?.status === "active",
    details: !(a.requirements?.entries ?? []).some((e) => e.minimum_deadline?.status === "currently_due"),
  };
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
