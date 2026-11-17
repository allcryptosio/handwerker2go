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

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export const formatCents = (cents: number) => eur.format(cents / 100);
export const formatPercent = (bps: number) =>
  `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(bps / 100)} %`;

/** Effektiver Monatspreis des Jahresabos, z. B. 24,99 €. */
export const yearlyPerMonthCents = () => Math.round(providerPricing.yearly.feeCents / 12);

/** Ersparnis des Jahresabos gegenüber zwölf Monatszahlungen in Prozent (gerundet). */
export const yearlySavingsPercent = () =>
  Math.round((1 - providerPricing.yearly.feeCents / (providerPricing.monthly.feeCents * 12)) * 100);
