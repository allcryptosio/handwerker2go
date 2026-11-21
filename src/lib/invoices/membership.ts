import "server-only";
import type Stripe from "stripe";
import { asSystem } from "@/lib/db";
import { membershipDescription } from "./document";
import { issueInvoice } from "./service";

const date = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(d);

/**
 * Bezahlte Abo-Rechnung von Stripe (invoice.paid): eigene Rechnung im Voraus ausstellen (Aufgabe 9.2).
 * Maßgeblich ist unsere PDF-Rechnung; der Stripe-Beleg gilt nur als Zahlungsquittung.
 */
export async function issueMembershipInvoice(invoice: Stripe.Invoice) {
  const accountId = (invoice as unknown as { customer_account?: string | null }).customer_account;
  if (!accountId || !invoice.id || (invoice.amount_paid ?? 0) <= 0) return null;
  const p = await asSystem(async (db) => (await db.query(
    "select id, membership_plan from provider_profiles where stripe_account_id = $1", [accountId],
  )).rows[0] as { id: string; membership_plan: string | null } | undefined);
  if (!p) return null;
  const exists = await asSystem(async (db) => (await db.query("select 1 from invoices where stripe_invoice_id = $1 and status <> 'cancelled'", [invoice.id])).rowCount);
  if (exists) return null;
  const line = invoice.lines?.data?.[0];
  const from = new Date(((line?.period?.start ?? invoice.period_start) as number) * 1000);
  const to = new Date(((line?.period?.end ?? invoice.period_end) as number) * 1000 - 1000);
  const plan = p.membership_plan === "yearly" ? "yearly" : "monthly";
  const net = (invoice as unknown as { subtotal_excluding_tax?: number | null }).subtotal_excluding_tax ?? invoice.subtotal ?? invoice.amount_paid;
  const paidAt = new Date(((invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000)) as number) * 1000);
  const description = membershipDescription(plan, from, to);
  return issueInvoice({
    kind: "membership", providerId: p.id, periodStart: from, periodEnd: to, description,
    lines: [{ text: description, amountCents: net }],
    paymentNote: `Bezahlt über Stripe am ${date(paidAt)}`,
    stripeInvoiceId: invoice.id,
  });
}
