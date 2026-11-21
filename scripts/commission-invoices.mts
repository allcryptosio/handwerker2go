// Monatliche Provisionsrechnungen an die Betriebe (Aufgabe 9): eigene PDF-Rechnungen aus unserer Datenbank sind maßgeblich.
// Je Betrieb und Monat eine Sammelrechnung über den Vormonat, Einzelaufstellung je Buchung, Reverse Charge, Nummernkreis H2G-JJJJ-00001.
// Vor jeder Rechnung: erneute VIES-Prüfung (Weg A) bzw. Nachweisprüfung (Weg B); sonst Status on_hold und Admin-Alarm.
// Bei Direct Charges ist die Provision bereits bei der Kundenzahlung einbehalten: Zahlungsvermerk „Bereits beglichen …“.
//
// Nutzung: node --conditions=react-server --import tsx --env-file=.env.local scripts/commission-invoices.mts [--period=2026-11] [--dry-run]
import pg from "pg";
import { COMMISSION_PAYMENT_NOTE, commissionDescription, type InvoiceLine } from "@/lib/invoices/document";
import { issueInvoice } from "@/lib/invoices/service";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const dry = !!args["dry-run"];

function berlinMonthStart(y: number, m: number) {
  const utc = Date.UTC(y, m - 1, 1);
  const off = new Date(utc).toLocaleString("en-US", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" }).match(/GMT([+-]\d+)/)?.[1] ?? "+1";
  return new Date(utc - Number(off) * 3600_000);
}
let year: number, month: number;
if (typeof args.period === "string") [year, month] = args.period.split("-").map(Number);
else { const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" })); year = now.getFullYear(); month = now.getMonth(); if (month === 0) { month = 12; year--; } }
const from = berlinMonthStart(year, month);
const to = month === 12 ? berlinMonthStart(year + 1, 1) : berlinMonthStart(year, month + 1);
const lastDay = new Date(to.getTime() - 1);
const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
console.log(`Zeitraum ${periodStart} (${from.toISOString()} bis ${to.toISOString()})${dry ? ", Probelauf" : ""}`);

const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
// Bezahlte Festpreis-Buchungen im Zeitraum; Provision nach Erstattungen anteilig (Stripe erstattet die application fee im gleichen Verhältnis)
const rows = (await db.query(
  `select b.provider_id, b.number, b.created_at, b.price_cents, b.commission_bps, b.application_fee_cents, coalesce(b.refunded_cents, 0) refunded_cents
     from bookings b
    where b.price_type = 'fixed' and b.stripe_payment_intent_id is not null and b.application_fee_cents > 0
      and b.status not in ('pending_payment', 'expired') and b.created_at >= $1 and b.created_at < $2
    order by b.provider_id, b.created_at`,
  [from, to],
)).rows;
const done = new Set((await db.query(
  `select provider_id from invoices where kind = 'commission' and period_start = $1 and status in ('issued', 'on_hold')`, [periodStart],
)).rows.map((r) => r.provider_id));
await db.end();

const byProvider = new Map<string, InvoiceLine[]>();
const fmt = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(d);
for (const r of rows) {
  const price = Number(r.price_cents);
  const fee = Math.round(Number(r.application_fee_cents) * Math.max(0, price - Number(r.refunded_cents)) / price);
  if (fee <= 0) continue;
  const lines = byProvider.get(r.provider_id) ?? [];
  lines.push({ text: `Provision ${r.number}`, bookingNumber: r.number, date: fmt(new Date(r.created_at)), orderValueCents: price - Number(r.refunded_cents), rateBps: Number(r.commission_bps), amountCents: fee });
  byProvider.set(r.provider_id, lines);
}
let created = 0;
for (const [providerId, lines] of byProvider) {
  if (done.has(providerId)) { console.log(`= ${providerId}: bereits abgerechnet`); continue; }
  const net = lines.reduce((a, l) => a + l.amountCents, 0);
  console.log(`+ ${providerId}: ${lines.length} Buchung(en), Provision ${(net / 100).toFixed(2)} € netto`);
  if (dry) continue;
  const r = await issueInvoice({ kind: "commission", providerId, periodStart: from, periodEnd: lastDay, description: commissionDescription(from, lastDay), lines, paymentNote: COMMISSION_PAYMENT_NOTE });
  console.log(`  ${r.status === "issued" ? `Rechnung ${r.number}` : "ANGEHALTEN (on_hold)"}`);
  created++;
}
console.log(`Fertig: ${created} Rechnung(en)`);
process.exit(0);
