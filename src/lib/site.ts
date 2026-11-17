/** Grundeinstellungen der Website. Später teilweise aus dem Admin-Dashboard. */
export const site = {
  name: "handwerker2go",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://handwerker2go.com",
  locale: "de_DE",
  timeZone: "Europe/Berlin",
  currency: "EUR",
  description:
    "Geprüfte Handwerksbetriebe in deiner Nähe: Festpreis sehen, Termin wählen, online bezahlen. Gestartet in Hamburg.",
  /** Startstadt. In Phase 2 kommen Städte aus der Datenbank (Tabelle cities). */
  defaultCity: "hamburg",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
