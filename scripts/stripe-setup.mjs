// Richtet Stripe für handwerker2go ein (idempotent, mehrfach ausführbar):
// Steuer-Ursprung und Registrierung Malta, eigene USt-IdNr., Produkte und Preise der Mitgliedschaft,
// Produkt für Provisionsrechnungen, Kundenportal. Beträge kommen aus src/lib/pricing.ts.
// Nutzung: node --env-file=.env.local scripts/stripe-setup.mjs
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
if (key.startsWith("sk_live_") && process.env.STRIPE_ALLOW_LIVE !== "1") throw new Error("Live-Schlüssel nur mit STRIPE_ALLOW_LIVE=1");
const s = new Stripe(key);

// Preise aus pricing.ts lesen (einfacher Parser, damit keine Werte doppelt gepflegt werden)
const src = readFileSync(new URL("../src/lib/pricing.ts", import.meta.url), "utf8");
const num = (re) => Number(src.match(re)[1]);
const monthlyCents = num(/monthly:\s*\{\s*feeCents:\s*(\d+)/);
const yearlyCents = num(/yearly:\s*\{\s*feeCents:\s*(\d+)/);

const legal = { line1: "Republic Street 266", postal_code: "VLT 1112", city: "Valletta", country: "MT" };
await s.tax.settings.update({ head_office: { address: legal }, defaults: { tax_behavior: "exclusive", tax_code: "txcd_10000000" } });
const regs = await s.tax.registrations.list({ limit: 50 });
if (!regs.data.some((r) => r.country === "MT" && r.status === "active")) {
  await s.tax.registrations.create({ country: "MT", country_options: { mt: { type: "standard", standard: { place_of_supply_scheme: "standard" } } }, active_from: "now" });
}
const ids = await s.taxIds.list({ owner: { type: "self" }, limit: 10 });
if (!ids.data.some((t) => t.value === "MT33258727")) await s.taxIds.create({ type: "eu_vat", value: "MT33258727", owner: { type: "self" } });

async function product(lookup, data) {
  // Liste statt Suche: der Suchindex von Stripe hinkt einige Sekunden hinterher
  for await (const prod of s.products.list({ active: true, limit: 100 })) if (prod.metadata?.h2g_key === lookup) return prod;
  return s.products.create({ ...data, metadata: { h2g_key: lookup } });
}
async function price(lookup_key, data) {
  const found = await s.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
  if (found.data[0] && found.data[0].unit_amount === data.unit_amount) return found.data[0];
  // Betrag geändert: neuen Preis anlegen und den Lookup-Key übertragen
  return s.prices.create({ ...data, lookup_key, transfer_lookup_key: true });
}

const membership = await product("membership", {
  name: "handwerker2go Mitgliedschaft",
  description: "Mitgliedschaft für Handwerksbetriebe auf handwerker2go.com",
  tax_code: "txcd_10103001", // Software as a Service, geschäftliche Nutzung
});
const pMonthly = await price("membership_monthly", { product: membership.id, currency: "eur", unit_amount: monthlyCents, recurring: { interval: "month" }, tax_behavior: "exclusive", nickname: "Monatlich" });
const pYearly = await price("membership_yearly", { product: membership.id, currency: "eur", unit_amount: yearlyCents, recurring: { interval: "year" }, tax_behavior: "exclusive", nickname: "Jährlich" });
const commission = await product("commission", {
  name: "Vermittlungsprovision",
  description: "Provision für über handwerker2go vermittelte und abgeschlossene Buchungen",
  tax_code: "txcd_20030000", // Dienstleistungen allgemein
});

// Kundenportal: Zahlungsmethode ändern, Rechnungen ansehen, kündigen (zum Ende der Laufzeit), Wechsel monatlich/jährlich
const portalConfigs = await s.billingPortal.configurations.list({ limit: 20 });
let portal = portalConfigs.data.find((c) => c.metadata?.h2g_key === "provider_portal" && c.active);
const portalData = {
  business_profile: { headline: "handwerker2go: Mitgliedschaft verwalten", privacy_policy_url: "https://handwerker2go.com/datenschutz", terms_of_service_url: "https://handwerker2go.com/agb-betriebe" },
  default_return_url: "https://handwerker2go.com/dashboard",
  features: {
    customer_update: { enabled: true, allowed_updates: ["address", "tax_id", "email", "name"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end", cancellation_reason: { enabled: true, options: ["too_expensive", "unused", "other"] } },
    subscription_update: { enabled: true, default_allowed_updates: ["price"], proration_behavior: "none", products: [{ product: membership.id, prices: [pMonthly.id, pYearly.id] }] },
  },
  metadata: { h2g_key: "provider_portal" },
};
portal = portal ? await s.billingPortal.configurations.update(portal.id, portalData) : await s.billingPortal.configurations.create(portalData);

console.log(`STRIPE_PRICE_MONTHLY=${pMonthly.id}`);
console.log(`STRIPE_PRICE_YEARLY=${pYearly.id}`);
console.log(`STRIPE_PRODUCT_COMMISSION=${commission.id}`);
console.log(`STRIPE_PORTAL_CONFIG=${portal.id}`);
