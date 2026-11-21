import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/** Die Bewertungsbitte wird nur mit Opt-in verschickt: die Auswahl im Job verlangt review_optin und prüft die Sperrliste */
test("Bewertungsmail ohne Opt-in wird nicht versendet (Auswahlbedingung)", () => {
  const src = readFileSync(new URL("../scripts/reminders.mts", import.meta.url), "utf8");
  const due = src.slice(src.indexOf("const reviewDue"), src.indexOf("`;", src.indexOf("const reviewDue")));
  assert.match(due, /\band review_optin\b/);
  assert.match(due, /review_mail_blocklist/);
  assert.match(due, /interval '24 hours'/);
});

test("Opt-in-Checkbox ist nie vorausgewählt", () => {
  for (const f of ["../src/components/booking/booking-form.tsx", "../src/components/booking/offer-forms.tsx"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    const box = src.slice(src.indexOf('name="review_optin"') - 60, src.indexOf('name="review_optin"') + 120);
    assert.ok(!/defaultChecked|checked=/.test(box), f);
  }
});
