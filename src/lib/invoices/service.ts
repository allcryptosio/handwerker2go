import "server-only";
import { createHash } from "node:crypto";
import { asSystem, audit } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { storage } from "@/lib/storage";
import { checkVatId } from "@/lib/tax/vies";
import {
  type InvoiceDoc, type InvoiceLine, type InvoiceRecipient,
  REVERSE_CHARGE_NOTE, formatInvoiceNumber, renderInvoicePdf,
} from "./document";

const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const date = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(d);

type ProviderRow = {
  id: string; company_name: string; street: string; postal_code: string; city: string; email: string;
  business_proof_type: string | null; vat_id: string | null; steuernummer: string | null; unternehmer_declaration_at: Date | null; gewerbe_at: Date | null;
};

/**
 * Empfänger prüfen (vor jeder Rechnung): Weg A erneute VIES-Prüfung, Weg B Steuernummer + Nachweis.
 * Ergebnis: Empfängerangaben oder Grund zum Anhalten.
 */
export async function checkRecipient(providerId: string): Promise<{ recipient: InvoiceRecipient; holdReason: string | null }> {
  const p = await asSystem(async (db) => (await db.query(
    `select p.id, p.company_name, p.street, p.postal_code, p.city, u.email, p.business_proof_type, p.vat_id, p.steuernummer, p.unternehmer_declaration_at,
            (select min(d.uploaded_at) from provider_documents d where d.provider_id = p.id and d.kind = 'gewerbeanmeldung') gewerbe_at
       from provider_profiles p join "user" u on u.id = p.user_id where p.id = $1`,
    [providerId],
  )).rows[0] as ProviderRow | undefined);
  if (!p) throw new Error("Betrieb nicht gefunden");
  const recipient: InvoiceRecipient = { name: p.company_name, address: `${p.street}, ${p.postal_code} ${p.city}, Deutschland` };
  if (p.business_proof_type === "ust_idnr" && p.vat_id) {
    const r = await checkVatId(p.vat_id);
    await asSystem((db) => db.query(
      "insert into vies_checks (provider_id, vat_id, valid, request_identifier, name, address, error, checked_at, purpose) values ($1,$2,$3,$4,$5,$6,$7,$8,'rechnung')",
      [p.id, p.vat_id, r.ok ? r.valid : null, r.ok ? r.requestIdentifier : null, r.ok ? r.name : null, r.ok ? r.address : null, r.ok ? null : r.error, r.checkedAt],
    ));
    if (r.ok && r.valid) {
      await asSystem((db) => db.query("update provider_profiles set vat_id_valid = true, vat_id_checked_at = $2, vies_request_id = $3 where id = $1", [p.id, r.checkedAt, r.requestIdentifier]));
      return { recipient: { ...recipient, vatId: p.vat_id }, holdReason: null };
    }
    if (r.ok && !r.valid) await asSystem((db) => db.query("update provider_profiles set vat_id_valid = false, vat_id_checked_at = $2 where id = $1", [p.id, r.checkedAt]));
    return { recipient: { ...recipient, vatId: p.vat_id }, holdReason: r.ok ? `USt-IdNr. ${p.vat_id} laut VIES ungültig` : `VIES nicht erreichbar: ${r.error}` };
  }
  if (p.business_proof_type === "gewerbe_nachweis" && p.steuernummer && p.unternehmer_declaration_at) {
    const proofText = `Unternehmereigenschaft nachgewiesen (Gewerbeanmeldung vorgelegt am ${p.gewerbe_at ? date(new Date(p.gewerbe_at)) : "—"}, Erklärung vom ${date(new Date(p.unternehmer_declaration_at))})`;
    return { recipient: { ...recipient, steuernummer: p.steuernummer, proofText }, holdReason: null };
  }
  return { recipient, holdReason: "Kein Unternehmer-Nachweis (USt-IdNr. oder Gewerbenachweis mit Steuernummer und Erklärung)" };
}

/** Nächste Nummer im einzigen Nummernkreis, in derselben Transaktion (Zeilensperre, daher lückenlos auch bei Parallelität) */
export async function allocateNumber(db: { query: (q: string, v?: unknown[]) => Promise<{ rows: { last_number: number }[] }> }, year: number) {
  const r = await db.query(
    `insert into invoice_counters (year, last_number) values ($1, 1)
     on conflict (year) do update set last_number = invoice_counters.last_number + 1 returning last_number`,
    [year],
  );
  const seq = r.rows[0].last_number;
  return { year, seq, number: formatInvoiceNumber(year, seq) };
}

export type IssueInput = {
  kind: "commission" | "membership";
  providerId: string;
  periodStart: Date;
  periodEnd: Date;
  description: string;
  lines: InvoiceLine[];
  paymentNote: string;
  stripeInvoiceId?: string | null;
};

/** Rechnung ausstellen (oder anhalten), PDF unveränderbar ablegen, per E-Mail senden */
/** Kalenderdatum in Europe/Berlin (JJJJ-MM-TT), damit Zeiträume nicht durch UTC verrutschen */
export const berlinDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Berlin" }).format(d);

export async function issueInvoice(input: IssueInput): Promise<{ id: string; status: "issued" | "on_hold"; number: string | null }> {
  const { recipient, holdReason } = await checkRecipient(input.providerId);
  const net = input.lines.reduce((a, l) => a + l.amountCents, 0);
  const issuedAt = new Date();
  const year = Number(new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: "Europe/Berlin" }).format(issuedAt));
  const row = await asSystem(async (db) => {
    const n = holdReason ? null : await allocateNumber(db, year);
    const r = await db.query(
      `insert into invoices (number, year, seq, kind, provider_id, period_start, period_end, issued_at, recipient, lines, net_cents, tax_rate_percent, tax_cents, total_cents,
         payment_note, reverse_charge_note, status, stripe_invoice_id, hold_reason, description)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,0,$11,$12,$13,$14,$15,$16,$17) returning id`,
      [n?.number ?? null, n?.year ?? null, n?.seq ?? null, input.kind, input.providerId, berlinDate(input.periodStart), berlinDate(input.periodEnd), issuedAt,
        JSON.stringify(recipient), JSON.stringify(input.lines), net, input.paymentNote, REVERSE_CHARGE_NOTE, holdReason ? "on_hold" : "issued",
        input.stripeInvoiceId ?? null, holdReason, input.description],
    );
    await audit(db, { actorRole: "system", action: holdReason ? "invoice.on_hold" : "invoice.issue", entity: "invoices", entityId: r.rows[0].id, after: { number: n?.number ?? null, net, holdReason } });
    return { id: r.rows[0].id as string, number: n?.number ?? null };
  });
  if (holdReason) {
    if (process.env.ADMIN_EMAIL) {
      await sendMail({ to: process.env.ADMIN_EMAIL, template: "invoice_on_hold_admin", subject: `Rechnung angehalten: ${recipient.name}`, heading: "Rechnung angehalten", paragraphs: [`Grund: ${holdReason}.`, "Nach Klärung im Admin-Bereich freigeben."], button: { label: "Rechnungen", url: `${base()}/admin/rechnungen` } }).catch(console.error);
    }
    return { id: row.id, status: "on_hold", number: null };
  }
  await finalizePdfAndSend(row.id);
  return { id: row.id, status: "issued", number: row.number };
}

/** PDF erzeugen, nur anhängend speichern (neuer Schlüssel), Hash festhalten, Rechnung verschicken */
export async function finalizePdfAndSend(invoiceId: string) {
  const inv = await asSystem(async (db) => (await db.query(
    `select i.*, u.email from invoices i join provider_profiles p on p.id = i.provider_id join "user" u on u.id = p.user_id where i.id = $1`, [invoiceId],
  )).rows[0]);
  if (!inv || !inv.number || inv.pdf_key) return;
  const credit = inv.credit_for ? (await asSystem(async (db) => (await db.query("select number from invoices where id = $1", [inv.credit_for])).rows[0]?.number)) : null;
  const doc: InvoiceDoc = {
    number: inv.number, kind: inv.kind, issuedAt: new Date(inv.issued_at), periodStart: dayNoon(inv.period_start), periodEnd: dayNoon(inv.period_end),
    recipient: inv.recipient, description: inv.description || descriptionFor(inv), lines: inv.lines, netCents: inv.net_cents, paymentNote: inv.payment_note, creditFor: credit,
  };
  const pdf = await renderInvoicePdf(doc);
  const sha = createHash("sha256").update(pdf).digest("hex");
  const key = await storage.put("rechnungen", pdf, "pdf");
  await asSystem((db) => db.query("update invoices set pdf_key = $2, pdf_sha256 = $3 where id = $1 and pdf_key is null", [invoiceId, key, sha]));
  await sendMail({
    to: inv.email, template: `invoice_${inv.kind}`, subject: `Rechnung ${inv.number} von handwerker2go`,
    heading: `Deine Rechnung ${inv.number}`,
    paragraphs: [
      `anbei deine Rechnung ${inv.number} über ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(inv.net_cents / 100)} (Reverse Charge, ohne Umsatzsteuer).`,
      inv.payment_note,
      "Die Umsatzsteuer darauf schuldest du nach § 13b UStG selbst, auch als Kleinunternehmer (AGB für Betriebe § 6). Die Rechnung findest du auch im Dashboard.",
    ],
    button: { label: "Rechnungen im Dashboard", url: `${base()}/dashboard#rechnungen` },
    attachments: [{ filename: `${inv.number}.pdf`, content: pdf, contentType: "application/pdf" }],
  }).catch(console.error);
  await asSystem((db) => db.query("update invoices set sent_at = now() where id = $1", [invoiceId]));
}

/** date-Spalte (pg liefert Date um 00:00 Serverzeit) als 12:00 UTC desselben Kalendertags */
function dayNoon(d: Date | string) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 12));
}

function descriptionFor(inv: { kind: string; description?: string }) {
  return inv.kind === "membership" ? "Mitgliedschaft handwerker2go" : "Vermittlungsprovision";
}

/** Angehaltene Rechnung nach Klärung freigeben: Empfänger neu prüfen, dann Nummer vergeben */
export async function releaseOnHold(invoiceId: string, actorId: string) {
  const inv = await asSystem(async (db) => (await db.query("select * from invoices where id = $1 and status = 'on_hold'", [invoiceId])).rows[0]);
  if (!inv) return { ok: false, reason: "nicht gefunden" };
  const { holdReason } = await checkRecipient(inv.provider_id);
  if (holdReason) return { ok: false, reason: holdReason };
  // Unveränderbare Felder (Empfänger, Beträge) bleiben; daher neue Rechnung ausstellen und die angehaltene stornieren
  const res = await issueInvoice({ kind: inv.kind, providerId: inv.provider_id, periodStart: dayNoon(inv.period_start), periodEnd: dayNoon(inv.period_end), description: inv.description, lines: inv.lines, paymentNote: inv.payment_note, stripeInvoiceId: inv.stripe_invoice_id });
  await asSystem(async (db) => {
    await db.query("update invoices set status = 'cancelled', hold_reason = coalesce(hold_reason, '') || ' | ersetzt nach Freigabe' where id = $1", [invoiceId]);
    await audit(db, { actorId, actorRole: "admin", action: "invoice.release", entity: "invoices", entityId: invoiceId, after: { replacement: res.id } });
  });
  return { ok: res.status === "issued", reason: res.status === "issued" ? undefined : "erneut angehalten" };
}

/** Stornierung nur per Gutschrift/Stornorechnung mit eigener Nummer und Bezug auf die Originalrechnung (9.1 Nr. 2) */
export async function issueCreditNote(invoiceId: string, actorId: string) {
  const res = await asSystem(async (db) => {
    const inv = (await db.query("select * from invoices where id = $1 and status = 'issued' and kind <> 'credit_note' for update", [invoiceId])).rows[0];
    if (!inv) return null;
    const year = Number(new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: "Europe/Berlin" }).format(new Date()));
    const n = await allocateNumber(db, year);
    const lines = (inv.lines as InvoiceLine[]).map((l) => ({ ...l, amountCents: -l.amountCents, orderValueCents: l.orderValueCents === undefined ? undefined : -l.orderValueCents }));
    const r = await db.query(
      `insert into invoices (number, year, seq, kind, provider_id, period_start, period_end, recipient, lines, net_cents, tax_rate_percent, tax_cents, total_cents,
         payment_note, reverse_charge_note, status, credit_for, description)
       values ($1,$2,$3,'credit_note',$4,$5,$6,$7,$8,$9,0,0,$9,$10,$11,'issued',$12,$13) returning id`,
      [n.number, n.year, n.seq, inv.provider_id, inv.period_start, inv.period_end, JSON.stringify(inv.recipient), JSON.stringify(lines), -inv.net_cents,
        `Gutschrift zur Rechnung ${inv.number}`, REVERSE_CHARGE_NOTE, inv.id, `Stornierung der Rechnung ${inv.number}: ${inv.description}`],
    );
    await db.query("update invoices set status = 'cancelled' where id = $1", [inv.id]);
    await audit(db, { actorId, actorRole: "admin", action: "invoice.credit_note", entity: "invoices", entityId: r.rows[0].id, after: { number: n.number, for: inv.number } });
    return r.rows[0].id as string;
  });
  if (res) await finalizePdfAndSend(res);
  return res;
}
