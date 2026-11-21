import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { adminAssignWithdrawal, adminRefundWithdrawal, adminRejectWithdrawal } from "@/lib/actions/withdrawal-admin-actions";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Admin: Widerrufe", robots: { index: false } };

const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const statusLabel: Record<string, string> = { received: "Offen", refunded: "Erstattet", partially_refunded: "Teilweise erstattet", rejected_late: "Abgelehnt (Frist)", rejected_excluded: "Abgelehnt (erloschen/ausgeschlossen)", unmatched: "Nicht zugeordnet" };
const caseLabel: Record<string, string> = { auto: "automatisch", wertersatz: "Wertersatz (Betrieb entscheidet, Tag 14 automatisch voll)", pruefung: "Prüfung durch Admin", unmatched: "Zuordnung fehlt" };

/** Textbaustein B.2 (nur manuell versenden) */
const b2 = (name: string, number: string) =>
  `Guten Tag ${name}, vielen Dank für Ihre Nachricht vom [Datum]. Nach unserer Prüfung besteht für Ihren Vertrag ${number} kein Widerrufsrecht mehr, weil [Grund: die Widerrufsfrist am … abgelaufen ist | der Betrieb die Leistung am … vollständig erbracht hat, nachdem Sie dem vorzeitigen Beginn am … ausdrücklich zugestimmt und den Verlust des Widerrufsrechts bestätigt hatten]. Wenn Sie das anders sehen, antworten Sie bitte auf diese E-Mail; wir prüfen es erneut.`;

async function List() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const rows = await withDb({ userId: u.id, role: "admin" }, async (db) =>
    (await db.query(
      `select w.*, b.number, b.service_name, b.starts_at, b.price_cents, b.price_type, b.early_start_consent_at, p.company_name
         from withdrawals w left join bookings b on b.id = w.booking_id left join provider_profiles p on p.id = b.provider_id
        order by (w.status in ('received', 'unmatched')) desc, w.received_at desc limit 300`,
    )).rows,
  );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Widerrufe</h1>
        <Link href="/admin" className="font-semibold text-brand underline">Zurück zu Admin</Link>
      </div>
      <p className="max-w-[760px] text-[15px] text-ink-soft">Spätestens 14 Tage nach Eingang muss erstattet sein. Keine automatische Ablehnung: Ablehnungen nur nach Prüfung, Antwort mit Textbaustein B.2 per E-Mail.</p>
      {rows.length === 0 ? <p className="rounded-panel border border-line bg-soft p-6">Noch keine Widerrufe.</p> : (
        <ul className="flex flex-col gap-3">
          {rows.map((w) => (
            <li key={w.id} className={`flex flex-col gap-3 rounded-panel border p-5 ${w.status === "received" || w.status === "unmatched" ? "border-[#e0a800] bg-[#fffbeb]" : "border-line"}`}>
              <dl className="grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-[180px_1fr]">
                <dt className="text-muted">Eingang</dt><dd className="font-semibold">{when(new Date(w.received_at))} Uhr ({w.source === "cancel_flow" ? "Stornierung in der Frist" : "Online-Formular"})</dd>
                <dt className="text-muted">Status</dt><dd className="font-semibold">{statusLabel[w.status]}{w.case_kind ? `, ${caseLabel[w.case_kind]}` : ""}</dd>
                <dt className="text-muted">Name, E-Mail</dt><dd>{w.name}, {w.confirmation_email}{w.verified ? " (Zuordnung geprüft)" : " (Zuordnung nicht geprüft)"}</dd>
                <dt className="text-muted">Vertrag</dt><dd>{w.contract_reference_text}</dd>
                {w.number && <><dt className="text-muted">Buchung</dt><dd>{w.number}, {w.company_name}, {w.price_type === "fixed" ? eur(w.price_cents) : "ohne Zahlung"}, Erklärung vorzeitiger Beginn: {w.early_start_consent_at ? "ja" : "nein"}</dd></>}
                <dt className="text-muted">Eingangsbestätigung</dt><dd>{w.confirmation_sent_at ? `${when(new Date(w.confirmation_sent_at))} Uhr` : "noch nicht"}</dd>
                {w.refund_id && <><dt className="text-muted">Erstattung</dt><dd>{w.refund_id}{w.wertersatz_amount_cents ? `, Wertersatz ${eur(w.wertersatz_amount_cents)}` : ""}</dd></>}
                {w.notes && <><dt className="text-muted">Notizen</dt><dd className="whitespace-pre-line">{w.notes}</dd></>}
              </dl>
              {w.status === "unmatched" && (
                <form action={adminAssignWithdrawal} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={w.id} />
                  <input name="number" placeholder="Buchungsnummer, z. B. H2G-…" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px]" />
                  <button className="rounded-full border-[1.5px] border-brand px-4 py-2 text-[14px] font-bold text-brand">Zuordnen und bearbeiten</button>
                </form>
              )}
              {w.status === "received" && w.booking_id && (
                <div className="flex flex-wrap gap-3">
                  <form action={adminRefundWithdrawal} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={w.id} />
                    <label className="text-[14px]">Wertersatz in €{" "}
                      <input name="wertersatz" defaultValue="0" inputMode="decimal" className="ml-1 min-h-10 w-24 rounded-xl border border-line-strong px-3" disabled={!w.early_start_consent_at} />
                    </label>
                    <button className="rounded-full bg-brand px-4 py-2 text-[14px] font-bold text-white">Erstatten</button>
                  </form>
                  <form action={adminRejectWithdrawal} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={w.id} />
                    <select name="kind" className="min-h-10 rounded-xl border border-line-strong px-2 text-[14px]">
                      <option value="late">Frist abgelaufen</option>
                      <option value="excluded">Recht erloschen/ausgeschlossen</option>
                    </select>
                    <input name="note" placeholder="Begründung (intern)" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px]" />
                    <button className="rounded-full border-[1.5px] border-[#b42318] px-4 py-2 text-[14px] font-bold text-[#b42318]">Als abgelehnt markieren</button>
                  </form>
                  <a className="self-center text-[14px] font-semibold text-brand underline"
                    href={`mailto:${w.confirmation_email}?subject=${encodeURIComponent(`Ihr Widerruf zu ${w.number}`)}&body=${encodeURIComponent(b2(w.name, w.number))}`}>
                    Antwort B.2 als E-Mail öffnen
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}>
        <List />
      </Suspense>
    </Container>
  );
}
