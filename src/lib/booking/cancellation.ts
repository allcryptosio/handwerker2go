/**
 * Storno-Regeln (Aufgabe 6, AGB für Kunden § 6). Reine Funktionen ohne Datenbank, damit sie testbar sind.
 * - Innerhalb der Widerrufsfrist gilt jede Stornierung als Widerruf: vor Leistungsbeginn volle Erstattung, keine Pauschale.
 * - Danach bis 24 Stunden vor dem Termin kostenlos.
 * - Danach (oder No-Show nach Ablauf der Widerrufsfrist): Pauschale = min(25 % des Festpreises, Anfahrtskosten). Besichtigung: immer 0.
 */
export const FREE_CANCELLATION_HOURS = 24;
export const LATE_FEE_PERCENT = 25;
export const WITHDRAWAL_DAYS = 14;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type CancelInput = {
  priceType: "fixed" | "quote";
  priceCents: number | null;
  anfahrtskostenCents: number | null;
  contractAt: Date; // Vertragsschluss
  startsAt: Date;
  now: Date;
  noShow?: boolean;
};

export type CancelDecision =
  | { kind: "withdrawal"; started: boolean; feeCents: 0; refundCents: number; message: string }
  | { kind: "free"; feeCents: 0; refundCents: number; message: string }
  | { kind: "late_fee"; feeCents: number; refundCents: number; message: string }
  | { kind: "admin_case"; feeCents: 0; refundCents: 0; message: string };

/** Höchstbetrag der Pauschale: 25 % des Festpreises, höchstens die Anfahrtskosten; Besichtigung 0 */
export function lateFeeCents(priceType: "fixed" | "quote", priceCents: number | null, anfahrtskostenCents: number | null): number {
  if (priceType !== "fixed" || !priceCents || priceCents <= 0) return 0;
  const pct = Math.floor((priceCents * LATE_FEE_PERCENT) / 100);
  return Math.max(0, Math.min(pct, anfahrtskostenCents ?? 0));
}

export function withinWithdrawal(contractAt: Date, at: Date) {
  return at.getTime() <= contractAt.getTime() + WITHDRAWAL_DAYS * DAY;
}

export function decideCancellation(i: CancelInput): CancelDecision {
  const price = i.priceType === "fixed" ? (i.priceCents ?? 0) : 0;
  const started = i.startsAt.getTime() <= i.now.getTime();
  if (withinWithdrawal(i.contractAt, i.now)) {
    if (i.noShow) return { kind: "admin_case", feeCents: 0, refundCents: 0, message: "Nichterscheinen innerhalb der Widerrufsfrist: keine automatische Pauschale, Prüfung durch handwerker2go." };
    return {
      kind: "withdrawal",
      started,
      feeCents: 0,
      refundCents: started ? 0 : price,
      message: started
        ? "Ihre Stornierung wird als Widerruf behandelt. Da die Leistung bereits begonnen hat, gilt die Regelung zum Wertersatz."
        : "Ihre Stornierung wird als Widerruf behandelt; Sie erhalten den vollen Betrag zurück.",
    };
  }
  if (i.priceType !== "fixed") return { kind: "free", feeCents: 0, refundCents: 0, message: "Der Besichtigungstermin ist kostenlos storniert." };
  const freeUntil = i.startsAt.getTime() - FREE_CANCELLATION_HOURS * HOUR;
  if (!i.noShow && i.now.getTime() <= freeUntil) return { kind: "free", feeCents: 0, refundCents: price, message: "Kostenlos storniert. Du bekommst den vollen Betrag zurück." };
  const fee = lateFeeCents(i.priceType, i.priceCents, i.anfahrtskostenCents);
  return {
    kind: "late_fee",
    feeCents: fee,
    refundCents: Math.max(0, price - fee),
    message: i.noShow ? "Bei dem Termin war niemand anzutreffen. Der Betrieb behält die Pauschale, der Rest wird erstattet." : "Spät storniert: Der Betrieb behält die Pauschale, der Rest wird erstattet.",
  };
}

const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);

/** Hinweis vor der Buchung und in der Bestätigung (Aufgabe 6) */
export function cancellationNotice(priceType: "fixed" | "quote", priceCents: number | null, anfahrtskostenCents: number | null): string {
  if (priceType !== "fixed") return "Der Besichtigungstermin ist kostenlos und unverbindlich, auch bei Stornierung fällt keine Pauschale an.";
  const fee = lateFeeCents(priceType, priceCents, anfahrtskostenCents);
  return `Kostenlose Stornierung bis 24 Stunden vor dem Termin. Danach oder wenn niemand angetroffen wird: höchstens ${eur(fee)} (25 % des Festpreises, maximal die Anfahrtskosten von ${eur(anfahrtskostenCents ?? 0)}).`;
}
