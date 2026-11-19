import { strict as assert } from "node:assert";
import { test } from "node:test";
import { type Candidate, checkSlot, earliestSlot, timesBetween, travelMinutes } from "../src/lib/booking/engine";
import { berlinTime, berlinToDate } from "../src/lib/booking/time";

const now = new Date("2026-11-19T09:00:00Z");
const date = "2026-11-25"; // Mittwoch
const weekdays = { 1: [{ from: 480, to: 1020 }], 2: [{ from: 480, to: 1020 }], 3: [{ from: 480, to: 1020 }], 4: [{ from: 480, to: 1020 }], 5: [{ from: 480, to: 1020 }] };
const base = (over: Partial<Candidate> = {}): Candidate => ({
  providerId: "p", distanceKm: 5, radiusKm: 20, offersService: true, priceType: "fixed", payable: true,
  durationMin: 60, bufferMin: 30, minNoticeHours: 12, hours: weekdays, timeOff: [], busy: [], ...over,
});
const at = (t: string) => berlinToDate(date, t).getTime();

test("Beispiel aus der Anforderung: 20 Elektriker, 6 verfügbar", () => {
  const list: Candidate[] = [];
  for (let i = 0; i < 5; i++) list.push(base({ providerId: `frei${i}`, hours: { 1: weekdays[1] } })); // mittwochs frei
  for (let i = 0; i < 4; i++) list.push(base({ providerId: `frueh${i}`, hours: { 3: [{ from: 420, to: 780 }] } })); // 7–13 Uhr
  for (let i = 0; i < 2; i++) list.push(base({ providerId: `weit${i}`, distanceKm: 35 }));
  for (let i = 0; i < 3; i++) list.push(base({ providerId: `belegt${i}`, busy: [{ start: at("13:30"), end: at("15:30") }] }));
  for (let i = 0; i < 6; i++) list.push(base({ providerId: `ok${i}` }));
  const counts: Record<string, number> = {};
  for (const c of list) {
    const r = checkSlot(c, date, "14:00", now);
    const k = r.ok ? "verfügbar" : r.reason;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  assert.deepEqual(counts, { day_off: 5, outside_hours: 4, outside_area: 2, busy: 3, "verfügbar": 6 });
});

test("Anfahrt muss in die Arbeitszeit passen", () => {
  assert.equal(travelMinutes(5), 25);
  const r = checkSlot(base(), date, "08:00", now); // 25 min Anfahrt vor 8 Uhr, Arbeitsbeginn 8 Uhr
  assert.equal(r.ok, false);
  assert.equal(checkSlot(base(), date, "08:30", now).ok, true);
});

test("Auftrag darf nicht über das Arbeitsende hinausgehen", () => {
  assert.equal(checkSlot(base(), date, "16:00", now).ok, true); // endet 17:00
  assert.equal(checkSlot(base(), date, "16:30", now).ok, false);
});

test("Pufferzeit nach einem Termin wird freigehalten", () => {
  // bestehender Termin belegt 10:00–11:30 (inkl. Puffer); neuer Termin 11:30 braucht 25 min Anfahrt ab 11:05 → Konflikt
  const busy = [{ start: at("10:00"), end: at("11:30") }];
  assert.equal(checkSlot(base({ busy }), date, "11:30", now).ok, false);
  assert.equal(checkSlot(base({ busy }), date, "12:00", now).ok, true);
});

test("Urlaub über den ganzen Tag = freier Tag, Teilsperre = belegt", () => {
  const ganz = [{ start: berlinToDate("2026-11-24", "00:00").getTime(), end: berlinToDate("2026-11-27", "00:00").getTime() }];
  const r1 = checkSlot(base({ timeOff: ganz }), date, "14:00", now);
  assert.equal(!r1.ok && r1.reason, "day_off");
  const teil = [{ start: at("13:00"), end: at("15:00") }];
  const r2 = checkSlot(base({ timeOff: teil }), date, "14:00", now);
  assert.equal(!r2.ok && r2.reason, "busy");
});

test("Mindestvorlauf und vergangene Zeiten", () => {
  const r = checkSlot(base(), "2026-11-19", "15:00", now); // heute 16 Uhr MEZ? now=10:00 MEZ, 15:00 < 22:00
  assert.equal(!r.ok && r.reason, "too_soon");
});

test("Festpreis nur mit eingerichteter Zahlung, Angebotstermin auch ohne", () => {
  const r = checkSlot(base({ payable: false }), date, "14:00", now);
  assert.equal(!r.ok && r.reason, "payment_not_ready");
  assert.equal(checkSlot(base({ payable: false, priceType: "quote" }), date, "14:00", now).ok, true);
});

test("Zeitfenster liefert frühesten freien Beginn", () => {
  const busy = [{ start: at("09:30"), end: at("11:00") }];
  const r = earliestSlot(base({ busy }), date, timesBetween("10:00", "12:00"), now);
  assert.ok(r.ok);
  assert.equal(berlinTime(r.start), "11:30"); // 11:00 + 25 min Anfahrt → erst 11:30 im 30-Minuten-Raster
});

test("Zeitumstellung: 29.03.2027 10:00 Berlin = 08:00 UTC (Sommerzeit)", () => {
  assert.equal(berlinToDate("2027-03-29", "10:00").toISOString(), "2027-03-29T08:00:00.000Z");
  assert.equal(berlinToDate("2026-11-25", "10:00").toISOString(), "2026-11-25T09:00:00.000Z");
});
