/**
 * Rechnungsinhalt und PDF (Aufgabe 9.1). Reine Funktionen ohne Datenbank, damit sie testbar sind.
 * Alle Rechnungen an Betriebe ohne Umsatzsteuer im Reverse-Charge-Verfahren; keine maltesische VAT.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import LEGAL from "@/config/legal-data.json";

export const REVERSE_CHARGE_NOTE = "Reverse Charge – Steuerschuldnerschaft des Leistungsempfängers (Art. 196 MwStSystRL, § 13b UStG)";
export const COMMISSION_PAYMENT_NOTE = "Bereits beglichen durch Einbehalt bei den Kundenzahlungen über Stripe";

export type InvoiceRecipient = {
  name: string;
  address: string;
  vatId?: string | null;
  steuernummer?: string | null;
  /** Weg B: „Unternehmereigenschaft nachgewiesen (…)“ */
  proofText?: string | null;
};

export type InvoiceLine = {
  text: string;
  bookingNumber?: string;
  date?: string; // TT.MM.JJJJ
  orderValueCents?: number;
  rateBps?: number;
  amountCents: number;
};

export type InvoiceDoc = {
  number: string;
  kind: "commission" | "membership" | "credit_note";
  issuedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  recipient: InvoiceRecipient;
  description: string;
  lines: InvoiceLine[];
  netCents: number;
  paymentNote: string;
  creditFor?: string | null;
};

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100).replace(/ /g, " ");
const date = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(d);
const pct = (bps: number) => `${(bps / 100).toLocaleString("de-DE")} %`;

/** Fortlaufende Rechnungsnummer im einheitlichen Format H2G-JJJJ-00001 */
export const formatInvoiceNumber = (year: number, seq: number) => `H2G-${year}-${String(seq).padStart(5, "0")}`;

/** Leistungsbeschreibung nach 9.1 Nr. 5 */
export function commissionDescription(from: Date, to: Date) {
  return `Vermittlungsprovision für über handwerker2go vermittelte Aufträge im Zeitraum ${date(from)}–${date(to)} (Einzelaufstellung: Buchungsnummer, Datum, Auftragswert, Provisionssatz, Provision)`;
}
export function membershipDescription(plan: "monthly" | "yearly", from: Date, to: Date) {
  return `Mitgliedschaft handwerker2go (${plan === "yearly" ? "jährlich" : "monatlich"}), Zeitraum ${date(from)}–${date(to)}`;
}

/** Alle Pflichtangaben als Textzeilen in Reihenfolge (Grundlage für PDF und Tests) */
export function invoiceTextLines(inv: InvoiceDoc): string[] {
  const r = inv.recipient;
  const ids = r.vatId ? [`USt-IdNr.: ${r.vatId}`] : [`Steuernummer: ${r.steuernummer ?? "—"}`, ...(r.proofText ? [r.proofText] : [])];
  return [
    inv.kind === "credit_note" ? "Gutschrift / Stornorechnung" : "Rechnung",
    `Rechnungsnummer: ${inv.number}`,
    `Rechnungsdatum: ${date(inv.issuedAt)}`,
    ...(inv.creditFor ? [`Bezug: Stornierung der Rechnung ${inv.creditFor}`] : []),
    "Leistender:",
    `${LEGAL.operatorName}, handelnd unter „${LEGAL.tradingName}“`,
    LEGAL.address,
    `USt-IdNr.: ${LEGAL.vatId}`,
    "Leistungsempfänger:",
    r.name,
    r.address,
    ...ids,
    "Leistung:",
    inv.description,
    `Leistungszeitraum: ${date(inv.periodStart)}–${date(inv.periodEnd)}`,
    ...inv.lines.map((l) =>
      l.bookingNumber
        ? `${l.bookingNumber} | ${l.date ?? ""} | Auftragswert ${eur(l.orderValueCents ?? 0)} | Satz ${pct(l.rateBps ?? 0)} | Provision ${eur(l.amountCents)}`
        : `${l.text}: ${eur(l.amountCents)}`,
    ),
    `Nettobetrag: ${eur(inv.netCents)}`,
    "Steuersatz: 0 %",
    "Steuerbetrag: 0,00 €",
    `Gesamtbetrag: ${eur(inv.netCents)}`,
    "Währung: EUR",
    REVERSE_CHARGE_NOTE,
    inv.paymentNote,
  ];
}

/** PDF/A4 mit pdf-lib (Standardschrift, unkomprimierte Textangaben bleiben über invoiceTextLines prüfbar) */
export async function renderInvoicePdf(inv: InvoiceDoc): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Rechnung ${inv.number}`);
  pdf.setAuthor(`${LEGAL.operatorName} (${LEGAL.tradingName})`);
  pdf.setCreationDate(inv.issuedAt);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  const left = 56, right = 539, bottom = 60;
  let y = 790;
  const green = rgb(0.07, 0.44, 0.31), ink = rgb(0.1, 0.12, 0.11), muted = rgb(0.34, 0.35, 0.35);
  const newPageIfNeeded = (h: number) => { if (y - h < bottom) { page = pdf.addPage([595.28, 841.89]); y = 790; } };
  const write = (text: string, opts: { size?: number; f?: typeof font; color?: typeof ink; x?: number } = {}) => {
    const size = opts.size ?? 10, f = opts.f ?? font, x = opts.x ?? left;
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(t, size) > right - x) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    for (const l of lines) { newPageIfNeeded(size + 4); page.drawText(l, { x, y, size, font: f, color: opts.color ?? ink }); y -= size + 4; }
  };
  const gap = (h = 8) => { y -= h; };

  write("handwerker2go", { size: 18, f: bold, color: green });
  write(`${LEGAL.operatorName}, handelnd unter „${LEGAL.tradingName}“, ${LEGAL.address}, USt-IdNr. ${LEGAL.vatId}`, { size: 8, color: muted });
  gap(18);
  const r = inv.recipient;
  write(r.name, { f: bold });
  write(r.address);
  if (r.vatId) write(`USt-IdNr.: ${r.vatId}`);
  else { write(`Steuernummer: ${r.steuernummer ?? "—"}`); if (r.proofText) write(r.proofText, { size: 9 }); }
  gap(18);
  write(inv.kind === "credit_note" ? "Gutschrift / Stornorechnung" : "Rechnung", { size: 16, f: bold });
  write(`Rechnungsnummer: ${inv.number}`);
  write(`Rechnungsdatum: ${date(inv.issuedAt)}`);
  write(`Leistungszeitraum: ${date(inv.periodStart)}–${date(inv.periodEnd)}`);
  if (inv.creditFor) write(`Bezug: Stornierung der Rechnung ${inv.creditFor}`);
  gap(10);
  write("Leistung", { f: bold });
  write(inv.description);
  gap(8);
  if (inv.lines.some((l) => l.bookingNumber)) {
    write("Buchungsnummer | Datum | Auftragswert | Satz | Provision", { size: 9, f: bold });
  }
  for (const l of inv.lines) {
    write(l.bookingNumber
      ? `${l.bookingNumber} | ${l.date ?? ""} | ${eur(l.orderValueCents ?? 0)} | ${pct(l.rateBps ?? 0)} | ${eur(l.amountCents)}`
      : `${l.text}: ${eur(l.amountCents)}`, { size: 9 });
  }
  gap(10);
  write(`Nettobetrag: ${eur(inv.netCents)}`);
  write("Steuersatz: 0 %");
  write("Steuerbetrag: 0,00 €");
  write(`Gesamtbetrag: ${eur(inv.netCents)} (Währung EUR)`, { f: bold });
  gap(10);
  write(REVERSE_CHARGE_NOTE, { f: bold });
  write(inv.paymentNote);
  gap(16);
  write(`${LEGAL.tradingName}, ${LEGAL.email}`, { size: 8, color: muted });
  return Buffer.from(await pdf.save({ useObjectStreams: false }));
}
