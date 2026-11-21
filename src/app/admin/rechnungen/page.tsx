import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { creditInvoice, releaseInvoice } from "@/lib/actions/invoice-admin-actions";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Admin: Rechnungen", robots: { index: false } };
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const d = (x: Date) => new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" }).format(x);

async function List({ searchParams }: PageProps<"/admin/rechnungen">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const rows = await withDb({ userId: u.id, role: "admin" }, async (db) => (await db.query(
    `select i.id, i.number, i.kind, i.status, i.issued_at, i.net_cents, i.hold_reason, i.pdf_sha256, i.sent_at, i.recipient->>'name' rname
       from invoices i order by (i.status = 'on_hold') desc, i.issued_at desc limit 300`,
  )).rows);
  const y = new Date().getFullYear();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Rechnungen</h1>
        <Link href="/admin" className="font-semibold text-brand underline">Zurück zu Admin</Link>
      </div>
      {sp.fehler && <p role="alert" className="rounded-card border-[1.5px] border-[#b42318] bg-[#fef3f2] p-4">Nicht freigegeben: {sp.fehler}</p>}
      <section className="flex flex-col gap-2 rounded-panel border border-line p-5 text-[15px]">
        <h2 className="text-lg font-bold">Export Zusammenfassende Meldung (Malta)</h2>
        <p className="text-ink-soft">Prüfung durch Steuerberater vor Abgabe. Fälle ohne USt-IdNr. (Weg B) stehen auf einem eigenen Blatt.</p>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((q) => (
            <span key={q} className="flex gap-2">Q{q} {y}:
              <a className="underline" href={`/api/admin/zm-export?jahr=${y}&quartal=${q}&format=xlsx`}>XLSX</a>
              <a className="underline" href={`/api/admin/zm-export?jahr=${y}&quartal=${q}&format=csv`}>CSV</a>
            </span>
          ))}
        </div>
        <p className="text-[13px] text-muted">Monatlich: /api/admin/zm-export?jahr={y}&amp;monat=11&amp;format=xlsx</p>
      </section>
      {rows.length === 0 ? <p className="rounded-panel border border-line bg-soft p-6">Noch keine Rechnungen.</p> : (
        <div className="overflow-x-auto rounded-panel border border-line">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead className="bg-soft text-[12px] uppercase tracking-[0.04em] text-muted">
              <tr><th className="p-3">Nummer</th><th className="p-3">Art</th><th className="p-3">Datum</th><th className="p-3">Empfänger</th><th className="p-3 text-right">Netto</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="p-3 font-mono text-[12px]">{r.number ?? "noch keine"}</td>
                  <td className="p-3">{r.kind === "commission" ? "Provision" : r.kind === "membership" ? "Mitgliedschaft" : "Gutschrift"}</td>
                  <td className="p-3">{d(new Date(r.issued_at))}</td>
                  <td className="p-3">{r.rname}</td>
                  <td className="p-3 text-right tabular-nums">{eur(r.net_cents)}</td>
                  <td className="p-3">{r.status === "on_hold" ? `Angehalten: ${r.hold_reason}` : r.status === "cancelled" ? "Storniert/ersetzt" : r.sent_at ? "Ausgestellt, versendet" : "Ausgestellt"}</td>
                  <td className="p-3">
                    {r.status === "on_hold" ? (
                      <form action={releaseInvoice}><input type="hidden" name="id" value={r.id} /><button className="font-semibold text-brand underline">Prüfen und freigeben</button></form>
                    ) : (
                      <span className="flex gap-3">
                        {r.pdf_sha256 && <a className="underline" href={`/api/rechnung/${r.id}`}>PDF</a>}
                        {r.status === "issued" && r.kind !== "credit_note" && (
                          <form action={creditInvoice}><input type="hidden" name="id" value={r.id} /><button className="text-[#b42318] underline">Stornieren (Gutschrift)</button></form>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function Page(props: PageProps<"/admin/rechnungen">) {
  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}><List {...props} /></Suspense>
    </Container>
  );
}
