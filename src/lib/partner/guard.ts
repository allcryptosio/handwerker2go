/**
 * Schutz vor Umgehung der Plattform: In öffentlichen Texten der Betriebe (Name, Beschreibung) sind keine
 * Kontaktdaten erlaubt. Kunden und Betriebe tauschen Kontaktdaten erst nach der Buchung aus (AGB für Betriebe § 7 Abs. 3).
 */
const patterns: { re: RegExp; label: string }[] = [
  { re: /[\w.+-]+\s*(@|\(at\)|\[at\]|\sat\s)\s*[\w-]+\s*(\.|\(dot\)|\[dot\]|\(punkt\)|\[punkt\]|\spunkt\s)\s*[a-z]{2,}/i, label: "E-Mail-Adresse" },
  { re: /(https?:\/\/|www\.)\S+|\b[\w-]+\.(de|com|net|org|info|eu|biz|io|hamburg)\b/i, label: "Website-Adresse" },
  { re: /(\+|\b00)\s?\d{1,3}[\s\-/()]*\d{2,}[\d\s\-/()]{4,}|\b0\d{2,5}[\s\-/()]*\d[\d\s\-/()]{4,}/, label: "Telefonnummer" },
  { re: /\b(whats\s?app|telegram|signal|instagram|facebook|tiktok|kleinanzeigen|ruf\s?(mich|uns)\s?an|direkt\s?kontakt)/i, label: "Hinweis auf Kontakt außerhalb der Plattform" },
];

/** Gibt die Art der gefundenen Kontaktangabe zurück oder null */
export function findContactData(text: string): string | null {
  for (const p of patterns) if (p.re.test(text)) return p.label;
  return null;
}

/** Gewerke, für die wir die Eintragung in die Handwerksrolle verlangen (zulassungspflichtig nach Anlage A HwO) */
export const MASTER_REQUIRED_CATEGORIES = ["elektriker", "sanitaer", "maler"] as const;

/** USt-IdNr. vergleichbar machen: Großbuchstaben ohne Leer- und Sonderzeichen */
export const normalizeVatId = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Telefonnummer vergleichbar machen: nur Ziffern, führende 0 → 49 */
export function normalizePhone(v: string) {
  const d = v.replace(/\D/g, "");
  return d.startsWith("00") ? d.slice(2) : d.startsWith("0") ? `49${d.slice(1)}` : d;
}
