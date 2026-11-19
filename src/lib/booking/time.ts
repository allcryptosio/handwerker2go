/**
 * Zeitrechnung in der Zeitzone Europe/Berlin (inkl. Sommer-/Winterzeit).
 * Datumsangaben als "YYYY-MM-DD", Uhrzeiten als "HH:MM".
 */
export const TZ = "Europe/Berlin";

/** Versatz von Berlin zu UTC in Minuten für einen Zeitpunkt (60 im Winter, 120 im Sommer) */
function offsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" }).formatToParts(at);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const m = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 60;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/** Berliner Ortszeit (Datum + Uhrzeit) als absoluter Zeitpunkt */
export function berlinToDate(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // zweimal korrigieren, damit auch Zeitpunkte rund um die Umstellung stimmen
  let ts = guess - offsetMinutes(new Date(guess)) * 60_000;
  ts = guess - offsetMinutes(new Date(ts)) * 60_000;
  return new Date(ts);
}

/** Datum "YYYY-MM-DD" in Berlin für einen Zeitpunkt */
export function berlinDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** Uhrzeit "HH:MM" in Berlin für einen Zeitpunkt */
export function berlinTime(at: Date): string {
  return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
}

/** ISO-Wochentag (1 = Montag … 7 = Sonntag) eines Kalenderdatums */
export function isoWeekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

/** Kalenderdatum plus n Tage */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const timeOf = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Uhrzeiten im 30-Minuten-Raster zwischen from (inkl.) und to (exkl.) */
export function halfHourSlots(from = "06:00", to = "21:00"): string[] {
  const out: string[] = [];
  for (let m = minutesOf(from); m < minutesOf(to); m += 30) out.push(timeOf(m));
  return out;
}

export const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
export const isValidTime = (s: string) => /^([01]\d|2[0-3]):[03]0$/.test(s);

/** Feste Zeitfenster für die Auswahl „Zeitfenster“ */
export const timeWindows = [
  { id: "08-10", from: "08:00", to: "10:00" },
  { id: "10-12", from: "10:00", to: "12:00" },
  { id: "12-14", from: "12:00", to: "14:00" },
  { id: "14-16", from: "14:00", to: "16:00" },
  { id: "16-18", from: "16:00", to: "18:00" },
  { id: "18-20", from: "18:00", to: "20:00" },
] as const;
export type TimeWindowId = (typeof timeWindows)[number]["id"];

/** Ostersonntag (Gauß/Meeus) als "YYYY-MM-DD" */
function easterSunday(year: number): string {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Bundesweite gesetzliche Feiertage. Landesfeiertage tragen Betriebe bei Bedarf selbst als freie Tage ein. */
export function isNationalHoliday(date: string): boolean {
  const year = Number(date.slice(0, 4));
  const e = easterSunday(year);
  const fixed = ["01-01", "05-01", "10-03", "12-25", "12-26"].map((md) => `${year}-${md}`);
  const moving = [-2, 1, 39, 50].map((n) => addDays(e, n)); // Karfreitag, Ostermontag, Himmelfahrt, Pfingstmontag
  return fixed.includes(date) || moving.includes(date);
}
