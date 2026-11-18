// Monatliche Provisionsrechnungen an die Betriebe.
// Bei Direct Charges behält Stripe die Provision als Plattformgebühr (application fee) ein; dafür entsteht keine Rechnung.
// Dieses Skript stellt je Betrieb und Monat eine Rechnung über die einbehaltenen Provisionen aus
// (netto, Stripe Tax, bei gültiger USt-IdNr. Reverse Charge) und markiert sie als bereits bezahlt.
//
// Nutzung: node --env-file=.env.local scripts/commission-invoices.mjs [--period=2026-11] [--dry-run]
//   Ohne --period wird der Vormonat abgerechnet (Zeitzone Europe/Berlin). Mehrfach ausführbar: je Betrieb und Monat nur eine Rechnung.
//   Nur Sandbox-Test ohne Datenbank: --simulate=acct_…:Cent
import pg from "pg";
import Stripe from "stripe";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.log("STRIPE_SECRET_KEY fehlt, nichts zu tun"); process.exit(0); }
if (key.startsWith("sk_live_") && process.env.STRIPE_ALLOW_LIVE !== "1") throw new Error("Live-Schlüssel nur mit STRIPE_ALLOW_LIVE=1");
const stripe = new Stripe(key);
const productId = process.env.STRIPE_PRODUCT_COMMISSION;
if (!productId) throw new Error("STRIPE_PRODUCT_COMMISSION fehlt (scripts/stripe-setup.mjs ausführen)");

// Abrechnungszeitraum als Monatsgrenzen in Europe/Berlin
function berlinMonthStart(y, m) {
  const utc = Date.UTC(y, m - 1, 1);
  const off = new Date(utc).toLocaleString("en-US", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" }).match(/GMT([+-]\d+)/)?.[1] ?? "+1";
  return new Date(utc - Number(off) * 3600_000);
}
let year, month;
if (typeof args.period === "string") [year, month] = args.period.split("-").map(Number);
else { const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" })); year = now.getFullYear(); month = now.getMonth(); if (month === 0) { month = 12; year--; } }
const from = berlinMonthStart(year, month);
const to = month === 12 ? berlinMonthStart(year + 1, 1) : berlinMonthStart(year, month + 1);
const periodLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(from);
const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
console.log(`Zeitraum ${periodLabel} (${from.toISOString()} bis ${to.toISOString()})${args["dry-run"] ? ", Probelauf" : ""}`);

// Einbehaltene Provisionen je Betriebskonto (abzüglich erstatteter Provisionen)
const perAccount = new Map();
if (typeof args.simulate === "string") {
  const [acct, cents] = args.simulate.split(":");
  perAccount.set(acct, { amount: Number(cents), count: 1 });
} else {
  for await (const fee of stripe.applicationFees.list({ created: { gte: Math.floor(from / 1000), lt: Math.floor(to / 1000) }, limit: 100 })) {
    const acct = typeof fee.account === "string" ? fee.account : fee.account.id;
    const e = perAccount.get(acct) ?? { amount: 0, count: 0 };
    e.amount += fee.amount - fee.amount_refunded;
    if (fee.amount - fee.amount_refunded > 0) e.count++;
    perAccount.set(acct, e);
  }
}

const db = typeof args.simulate === "string" ? null : new pg.Client({ connectionString: process.env.DATABASE_URL });
if (db) await db.connect();
async function sys(fn) {
  await db.query("begin");
  try { await db.query("select set_config('app.role', 'system', true)"); const r = await fn(); await db.query("commit"); return r; }
  catch (e) { await db.query("rollback"); throw e; }
}

// Eigene USt-IdNr. (MT…) auf jede Rechnung drucken
const ownTaxIds = (await stripe.taxIds.list({ owner: { type: "self" }, limit: 10 })).data.filter((t) => t.type === "eu_vat").map((t) => t.id);

let created = 0;
for (const [acct, { amount, count }] of perAccount) {
  if (amount <= 0) continue;
  let providerId = null;
  if (db) {
    const p = await sys(async () => (await db.query("select id from provider_profiles where stripe_account_id = $1", [acct])).rows[0]);
    if (!p) { console.log(`! ${acct}: kein Betrieb in der Datenbank, übersprungen`); continue; }
    providerId = p.id;
    const done = await sys(async () => (await db.query("select stripe_invoice_id from commission_invoices where provider_id = $1 and period_start = $2", [providerId, periodStart])).rows[0]);
    if (done?.stripe_invoice_id) { console.log(`= ${acct}: bereits abgerechnet (${done.stripe_invoice_id})`); continue; }
  }
  console.log(`+ ${acct}: ${count} Buchungen, Provision ${(amount / 100).toFixed(2)} € netto`);
  if (args["dry-run"]) continue;

  const idem = `commission-${acct}-${periodStart}`;
  // Konto auch als Kunde der Plattform führen (für Rechnung und Steuerberechnung)
  const a = await stripe.v2.core.accounts.retrieve(acct, { include: ["configuration.customer"] });
  if (!a.configuration?.customer) await stripe.v2.core.accounts.update(acct, { configuration: { customer: { capabilities: { automatic_indirect_tax: { requested: true } } } } });

  const invoice = await stripe.invoices.create({
    customer_account: acct,
    currency: "eur",
    collection_method: "send_invoice",
    days_until_due: 0,
    auto_advance: false,
    automatic_tax: { enabled: true },
    account_tax_ids: ownTaxIds,
    description: `Vermittlungsprovision handwerker2go für ${periodLabel}. Die Provision wurde bei den Kundenzahlungen bereits über Stripe einbehalten; es ist keine Zahlung mehr erforderlich.`,
    metadata: { purpose: "commission", period: periodStart, provider_id: providerId ?? "" },
  }, { idempotencyKey: `${idem}-invoice` });
  await stripe.invoiceItems.create({
    customer_account: acct,
    invoice: invoice.id,
    currency: "eur",
    amount,
    tax_behavior: "exclusive",
    description: `Provision für ${count} über handwerker2go vermittelte Buchung${count === 1 ? "" : "en"} (${periodLabel})`,
    metadata: { period: periodStart },
  }, { idempotencyKey: `${idem}-item` });
  // Die Provision ist bereits bei den Kundenzahlungen einbehalten. Als Guthaben gutschreiben, damit die Rechnung
  // mit „Fälliger Betrag 0,00 €“ abschließt. Fällt Steuer an (keine gültige USt-IdNr.), bleibt nur der Steueranteil offen.
  await stripe.rawRequest("POST", `/v1/customers/${acct}/balance_transactions`, {
    amount: -amount,
    currency: "eur",
    description: `Über Stripe einbehaltene Provision ${periodLabel}`,
    metadata: { invoice: invoice.id, period: periodStart },
  }, { idempotencyKey: `${idem}-credit` });
  const finalized = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false });
  const status = finalized.status;
  await stripe.invoices.sendInvoice(invoice.id).catch((e) => console.log(`  Versand: ${e.message}`));
  const final = await stripe.invoices.retrieve(invoice.id);
  const taxes = (finalized.total_taxes ?? []).map((t) => `${t.amount} (${t.taxability_reason})`).join(", ") || "keine";
  console.log(`  Rechnung ${finalized.number ?? invoice.id}: netto ${finalized.subtotal}, Steuer ${taxes}, Status ${status}`);
  console.log(`  PDF ${final.invoice_pdf}`);
  if (db) {
    await sys(() => db.query(
      `insert into commission_invoices (provider_id, period_start, stripe_invoice_id, fee_count, amount_cents, status) values ($1, $2, $3, $4, $5, $6)
       on conflict (provider_id, period_start) do update set stripe_invoice_id = excluded.stripe_invoice_id, status = excluded.status`,
      [providerId, periodStart, invoice.id, count, amount, status],
    ));
  }
  created++;
}
console.log(`Fertig: ${created} Rechnung(en) erstellt`);
if (db) await db.end();
