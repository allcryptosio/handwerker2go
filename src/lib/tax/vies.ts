/**
 * USt-IdNr.-Prüfung über die offizielle VIES-REST-API der EU-Kommission (Aufgabe 8).
 * Mit unserer MT33258727 als Anfragender, damit eine requestIdentifier (qualifizierte Bestätigung) zurückkommt.
 * Tests: VIES_MOCK=valid|invalid|error statt echter Anfrage.
 */
import LEGAL from "@/config/legal-data.json";

export const VIES_URL = "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number";

export type ViesResult =
  | { ok: true; valid: boolean; requestIdentifier: string | null; name: string | null; address: string | null; checkedAt: Date }
  | { ok: false; error: string; checkedAt: Date };

/** Deutsche USt-IdNr.: DE + 9 Ziffern */
export function parseGermanVatId(input: string): { countryCode: "DE"; vatNumber: string } | null {
  const v = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^DE\d{9}$/.test(v) ? { countryCode: "DE", vatNumber: v.slice(2) } : null;
}

export async function checkVatId(vatId: string, fetchImpl: typeof fetch = fetch): Promise<ViesResult> {
  const checkedAt = new Date();
  const parsed = parseGermanVatId(vatId);
  if (!parsed) return { ok: true, valid: false, requestIdentifier: null, name: null, address: null, checkedAt };
  const mock = process.env.VIES_MOCK;
  if (mock === "valid") return { ok: true, valid: true, requestIdentifier: `WAPIMOCK${Date.now()}`, name: "TESTBETRIEB", address: "TESTSTRASSE 1, 20095 HAMBURG", checkedAt };
  if (mock === "invalid") return { ok: true, valid: false, requestIdentifier: `WAPIMOCK${Date.now()}`, name: null, address: null, checkedAt };
  if (mock === "error") return { ok: false, error: "VIES nicht erreichbar (Mock)", checkedAt };
  const own = LEGAL.vatId; // MT33258727
  try {
    const res = await fetchImpl(VIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ countryCode: parsed.countryCode, vatNumber: parsed.vatNumber, requesterMemberStateCode: own.slice(0, 2), requesterNumber: own.slice(2) }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { valid?: boolean; requestIdentifier?: string; name?: string; address?: string; userError?: string };
    if (!res.ok || typeof body.valid !== "boolean") return { ok: false, error: body.userError ?? `HTTP ${res.status}`, checkedAt };
    const clean = (s?: string) => (s && s.trim() && s.trim() !== "---" ? s.trim() : null);
    return { ok: true, valid: body.valid, requestIdentifier: body.requestIdentifier ?? null, name: clean(body.name), address: clean(body.address), checkedAt };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 200), checkedAt };
  }
}
