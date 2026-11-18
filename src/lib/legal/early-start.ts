import { legal } from "@/config/legal";

/**
 * Vorzeitiger Leistungsbeginn innerhalb der Widerrufsfrist (§ 356 Abs. 4, § 357a BGB).
 * Wird vom Buchungsablauf (Phase 3) genutzt: Pflicht-Checkbox, nicht vorausgewählt,
 * Zustimmung mit Zeitstempel in der Tabelle consents speichern und in der Bestätigungsmail wiederholen.
 */
export const EARLY_START_CONSENT_TEXT =
  "Ich verlange ausdrücklich, dass der Betrieb vor Ablauf der Widerrufsfrist mit der Leistung beginnt. Mir ist bekannt, dass ich " +
  "mein Widerrufsrecht verliere, wenn die Leistung vollständig erbracht ist, und dass ich bei einem Widerruf für die bis dahin " +
  "erbrachte Leistung anteiligen Wertersatz schulde.";

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
