import { legal } from "@/config/legal";

/**
 * Vorzeitiger Leistungsbeginn innerhalb der Widerrufsfrist (§ 356 Abs. 4, § 357a BGB).
 * Wird vom Buchungsablauf (Phase 3) genutzt: Pflicht-Checkbox, nicht vorausgewählt,
 * Zustimmung mit Zeitstempel in der Tabelle consents speichern und in der Bestätigungsmail wiederholen.
 */
export const EARLY_START_CONSENT_TEXT =
  "Ich verlange ausdrücklich, dass der Betrieb vor Ablauf der Widerrufsfrist mit der Leistung beginnt. Mir ist bekannt, dass ich bei " +
  "vollständiger Vertragserfüllung mein Widerrufsrecht verliere und bei einem Widerruf für die bis dahin erbrachte Leistung einen " +
  "anteiligen Betrag (Wertersatz) zahlen muss.";

/** Version des Wortlauts (Anhang C.1), wird mit der Zustimmung gespeichert */
export const EARLY_START_TEXT_VERSION = "C.1-2026-11-21";

/** True, wenn der Termin vor Ablauf der Widerrufsfrist liegt */
export function needsEarlyStartConsent(contractAt: Date, appointmentStart: Date): boolean {
  const end = new Date(contractAt.getTime() + legal.withdrawalDays * 24 * 60 * 60 * 1000);
  return appointmentStart < end;
}

/** Absatz für die Buchungsbestätigung */
export function earlyStartConfirmationParagraph(acceptedAt: Date): string {
  const when = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" }).format(acceptedAt);
  return `Deine Erklärung vom ${when}: „${EARLY_START_CONSENT_TEXT}“`;
}
