/** Texte für den Unternehmer-Nachweis (Anhang F), Version wird mit der Erklärung gespeichert */
export const UNTERNEHMER_DECLARATION_TEXT =
  "Ich erkläre, dass ich (bzw. der angemeldete Betrieb) als Unternehmer im Sinne des Umsatzsteuergesetzes tätig bin und die Leistungen von handwerker2go für mein Unternehmen beziehe. Die hochgeladene Gewerbeanmeldung und die Angaben zur Steuernummer sind aktuell. Mir ist bekannt, dass ich auf Provision und Mitgliedschaft die deutsche Umsatzsteuer nach § 13b UStG selbst schulde und anmelden muss, auch als Kleinunternehmer.";
export const UNTERNEHMER_DECLARATION_VERSION = "F.1-2026-11-21";

export const WEG_B_HINT =
  "Tipp: Auch Kleinunternehmer können beim Bundeszentralamt für Steuern (BZSt) kostenlos eine USt-IdNr. beantragen. Damit geht die Prüfung schneller. Du kannst sie jederzeit im Dashboard nachtragen.";

/** Steuernummer: 10 bis 13 Ziffern, mit / oder Leerzeichen */
export const isSteuernummer = (v: string) => /^[0-9][0-9 /]{8,18}[0-9]$/.test(v.trim()) && v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 13;
