import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Mein Konto", robots: { index: false } };

async function Account() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role === "provider") redirect("/dashboard");
  const bookings = await withDb({ userId: u.id, role: u.role }, async (db) =>
    (await db.query(
      `select b.id, b.number, b.service_name, b.status, b.starts_at, p.company_name from bookings b join provider_profiles p on p.id = b.provider_id
        where b.customer_id = $1 and b.status <> 'expired' order by b.starts_at desc limit 50`,
      [u.id],
    )).rows,
  );
  const when = (d: Date) => new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d);
  const label: Record<string, string> = { pending_payment: "Zahlung offen", requested: "Wartet auf Bestätigung", confirmed: "Bestätigt", declined: "Abgelehnt", cancelled: "Storniert", completed: "Erledigt" };
  return (
    <>
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Hallo {u.name}</h1>
      <dl className="grid gap-4 rounded-panel border border-line p-6 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Name</dt><dd className="mt-1 font-semibold">{u.name}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">E-Mail</dt><dd className="mt-1 font-semibold">{u.email}</dd></div>
      </dl>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Deine Buchungen</h2>
          <Link href="/" className="rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">Neuen Termin buchen</Link>
        </div>
        {bookings.length === 0 ? (
          <p className="rounded-panel bg-mint p-6 text-[15px] text-ink-soft">Noch keine Buchungen. Wähle auf der Startseite Leistung, Ort und Wunschtermin.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookings.map((b) => (
              <li key={b.id}>
                <Link href={`/buchung/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line p-4 hover:bg-soft">
                  <span>
                    <span className="block font-bold">{b.service_name}</span>
                    <span className="block text-[14px] text-ink-soft">{when(new Date(b.starts_at))} Uhr, {b.company_name}</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${b.status === "confirmed" ? "bg-mint text-brand-dark" : b.status === "requested" || b.status === "pending_payment" ? "bg-[#fff8e1] text-[#7a5b00]" : "bg-soft text-muted"}`}>{label[b.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SignOutButton />
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex max-w-[760px] flex-col gap-6 py-16">
      <Suspense fallback={<p>Lädt …</p>}>
        <Account />
      </Suspense>
    </Container>
  );
}
