import { test } from "node:test";
import assert from "node:assert/strict";
import { commissionBpsAt } from "../src/lib/stripe/commission";
import { partnerTerms } from "../src/lib/pricing";

test("FCKSTP: dauerhaft 10 % Provision, auch nach der Einführungsphase", () => {
  const approved = new Date("2026-01-01T10:00:00Z");
  assert.equal(commissionBpsAt(approved, new Date("2026-02-01T10:00:00Z"), "FCKSTP"), 1000);
  assert.equal(commissionBpsAt(approved, new Date("2030-06-01T10:00:00Z"), "fckstp "), 1000);
  assert.equal(commissionBpsAt(approved, new Date("2030-06-01T10:00:00Z")), 1500);
  assert.equal(commissionBpsAt(approved, new Date("2030-06-01T10:00:00Z"), "FALSCH"), 1500);
});

test("Partnercode: nur gültige Codes", () => {
  assert.equal(partnerTerms("FCKSTP")?.monthlyFeeCents, 0);
  assert.equal(partnerTerms(" fck stp")?.code, "FCKSTP");
  assert.equal(partnerTerms("ABC"), null);
  assert.equal(partnerTerms(""), null);
});
