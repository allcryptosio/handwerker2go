/**
 * Zentrale Angaben zum Plattformbetreiber für AGB, Widerrufsbelehrung und Ranking-Seite.
 * Rechtstexte lesen nur von hier. Sobald die Betreiberfirma registriert ist, hier eintragen.
 *
 * TODO(Betreiber): operatorName auf die eingetragene Firma ändern (aktuell Platzhalter = Marke).
 */
export const legal = {
  /** Name des Plattformbetreibers, wie er in AGB und Widerrufsbelehrung erscheint */
  operatorName: "handwerker2go",
  /** Straße und Postleitzahl */
  operatorAddress: "157 - 69 Patri Felicjan Bilocca St, MRS 1521",
  /** Ort des Sitzes, zugleich Gerichtsstand gegenüber Kaufleuten (§ 38 ZPO) */
  operatorCity: "Marsa (Malta)",
  /** Umsatzsteuer-Identifikationsnummer */
  vatId: "MT33258727",
  /** Kontakt für Widerruf, Kündigung und Fragen */
  email: "info@handwerker2go.com",
  phone: "+356 7781 8522",
  /** Kostenlose Stornierung für Kunden bis so viele Stunden vor dem Termin */
  freeCancellationHours: 24,
  /** Pauschale bei späterer Stornierung oder Nichterscheinen, in Prozent des Festpreises */
  lateCancellationPercent: 25,
  /** Gesetzliche Widerrufsfrist in Tagen */
  withdrawalDays: 14,
  /** Stand der Rechtstexte, wird in Zustimmungen mitgespeichert */
  termsVersion: "2026-11-18",
} as const;

/** "Name, Straße, Ort" für Fließtext */
export const operatorLine = () => `${legal.operatorName}, ${legal.operatorAddress} ${legal.operatorCity}`;
