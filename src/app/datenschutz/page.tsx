import type { Metadata } from "next";
import Link from "next/link";
import { Email } from "@/components/legal/email";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine, termsDate } from "@/config/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Wie handwerker2go personenbezogene Daten verarbeitet: Konto, Buchungen, Zahlung über Stripe, Cookies, Speicherdauer und deine Rechte.",
  alternates: { canonical: "/datenschutz" },
};

/**
 * Datenschutzerklärung nach Art. 13 DSGVO. Beschreibt nur Verarbeitungen, die tatsächlich stattfinden.
 * Offene Prüfpunkte: docs/RECHTLICHE-PRUEFUNGEN.md. Nicht genutzte Dienste (z. B. Kartendienste, Analyse) nicht aufnehmen.
 */
const th = "py-2 pr-3 text-left align-bottom font-semibold text-ink";
const td = "py-2 pr-3 align-top";

export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>Stand: {termsDate()}</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {operatorLine()}
        <br />
        E-Mail: <Email />, Telefon: {legal.phone}
      </p>
      <p>Einen Datenschutzbeauftragten haben wir nicht benannt. Für alle Fragen zum Datenschutz erreichst du uns unter <Email />.</p>

      <h2>2. Überblick</h2>
      <p>
        handwerker2go ist ein Online-Marktplatz: Du findest dort selbstständige Handwerksbetriebe, siehst ihre freien Termine und
        buchst sie direkt. Den Vertrag über die Handwerkerleistung schließt du mit dem Betrieb, nicht mit uns. Wir verarbeiten
        personenbezogene Daten nur, soweit das für den Betrieb der Website, die Vermittlung zwischen dir und den Betrieben, die
        Abrechnung mit den Betrieben und die Erfüllung gesetzlicher Pflichten nötig ist. Wir setzen keine Analyse- oder
        Werbedienste ein und erstellen keine Nutzungsprofile.
      </p>

      <h2>3. Aufruf der Website und Server-Protokolle</h2>
      <p>
        Beim Aufruf der Website verarbeiten wir technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite,
        übertragene Datenmenge, Referrer-URL, Browser und Betriebssystem. Zweck ist die Auslieferung der Website, die Abwehr von
        Angriffen und die Fehleranalyse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist ein
        sicherer und stabiler Betrieb der Website. Unsere Server-Protokolle werden nach 14 Tagen automatisch gelöscht.
      </p>

      <h2>4. Hosting</h2>
      <p>
        Website und Datenbank laufen auf einem Server der Hostinger International Ltd. in einem Rechenzentrum in Frankfurt am
        Main, Deutschland. Hostinger verarbeitet die Daten in unserem Auftrag (Art. 28 DSGVO).
      </p>

      <h2>5. Cloudflare</h2>
      <p>
        Alle Aufrufe der Website laufen über das Netzwerk der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA.
        Cloudflare schützt die Website vor Angriffen, liefert sie schnell aus und verwaltet unsere Domain. Dabei verarbeitet
        Cloudflare die Verbindungsdaten aus Abschnitt 3. Über die Funktion „Network Error Logging“ sammelt Cloudflare außerdem
        technische Fehlerberichte zu fehlgeschlagenen Verbindungen. Zusätzlich speichern wir verschlüsselte Datensicherungen bei
        Cloudflare in der Europäischen Union (Abschnitt 14). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes
        Interesse ist ein sicherer, schneller und ausfallsicherer Betrieb. Cloudflare verarbeitet die Daten in unserem Auftrag
        (Art. 28 DSGVO). Zur Übermittlung in die USA siehe Abschnitt 18.
      </p>

      <h2 id="cookies">6. Cookies und Speicher im Browser</h2>
      <p>
        Wir verwenden nur ein einziges, technisch notwendiges Cookie, und zwar erst, wenn du dich anmeldest. Andere Cookies,
        Analyse- oder Marketing-Tools und Speicher im Browser (Local Storage) setzen wir nicht ein. Deshalb gibt es bei uns kein
        Cookie-Banner: Für technisch notwendige Cookies ist keine Einwilligung nötig.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[14px] leading-snug">
          <thead>
            <tr className="border-b-2 border-line-strong">
              <th className={th}>Name</th><th className={th}>Anbieter</th><th className={th}>Zweck</th>
              <th className={th}>Laufzeit</th><th className={th}>Notwendig</th><th className={th}>Rechtsgrundlage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${td} break-all`}>__Secure-better-auth.session_token</td>
              <td className={td}>handwerker2go</td>
              <td className={td}>Hält dich nach der Anmeldung angemeldet</td>
              <td className={td}>bis zur Abmeldung, höchstens 30 Tage</td>
              <td className={td}>ja</td>
              <td className={td}>§ 25 Abs. 2 Nr. 2 TDDDG; Art. 6 Abs. 1 lit. b DSGVO</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Zum Bezahlen leiten wir dich auf eine Bezahlseite von Stripe weiter. Dort gelten die Hinweise von Stripe zu Cookies
        (stripe.com/de/privacy). Auf unseren eigenen Seiten laden wir keine Skripte von Stripe oder anderen Anbietern; auch unsere
        Schriften liegen auf unserem eigenen Server.
      </p>

      <h2>7. Kundenkonto</h2>
      <p>
        Für ein Kundenkonto verarbeiten wir Name, E-Mail-Adresse, Passwort (nur verschlüsselt als Hash gespeichert), freiwillig
        deine Telefonnummer und den Zeitpunkt, zu dem du den AGB zugestimmt hast. Nach der Registrierung schicken wir dir eine
        E-Mail, mit der du deine Adresse bestätigst. Zweck ist die Bereitstellung des Kontos und die Abwicklung deiner Buchungen;
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Kontodaten speichern wir, bis du dein Konto löschen lässt; danach
        gelten nur noch die Fristen aus Abschnitt 16.
      </p>

      <h2>8. Konto für Handwerksbetriebe</h2>
      <p>
        Für die Registrierung eines Betriebs verarbeiten wir Firmenname, Rechtsform, Anschrift, Ansprechperson, E-Mail-Adresse,
        Telefonnummer, Passwort (als Hash), freiwillig die USt-IdNr., die angebotenen Sparten und Leistungen mit Preisen,
        Einsatzgebiet, Arbeitszeiten, Beschreibung, Logo und einen gewerblichen Nachweis. Den Nachweis sieht nur unser Prüfteam;
        er wird nicht veröffentlicht. Zweck ist die Prüfung und Freischaltung, das öffentliche Profil, die Terminplanung und die
        Abrechnung; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Öffentlich sichtbar sind nur Profilangaben, Leistungen,
        Preise und Bewertungen des Betriebs.
      </p>

      <h2>9. Terminsuche, Buchungen und Angebotsanfragen</h2>
      <p>
        Für die Suche verarbeiten wir Leistung, Postleitzahl oder Ort, Tag und Uhrzeit. Diese Suchangaben speichern wir nicht
        dauerhaft. Die Entfernung berechnen wir mit einer Postleitzahlen-Datenbank auf unserem eigenen Server, ohne externe
        Kartendienste.
      </p>
      <p>
        Wenn du buchst oder einen Besichtigungstermin für ein Angebot anfragst, speichern wir Leistung, Termin, Einsatzadresse,
        Name, Telefonnummer, E-Mail-Adresse, deine Hinweise und Beschreibung, freiwillig hochgeladene Fotos und, falls nötig,
        deine Erklärung zum Beginn der Leistung vor Ablauf der Widerrufsfrist mit Zeitpunkt. Zweck ist die Vermittlung und
        Abwicklung des Auftrags; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
      </p>
      <p>
        <b>Weitergabe an den Betrieb:</b> Den gebuchten Betrieb informieren wir mit Name, Einsatzadresse, Kontaktdaten, Hinweisen,
        Beschreibung und Fotos, damit er den Auftrag ausführen kann. Der Betrieb verarbeitet diese Daten als eigener
        Verantwortlicher für die Durchführung deines Vertrags mit ihm. Fragen zur Verarbeitung beim Betrieb richtest du an den
        Betrieb; seine Kontaktdaten stehen in der Buchungsbestätigung.
      </p>

      <h2>10. Zahlung über Stripe</h2>
      <p>
        Zahlungen wickeln wir über Stripe ab (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin,
        D02 H210, Irland). Du gibst deine Zahlungsdaten direkt auf einer Seite von Stripe ein, zum Beispiel für Karte, Apple Pay
        oder Google Pay. Wir erhalten keine vollständigen Karten- oder Kontodaten, sondern nur Zahlungsstatus, Betrag und
        Kennungen der Zahlung. Empfänger der Zahlung ist der gebuchte Betrieb; Stripe zahlt den Betrag an ihn aus und behält
        dabei unsere Provision ein. Erstattungen, zum Beispiel nach einer Stornierung, laufen ebenfalls über Stripe.
      </p>
      <p>
        Handwerksbetriebe richten für den Empfang von Zahlungen ein eigenes Konto bei Stripe ein. Dabei prüft Stripe Identität,
        Unternehmen und Bankverbindung. Diese Angaben erhebt Stripe direkt; wir erhalten nur den Status des Kontos. Die
        Mitgliedschaft der Betriebe und unsere Provisionsrechnungen rechnen wir ebenfalls über Stripe ab.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, für steuerliche Pflichten Art. 6 Abs. 1 lit. c DSGVO. Stripe verarbeitet
        Daten zur Betrugsprävention, zur Prüfung von Identitäten und zur Erfüllung gesetzlicher Pflichten in eigener
        Verantwortung; Einzelheiten stehen in der Datenschutzerklärung von Stripe unter stripe.com/de/privacy.
      </p>

      <h2>11. Bewertungen</h2>
      <p>
        Bewerten kann nur, wer über handwerker2go gebucht hat und dessen Auftrag abgeschlossen ist. Wir speichern Sterne, Text,
        Datum und die Zuordnung zur Buchung. Öffentlich erscheinen Sterne, Text und Datum; deinen Nachnamen, deine Kontaktdaten und
        deine Adresse veröffentlichen wir nicht. Zweck ist die Information anderer Kundinnen und Kunden und die Echtheit der
        Bewertungen; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Bewertungen speichern wir, solange das Profil des Betriebs
        besteht oder bis du sie löschen lässt.
      </p>

      <h2>12. E-Mails</h2>
      <p>
        Wir schicken dir E-Mails, die für dein Konto und deine Buchungen nötig sind, zum Beispiel zur Bestätigung deiner Adresse,
        Buchungsbestätigungen, Absagen und Erstattungen. Werbe-Newsletter verschicken wir nicht. Unsere Postfächer und der Versand
        laufen über Google Workspace der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, die die Daten in
        unserem Auftrag verarbeitet (Art. 28 DSGVO). Wenn du uns schreibst, verarbeiten wir deine Angaben zur Bearbeitung deiner
        Anfrage (Art. 6 Abs. 1 lit. b DSGVO, sonst lit. f mit dem berechtigten Interesse, Anfragen zu beantworten).
      </p>

      <h2>13. Protokollierung von Änderungen</h2>
      <p>
        Wichtige Vorgänge wie Registrierungen, Freischaltungen, Buchungen, Stornierungen und Änderungen an Zahlungsdaten
        protokollieren wir mit Zeitpunkt und handelnder Person. Zweck ist die Aufklärung von Missbrauch und der Nachweis
        ordnungsgemäßer Abläufe; Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, soweit Abrechnungen betroffen sind lit. c.
        Protokolleinträge bewahren wir höchstens 9 Jahre auf.
      </p>

      <h2>14. Datensicherung</h2>
      <p>
        Wir erstellen täglich verschlüsselte Sicherungskopien unserer Daten, auf unserem Server und bei Cloudflare in der
        Europäischen Union. Sicherungen werden höchstens 12 Monate aufbewahrt und danach automatisch gelöscht; so lange können
        gelöschte Daten noch in Sicherungen enthalten sein. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO in Verbindung mit
        Art. 32 DSGVO; unser berechtigtes Interesse ist der Schutz vor Datenverlust.
      </p>

      <h2>15. Meldepflichten für Plattformbetreiber (DAC7)</h2>
      <p>
        Plattformbetreiber in der EU können verpflichtet sein, Angaben zu Anbietern und deren Einnahmen an die Steuerbehörden zu
        melden (Richtlinie (EU) 2021/514, „DAC7“, in Malta umgesetzt durch S.L. 123.127). Sofern und sobald diese Pflicht für uns
        gilt, verarbeiten wir dafür Angaben zu den Handwerksbetrieben wie Name, Anschrift, Steuer- und Umsatzsteuer-Nummer,
        Bankverbindung und die über die Plattform erzielten Umsätze und melden sie an die maltesische Steuerbehörde.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. c DSGVO. Daten von Kundinnen und Kunden sind davon nicht betroffen.
      </p>

      <h2 id="speicherdauer">16. Speicherdauer</h2>
      <p>
        Wir speichern Daten nur so lange, wie wir sie für den jeweiligen Zweck brauchen oder gesetzlich aufbewahren müssen. Bei
        Buchungen geht das in Stufen: Während die Buchung läuft, brauchen wir alle Angaben. Nach dem Abschluss behalten wir die
        Angaben zur Buchung so lange, wie noch Ansprüche geltend gemacht werden können. Abrechnungsdaten bewahren wir länger auf,
        weil das Steuerrecht es verlangt. Danach löschen oder anonymisieren wir die Daten automatisch.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[14px] leading-snug">
          <thead>
            <tr className="border-b-2 border-line-strong">
              <th className={th}>Datenkategorie</th><th className={th}>Zweck</th><th className={th}>Rechtsgrundlage</th>
              <th className={th}>Speicherdauer</th><th className={th}>Quelle</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className={td}>Laufende Buchung: alle Angaben zur Buchung</td>
              <td className={td}>Vermittlung und Durchführung</td>
              <td className={td}>Art. 6 Abs. 1 lit. b DSGVO</td>
              <td className={td}>solange die Buchung läuft und abgewickelt wird</td>
              <td className={td}>Vertrag</td>
            </tr>
            <tr className="border-b border-line">
              <td className={td}>Buchungsdaten nach Abschluss: Kontaktdaten, Einsatzadresse, Beschreibung, Erklärung zum vorzeitigen Leistungsbeginn</td>
              <td className={td}>Abwehr von Ansprüchen, etwa bei Stornierung, Erstattung, Rückbuchung (Chargeback) oder Beschwerde</td>
              <td className={td}>Art. 6 Abs. 1 lit. f DSGVO</td>
              <td className={td}>3 Jahre ab Ende des Kalenderjahres, in dem die Buchung abgeschlossen wurde; bei einem anhängigen Streit bis zu dessen Erledigung zuzüglich der restlichen Verjährungsfrist</td>
              <td className={td}>§§ 195, 199 BGB; Art. 6 Rom-I-Verordnung</td>
            </tr>
            <tr className="border-b border-line">
              <td className={td}>Abrechnungsdaten: Provisions- und Abo-Rechnungen, Belege zu Zahlungen, Auszahlungen und Provisionen, Buchhaltung</td>
              <td className={td}>Gesetzliche Aufbewahrung</td>
              <td className={td}>Art. 6 Abs. 1 lit. c DSGVO</td>
              <td className={td}>9 Jahre nach Abschluss des jeweiligen Vorgangs</td>
              <td className={td}>Income Tax Management Act (Malta), Cap. 372, Art. 19 Abs. 5; umfasst VAT Act, Cap. 406, Art. 48 Abs. 4 und Commercial Code, Cap. 13, Art. 26</td>
            </tr>
            <tr className="border-b border-line">
              <td className={td}>Meldedaten zu Handwerksbetrieben (DAC7), soweit die Meldepflicht für uns gilt</td>
              <td className={td}>Erfüllung von Meldepflichten</td>
              <td className={td}>Art. 6 Abs. 1 lit. c DSGVO</td>
              <td className={td}>mindestens 5 Jahre ab Ende des betreffenden Jahres; soweit zugleich Steuerunterlagen, 9 Jahre</td>
              <td className={td}>S.L. 123.127 (Malta), Reg. 13(12)(i)</td>
            </tr>
            <tr className="border-b border-line">
              <td className={td}>Fotos und Freitext aus Angebotsanfragen</td>
              <td className={td}>Vorbereitung und Durchführung des Auftrags</td>
              <td className={td}>Art. 6 Abs. 1 lit. b DSGVO; Datenminimierung (Art. 5 Abs. 1 lit. e DSGVO)</td>
              <td className={td}>12 Monate nach Abschluss der Buchung; bei einem anhängigen Streit wie Buchungsdaten</td>
              <td className={td}>keine gesetzliche Mindestfrist</td>
            </tr>
            <tr className="border-b border-line">
              <td className={td}>Server-Protokolle</td>
              <td className={td}>Sicherer und stabiler Betrieb</td>
              <td className={td}>Art. 6 Abs. 1 lit. f DSGVO</td>
              <td className={td}>14 Tage</td>
              <td className={td}>berechtigtes Interesse</td>
            </tr>
            <tr>
              <td className={td}>Kontodaten von Kunden und Betrieben</td>
              <td className={td}>Bereitstellung des Kontos</td>
              <td className={td}>Art. 6 Abs. 1 lit. b DSGVO</td>
              <td className={td}>bis zur Löschung des Kontos; danach nur die Fristen der übrigen Zeilen</td>
              <td className={td}>Vertrag</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Ist zu einer Buchung ein Streit anhängig, etwa eine Rückbuchung, eine Beschwerde oder ein Verfahren, bewahren wir
        Buchungsdaten, Fotos und Texte bis zur Erledigung und danach für die restliche Verjährungsfrist auf. Ansprüche wegen
        Mängeln an der Handwerkerleistung richtest du an den Betrieb, der dein Vertragspartner ist. Nach Ablauf der Fristen bleibt
        von einer Buchung nur der Teil gespeichert, den wir für die Abrechnung brauchen (Buchungsnummer, Datum, Betrag,
        Provision, Betrieb).
      </p>

      <h2>17. Empfänger</h2>
      <p>
        Personenbezogene Daten erhalten nur: der von dir gebuchte Betrieb (Abschnitt 9), Stripe (Abschnitt 10), unsere
        Dienstleister Hostinger, Cloudflare und Google, die in unserem Auftrag handeln (Abschnitte 4, 5 und 12), sowie Behörden,
        wenn wir gesetzlich dazu verpflichtet sind (Abschnitt 15). Wir verkaufen keine Daten.
      </p>

      <h2>18. Übermittlung in Drittländer</h2>
      <p>
        Eine Übermittlung in die USA ist bei Cloudflare, Stripe und Google möglich. Diese Anbieter sind nach dem EU-US Data
        Privacy Framework zertifiziert, für das ein Angemessenheitsbeschluss der EU-Kommission besteht (Art. 45 DSGVO). Ergänzend
        sehen ihre Verträge die Standardvertragsklauseln der EU-Kommission vor (Art. 46 Abs. 2 lit. c DSGVO).
      </p>

      <h2>19. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Soweit wir Daten auf Grundlage einer Einwilligung verarbeiten,
        kannst du sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO).
      </p>
      <p>
        <b>Widerspruchsrecht (Art. 21 DSGVO):</b> Soweit wir Daten auf Grundlage berechtigter Interessen verarbeiten (Art. 6
        Abs. 1 lit. f DSGVO), kannst du aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen.
        Wir verarbeiten die Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen oder die
        Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
      </p>
      <p>
        Eine automatisierte Entscheidung, die dir gegenüber rechtliche Wirkung entfaltet oder dich ähnlich erheblich
        beeinträchtigt (Art. 22 DSGVO), findet nicht statt. Die Reihenfolge der Suchergebnisse berechnen wir automatisch nach
        festen Kriterien; sie ist auf der Seite <Link href="/ranking" className="underline">So sortieren wir</Link> erklärt.
      </p>
      <p>Für alle Anliegen genügt eine E-Mail an <Email />.</p>

      <h2>20. Beschwerde bei einer Aufsichtsbehörde</h2>
      <p>
        Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Für uns zuständig ist das Office of the Information and
        Data Protection Commissioner in Malta (idpc.org.mt). Du kannst dich auch an die Aufsichtsbehörde an deinem Wohnort oder
        Arbeitsplatz wenden, in Hamburg etwa an den Hamburgischen Beauftragten für Datenschutz und Informationsfreiheit.
      </p>

      <h2>21. Änderungen</h2>
      <p>
        Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die eingesetzten Dienste ändern. Es gilt die
        jeweils hier veröffentlichte Fassung.
      </p>
    </LegalPage>
  );
}
