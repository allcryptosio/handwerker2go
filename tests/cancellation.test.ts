import assert from "node:assert/strict";
import { test } from "node:test";
import { cancellationNotice, decideCancellation, lateFeeCents } from "../src/lib/booking/cancellation";

const H = 3_600_000, D = 24 * H;
const now = new Date("2026-12-10T10:00:00Z");

test("Stornierung 2 Std. vor Termin innerhalb der Widerrufsfrist, ohne Leistungsbeginn: volle Erstattung, keine Pauschale", () => {
  const r = decideCancellation({ priceType: "fixed", priceCents: 10000, anfahrtskostenCents: 3000, contractAt: new Date(now.getTime() - 3 * D), startsAt: new Date(now.getTime() + 2 * H), now });
  assert.equal(r.kind, "withdrawal");
  assert.equal(r.feeCents, 0);
  assert.equal(r.refundCents, 10000);
  assert.match(r.message, /als Widerruf behandelt; Sie erhalten den vollen Betrag zurück/);
});

test("Stornierung nach Ablauf der Widerrufsfrist, 2 Std. vor Termin: Pauschale = min(25 %, Anfahrtskosten)", () => {
  const base = { priceType: "fixed" as const, contractAt: new Date(now.getTime() - 20 * D), startsAt: new Date(now.getTime() + 2 * H), now };
  const a = decideCancellation({ ...base, priceCents: 10000, anfahrtskostenCents: 1500 }); // 25 % = 25 €, Anfahrt 15 €
  assert.equal(a.kind, "late_fee"); assert.equal(a.feeCents, 1500); assert.equal(a.refundCents, 8500);
  const b = decideCancellation({ ...base, priceCents: 4000, anfahrtskostenCents: 3000 }); // 25 % = 10 €
  assert.equal(b.feeCents, 1000); assert.equal(b.refundCents, 3000);
});

test("nach Ablauf der Widerrufsfrist, mehr als 24 Std. vorher: kostenlos", () => {
  const r = decideCancellation({ priceType: "fixed", priceCents: 10000, anfahrtskostenCents: 3000, contractAt: new Date(now.getTime() - 20 * D), startsAt: new Date(now.getTime() + 30 * H), now });
  assert.equal(r.kind, "free"); assert.equal(r.refundCents, 10000);
});

test("Besichtigungstermin: Pauschale immer 0", () => {
  assert.equal(lateFeeCents("quote", null, 5000), 0);
  const r = decideCancellation({ priceType: "quote", priceCents: null, anfahrtskostenCents: 5000, contractAt: new Date(now.getTime() - 20 * D), startsAt: new Date(now.getTime() + 1 * H), now, noShow: true });
  assert.equal(r.feeCents, 0);
  assert.match(cancellationNotice("quote", null, 5000), /keine Pauschale/);
});

test("No-Show innerhalb der Widerrufsfrist: Admin-Fall statt Pauschale; danach Pauschale", () => {
  const inside = decideCancellation({ priceType: "fixed", priceCents: 10000, anfahrtskostenCents: 2000, contractAt: new Date(now.getTime() - 5 * D), startsAt: new Date(now.getTime() - 1 * H), now, noShow: true });
  assert.equal(inside.kind, "admin_case");
  const after = decideCancellation({ priceType: "fixed", priceCents: 10000, anfahrtskostenCents: 2000, contractAt: new Date(now.getTime() - 20 * D), startsAt: new Date(now.getTime() - 1 * H), now, noShow: true });
  assert.equal(after.kind, "late_fee"); assert.equal(after.feeCents, 2000);
});

test("Hinweistext mit Betrag", () => {
  assert.equal(cancellationNotice("fixed", 10000, 1500).replace(/\u00a0/g, " "), "Kostenlose Stornierung bis 24 Stunden vor dem Termin. Danach oder wenn niemand angetroffen wird: höchstens 15,00 € (25 % des Festpreises, maximal die Anfahrtskosten von 15,00 €).");
});
