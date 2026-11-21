import assert from "node:assert/strict";
import { test } from "node:test";
import { priceLine, priceParts, taxNote } from "../src/lib/booking/price-label";

const norm = (s: string) => s.replace(/ /g, " ");

test("Kleinunternehmer zeigt nie „MwSt.“", () => {
  for (const c of [100, 9900, 123456]) {
    const line = norm(priceLine(c, "kleinunternehmer_19"));
    assert.ok(!/MwSt/i.test(line), line);
    assert.ok(!/MwSt/i.test(taxNote("kleinunternehmer_19")));
    assert.match(line, /Endpreis, keine USt nach § 19 UStG/);
  }
});

test("Regelbesteuert zeigt „inkl. 19 % MwSt.“", () => {
  assert.equal(norm(priceLine(9900, "regelbesteuert")), "Festpreis 99,00 € inkl. 19 % MwSt., Anfahrt inklusive");
  assert.equal(priceParts(9900, "regelbesteuert").tax, "inkl. 19 % MwSt.");
});

test("Snapshot Kleinunternehmer", () => {
  assert.equal(norm(priceLine(9900, "kleinunternehmer_19")), "Festpreis 99,00 €, Endpreis, keine USt nach § 19 UStG, Anfahrt inklusive");
});
