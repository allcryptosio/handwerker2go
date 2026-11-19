"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { audit, withDb } from "@/lib/db";
import { addDays, berlinToDate, isValidDate } from "@/lib/booking/time";
import { detectImageType, storage } from "@/lib/storage";

export interface CalState {
  ok?: string;
  error?: string;
  /** Zeitstempel nach dem Speichern, z. B. um ein neues Logo nachzuladen */
  v?: number;
}

/** Eigener Betrieb des angemeldeten Nutzers; alle Schreibzugriffe laufen mit seiner Rolle (RLS: owns_provider) */
async function me() {
  const u = await currentUser();
  if (!u || u.role !== "provider") throw new Error("Nicht berechtigt");
  const pid = await withDb({ userId: u.id, role: "provider" }, async (db) =>
    (await db.query("select id from provider_profiles where user_id = $1", [u.id])).rows[0]?.id as string | undefined,
  );
  if (!pid) throw new Error("Kein Betrieb");
  return { u, pid };
}
const asProvider = <T>(userId: string, fn: Parameters<typeof withDb<T>>[1]) => withDb<T>({ userId, role: "provider" }, fn);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

// ---------------------------------------------------------------- Arbeitszeiten
export async function saveWorkingHours(_: CalState, form: FormData): Promise<CalState> {
  const { u, pid } = await me();
  const rows: { wd: number; from: string; to: string }[] = [];
  for (let wd = 1; wd <= 7; wd++) {
    if (form.get(`open_${wd}`) !== "on") continue;
    const from = time.safeParse(form.get(`from_${wd}`));
    const to = time.safeParse(form.get(`to_${wd}`));
    if (!from.success || !to.success || to.data <= from.data) return { error: "Bitte prüfe die Uhrzeiten: Das Ende muss nach dem Beginn liegen." };
    rows.push({ wd, from: from.data, to: to.data });
  }
  await asProvider(u.id, async (db) => {
    await db.query("delete from provider_working_hours where provider_id = $1", [pid]);
    for (const r of rows) await db.query("insert into provider_working_hours (provider_id, weekday, starts, ends) values ($1, $2, $3, $4)", [pid, r.wd, r.from, r.to]);
    await audit(db, { actorId: u.id, actorRole: "provider", action: "calendar.hours", entity: "provider_profiles", entityId: pid, after: rows });
  });
  revalidatePath("/dashboard/kalender");
  return { ok: "Arbeitszeiten gespeichert." };
}

// ---------------------------------------------------------------- Urlaub, freie Tage, Sperren
const offSchema = z.object({
  from_date: z.string().refine(isValidDate, "Bitte ein Datum wählen"),
  to_date: z.string().optional(),
  from_time: z.string().optional(),
  to_time: z.string().optional(),
  reason: z.string().trim().max(80).optional(),
});

export async function addTimeOff(_: CalState, form: FormData): Promise<CalState> {
  const { u, pid } = await me();
  const p = offSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  const toDate = d.to_date && isValidDate(d.to_date) ? d.to_date : d.from_date;
  if (toDate < d.from_date) return { error: "Das Enddatum liegt vor dem Startdatum." };
  let start: Date, end: Date;
  if (d.from_time && d.to_time) {
    if (toDate !== d.from_date) return { error: "Eine Sperre mit Uhrzeit geht nur für einen einzelnen Tag." };
    if (!time.safeParse(d.from_time).success || !time.safeParse(d.to_time).success || d.to_time <= d.from_time) return { error: "Bitte prüfe die Uhrzeiten." };
    start = berlinToDate(d.from_date, d.from_time);
    end = berlinToDate(d.from_date, d.to_time);
  } else {
    start = berlinToDate(d.from_date, "00:00");
    end = berlinToDate(addDays(toDate, 1), "00:00");
  }
  await asProvider(u.id, (db) =>
    db.query("insert into provider_time_off (provider_id, during, reason) values ($1, tstzrange($2, $3), $4)", [pid, start, end, d.reason || null]),
  );
  revalidatePath("/dashboard/kalender");
  return { ok: "Eingetragen. In dieser Zeit wirst du nicht mehr gefunden." };
}

export async function removeTimeOff(form: FormData) {
  const { u, pid } = await me();
  const id = z.string().uuid().parse(form.get("id"));
  await asProvider(u.id, (db) => db.query("delete from provider_time_off where id = $1 and provider_id = $2", [id, pid]));
  revalidatePath("/dashboard/kalender");
}

// ---------------------------------------------------------------- Einstellungen
const settingsSchema = z.object({
  buffer_minutes: z.coerce.number().int().min(0).max(240),
  min_notice_hours: z.coerce.number().int().min(0).max(168),
  booking_mode: z.enum(["instant", "confirm"]),
});

export async function saveSettings(_: CalState, form: FormData): Promise<CalState> {
  const { u, pid } = await me();
  const p = settingsSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Bitte prüfe die Angaben." };
  await asProvider(u.id, (db) =>
    db.query("update provider_profiles set buffer_minutes = $2, min_notice_hours = $3, booking_mode = $4 where id = $1", [pid, p.data.buffer_minutes, p.data.min_notice_hours, p.data.booking_mode]),
  );
  revalidatePath("/dashboard/kalender");
  return { ok: "Einstellungen gespeichert." };
}

// ---------------------------------------------------------------- Leistungen mit Preis und Dauer
export async function saveServices(_: CalState, form: FormData): Promise<CalState> {
  const { u, pid } = await me();
  const templates = await asProvider(u.id, async (db) =>
    (await db.query(
      `select t.id, t.mode, t.name from service_templates t join provider_categories pc on pc.category_id = t.category_id where pc.provider_id = $1`,
      [pid],
    )).rows as { id: string; mode: "fixed" | "quote"; name: string }[],
  );
  const rows: { id: string; type: "fixed" | "quote"; price: number | null; duration: number }[] = [];
  for (const t of templates) {
    if (form.get(`offer_${t.id}`) !== "on") continue;
    const duration = Number(form.get(`duration_${t.id}`));
    if (!Number.isInteger(duration) || duration < 15 || duration > 1440) return { error: `Bitte eine Dauer für „${t.name}“ wählen.` };
    let price: number | null = null;
    if (t.mode === "fixed") {
      const raw = String(form.get(`price_${t.id}`) ?? "").replace(/\s|€/g, "").replace(/\./g, "").replace(",", ".");
      const euro = Number(raw);
      if (!raw || !Number.isFinite(euro) || euro < 1 || euro > 100000) return { error: `Bitte einen Festpreis für „${t.name}“ angeben (in Euro, inkl. MwSt.).` };
      price = Math.round(euro * 100);
    }
    rows.push({ id: t.id, type: t.mode, price, duration });
  }
  await asProvider(u.id, async (db) => {
    await db.query("update provider_services set active = false, updated_at = now() where provider_id = $1", [pid]);
    for (const r of rows) {
      await db.query(
        `insert into provider_services (provider_id, template_id, price_type, price_cents, duration_min, active) values ($1, $2, $3, $4, $5, true)
         on conflict (provider_id, template_id) do update set price_type = excluded.price_type, price_cents = excluded.price_cents,
           duration_min = excluded.duration_min, active = true, updated_at = now()`,
        [pid, r.id, r.type, r.price, r.duration],
      );
    }
    await audit(db, { actorId: u.id, actorRole: "provider", action: "calendar.services", entity: "provider_profiles", entityId: pid, after: rows });
  });
  revalidatePath("/dashboard/kalender");
  return { ok: `${rows.length} ${rows.length === 1 ? "Leistung" : "Leistungen"} gespeichert.` };
}

// ---------------------------------------------------------------- Logo
export async function uploadLogo(_: CalState, form: FormData): Promise<CalState> {
  const { u, pid } = await me();
  const f = form.get("logo");
  if (!(f instanceof File) || f.size === 0) return { error: "Bitte eine Bilddatei wählen." };
  if (f.size > 3 * 1024 * 1024) return { error: "Das Logo darf höchstens 3 MB groß sein." };
  const buf = Buffer.from(await f.arrayBuffer());
  const t = detectImageType(buf);
  if (!t) return { error: "Bitte ein Bild als JPG, PNG oder WebP hochladen." };
  const key = await storage.put("logos", buf, t.ext);
  await asProvider(u.id, (db) => db.query("update provider_profiles set logo_key = $2 where id = $1", [pid, key]));
  revalidatePath("/dashboard/kalender");
  return { ok: "Logo gespeichert.", v: Date.now() };
}
