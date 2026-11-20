import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" }, robots: { index: false } };

/**
 * Entwurf, Stand 18.11.2026. Beschreibt nur Verarbeitungen, die tatsächlich stattfinden.
 * Abschnitte für noch nicht aktive Dienste (Mapbox, Resend) erst bei Aktivierung einfügen.
 */
export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>Stand: 18. November 2026</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Joe Becker, 157 - 69 Patri Felicjan Bilocca St, MRS 1521 Marsa, Malta
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
        schicken wir dir eine E-Mail zur Bestätigung deiner Adresse. Die Kontodaten speichern wir, bis du dein Konto löschen
        lässt. Danach gelten nur noch die Restfristen für Buchungs- und Abrechnungsdaten aus Abschnitt 16.
      </p>

      <h2>8. Registrierung von Handwerksbetrieben</h2>
      <p>
        Für die Registrierung eines Betriebs verarbeiten wir Firmenname, Rechtsform, Anschrift, Ansprechperson, E-Mail-Adresse,
        Telefonnummer, USt-IdNr., Leistungen, Einsatzgebiet, Beschreibung und den hochgeladenen gewerblichen Nachweis. Der
        Nachweis ist nur für unser Prüfteam sichtbar und wird nicht veröffentlicht. Zweck ist die Prüfung und Freischaltung des
        Betriebs, die Darstellung des öffentlichen Profils und die Abrechnung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        Öffentlich sichtbar sind nach der Freischaltung nur die Profilangaben des Betriebs, nicht Nachweise oder interne Daten.
      </p>

      <h2>9. Terminsuche und Buchungen</h2>
      <p>
        Für die Suche nach freien Betrieben verarbeiten wir die gewählte Leistung, die Postleitzahl oder den Ort sowie Tag und
        Uhrzeit. Diese Suchangaben speichern wir nicht dauerhaft. Für die Entfernung nutzen wir eine Postleitzahlen-Datenbank auf
        unserem eigenen Server; dabei werden keine Daten an Kartendienste übermittelt.
      </p>
      <p>
        Wenn du buchst, speichern wir Leistung, Termin, Adresse des Einsatzorts, Name, Telefonnummer, E-Mail-Adresse, deine
        Hinweise und freiwillig hochgeladene Fotos sowie, falls erforderlich, deine Erklärung zum Beginn der Leistung vor Ablauf
        der Widerrufsfrist mit Zeitpunkt. Diese Angaben erhält der gebuchte Betrieb, damit er den Auftrag ausführen kann. Fotos
        sind nur für dich, den Betrieb und unser Supportteam sichtbar. Zweck ist die Vermittlung und Abwicklung des Auftrags,
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Wie lange wir Buchungsdaten, Fotos und Abrechnungsdaten nach Abschluss
        aufbewahren, steht gestaffelt in Abschnitt 16.
      </p>

      <h2>10. Online-Zahlung über Stripe</h2>
      <p>
        Zahlungen wickeln wir über Stripe ab (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock,
        Dublin, D02 H210, Irland). Bei einer Buchung gibst du deine Zahlungsdaten direkt auf einer Seite von Stripe ein; wir
        erhalten keine vollständigen Karten- oder Kontodaten. Empfänger der Zahlung ist der gebuchte Betrieb; Stripe übermittelt
        uns den Zahlungsstatus und den einbehaltenen Provisionsbetrag. Für Handwerksbetriebe verarbeitet Stripe zusätzlich die
        Angaben zur Identitäts- und Unternehmensprüfung sowie die Bankverbindung, für die Mitgliedschaft die Rechnungsdaten.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Stripe verarbeitet bestimmte Daten zur Betrugsprävention und zur
        Erfüllung gesetzlicher Pflichten in eigener Verantwortung; Einzelheiten stehen in der Datenschutzerklärung von Stripe
        unter stripe.com/de/privacy. Eine Übermittlung an Stripe, Inc. in den USA ist möglich; Stripe ist nach dem EU-US Data
        Privacy Framework zertifiziert.
      </p>

      <h2>11. Protokollierung von Änderungen</h2>
      <p>
        Wichtige Vorgänge wie Registrierungen, Freischaltungen und Änderungen an Finanzdaten protokollieren wir mit Zeitpunkt
        und handelnder Person, um Missbrauch aufzuklären und gesetzliche Nachweispflichten zu erfüllen. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. c und f DSGVO. [Aufbewahrungsdauer festlegen.]
      </p>

      <h2>12. E-Mail und Kontakt</h2>
      <p>
        Unsere E-Mail-Postfächer und der Versand von E-Mails der Website laufen über Google Workspace der Google Ireland
        Limited, Gordon House, Barrow Street, Dublin 4, Irland. Wenn du uns schreibst, verarbeiten wir deine Angaben zur
        Bearbeitung deiner Anfrage (Art. 6 Abs. 1 lit. b oder f DSGVO). Eine Übermittlung an die Google LLC in den USA ist
        möglich; Google ist nach dem EU-US Data Privacy Framework zertifiziert. Mit Google besteht [ein Vertrag zur
        Auftragsverarbeitung, prüfen].
      </p>

      <h2>13. Datensicherung</h2>
      <p>
        Wir erstellen täglich verschlüsselte Sicherungskopien unserer Daten, auf unserem Server und bei Cloudflare in der
        Europäischen Union. Sicherungen werden bis zu 12 Monate aufbewahrt und danach automatisch gelöscht. Gelöschte Daten
        können bis zu diesem Zeitpunkt noch in Sicherungen enthalten sein. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO und
        Art. 32 DSGVO.
      </p>

      <h2>14. Schriftarten und externe Inhalte</h2>
      <p>
        Die auf der Website verwendeten Schriften werden von unserem eigenen Server geladen. Beim Besuch der Website werden
        keine Inhalte von Drittanbietern wie Google Fonts, Social-Media-Plattformen oder Videodiensten eingebunden.
      </p>


      <h2>15. Empfänger</h2>
      <p>
        Wenn du einen Auftrag erteilst oder eine Anfrage stellst, geben wir die dafür nötigen Angaben (Name, Adresse des
        Einsatzorts, Kontaktdaten, Beschreibung) an den ausgewählten Handwerksbetrieb weiter. Darüber hinaus geben wir Daten
        nur an die oben genannten Dienstleister oder an Behörden weiter, wenn wir dazu gesetzlich verpflichtet sind.
      </p>

      <h2 id="speicherdauer">16. Speicherdauer</h2>
      <p>
        Wir speichern deine Daten nur so lange, wie wir sie für den jeweiligen Zweck brauchen oder gesetzlich aufbewahren müssen.
        Bei Buchungen geht das in Stufen: Während die Buchung läuft, brauchen wir alle Angaben. Nach dem Abschluss behalten wir
        die Angaben zur Buchung so lange, wie noch Ansprüche geltend gemacht werden können. Abrechnungsdaten müssen wir länger
        aufbewahren, weil das Steuerrecht es verlangt. Danach löschen oder anonymisieren wir die Daten.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px] leading-snug">
          <thead>
            <tr className="border-b-2 border-line-strong align-bottom">
              <th className="py-2 pr-3">Datenkategorie</th>
              <th className="py-2 pr-3">Zweck</th>
              <th className="py-2 pr-3">Rechtsgrundlage</th>
              <th className="py-2 pr-3">Speicherdauer</th>
              <th className="py-2">Quelle</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(a) Laufende Buchung: alle Angaben zur Buchung</td>
              <td className="py-2 pr-3">Vermittlung und Durchführung der Buchung</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. b DSGVO</td>
              <td className="py-2 pr-3">solange die Buchung läuft und abgewickelt wird</td>
              <td className="py-2">Vertrag</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(b) Buchungsdaten nach Abschluss: Kontaktdaten, Einsatzadresse, Beschreibung, Erklärung zum vorzeitigen Leistungsbeginn</td>
              <td className="py-2 pr-3">Abwehr von Ansprüchen, z. B. bei Stornierung, Erstattung, Rückbuchung (Chargeback) oder Beschwerde</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. f DSGVO</td>
              <td className="py-2 pr-3">3 Jahre ab Ende des Kalenderjahres, in dem die Buchung abgeschlossen wurde; bei einem anhängigen Streit bis zu dessen Erledigung zuzüglich der restlichen Verjährungsfrist</td>
              <td className="py-2">§§ 195, 199 BGB; Art. 6 Rom-I-Verordnung</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(c) Abrechnungsdaten: Provisionsrechnungen, Abo-Rechnungen, Belege zu Auszahlungen und Provisionen über Stripe, Buchhaltung</td>
              <td className="py-2 pr-3">Gesetzliche Aufbewahrung</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. c DSGVO</td>
              <td className="py-2 pr-3">9 Jahre nach Abschluss des jeweiligen Vorgangs</td>
              <td className="py-2">Income Tax Management Act (Malta), Cap. 372, Art. 19 Abs. 5; damit abgedeckt: VAT Act, Cap. 406, Art. 48 Abs. 4 (mindestens 6 Jahre ab Jahresende) und Commercial Code, Cap. 13, Art. 26 (5 Jahre)</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(d) Meldedaten zu Handwerksbetrieben nach DAC7 (nur falls anwendbar)</td>
              <td className="py-2 pr-3">Erfüllung von Meldepflichten als Plattformbetreiber</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. c DSGVO</td>
              <td className="py-2 pr-3">mindestens 5 Jahre ab Ende des betreffenden Jahres; soweit es zugleich Steuerunterlagen sind, 9 Jahre</td>
              <td className="py-2">S.L. 123.127 (Malta), Reg. 13(12)(i) [prüfen: Anwendbarkeit auf Einzelunternehmer als natürliche Person]</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(e) Fotos und Freitext aus Angebotsanfragen</td>
              <td className="py-2 pr-3">Vorbereitung und Durchführung des Auftrags</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. b DSGVO; Datenminimierung nach Art. 5 Abs. 1 lit. e DSGVO</td>
              <td className="py-2 pr-3">Löschung 12 Monate nach Abschluss der Buchung; bei einem anhängigen Streit wie (b)</td>
              <td className="py-2">keine gesetzliche Mindestfrist</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-3">(f) Server-Protokolle</td>
              <td className="py-2 pr-3">Sicherer und stabiler Betrieb (siehe Abschnitt 3)</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. f DSGVO</td>
              <td className="py-2 pr-3">14 Tage</td>
              <td className="py-2">berechtigtes Interesse</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">(f) Kontodaten von Kunden und Betrieben</td>
              <td className="py-2 pr-3">Bereitstellung des Kontos</td>
              <td className="py-2 pr-3">Art. 6 Abs. 1 lit. b DSGVO</td>
              <td className="py-2 pr-3">bis zur Löschung des Kontos; danach nur noch die Restfristen aus (b) bis (e)</td>
              <td className="py-2">Vertrag</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Den Streitfall regeln wir so: Ist zu einer Buchung ein Streit anhängig, etwa eine Rückbuchung, eine Beschwerde oder ein
        Verfahren, bewahren wir die Angaben aus (b) und (e) bis zur Erledigung und danach für die restliche Verjährungsfrist auf.
        Ansprüche wegen Mängeln an der Handwerkerleistung richtest du an den Betrieb, der dein Vertragspartner ist.
      </p>
      <p>
        Nach Ablauf der Fristen löschen oder anonymisieren wir die Daten. Von einer Buchung bleibt dann nur der Teil, den wir
        für die Abrechnung brauchen (zum Beispiel Buchungsnummer, Datum, Betrag, Provision, Betrieb), für 9 Jahre gespeichert.
        In Sicherungskopien können gelöschte Daten noch bis zu 12 Monate enthalten sein (Abschnitt 13). [prüfen: technische
        Umsetzung der automatischen Löschung]
      </p>
      <p className="font-semibold">Keine Rechtsberatung, vor Livegang prüfen lassen.</p>

      <h2>17. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter
        Interessen (Art. 21). Schreib uns dazu an info@handwerker2go.com.
      </p>
      <p>
        Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns zuständigen Behörde in
        Malta (Information and Data Protection Commissioner, idpc.org.mt) oder bei der Behörde deines Wohnorts.
      </p>

      <h2>18. Änderungen</h2>
      <p>
        Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die eingesetzten Dienste ändern. Es gilt die
        jeweils hier veröffentlichte Fassung.
      </p>
    </LegalPage>
  );
}
