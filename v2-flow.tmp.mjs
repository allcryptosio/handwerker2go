import Stripe from "stripe";
const s = new Stripe(process.env.STRIPE_SECRET_KEY);
const a = await s.v2.core.accounts.create({
  contact_email: "betrieb-v2@example.com", display_name: "Testbetrieb A", dashboard: "full",
  identity: { country: "de", entity_type: "individual", business_details: { registered_name: "Testbetrieb A" } },
  defaults: { currency: "eur", locales: ["de-DE"], responsibilities: { fees_collector: "stripe", losses_collector: "stripe" } },
  configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
  metadata: { provider_id: "sandbox-v2" },
});
console.log("Konto:", a.id);
const link = await s.v2.core.accountLinks.create({ account: a.id, use_case: { type: "account_onboarding", account_onboarding: { collection_options: { fields: "eventually_due" }, refresh_url: "https://handwerker2go.com/dashboard?stripe=erneut", return_url: "https://handwerker2go.com/dashboard?stripe=zurueck" } } });
console.log("✓ Onboarding-Link:", link.url.slice(0, 50) + "…");
try {
  await s.v2.core.accounts.update(a.id, {
    identity: {
      attestations: { terms_of_service: { account: { date: new Date().toISOString(), ip: "187.124.163.107" } } },
      individual: { given_name: "Test", surname: "Betrieb", email: "betrieb-v2@example.com", phone: "+4915112345678",
        date_of_birth: { day: 1, month: 1, year: 1901 }, address: { line1: "Teststraße 1", postal_code: "20095", city: "Hamburg", country: "de" } },
    },
  });
  console.log("✓ Identitätsdaten per API gesetzt");
} catch (e) { console.log("✗ API-Befüllung nicht erlaubt:", e.message.slice(0, 160)); }
const r = await s.v2.core.accounts.retrieve(a.id, { include: ["configuration.merchant", "requirements"] });
console.log("card_payments:", r.configuration?.merchant?.capabilities?.card_payments?.status, "| payouts:", r.configuration?.merchant?.capabilities?.stripe_balance?.payouts?.status);
console.log("offene Anforderungen:", (r.requirements?.entries ?? []).length);
console.log("LINK=" + link.url);
console.log("ACCT=" + a.id);
