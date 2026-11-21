/**
 * Preisanzeige je Steuerstatus des Betriebs (Aufgabe 7, PAngV).
 * Nie „inkl. MwSt.“ bei Kleinunternehmern. Die Anfahrt ist im Festpreis immer enthalten.
 */
export type TaxStatus = "regelbesteuert" | "kleinunternehmer_19";

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);

export function taxNote(status: TaxStatus | null | undefined): string {
  if (status === "kleinunternehmer_19") return "Endpreis, keine USt nach § 19 UStG";
  if (status === "regelbesteuert") return "inkl. 19 % MwSt.";
  return "Endpreis";
}

/** Bausteine für die Anzeige: Betrag, Steuerhinweis, Anfahrt */
export function priceParts(priceCents: number, status: TaxStatus | null | undefined) {
  return { amount: eur(priceCents), tax: taxNote(status), travel: "Anfahrt inklusive" };
}

/** Eine Zeile, z. B. „Festpreis 99,00 € inkl. 19 % MwSt., Anfahrt inklusive“ */
export function priceLine(priceCents: number, status: TaxStatus | null | undefined): string {
  const p = priceParts(priceCents, status);
  return status === "kleinunternehmer_19"
    ? `Festpreis ${p.amount}, ${p.tax}, ${p.travel}`
    : `Festpreis ${p.amount} ${p.tax}, ${p.travel}`;
}
