import { partnerTerms, providerPricing } from "@/lib/pricing";

/**
 * Provisionssatz in Basispunkten zum Zeitpunkt der Buchung.
 * Einführungsphase ab Freischaltung (providerPricing.introMonths), danach Satz der Mitgliedschaft.
 * Werte kommen ausschließlich aus src/lib/pricing.ts.
 */
export function commissionBpsAt(approvedAt: Date, bookedAt: Date = new Date(), partnerCode?: string | null): number {
  // Partnercode (z. B. FCKSTP): fester Satz auf Dauer
  const partner = partnerTerms(partnerCode);
  if (partner) return partner.commissionBps;
  const introEnd = new Date(approvedAt);
  introEnd.setMonth(introEnd.getMonth() + providerPricing.introMonths);
  return bookedAt < introEnd ? providerPricing.introCommissionBps : providerPricing.monthly.commissionBps;
}

/** Plattformgebühr in Cent, kaufmännisch gerundet */
export function applicationFeeCents(amountCents: number, bps: number): number {
  return Math.round((amountCents * bps) / 10_000);
}
