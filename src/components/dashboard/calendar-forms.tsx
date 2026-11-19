"use client";

import { useActionState } from "react";
import { type CalState, addTimeOff, saveServices, saveSettings, saveWorkingHours, uploadLogo } from "@/lib/actions/calendar-actions";

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const TIMES = Array.from({ length: 37 }, (_, i) => `${String(5 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`); // 05:00–23:00
const sel = "min-h-11 rounded-xl border-[1.5px] border-line-strong bg-white px-3 text-[15px] outline-none focus:border-brand";
const btn = "min-h-11 rounded-full bg-brand px-5 font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60";

function Status({ s }: { s: CalState }) {
  if (s.error) return <p role="alert" className="text-[14px] font-semibold text-[#b42318]">{s.error}</p>;
  if (s.ok) return <p role="status" className="text-[14px] font-semibold text-brand">{s.ok}</p>;
  return null;
}

export function HoursForm({ hours }: { hours: Record<number, { from: string; to: string }> }) {
  const [s, action, pending] = useActionState(saveWorkingHours, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      {DAYS.map((name, i) => {
        const wd = i + 1;
        const h = hours[wd];
        return (
          <div key={wd} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[140px_auto_1fr]">
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" name={`open_${wd}`} defaultChecked={!!h} className="h-5 w-5 accent-[#12704f]" /> {name}
            </label>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <select name={`from_${wd}`} defaultValue={h?.from ?? "08:00"} aria-label={`${name} von`} className={sel}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
              <span className="text-muted">bis</span>
              <select name={`to_${wd}`} defaultValue={h?.to ?? "17:00"} aria-label={`${name} bis`} className={sel}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className={btn}>{pending ? "Speichert …" : "Arbeitszeiten speichern"}</button>
        <Status s={s} />
      </div>
    </form>
  );
}

export function TimeOffForm() {
  const [s, action, pending] = useActionState(addTimeOff, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">Von (Tag)<input type="date" name="from_date" required className={sel} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Bis (Tag, optional)<input type="date" name="to_date" className={sel} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Ab Uhrzeit (optional)
          <select name="from_time" defaultValue="" className={sel}><option value="">ganzer Tag</option>{TIMES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Bis Uhrzeit (optional)
          <select name="to_time" defaultValue="" className={sel}><option value="">ganzer Tag</option>{TIMES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Grund (nur für dich sichtbar, optional)
          <input name="reason" maxLength={80} placeholder="z. B. Urlaub, Arzttermin" className={`${sel} px-4`} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={btn}>{pending ? "Speichert …" : "Eintragen"}</button>
        <Status s={s} />
      </div>
    </form>
  );
}

export function SettingsForm({ buffer, notice, mode }: { buffer: number; notice: number; mode: "instant" | "confirm" }) {
  const [s, action, pending] = useActionState(saveSettings, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">Pufferzeit nach jedem Auftrag
          <select name="buffer_minutes" defaultValue={String(buffer)} className={sel}>
            {[0, 15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m === 0 ? "keine" : `${m} Minuten`}</option>)}
          </select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Mindestvorlauf für Buchungen
          <select name="min_notice_hours" defaultValue={String(notice)} className={sel}>
            {[2, 4, 12, 24, 48, 72].map((h) => <option key={h} value={h}>{h} Stunden</option>)}
          </select></label>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Buchungen</legend>
        <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="booking_mode" value="instant" defaultChecked={mode === "instant"} className="mt-1 h-4 w-4 accent-[#12704f]" />
          <span><b>Sofort bestätigen.</b> Freie Termine sind direkt gebucht. Kunden mögen das am meisten.</span></label>
        <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="booking_mode" value="confirm" defaultChecked={mode === "confirm"} className="mt-1 h-4 w-4 accent-[#12704f]" />
          <span><b>Ich bestätige selbst.</b> Jede Buchung ist erst eine Anfrage. Lehnst du ab, bekommt der Kunde sein Geld zurück.</span></label>
      </fieldset>
      <p className="text-[13px] text-muted">Die Anfahrtszeit rechnen wir automatisch aus der Entfernung (Stadtverkehr, rund 25 km/h) und planen sie vor jedem Termin ein.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={btn}>{pending ? "Speichert …" : "Einstellungen speichern"}</button>
        <Status s={s} />
      </div>
    </form>
  );
}

export interface ServiceRow {
  id: string;
  name: string;
  category: string;
  mode: "fixed" | "quote";
  defaultDuration: number | null;
  offered: boolean;
  priceCents: number | null;
  duration: number | null;
}

const DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480];

export function ServicesForm({ rows }: { rows: ServiceRow[] }) {
  const [s, action, pending] = useActionState(saveServices, {});
  const cats = [...new Set(rows.map((r) => r.category))];
  return (
    <form action={action} className="flex flex-col gap-6">
      {cats.map((c) => (
        <div key={c} className="flex flex-col gap-2">
          <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">{c}</div>
          {rows.filter((r) => r.category === c).map((r) => (
            <div key={r.id} className="grid items-center gap-2 rounded-card border border-line p-3 sm:grid-cols-[1fr_150px_150px]">
              <label className="flex items-center gap-2 font-semibold">
                <input type="checkbox" name={`offer_${r.id}`} defaultChecked={r.offered} className="h-5 w-5 accent-[#12704f]" />
                {r.name}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.mode === "fixed" ? "bg-mint text-brand-dark" : "bg-soft text-muted"}`}>{r.mode === "fixed" ? "Festpreis" : "Besichtigung"}</span>
              </label>
              {r.mode === "fixed" ? (
                <label className="flex items-center gap-2 text-[14px]">
                  <input name={`price_${r.id}`} inputMode="decimal" placeholder="Preis" aria-label={`Festpreis ${r.name} in Euro`}
                    defaultValue={r.priceCents ? (r.priceCents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 }) : ""} className={`${sel} w-full px-3`} />
                  <span>€</span>
                </label>
              ) : <span className="text-[13px] text-muted">Preis nach Angebot</span>}
              <select name={`duration_${r.id}`} defaultValue={String(r.duration ?? r.defaultDuration ?? 60)} aria-label={`Dauer ${r.name}`} className={sel}>
                {DURATIONS.map((m) => <option key={m} value={m}>{m < 60 ? `${m} Min.` : m % 60 ? `${Math.floor(m / 60)},5 Std.` : `${m / 60} Std.`}</option>)}
              </select>
            </div>
          ))}
        </div>
      ))}
      <p className="text-[13px] text-muted">Festpreise sind Endpreise für Kunden (inkl. Umsatzsteuer, soweit du sie berechnest). Die Dauer bestimmt, wie lange der Termin in deinem Kalender belegt ist.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={btn}>{pending ? "Speichert …" : "Leistungen speichern"}</button>
        <Status s={s} />
      </div>
    </form>
  );
}

export function LogoForm({ hasLogo, providerId }: { hasLogo: boolean; providerId: string }) {
  const [s, action, pending] = useActionState(uploadLogo, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-4">
      {hasLogo || s.v ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/logo/${providerId}?v=${s.v ?? 0}`} alt="Dein Logo" className="h-16 w-16 rounded-2xl border border-line object-cover" />
      ) : <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-[12px] text-muted">kein Logo</span>}
      <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" required
        className="text-[14px] file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-mint file:px-4 file:font-semibold file:text-brand-dark" />
      <button type="submit" disabled={pending} className={btn}>{pending ? "Lädt hoch …" : "Logo hochladen"}</button>
      <Status s={s} />
    </form>
  );
}
