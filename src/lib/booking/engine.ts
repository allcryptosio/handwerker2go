import { addDays, berlinToDate, isNationalHoliday, isoWeekday, minutesOf, timeOf } from "./time";

/**
 * Verfügbarkeitsberechnung (rein, ohne Datenbank, dadurch testbar).
 *
 * Ein Betrieb kann einen Termin mit Beginn `start` übernehmen, wenn
 *  1. er im Einsatzgebiet liegt (Entfernung ≤ Radius),
 *  2. die Leistung anbietet (bei Festpreis zusätzlich: Stripe-Zahlungen aktiv),
 *  3. der Beginn mindestens `minNoticeHours` in der Zukunft liegt,
 *  4. Anfahrt + Auftragsdauer vollständig in einem Arbeitszeitblock des Tages liegen,
 *  5. sich [Beginn − Anfahrt, Ende + Puffer] mit keinem Urlaub/keiner Sperre überschneidet,
 *  6. und mit keinem bereits belegten Termin (die gespeichert schon Anfahrt und Puffer enthalten).
 * Die Datenbank prüft Punkt 6 beim Speichern ein zweites Mal (Ausschluss-Constraint), damit es keine Doppelbuchung gibt.
 */

export const AVG_SPEED_KMH = 25; // Stadtverkehr inkl. Parken
export const TRAVEL_BASE_MIN = 10;

export function travelMinutes(distanceKm: number): number {
  const raw = (distanceKm / AVG_SPEED_KMH) * 60 + TRAVEL_BASE_MIN;
  return Math.ceil(raw / 5) * 5;
}

export interface Interval {
  start: number; // ms
  end: number; // ms, exklusiv
}
export const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

export interface Candidate {
  providerId: string;
  distanceKm: number | null;
  radiusKm: number;
  offersService: boolean;
  priceType: "fixed" | "quote" | null;
  payable: boolean;
  durationMin: number;
  bufferMin: number;
  minNoticeHours: number;
  /** Arbeitszeitblöcke je ISO-Wochentag, Minuten ab Mitternacht */
  hours: Record<number, { from: number; to: number }[]>;
  timeOff: Interval[];
  busy: Interval[];
}

export type Exclusion =
  | "outside_area"
  | "no_service"
  | "payment_not_ready"
  | "day_off"
  | "outside_hours"
  | "too_soon"
  | "busy";

export interface SlotResult {
  ok: true;
  start: Date;
  end: Date;
  travelMin: number;
  blocked: Interval;
}

/** Prüft genau einen Beginn. Gibt den Grund zurück, wenn es nicht passt. */
export function checkSlot(c: Candidate, date: string, time: string, now: Date): SlotResult | { ok: false; reason: Exclusion } {
  if (c.distanceKm === null || c.distanceKm > c.radiusKm) return { ok: false, reason: "outside_area" };
  if (!c.offersService) return { ok: false, reason: "no_service" };
  if (c.priceType === "fixed" && !c.payable) return { ok: false, reason: "payment_not_ready" };

  const blocks = c.hours[isoWeekday(date)] ?? [];
  const dayStart = berlinToDate(date, "00:00").getTime();
  const dayEnd = berlinToDate(addDays(date, 1), "00:00").getTime();
  const dayOff = blocks.length === 0 || isNationalHoliday(date) || c.timeOff.some((t) => t.start <= dayStart && t.end >= dayEnd);
  if (dayOff) return { ok: false, reason: "day_off" };

  const travel = travelMinutes(c.distanceKm);
  const startMin = minutesOf(time);
  const fits = blocks.some((b) => startMin - travel >= b.from && startMin + c.durationMin <= b.to);
  if (!fits) return { ok: false, reason: "outside_hours" };

  const start = berlinToDate(date, time);
  if (start.getTime() < now.getTime() + c.minNoticeHours * 3_600_000) return { ok: false, reason: "too_soon" };
  const end = new Date(start.getTime() + c.durationMin * 60_000);
  const blocked: Interval = { start: start.getTime() - travel * 60_000, end: end.getTime() + c.bufferMin * 60_000 };
  if (c.timeOff.some((t) => overlaps(t, blocked))) return { ok: false, reason: "busy" };
  if (c.busy.some((b) => overlaps(b, blocked))) return { ok: false, reason: "busy" };
  return { ok: true, start, end, travelMin: travel, blocked };
}

/** Rangfolge der Gründe: es zählt der „weiteste“ Grund, den ein Betrieb über alle geprüften Zeiten erreicht hat */
const depth: Record<Exclusion, number> = {
  outside_area: 0, no_service: 1, payment_not_ready: 2, day_off: 3, outside_hours: 4, too_soon: 5, busy: 6,
};

/** Frühester passender Beginn aus einer Liste von Uhrzeiten (exakte Zeit = Liste mit einem Eintrag) */
export function earliestSlot(c: Candidate, date: string, times: string[], now: Date): SlotResult | { ok: false; reason: Exclusion } {
  let best: Exclusion = "outside_area";
  let first = true;
  for (const t of times) {
    const r = checkSlot(c, date, t, now);
    if (r.ok) return r;
    if (first || depth[r.reason] > depth[best]) best = r.reason;
    first = false;
    // diese Gründe hängen nicht von der Uhrzeit ab
    if (["outside_area", "no_service", "payment_not_ready", "day_off"].includes(r.reason)) break;
  }
  return { ok: false, reason: best };
}

export const exclusionLabel: Record<Exclusion, string> = {
  outside_area: "außerhalb des Einsatzgebiets",
  no_service: "bietet die Leistung nicht an",
  payment_not_ready: "Zahlung noch nicht eingerichtet",
  day_off: "an diesem Tag frei",
  outside_hours: "arbeitet zu dieser Uhrzeit nicht",
  too_soon: "zu kurzfristig",
  busy: "bereits anderer Auftrag",
};

export const timesBetween = (from: string, to: string) => {
  const out: string[] = [];
  for (let m = minutesOf(from); m < minutesOf(to); m += 30) out.push(timeOf(m));
  return out;
};
