import data from "./legal-data.json";

/**
 * Zentrale Betreiberdaten. Rechtstexte, E-Mails und Rechnungen lesen Betreiberdaten nur von hier
 * (Skripte unter scripts/ lesen dieselbe Datei legal-data.json).
 * Betreiber ist eine natürliche Person (Einzelunternehmer in Malta) mit Handelsname.
 */
export const LEGAL = data as {
  operatorName: string;
  vatRegistration: string;
  tradingName: string;
  address: string;
  addressLines: [string, string, string];
  email: string;
  phone: string;
  vatId: string;
  dsaContactEmail: string;
  jurisdictionCourt: string;
  withdrawalUrl: string;
  legalVersion: string;
};

/** Bisherige Schnittstelle, abgeleitet aus LEGAL (damit alle Stellen dieselben Daten nutzen) */
export const legal = {
  /** Inhaber (natürliche Person) */
  operatorPerson: LEGAL.operatorName,
  /** Handelsname */
  operatorName: LEGAL.tradingName,
  /** Anschrift in einer Zeile */
  operatorAddress: LEGAL.address,
  vatId: LEGAL.vatId,
  /** Kontakt für Widerruf, Kündigung und Fragen */
  email: LEGAL.email,
  phone: LEGAL.phone,
  /** Kostenlose Stornierung für Kunden bis so viele Stunden vor dem Termin */
  freeCancellationHours: 24,
  /** Pauschale bei späterer Stornierung oder Nichterscheinen, in Prozent des Festpreises (höchstens Anfahrtskosten) */
  lateCancellationPercent: 25,
  /** Gesetzliche Widerrufsfrist in Tagen */
  withdrawalDays: 14,
  /** Stand der Rechtstexte, wird in Zustimmungen mitgespeichert */
  termsVersion: LEGAL.legalVersion,
} as const;

/** „Joe Becker, handelnd unter „handwerker2go“, Anschrift“ für Fließtext */
export const operatorLine = () => `${LEGAL.operatorName}, handelnd unter „${LEGAL.tradingName}“, ${LEGAL.address}`;

/** Stand der Rechtstexte als „21.11.2026“ */
export const termsDate = () => LEGAL.legalVersion.split("-").reverse().join(".");
