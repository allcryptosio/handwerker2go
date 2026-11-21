import ExcelJS from "exceljs";
import { currentUser } from "@/lib/auth";
import { asSystem } from "@/lib/db";

/**
 * Export für die maltesische Zusammenfassende Meldung (Recapitulative Statement), Aufgabe 9.3.
 * ?jahr=2026&quartal=4 oder ?jahr=2026&monat=11, format=csv|xlsx. Weg-B-Fälle getrennt (Prüfung durch Steuerberater).
 */
const HEADER_NOTE = "Prüfung durch Steuerberater vor Abgabe.";

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return new Response("Nicht berechtigt", { status: 403 });
  const q = new URL(req.url).searchParams;
  const year = Number(q.get("jahr"));
  const quarter = q.get("quartal") ? Number(q.get("quartal")) : null;
  const month = q.get("monat") ? Number(q.get("monat")) : null;
  if (!year || (!quarter && !month) || (quarter && (quarter < 1 || quarter > 4)) || (month && (month < 1 || month > 12))) {
    return new Response("Bitte jahr und quartal (1–4) oder monat (1–12) angeben", { status: 400 });
  }
  const firstMonth = quarter ? (quarter - 1) * 3 + 1 : month!;
  const months = quarter ? 3 : 1;
  const from = `${year}-${String(firstMonth).padStart(2, "0")}-01`;
  const toMonth = firstMonth + months;
  const to = toMonth > 12 ? `${year + 1}-01-01` : `${year}-${String(toMonth).padStart(2, "0")}-01`;
  const label = quarter ? `${year}-Q${quarter}` : `${year}-${String(month).padStart(2, "0")}`;

  const rows = await asSystem(async (db) => (await db.query(
    `select i.kind, i.net_cents, i.recipient, p.company_name, p.id provider_id
       from invoices i join provider_profiles p on p.id = i.provider_id
      where i.status = 'issued' and i.number is not null
        and (i.issued_at at time zone 'Europe/Berlin')::date >= $1::date and (i.issued_at at time zone 'Europe/Berlin')::date < $2::date`,
    [from, to],
  )).rows as { kind: string; net_cents: number; recipient: { name: string; vatId?: string; steuernummer?: string }; company_name: string; provider_id: string }[]);

  type Agg = { key: string; country?: string; number?: string; steuernummer?: string; name: string; net: number; credits: number; count: number };
  const withVat = new Map<string, Agg>(), withoutVat = new Map<string, Agg>();
  for (const r of rows) {
    const vat = r.recipient?.vatId?.replace(/\s/g, "").toUpperCase();
    const target = vat ? withVat : withoutVat;
    const key = vat ?? r.provider_id;
    const a = target.get(key) ?? { key, name: r.recipient?.name ?? r.company_name, net: 0, credits: 0, count: 0, ...(vat ? { country: vat.slice(0, 2), number: vat.slice(2) } : { steuernummer: r.recipient?.steuernummer ?? "" }) };
    if (r.kind === "credit_note") a.credits += Math.abs(r.net_cents); else a.net += r.net_cents;
    a.count++;
    target.set(key, a);
  }
  const euro = (c: number) => (c / 100).toFixed(2);
  const format = q.get("format") === "xlsx" ? "xlsx" : "csv";

  if (format === "csv") {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const out = [
      `# ${HEADER_NOTE} Zeitraum ${label}`,
      ["Ländercode", "USt-IdNr.", "Firmenname", "Summe Nettobeträge Dienstleistungen (EUR)", "Anzahl Rechnungen", "Gutschriften (Abzug, EUR)", "Netto nach Gutschriften (EUR)"].map(esc).join(";"),
      ...[...withVat.values()].map((a) => [a.country!, a.number!, a.name, euro(a.net), a.count, euro(a.credits), euro(a.net - a.credits)].map(esc).join(";")),
      "",
      `# Ohne USt-IdNr. (Weg B): nicht für die Meldung, zur Prüfung an den Steuerberater`,
      ["Betrieb", "Steuernummer", "Summe Netto (EUR)", "Anzahl Rechnungen", "Gutschriften (EUR)"].map(esc).join(";"),
      ...[...withoutVat.values()].map((a) => [a.name, a.steuernummer ?? "", euro(a.net), a.count, euro(a.credits)].map(esc).join(";")),
    ].join("\r\n");
    return new Response("﻿" + out, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="zusammenfassende-meldung-${label}.csv"` } });
  }

  const wb = new ExcelJS.Workbook();
  const s1 = wb.addWorksheet("Zusammenfassende Meldung");
  s1.addRow([`${HEADER_NOTE} Zeitraum ${label}`]).font = { bold: true };
  s1.addRow(["Ländercode", "USt-IdNr.", "Firmenname", "Summe Nettobeträge Dienstleistungen (EUR)", "Anzahl Rechnungen", "Gutschriften (Abzug, EUR)", "Netto nach Gutschriften (EUR)"]).font = { bold: true };
  for (const a of withVat.values()) s1.addRow([a.country, a.number, a.name, a.net / 100, a.count, a.credits / 100, (a.net - a.credits) / 100]);
  const s2 = wb.addWorksheet("Ohne USt-IdNr. (Weg B)");
  s2.addRow([`${HEADER_NOTE} Diese Fälle gehören nicht in die Meldung, sondern zur Prüfung an den Steuerberater.`]).font = { bold: true };
  s2.addRow(["Betrieb", "Steuernummer", "Summe Netto (EUR)", "Anzahl Rechnungen", "Gutschriften (EUR)"]).font = { bold: true };
  for (const a of withoutVat.values()) s2.addRow([a.name, a.steuernummer, a.net / 100, a.count, a.credits / 100]);
  const buf = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buf as ArrayBuffer), {
    headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="zusammenfassende-meldung-${label}.xlsx"` },
  });
}
