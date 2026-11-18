import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" }, robots: { index: false } };

/**
 * Entwurf, Stand 18.11.2026. Beschreibt nur Verarbeitungen, die tatsächlich stattfinden.
 * Abschnitte für noch nicht aktive Dienste (Stripe, Mapbox, Resend) erst bei Aktivierung einfügen.
 */
export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>Stand: 18. November 2026</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Joe Becker, Republic Street 266, VLT 1112 Valletta, Malta
        <br />
        E-Mail: info@handwerker2go.com, Telefon: +356 7781 8522
      </p>

      <h2>2. Überblick</h2>
      <p>
        handwerker2go ist ein Online-Marktplatz, auf dem Kundinnen und Kunden Handwerksbetriebe finden und beauftragen können.
        Wir verarbeiten personenbezogene Daten nur, soweit das für den Betrieb der Website, die Vermittlung zwischen Kunden und
        Betrieben und die Erfüllung gesetzlicher Pflichten erforderlich ist. Wir setzen keine Werbe- oder Analyse-Tools ein und
        erstellen keine Nutzungsprofile.
      </p>

      <h2>3. Aufruf der Website und Server-Protokolle</h2>
      <p>
        Beim Aufruf der Website verarbeiten unser Hosting-Anbieter und unser Netzwerkdienstleister technisch notwendige Daten:
        IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Referrer-URL, Browser und Betriebssystem.
        Zweck ist die Auslieferung der Website, die Abwehr von Angriffen und die Fehleranalyse. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Server-Protokolle werden nach
        14 Tagen automatisch gelöscht.
      </p>

      <h2>4. Hosting</h2>
      <p>
        Die Website und die Datenbank laufen auf einem Server von Hostinger International Ltd. [Anschrift und Serverstandort
        prüfen; laut IP-Registrierung Rechenzentrum in Deutschland]. Mit dem Anbieter besteht [ein Vertrag zur
        Auftragsverarbeitung nach Art. 28 DSGVO, prüfen]. Die Daten werden in der Europäischen Union verarbeitet.
      </p>

      <h2>5. Cloudflare</h2>
      <p>
        Wir nutzen Dienste der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA: als Netzwerk und Schutz vor
        Angriffen (alle Aufrufe der Website laufen über Cloudflare), für die Verwaltung unserer Domain und als Speicher für
        verschlüsselte Datensicherungen (Speicherort Europäische Union). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Eine
        Übermittlung in die USA ist möglich; Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert. Mit Cloudflare
        besteht [ein Vertrag zur Auftragsverarbeitung, prüfen].
      </p>

      <h2 id="cookies">6. Cookies</h2>
      <p>
        Wir setzen keine Cookies für Werbung, Statistik oder Tracking. Nur wenn du dich anmeldest, speichern wir ein technisch
        notwendiges Sitzungs-Cookie (better-auth.session_token), damit du angemeldet bleibst. Es enthält eine zufällige Kennung
        und wird beim Abmelden oder spätestens nach 30 Tagen gelöscht. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG und Art. 6
        Abs. 1 lit. b DSGVO. Eine Einwilligung ist dafür nicht erforderlich.
      </p>

      <h2>7. Kundenkonto</h2>
      <p>
        Für ein Kundenkonto verarbeiten wir Name, E-Mail-Adresse, Passwort (nur verschlüsselt als Hash gespeichert) und
        freiwillig deine Telefonnummer sowie den Zeitpunkt, zu dem du den AGB zugestimmt hast. Zweck ist die Bereitstellung des
        Kontos und die Vermittlung von Aufträgen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Nach der Registrierung
        schicken wir dir eine E-Mail zur Bestätigung deiner Adresse. Die Daten werden gelöscht, wenn du dein Konto löschen lässt,
        soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
      </p>

      <h2>8. Registrierung von Handwerksbetrieben</h2>
      <p>
        Für die Registrierung eines Betriebs verarbeiten wir Firmenname, Rechtsform, Anschrift, Ansprechperson, E-Mail-Adresse,
        Telefonnummer, USt-IdNr., Leistungen, Einsatzgebiet, Beschreibung und den hochgeladenen gewerblichen Nachweis. Der
        Nachweis ist nur für unser Prüfteam sichtbar und wird nicht veröffentlicht. Zweck ist die Prüfung und Freischaltung des
        Betriebs, die Darstellung des öffentlichen Profils und die Abrechnung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        Öffentlich sichtbar sind nach der Freischaltung nur die Profilangaben des Betriebs, nicht Nachweise oder interne Daten.
      </p>

      <h2>9. Protokollierung von Änderungen</h2>
      <p>
        Wichtige Vorgänge wie Registrierungen, Freischaltungen und Änderungen an Finanzdaten protokollieren wir mit Zeitpunkt
        und handelnder Person, um Missbrauch aufzuklären und gesetzliche Nachweispflichten zu erfüllen. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. c und f DSGVO. [Aufbewahrungsdauer festlegen.]
      </p>

      <h2>10. E-Mail und Kontakt</h2>
      <p>
        Unsere E-Mail-Postfächer und der Versand von E-Mails der Website laufen über Google Workspace der Google Ireland
        Limited, Gordon House, Barrow Street, Dublin 4, Irland. Wenn du uns schreibst, verarbeiten wir deine Angaben zur
        Bearbeitung deiner Anfrage (Art. 6 Abs. 1 lit. b oder f DSGVO). Eine Übermittlung an die Google LLC in den USA ist
        möglich; Google ist nach dem EU-US Data Privacy Framework zertifiziert. Mit Google besteht [ein Vertrag zur
        Auftragsverarbeitung, prüfen].
      </p>

      <h2>11. Datensicherung</h2>
      <p>
        Wir erstellen täglich verschlüsselte Sicherungskopien unserer Daten, auf unserem Server und bei Cloudflare in der
        Europäischen Union. Sicherungen werden bis zu 12 Monate aufbewahrt und danach automatisch gelöscht. Gelöschte Daten
        können bis zu diesem Zeitpunkt noch in Sicherungen enthalten sein. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO und
        Art. 32 DSGVO.
      </p>

      <h2>12. Schriftarten und externe Inhalte</h2>
      <p>
        Die auf der Website verwendeten Schriften werden von unserem eigenen Server geladen. Beim Besuch der Website werden
        keine Inhalte von Drittanbietern wie Google Fonts, Social-Media-Plattformen oder Videodiensten eingebunden.
      </p>

      <p>
        [Bei Aktivierung ergänzen: Online-Zahlung über Stripe (Stripe Payments Europe Ltd., Irland), Karten und
        Adresssuche über Mapbox, E-Mail-Versand über Resend.]
      </p>

      <h2>13. Empfänger</h2>
      <p>
        Wenn du einen Auftrag erteilst oder eine Anfrage stellst, geben wir die dafür nötigen Angaben (Name, Adresse des
        Einsatzorts, Kontaktdaten, Beschreibung) an den ausgewählten Handwerksbetrieb weiter. Darüber hinaus geben wir Daten
        nur an die oben genannten Dienstleister oder an Behörden weiter, wenn wir dazu gesetzlich verpflichtet sind.
      </p>

      <h2>14. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter
        Interessen (Art. 21). Schreib uns dazu an info@handwerker2go.com.
      </p>
      <p>
        Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns zuständigen Behörde in
        Malta (Information and Data Protection Commissioner, idpc.org.mt) oder bei der Behörde deines Wohnorts.
      </p>

      <h2>15. Änderungen</h2>
      <p>
        Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die eingesetzten Dienste ändern. Es gilt die
        jeweils hier veröffentlichte Fassung.
      </p>
    </LegalPage>
  );
}
