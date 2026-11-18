import { providerPricing } from "@/lib/pricing";

/**
 * Provisionssatz in Basispunkten zum Zeitpunkt der Buchung.
 * Einführungsphase ab Freischaltung (providerPricing.introMonths), danach Satz der Mitgliedschaft.
 * Werte kommen ausschließlich aus src/lib/pricing.ts.
 */
export function commissionBpsAt(approvedAt: Date, bookedAt: Date = new Date()): number {
  const introEnd = new Date(approvedAt);
  introEnd.setMonth(introEnd.getMonth() + providerPricing.introMonths);
  return bookedAt < introEnd ? providerPricing.introCommissionBps : providerPricing.monthly.commissionBps;
}

/** Plattformgebühr in Cent, kaufmännisch gerundet */
export function applicationFeeCents(amountCents: number, bps: number): number {
  return Math.round((amountCents * bps) / 10_000);
}
