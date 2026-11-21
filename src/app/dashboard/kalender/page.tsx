import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { HoursForm, LogoForm, type ServiceRow, ServicesForm, SettingsForm, TimeOffForm } from "@/components/dashboard/calendar-forms";
import { Container } from "@/components/ui/container";
import { removeTimeOff } from "@/lib/actions/calendar-actions";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Kalender & Leistungen", robots: { index: false } };

const fmt = (d: Date, withTime: boolean) =>
  new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}), timeZone: "Europe/Berlin" }).format(d);

async function Calendar() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "provider") redirect("/konto");
  const data = await withDb({ userId: u.id, role: "provider" }, async (db) => {
    const p = (await db.query("select id, buffer_minutes, min_notice_hours, booking_mode, logo_key, anfahrtskosten_cents, instant_confirm_consent_at from provider_profiles where user_id = $1", [u.id])).rows[0];
    if (!p) return null;
    const hours = (await db.query("select weekday, to_char(starts, 'HH24:MI') f, to_char(ends, 'HH24:MI') t from provider_working_hours where provider_id = $1 order by starts", [p.id])).rows;
    const off = (await db.query("select id, lower(during) s, upper(during) e, reason from provider_time_off where provider_id = $1 and upper(during) > now() order by lower(during)", [p.id])).rows;
    const services = (await db.query(
      `select t.id, t.name, t.mode, t.duration_min, c.label, ps.active offered, ps.price_cents, ps.duration_min dur
         from provider_categories pc join service_categories c on c.id = pc.category_id
         join service_templates t on t.category_id = c.id
         left join provider_services ps on ps.provider_id = pc.provider_id and ps.template_id = t.id
        where pc.provider_id = $1 order by c.sort, t.sort`,
      [p.id],
    )).rows;
    return { p, hours, off, services };
  });
  if (!data) redirect("/partner/registrieren");
  const { p, hours, off, services } = data;
  const hourMap: Record<number, { from: string; to: string }> = {};
  for (const h of hours) hourMap[h.weekday] ??= { from: h.f, to: h.t };
  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id, name: s.name, category: s.label, mode: s.mode, defaultDuration: s.duration_min,
    offered: s.offered === true, priceCents: s.price_cents, duration: s.dur,
  }));
  const offeredCount = rows.filter((r) => r.offered).length;
  const card = "flex flex-col gap-4 rounded-panel border border-line p-6";

  return (
    <>
      <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">Kalender & Leistungen</h1>
      <DashboardNav active="/dashboard/kalender" />
      {offeredCount === 0 && (
        <p className="rounded-card border-[1.5px] border-[#e0a800] bg-[#fff8e1] p-4 text-[15px]">
          Du bietest noch keine Leistung mit Preis an. Wähle unten deine Leistungen aus, sonst finden Kunden dich nicht.
        </p>
      )}
      <section className={card}>
        <h2 className="text-lg font-bold">Leistungen, Preise und Dauer</h2>
        <ServicesForm rows={rows} />
      </section>
      <section className={card}>
        <h2 className="text-lg font-bold">Arbeitszeiten</h2>
        <p className="text-[15px] text-ink-soft">In diesen Zeiten können Kunden Termine bei dir buchen. Bundesweite Feiertage sind automatisch frei.</p>
        <HoursForm hours={hourMap} />
      </section>
      <section className={card}>
        <h2 className="text-lg font-bold">Urlaub, freie Tage und Sperren</h2>
        <TimeOffForm />
        {off.length > 0 && (
          <ul className="flex flex-col gap-2">
            {off.map((o) => {
              const s = new Date(o.s), e = new Date(o.e);
              const fullDays = s.getUTCHours() === e.getUTCHours() && s.getUTCMinutes() === 0;
              const lastDay = new Date(e.getTime() - 1);
              return (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-card bg-soft px-4 py-3 text-[15px]">
                  <span>
                    {fullDays ? (fmt(s, false) === fmt(lastDay, false) ? fmt(s, false) : `${fmt(s, false)} bis ${fmt(lastDay, false)}`) : `${fmt(s, true)} bis ${fmt(e, true).split(", ").pop()}`}
                    {o.reason && <span className="text-muted">, {o.reason}</span>}
                  </span>
                  <form action={removeTimeOff}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="text-[14px] font-semibold text-[#b42318] underline">Entfernen</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className={card}>
        <h2 className="text-lg font-bold">Planung</h2>
        <SettingsForm buffer={p.buffer_minutes} notice={p.min_notice_hours} mode={p.booking_mode} anfahrtskostenCents={p.anfahrtskosten_cents} instantConsent={!!p.instant_confirm_consent_at} />
      </section>
      <section className={card}>
        <h2 className="text-lg font-bold">Logo oder Profilbild</h2>
        <LogoForm hasLogo={!!p.logo_key} providerId={p.id} />
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex max-w-[900px] flex-col gap-6 py-12">
      <Suspense fallback={<p>Lädt …</p>}>
        <Calendar />
      </Suspense>
    </Container>
  );
}
