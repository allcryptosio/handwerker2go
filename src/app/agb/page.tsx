import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "AGB", alternates: { canonical: "/agb" }, robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <h2>1. Rolle von handwerker2go</h2>
      <p>[handwerker2go betreibt einen Online-Marktplatz und vermittelt Leistungen selbstständiger Handwerksbetriebe. Der Vertrag über die Handwerkerleistung kommt zwischen Kunde und Betrieb zustande. Formulierung und Zahlungsabwicklung im Namen des Betriebs prüfen lassen.]</p>
      <h2>2. Nutzung für Kundinnen und Kunden</h2>
      <p>[Registrierung, Buchung, Angebotsanfrage, Zahlung, Stornierung, Bewertungen]</p>
      <h2>3. Bedingungen für Handwerksbetriebe</h2>
      <p>[Einführungsphase drei Monate ohne Grundgebühr mit 10 % Provision ab Freischaltung. Danach Mitgliedschaft nur nach ausdrücklicher Zustimmung: monatlich 29,99 € oder jährlich 299,88 €, jeweils 15 % Provision. Alle Preise für Betriebe sind Nettopreise; die Umsatzsteuer schuldet der Betrieb als Leistungsempfänger (Reverse-Charge-Verfahren), Rechnungen ergehen netto mit dem Hinweis „Reverse charge“. Laufzeiten, Kündigungsfristen, Kündigungsbutton nach § 312k BGB prüfen lassen.]</p>
      <h2>4. Haftung, Schlussbestimmungen</h2>
      <p>[prüfen lassen]</p>
    </LegalPage>
  );
}
