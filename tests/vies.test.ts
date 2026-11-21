import assert from "node:assert/strict";
import { test } from "node:test";
import { checkVatId, parseGermanVatId } from "../src/lib/tax/vies";

test("Format DE + 9 Ziffern", () => {
  assert.deepEqual(parseGermanVatId("de 123 456 789"), { countryCode: "DE", vatNumber: "123456789" });
  assert.equal(parseGermanVatId("DE12345678"), null);
  assert.equal(parseGermanVatId("AT123456789"), null);
});

test("VIES-Mock gültig → Weg A ok", async () => {
  process.env.VIES_MOCK = "valid";
  const r = await checkVatId("DE123456789");
  assert.ok(r.ok && r.valid && r.requestIdentifier);
});

test("VIES-Mock ungültig → Weg A blockiert", async () => {
  process.env.VIES_MOCK = "invalid";
  const r = await checkVatId("DE123456789");
  assert.ok(r.ok && !r.valid);
});

test("VIES-Ausfall → kein Abschluss über Weg A", async () => {
  process.env.VIES_MOCK = "error";
  const r = await checkVatId("DE123456789");
  assert.equal(r.ok, false);
});

test("Anfrage mit eigener USt-IdNr. als Requester (fetch gemockt)", async () => {
  delete process.env.VIES_MOCK;
  let sent: Record<string, string> = {};
  const fake = (async (_u: string, init: RequestInit) => {
    sent = JSON.parse(String(init.body));
    return new Response(JSON.stringify({ valid: true, requestIdentifier: "WAPI123", name: "MUSTER GMBH", address: "HAMBURG" }), { status: 200 });
  }) as unknown as typeof fetch;
  const r = await checkVatId("DE123456789", fake);
  assert.deepEqual(sent, { countryCode: "DE", vatNumber: "123456789", requesterMemberStateCode: "MT", requesterNumber: "33258727" });
  assert.ok(r.ok && r.valid && r.requestIdentifier === "WAPI123");
});
