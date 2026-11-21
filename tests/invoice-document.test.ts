import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { COMMISSION_PAYMENT_NOTE, REVERSE_CHARGE_NOTE, commissionDescription, formatInvoiceNumber, invoiceTextLines, renderInvoicePdf, type InvoiceDoc } from "../src/lib/invoices/document";

const base: Omit<InvoiceDoc, "recipient"> = {
  number: formatInvoiceNumber(2026, 1), kind: "commission", issuedAt: new Date("2026-12-01T09:00:00Z"),
  periodStart: new Date("2026-11-01T00:00:00+01:00"), periodEnd: new Date("2026-11-30T23:59:59+01:00"),
  description: commissionDescription(new Date("2026-11-01T00:00:00+01:00"), new Date("2026-11-30T23:59:59+01:00")),
  lines: [{ text: "x", bookingNumber: "H2G-ABCDEF12", date: "03.11.2026", orderValueCents: 9900, rateBps: 1000, amountCents: 990 }],
  netCents: 990, paymentNote: COMMISSION_PAYMENT_NOTE,
};

test("Nummernformat H2G-JJJJ-00001", () => {
  assert.equal(formatInvoiceNumber(2026, 1), "H2G-2026-00001");
  assert.equal(formatInvoiceNumber(2027, 12345), "H2G-2027-12345");
});

test("Weg A: beide USt-IdNr. und Reverse-Charge-Satz wörtlich", () => {
  const t = invoiceTextLines({ ...base, recipient: { name: "Elektro Nord GmbH", address: "Weg 1, 20095 Hamburg, Deutschland", vatId: "DE123456789" } }).join("\n");
  assert.match(t, /USt-IdNr\.: MT33258727/);
  assert.match(t, /USt-IdNr\.: DE123456789/);
  assert.ok(t.includes("Reverse Charge – Steuerschuldnerschaft des Leistungsempfängers (Art. 196 MwStSystRL, § 13b UStG)"));
  assert.ok(t.includes(REVERSE_CHARGE_NOTE));
  assert.match(t, /Steuersatz: 0 %/);
  assert.match(t, /Steuerbetrag: 0,00 €/);
  assert.match(t, /Bereits beglichen durch Einbehalt bei den Kundenzahlungen über Stripe/);
  assert.match(t, /H2G-ABCDEF12 \| 03\.11\.2026 \| Auftragswert 99,00 € \| Satz 10 % \| Provision 9,90 €/);
});

test("Weg B: Steuernummer und Nachweis statt USt-IdNr.", () => {
  const t = invoiceTextLines({ ...base, recipient: { name: "Maler Klein", address: "Gasse 2, 22301 Hamburg, Deutschland", steuernummer: "12/345/67890", proofText: "Unternehmereigenschaft nachgewiesen (Gewerbeanmeldung vorgelegt am 01.11.2026, Erklärung vom 01.11.2026)" } }).join("\n");
  assert.match(t, /USt-IdNr\.: MT33258727/);
  assert.match(t, /Steuernummer: 12\/345\/67890/);
  assert.match(t, /Unternehmereigenschaft nachgewiesen/);
  assert.ok(t.includes(REVERSE_CHARGE_NOTE));
});

test("PDF wird erzeugt und ist lesbar", async () => {
  const pdf = await renderInvoicePdf({ ...base, recipient: { name: "Elektro Nord GmbH", address: "Weg 1, 20095 Hamburg", vatId: "DE123456789" } });
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  const doc = await PDFDocument.load(pdf);
  assert.ok(doc.getPageCount() >= 1);
  assert.equal(doc.getTitle(), "Rechnung H2G-2026-00001");
});
