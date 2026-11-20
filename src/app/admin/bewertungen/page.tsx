import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { moderateReview } from "@/lib/actions/review-actions";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { findContactData } from "@/lib/partner/guard";

export const metadata: Metadata = { title: "Admin: Bewertungen", robots: { index: false } };

const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);

async function Reviews() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const rows = await withDb({ userId: u.id, role: "admin" }, async (db) =>
    (await db.query(
      `select r.id, r.rating, r.body, r.visible, r.hidden_reason, r.created_at, b.number, b.service_name, b.contact_name, p.company_name
         from reviews r join bookings b on b.id = r.booking_id join provider_profiles p on p.id = r.provider_id
        order by r.created_at desc limit 300`,
    )).rows,
  );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Bewertungen</h1>
        <Link href="/admin" className="font-semibold text-brand underline">Zurück zu Admin</Link>
      </div>
      <p className="max-w-[760px] text-[15px] text-ink-soft">
        Ausblenden nur bei unzulässigen Inhalten (Beleidigung, Rechtsverstoß, kein Bezug zur Leistung). Kritische, aber sachliche Bewertungen bleiben stehen (AGB für Kunden § 7 Abs. 2).
      </p>
      {rows.length === 0 ? (
        <p className="rounded-panel border border-line bg-soft p-6">Noch keine Bewertungen.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const flag = r.body ? findContactData(r.body) : null;
            return (
              <li key={r.id} className={`flex flex-col gap-2 rounded-panel border p-5 ${r.visible ? "border-line" : "border-[#b42318] bg-[#fef3f2]"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
                  <span className="text-[18px] leading-none text-star">{"★".repeat(r.rating)}<span className="text-line-strong">{"★".repeat(5 - r.rating)}</span></span>
                  <span className="text-muted">{when(new Date(r.created_at))} | {r.company_name} | {r.service_name} | Buchung {r.number} | Kunde {r.contact_name}</span>
                </div>
                {r.body ? <p className="whitespace-pre-line text-[15px]">{r.body}</p> : <p className="text-[14px] text-muted">Ohne Text</p>}
                {flag && <p className="text-[13px] font-semibold text-[#b42318]">Hinweis: {flag} im Text</p>}
                {!r.visible && <p className="text-[13px] font-semibold">Ausgeblendet{r.hidden_reason ? `: ${r.hidden_reason}` : ""}</p>}
                <form action={moderateReview} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  {r.visible ? (
                    <>
                      <input name="reason" placeholder="Grund (intern)" className="min-h-10 rounded-xl border border-line-strong px-3 text-[14px]" />
                      <button type="submit" className="rounded-full border-[1.5px] border-[#b42318] px-4 py-2 text-[14px] font-bold text-[#b42318]">Ausblenden</button>
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="show" value="1" />
                      <button type="submit" className="rounded-full border-[1.5px] border-brand px-4 py-2 text-[14px] font-bold text-brand">Wieder einblenden</button>
                    </>
                  )}
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <Suspense fallback={<div className="h-[400px] animate-pulse rounded-panel bg-soft" />}>
        <Reviews />
      </Suspense>
    </Container>
  );
}
