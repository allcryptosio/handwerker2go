import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { formatCents, formatPercent } from "@/lib/pricing";
import { startStripeOnboarding } from "@/lib/actions/auth-actions";
import { stripeConfigured, stripeIsTestMode } from "@/lib/stripe/client";
import { isBookable, syncConnectAccount } from "@/lib/stripe/connect";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const statusText: Record<string, { label: string; text: string; tone: string }> = {
  pending: { label: "In Prüfung", text: "Wir prüfen gerade deine Angaben und deinen Nachweis. Du bekommst eine E-Mail, sobald dein Betrieb freigeschaltet ist.", tone: "bg-[#fff8e1] border-[#e0a800]" },
  approved: { label: "Freigeschaltet", text: "Dein Profil ist öffentlich sichtbar.", tone: "bg-mint border-brand" },
  rejected: { label: "Nicht freigeschaltet", text: "Wir konnten deinen Betrieb nicht freischalten.", tone: "bg-[#fef3f2] border-[#b42318]" },
  suspended: { label: "Gesperrt", text: "Dein Profil ist vorübergehend nicht sichtbar.", tone: "bg-[#fef3f2] border-[#b42318]" },
};

async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "provider") redirect(u.role === "admin" ? "/admin" : "/konto");
  const data = await withDb({ userId: u.id, role: "provider" }, async (db) => {
    const p = (await db.query("select * from provider_profiles where user_id = $1", [u.id])).rows[0];
    if (!p) return null;
    const cats = (await db.query("select c.label from provider_categories pc join service_categories c on c.id = pc.category_id where pc.provider_id = $1 order by c.sort", [p.id])).rows.map((r) => r.label as string);
    const area = (await db.query("select label, radius_km from service_areas where provider_id = $1 limit 1", [p.id])).rows[0];
    const pricing = (await db.query("select * from pricing_settings where valid_from <= now() order by valid_from desc limit 1")).rows[0];
    return { p, cats, area, pricing };
  });
  if (!data) redirect("/fuer-handwerker/registrieren");
  const { p, cats, area, pricing } = data;
  if (p.stripe_account_id && !(p.stripe_charges_enabled && p.stripe_payouts_enabled) && stripeConfigured()) {
    const f = await syncConnectAccount(p.stripe_account_id).catch(() => null);
    if (f) Object.assign(p, { stripe_charges_enabled: f.charges, stripe_payouts_enabled: f.payouts, stripe_details_submitted: f.details });
  }
  const s = statusText[p.status];
  const introEnd = p.approved_at ? new Date(new Date(p.approved_at).setMonth(new Date(p.approved_at).getMonth() + pricing.intro_months)) : null;
  const fmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">{p.company_name}</h1>
        <SignOutButton />
      </div>
      <section className={`rounded-panel border-[1.5px] p-6 ${s.tone}`}>
        <h2 className="text-lg font-bold">Status: {s.label}</h2>
        <p className="mt-2 text-[15px]">{s.text}{p.status_reason ? ` Grund: ${p.status_reason}` : ""}</p>
      </section>
      {p.status === "approved" && introEnd && (
        <section className="grid gap-4 rounded-panel border border-line p-6 sm:grid-cols-3">
          <div><div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Einführungsphase bis</div><div className="mt-1 text-lg font-extrabold">{fmt.format(introEnd)}</div></div>
          <div><div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Grundgebühr</div><div className="mt-1 text-lg font-extrabold">{formatCents(pricing.intro_fee_cents)}</div></div>
          <div><div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Provision</div><div className="mt-1 text-lg font-extrabold">{formatPercent(pricing.intro_commission_bps)}</div></div>
        </section>
      )}
      {p.status === "approved" && (
        <section className="flex flex-col gap-3 rounded-panel border border-line p-6">
          <h2 className="text-lg font-bold">Auszahlungen über Stripe</h2>
          {!stripeConfigured() ? (
            <p className="text-[15px] text-ink-soft">Die Online-Zahlung wird gerade eingerichtet. Wir melden uns, sobald du dein Auszahlungskonto verbinden kannst.</p>
          ) : isBookable(p) ? (
            <p className="text-[15px] text-ink-soft">Dein Stripe-Konto ist verbunden und geprüft. Kunden können dich buchen und online bezahlen.</p>
          ) : (
            <>
              <p className="text-[15px] text-ink-soft">
                Damit Kunden dich buchen können, verbinde ein Stripe-Konto. Stripe prüft dabei deine Identität, dein Unternehmen und
                deine Bankverbindung. Das dauert etwa zehn Minuten.
                {p.stripe_details_submitted ? " Deine Angaben liegen Stripe vor und werden noch geprüft." : ""}
              </p>
              <form action={startStripeOnboarding}>
                <button type="submit" className="rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">
                  {p.stripe_account_id ? "Stripe-Einrichtung fortsetzen" : "Stripe-Konto verbinden"}
                </button>
              </form>
            </>
          )}
          {stripeConfigured() && stripeIsTestMode() && <p className="text-[13px] text-muted">Testmodus: Es fließt kein echtes Geld.</p>}
        </section>
      )}
      <section className="rounded-panel border border-line p-6">
        <h2 className="text-lg font-bold">Deine Angaben</h2>
        <dl className="mt-4 grid gap-4 text-[15px] sm:grid-cols-2">
          <div><dt className="text-muted">Ansprechperson</dt><dd className="font-semibold">{p.contact_name}</dd></div>
          <div><dt className="text-muted">Telefon</dt><dd className="font-semibold">{p.phone}</dd></div>
          <div><dt className="text-muted">Anschrift</dt><dd className="font-semibold">{p.street}, {p.postal_code} {p.city}</dd></div>
          <div><dt className="text-muted">Einsatzgebiet</dt><dd className="font-semibold">{area ? `${area.label}, ${Number(area.radius_km)} km` : "–"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-muted">Leistungen</dt><dd className="font-semibold">{cats.join(", ")}</dd></div>
        </dl>
      </section>
      <p className="text-[15px] text-muted">Leistungen mit Preisen, Kalender und Buchungen folgen in den nächsten Ausbaustufen.</p>
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex max-w-[900px] flex-col gap-6 py-16">
      <Suspense fallback={<p>Lädt …</p>}>
        <Dashboard />
      </Suspense>
    </Container>
  );
}
