/**
 * Konditionen für Handwerksbetriebe.
 * Vorläufig im Code, ab Phase 5 aus der Datenbank (pricing_settings) und im
 * Admin-Dashboard änderbar. Beträge in Cent, Provision in Basispunkten.
 */
export const providerPricing = {
  introMonths: 3,
  introMonthlyFeeCents: 0,
  introCommissionBps: 1000, // 10 %
  monthly: { feeCents: 2999, commissionBps: 1500 }, // 29,99 € / 15 %
  yearly: { feeCents: 29988, commissionBps: 1500 }, // 299,88 € / 15 %
} as const;

/**
 * Umsatzsteuer auf Abo und Provision: Der Betreiber sitzt in Malta, die Betriebe in Deutschland.
 * B2B-Dienstleistung, Ort der Leistung beim Empfänger: Reverse-Charge, Nettorechnung mit Hinweis
 * "Reverse charge", keine maltesische Mehrwertsteuer (gleiche Regelung wie bei deinminijob.com).
 */
export const providerVatNote =
  "Alle Preise sind Nettopreise. Mit USt-IdNr. schuldet der Betrieb die Umsatzsteuer als Leistungsempfänger (Reverse-Charge-Verfahren).";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export const formatCents = (cents: number) => eur.format(cents / 100);
export const formatPercent = (bps: number) =>
  `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(bps / 100)} %`;

/** Effektiver Monatspreis des Jahresabos, z. B. 24,99 €. */
export const yearlyPerMonthCents = () => Math.round(providerPricing.yearly.feeCents / 12);

/** Ersparnis des Jahresabos gegenüber zwölf Monatszahlungen in Prozent (gerundet). */
export const yearlySavingsPercent = () =>
  Math.round((1 - providerPricing.yearly.feeCents / (providerPricing.monthly.feeCents * 12)) * 100);

/**
 * Partnercodes: dauerhafte Sonderkonditionen (z. B. für Freunde). Gilt ab Freischaltung für die gesamte
 * Laufzeit: fester Provisionssatz, keine Grundgebühr, keine Mitgliedschaft nötig.
 */
export const partnerCodes: Record<string, { label: string; commissionBps: number; monthlyFeeCents: 0 }> = {
  FCKSTP: { label: "Freundes-Konditionen", commissionBps: 1000, monthlyFeeCents: 0 }, // dauerhaft 10 %, kein Monatsbeitrag
};
export const normalizePartnerCode = (raw: string | null | undefined) => (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
export const partnerTerms = (code: string | null | undefined) => {
  const c = normalizePartnerCode(code);
  return c && partnerCodes[c] ? { code: c, ...partnerCodes[c] } : null;
};
