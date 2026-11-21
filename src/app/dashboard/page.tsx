import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { formatCents, formatPercent, providerPricing, yearlyPerMonthCents, yearlySavingsPercent } from "@/lib/pricing";
import { openBillingPortal, startMembership, startStripeOnboarding } from "@/lib/actions/auth-actions";
import { stripeConfigured, stripeIsTestMode } from "@/lib/stripe/client";
import { isBookable, syncConnectAccount } from "@/lib/stripe/connect";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

const membershipText: Record<string, string> = {
  trialing: "abgeschlossen, die Abrechnung beginnt nach der Einführungsphase",
  active: "aktiv",
  past_due: "Zahlung offen, Stripe versucht den Einzug erneut",
  unpaid: "unbezahlt, dein Profil ist nicht in der Suche",
  canceled: "beendet",
  incomplete: "Zahlung noch nicht abgeschlossen",
  paused: "pausiert",
};

const statusText: Record<string, { label: string; text: string; tone: string }> = {
  pending: { label: "In Prüfung", text: "Wir prüfen gerade deine Angaben und deinen Nachweis. Du bekommst eine E-Mail, sobald dein Betrieb freigeschaltet ist.", tone: "bg-[#fff8e1] border-[#e0a800]" },
  approved: { label: "Freigeschaltet", text: "Dein Profil ist öffentlich sichtbar.", tone: "bg-mint border-brand" },
  rejected: { label: "Nicht freigeschaltet", text: "Wir konnten deinen Betrieb nicht freischalten.", tone: "bg-[#fef3f2] border-[#b42318]" },
  suspended: { label: "Gesperrt", text: "Dein Profil ist vorübergehend nicht sichtbar.", tone: "bg-[#fef3f2] border-[#b42318]" },
};

/** „Startklar“-Liste: zeigt dem Betrieb jeden Schritt bis zur Buchbarkeit */
function SetupChecklist({ steps }: { steps: { t: string; done: boolean; hint?: string; href?: string }[] }) {
  const done = steps.filter((x) => x.done).length;
  if (done === steps.length) {
    return (
      <section className="flex items-center gap-3 rounded-panel border-[1.5px] border-brand bg-mint p-5">
        <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-bold text-white">✓</span>
        <p className="font-semibold text-brand-dark">Alles eingerichtet. Kunden können dich jetzt buchen.</p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-line p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-bold">Startklar in {steps.length} Schritten</h2>
        <span className="text-[14px] font-semibold text-muted">{done} von {steps.length} erledigt</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done}>
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="flex flex-col gap-2">
        {steps.map((x, i) => (
          <li key={x.t} className={`flex items-start gap-3 rounded-card px-3 py-2.5 ${x.done ? "" : "bg-soft"}`}>
            <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${x.done ? "bg-brand text-white" : "border-[1.5px] border-line-strong text-muted"}`}>
              {x.done ? "✓" : i + 1}
            </span>
            <span className="flex-1">
              <span className={`block font-semibold ${x.done ? "text-muted line-through decoration-1" : ""}`}>{x.t}</span>
              {!x.done && x.hint && <span className="block text-[14px] text-ink-soft">{x.hint}</span>}
            </span>
            {!x.done && x.href && <Link href={x.href} className="shrink-0 text-[14px] font-bold text-brand underline">Erledigen</Link>}
          </li>
        ))}
      </ol>
    </section>
  );
}

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
    const setup = (await db.query(
      `select (select count(*) from provider_services s where s.provider_id = $1 and s.active)::int services,
              (select count(*) from provider_services s where s.provider_id = $1 and s.active and s.price_type = 'fixed')::int fixed_services,
              (select count(*) from provider_working_hours h where h.provider_id = $1)::int hours,
              (select "emailVerified" from "user" where id = $2) email_verified`,
      [p.id, u.id],
    )).rows[0] as { services: number; fixed_services: number; hours: number; email_verified: boolean };
    return { p, cats, area, pricing, setup };
  });
  if (!data) redirect("/partner/registrieren");
  const { p, cats, area, pricing, setup } = data;
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
      <DashboardNav active="/dashboard" />
      <SetupChecklist
        steps={[
          { t: "Betrieb registriert", done: true },
          { t: "E-Mail-Adresse bestätigt", done: setup.email_verified, hint: "Klick auf den Link in unserer E-Mail." },
          { t: "Prüfung durch handwerker2go", done: p.status === "approved", hint: p.status === "pending" ? "Wir prüfen deine Nachweise und melden uns per E-Mail." : statusText[p.status]?.text },
          {
            t: "Auszahlungen bei Stripe eingerichtet",
            done: p.stripe_charges_enabled && p.stripe_payouts_enabled,
            hint: setup.fixed_services === 0 ? "Nötig, sobald du Leistungen mit Festpreis anbietest." : "Ohne Stripe-Konto können Kunden deine Festpreis-Leistungen nicht buchen.",
            href: p.status === "approved" ? "#stripe" : undefined,
          },
          { t: "Leistungen mit Preisen eingetragen", done: setup.services > 0, href: "/dashboard/kalender", hint: "Welche Leistungen, zu welchem Preis, wie lange." },
          { t: "Arbeitszeiten festgelegt", done: setup.hours > 0, href: "/dashboard/kalender", hint: "Nur in diesen Zeiten können Kunden buchen." },
        ]}
      />
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
        <section id="stripe" className="flex scroll-mt-6 flex-col gap-3 rounded-panel border border-line p-6">
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
      {p.status === "approved" && stripeConfigured() && (
        <section className="flex flex-col gap-4 rounded-panel border border-line p-6">
          <h2 className="text-lg font-bold">Mitgliedschaft</h2>
          {["trialing", "active", "past_due", "unpaid", "paused"].includes(p.membership_status) ? (
            <>
              <p className="text-[15px] text-ink-soft">
                {p.membership_plan === "yearly" ? "Jährlich" : "Monatlich"}: {membershipText[p.membership_status]}.
                {p.membership_period_end && (p.membership_cancel_at_period_end
                  ? ` Gekündigt zum ${fmt.format(new Date(p.membership_period_end))}.`
                  : ` Nächste Abrechnung am ${fmt.format(new Date(p.membership_period_end))}.`)}
              </p>
              <form action={openBillingPortal}>
                <button type="submit" className="rounded-full border-[1.5px] border-brand px-5 py-3 font-bold text-brand hover:bg-mint">
                  Mitgliedschaft und Rechnungen verwalten
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-[15px] text-ink-soft">
                {introEnd && introEnd > new Date()
                  ? `Bis zum ${fmt.format(introEnd)} zahlst du keine Grundgebühr. Wenn du jetzt einen Tarif wählst, beginnt die Abrechnung erst danach. Ohne Mitgliedschaft erscheint dein Profil nach der Einführungsphase nicht mehr in der Suche.`
                  : "Deine Einführungsphase ist beendet. Mit einer Mitgliedschaft erscheint dein Profil wieder in der Suche."}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <form action={startMembership} className="flex flex-col gap-2 rounded-card border border-line p-5">
                  <input type="hidden" name="plan" value="monthly" />
                  <span className="font-bold">Monatlich</span>
                  <span className="text-2xl font-extrabold">{formatCents(providerPricing.monthly.feeCents)}<span className="text-sm font-semibold text-muted"> / Monat netto</span></span>
                  <span className="text-[14px] text-ink-soft">{formatPercent(providerPricing.monthly.commissionBps)} Provision, monatlich kündbar</span>
                  <button type="submit" className="mt-2 rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">Monatlich wählen</button>
                </form>
                <form action={startMembership} className="flex flex-col gap-2 rounded-card border-[1.5px] border-brand p-5">
                  <input type="hidden" name="plan" value="yearly" />
                  <span className="font-bold">Jährlich <span className="ml-1 rounded-full bg-mint px-2 py-0.5 text-xs text-brand-dark">{yearlySavingsPercent()} % günstiger</span></span>
                  <span className="text-2xl font-extrabold">{formatCents(yearlyPerMonthCents())}<span className="text-sm font-semibold text-muted"> / Monat netto</span></span>
                  <span className="text-[14px] text-ink-soft">{formatCents(providerPricing.yearly.feeCents)} jährlich im Voraus, {formatPercent(providerPricing.yearly.commissionBps)} Provision</span>
                  <button type="submit" className="mt-2 rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">Jährlich wählen</button>
                </form>
              </div>
              <p className="text-[13px] text-muted">
                Alle Preise netto. Die USt-IdNr. ist freiwillig: Gibst du sie auf der Bezahlseite an, rechnen wir ohne Umsatzsteuer ab (Steuerschuldnerschaft des Leistungsempfängers).
              </p>
            </>
          )}
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
      <p className="text-[15px] text-muted">Preise, Arbeitszeiten und freie Tage pflegst du unter „Kalender & Leistungen“, Buchungen findest du unter „Termine“.</p>
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
