import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" }, robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>Verantwortlicher</h2>
      <p>[Firmenname, Anschrift, E-Mail] </p>
      <h2>Welche Daten wir verarbeiten</h2>
      <p>[Kontodaten, Adressen, Buchungen, Zahlungsdaten über Stripe, E-Mail-Versand über Resend, Kartendienst über Mapbox. Für jede Verarbeitung Zweck, Rechtsgrundlage und Speicherdauer angeben.]</p>
      <h2>Auftragsverarbeiter und Drittländer</h2>
      <p>[Supabase, Stripe, Resend, Mapbox, Hosting. Verträge zur Auftragsverarbeitung und Übermittlungsgrundlagen prüfen.]</p>
      <h2 id="cookies">Cookies und lokale Speicherung</h2>
      <p>
        Diese Website setzt derzeit keine Cookies für Werbung oder Statistik. Technisch notwendige Speicherungen, etwa für die
        Anmeldung, kommen mit dem Kundenkonto hinzu. Sobald optionale Dienste eingebunden werden, erscheint hier eine
        Einstellungsmöglichkeit für die Einwilligung.
      </p>
      <h2>Deine Rechte</h2>
      <p>[Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei einer Aufsichtsbehörde]</p>
    </LegalPage>
  );
}
