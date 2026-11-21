import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { decideReport } from "@/lib/actions/report-actions";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { REPORT_REASONS, type ReportReason } from "@/lib/legal/report-reasons";

export const metadata: Metadata = { title: "Admin: Meldungen", robots: { index: false } };
const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" }).format(d);
const label: Record<string, string> = { received: "Offen", removed: "Entfernt", restricted: "Eingeschränkt", rejected: "Zurückgewiesen" };

async function List() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const rows = await withDb({ userId: u.id, role: "admin" }, async (db) => (await db.query(
    `select c.*, r.body review_body, r.visible review_visible, p.company_name
       from content_reports c left join reviews r on c.content_type = 'review' and r.id = c.content_id
       left join provider_profiles p on c.content_type = 'provider_profile' and p.id = c.content_id
      order by (c.status = 'received') desc, c.created_at desc limit 300`,
  )).rows);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Meldungen (DSA)</h1>
        <Link href="/admin" className="font-semibold text-brand underline">Zurück zu Admin</Link>
      </div>
      <p className="max-w-[760px] text-[15px] text-ink-soft">Jede Meldung zeitnah und sorgfältig prüfen. Bei Entfernen oder Einschränken erhält der Betroffene automatisch eine Begründung (Grund, Tatsachen, Widerspruchsmöglichkeit), der Meldende das Ergebnis.</p>
      {rows.length === 0 ? <p className="rounded-panel border border-line bg-soft p-6">Keine Meldungen.</p> : (
        <ul className="flex flex-col gap-3">
          {rows.map((c) => (
            <li key={c.id} className={`flex flex-col gap-3 rounded-panel border p-5 ${c.status === "received" ? "border-[#e0a800] bg-[#fffbeb]" : "border-line"}`}>
              <dl className="grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-[160px_1fr]">
                <dt className="text-muted">Eingang</dt><dd className="font-semibold">{when(new Date(c.created_at))} Uhr, Status {label[c.status]}</dd>
                <dt className="text-muted">Inhalt</dt><dd>{c.content_type === "review" ? `Bewertung: „${(c.review_body ?? "ohne Text").slice(0, 200)}“${c.review_visible === false ? " (ausgeblendet)" : ""}` : `Profil: ${c.company_name ?? c.content_id}`} {c.content_url && <a className="underline" href={c.content_url}>öffnen</a>}</dd>
                <dt className="text-muted">Grund</dt><dd>{REPORT_REASONS[c.reason as ReportReason]}</dd>
                <dt className="text-muted">Begründung</dt><dd className="whitespace-pre-line">{c.explanation}</dd>
                <dt className="text-muted">Meldender</dt><dd>{c.reporter_name ?? "ohne Name"}{c.reporter_email ? `, ${c.reporter_email}` : ", ohne E-Mail"}</dd>
                {c.decision_reason && <><dt className="text-muted">Entscheidung</dt><dd>{c.decision_reason} ({c.decision_facts})</dd></>}
              </dl>
              {c.status === "received" && (
                <form action={decideReport} className="grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={c.id} />
                  <select name="decision" className="min-h-10 rounded-xl border border-line-strong px-2 text-[14px]">
                    <option value="rejected">Zurückweisen (Inhalt bleibt)</option>
                    <option value="removed">Entfernen</option>
                    <option value="restricted">Einschränken</option>
                  </select>
                  <input name="measure" placeholder="Bei Einschränkung: welche Maßnahme" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px]" />
                  <input name="reason" required placeholder="Grund (z. B. Verstoß gegen § 7 AGB: Beleidigung)" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px] sm:col-span-2" />
                  <input name="facts" required placeholder="Tatsachen (kurze Begründung)" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px] sm:col-span-2" />
                  <button className="self-start rounded-full bg-brand px-4 py-2 text-[14px] font-bold text-white">Entscheidung speichern und mitteilen</button>
                </form>
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
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}><List /></Suspense>
    </Container>
  );
}
