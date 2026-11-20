/**
 * Zentrale Angaben zum Plattformbetreiber für AGB, Widerrufsbelehrung und Ranking-Seite.
 * Rechtstexte lesen nur von hier. Betreiber ist eine natürliche Person (Einzelunternehmer in Malta) mit Handelsname.
 */
export const legal = {
  /** Inhaber (natürliche Person), wie im Impressum */
  operatorPerson: "Joe Becker",
  /** Handelsname */
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
  termsVersion: "2026-11-20",
} as const;

/** "Name, Straße, Ort" für Fließtext */
export const operatorLine = () =>
  `${legal.operatorPerson}, handelnd unter „${legal.operatorName}“, ${legal.operatorAddress} Marsa, Malta`;

/** Stand der Rechtstexte als „20.11.2026“ */
export const termsDate = () => legal.termsVersion.split("-").reverse().join(".");
