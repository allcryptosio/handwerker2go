import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { formatCents, formatPercent, providerPricing as p, yearlyPerMonthCents } from "@/lib/pricing";

export const metadata: Metadata = { title: "AGB", alternates: { canonical: "/agb" }, robots: { index: false } };

/** Entwurf, Stand 18.11.2026. Vor Anwaltsprüfung nicht als geprüft darstellen. */
export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <p>Stand: 18. November 2026</p>

      <h2>§ 1 Geltungsbereich und Anbieter</h2>
      <p>
        (1) Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung des Online-Marktplatzes handwerker2go
        (handwerker2go.com). Betreiber ist Joe Becker, Republic Street 266, VLT 1112 Valletta, Malta (im Folgenden
        „handwerker2go“ oder „wir“).
      </p>
      <p>
        (2) Nutzer sind Kundinnen und Kunden, die Handwerkerleistungen suchen und beauftragen („Kunden“), sowie
        Handwerksbetriebe, die ihre Leistungen anbieten („Betriebe“). Für Betriebe gelten zusätzlich die besonderen Bedingungen
        in § 9.
      </p>
      <p>(3) Abweichende Bedingungen von Nutzern gelten nur, wenn wir ihnen ausdrücklich in Textform zustimmen.</p>

      <h2>§ 2 Leistungen von handwerker2go</h2>
      <p>
        (1) handwerker2go stellt eine Plattform bereit, auf der Kunden Betriebe in ihrer Nähe finden, Leistungen und Preise
        vergleichen, Termine buchen und Angebote anfragen können.
      </p>
      <p>
        (2) handwerker2go erbringt selbst keine Handwerkerleistungen. Der Vertrag über die Handwerkerleistung kommt
        ausschließlich zwischen dem Kunden und dem jeweiligen Betrieb zustande. Der Betrieb ist für die Ausführung, die
        Gewährleistung und die Einhaltung gesetzlicher Vorschriften verantwortlich. Bei jedem Angebot ist erkennbar, dass es
        sich um einen Unternehmer handelt.
      </p>
      <p>
        (3) Wir prüfen Betriebe vor der Freischaltung anhand der eingereichten Unternehmensdaten und Nachweise. Diese Prüfung
        ersetzt keine eigene Prüfung durch den Kunden und ist keine Garantie für die Qualität einzelner Leistungen.
      </p>
      <p>
        (4) Die Reihenfolge der Betriebe in Suchergebnissen richtet sich nach Entfernung zum Einsatzort, Verfügbarkeit,
        angebotener Leistung und Bewertungen. [Ranking-Kriterien vor Start der Suche abschließend festlegen.]
      </p>
      <p>(5) Die Nutzung der Plattform ist für Kunden kostenlos.</p>

      <h2>§ 3 Registrierung und Konto</h2>
      <p>
        (1) Für bestimmte Funktionen ist ein Konto erforderlich. Bei der Registrierung sind wahrheitsgemäße Angaben zu machen.
        Die E-Mail-Adresse muss über den zugesandten Link bestätigt werden.
      </p>
      <p>
        (2) Zugangsdaten sind geheim zu halten. Bei Verdacht auf Missbrauch ist uns unverzüglich Bescheid zu geben
        (info@handwerker2go.com).
      </p>
      <p>
        (3) Nutzer können ihr Konto jederzeit per E-Mail an info@handwerker2go.com löschen lassen, soweit keine laufenden
        Aufträge oder gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>§ 4 Buchung und Angebotsanfrage</h2>
      <p>
        (1) Festpreis-Buchung: Der Kunde wählt eine Leistung, einen freien Termin und den Einsatzort und gibt die Buchung mit dem
        Button „zahlungspflichtig buchen“ ab. Damit gibt er ein verbindliches Angebot gegenüber dem Betrieb ab. Der Vertrag
        kommt zustande, wenn wir die Buchung im Namen des Betriebs per E-Mail bestätigen.
      </p>
      <p>
        (2) Angebotsanfrage: Der Kunde beschreibt sein Vorhaben, auf Wunsch mit Fotos. Betriebe können darauf ein Angebot
        abgeben. Ein Vertrag kommt erst zustande, wenn der Kunde ein Angebot auf der Plattform annimmt und dies bestätigt wird.
      </p>
      <p>
        (3) Angaben zum Einsatzort und zum Umfang müssen zutreffen. Weicht der tatsächliche Aufwand wegen falscher oder
        unvollständiger Angaben erheblich ab, kann der Betrieb den Preis anpassen oder vom Vertrag zurücktreten. Der Kunde wird
        vorher informiert.
      </p>
      <p>[Buchung und Zahlung werden schrittweise freigeschaltet. Dieser Abschnitt gilt, sobald die Funktion verfügbar ist.]</p>

      <h2>§ 5 Preise und Zahlung für Kunden</h2>
      <p>
        (1) Die angezeigten Preise für Handwerkerleistungen sind Endpreise des jeweiligen Betriebs einschließlich der
        gesetzlichen Umsatzsteuer, sofern der Betrieb Umsatzsteuer berechnet.
      </p>
      <p>
        (2) Die Zahlung erfolgt online über unseren Zahlungsdienstleister. Wir nehmen Zahlungen im Auftrag des Betriebs entgegen.
        Die Rechnung über die Handwerkerleistung stellt der Betrieb aus. [Zahlungsabwicklung und Rolle des Zahlungsdienstleisters
        vor Aktivierung rechtlich prüfen.]
      </p>

      <h2>§ 6 Stornierung und Widerruf</h2>
      <p>
        (1) Verbrauchern steht gegenüber dem Betrieb ein gesetzliches Widerrufsrecht zu. Einzelheiten stehen in der
        Widerrufsbelehrung.
      </p>
      <p>
        (2) Unabhängig vom Widerrufsrecht kann der Kunde eine Festpreis-Buchung bis [24 Stunden] vor dem Termin kostenlos
        stornieren. [Stornobedingungen und mögliche Gebühren bei kurzfristiger Absage festlegen.]
      </p>

      <h2>§ 7 Bewertungen</h2>
      <p>
        (1) Nur Kunden mit einer über handwerker2go gebuchten und abgeschlossenen Leistung können den Betrieb bewerten (1 bis 5
        Sterne und Text). Jede Bewertung ist mit der zugrunde liegenden Buchung verknüpft.
      </p>
      <p>
        (2) Bewertungen müssen wahr und sachlich sein. Beleidigende, rechtswidrige oder nicht auf die Leistung bezogene Inhalte
        dürfen wir entfernen. Kritische, aber zulässige Bewertungen werden nicht gelöscht. Betriebe können nicht dafür
        bezahlen, Bewertungen zu entfernen oder hervorzuheben.
      </p>

      <h2>§ 8 Pflichten aller Nutzer</h2>
      <p>
        Nutzer dürfen die Plattform nicht missbräuchlich nutzen, insbesondere keine falschen Angaben machen, keine Rechte
        Dritter verletzen, keine Schadsoftware einbringen und keine Vereinbarungen treffen, um vermittelte Aufträge an der
        Plattform vorbei abzuwickeln. Bei Verstößen können wir Inhalte entfernen und Konten vorübergehend oder dauerhaft sperren.
      </p>

      <h2>§ 9 Besondere Bedingungen für Handwerksbetriebe</h2>
      <p>
        (1) Betriebe nutzen die Plattform ausschließlich als Unternehmer im Sinne des § 14 BGB. Nach der Registrierung prüfen wir
        die Angaben und den eingereichten Nachweis. Ein Anspruch auf Freischaltung besteht nicht. Erst nach der Freischaltung
        ist das Profil öffentlich sichtbar.
      </p>
      <p>
        (2) Einführungsphase: Ab der Freischaltung beginnt eine Einführungsphase von {p.introMonths} Monaten. In dieser Zeit
        fällt keine Grundgebühr an ({formatCents(p.introMonthlyFeeCents)}). Für jede erfolgreich abgeschlossene Buchung
        berechnen wir eine Provision von {formatPercent(p.introCommissionBps)} des Auftragswerts.
      </p>
      <p>
        (3) Mitgliedschaft nach der Einführungsphase: Vor Ende der Einführungsphase informieren wir den Betrieb rechtzeitig per
        E-Mail. Eine kostenpflichtige Mitgliedschaft entsteht nur, wenn der Betrieb sie ausdrücklich abschließt. Zur Wahl stehen:
      </p>
      <ul className="list-disc pl-6">
        <li>
          monatlich: {formatCents(p.monthly.feeCents)} pro Monat, Provision {formatPercent(p.monthly.commissionBps)};
          kündbar jederzeit zum Ende des laufenden Monats;
        </li>
        <li>
          jährlich: {formatCents(p.yearly.feeCents)} pro Jahr (entspricht {formatCents(yearlyPerMonthCents())} pro Monat),
          Provision {formatPercent(p.yearly.commissionBps)}; Laufzeit 12 Monate, verlängert sich um weitere 12 Monate, wenn nicht
          bis zum Ende der Laufzeit gekündigt wird. Wir erinnern rechtzeitig vor der Verlängerung.
        </li>
      </ul>
      <p>
        Schließt der Betrieb keine Mitgliedschaft ab, wird sein Profil nach Ende der Einführungsphase nicht mehr in der Suche
        angezeigt. Bereits gebuchte Aufträge bleiben unberührt.
      </p>
      <p>
        (4) Provision: Die Provision fällt nur für erfolgreich abgeschlossene Buchungen an und wird bei der Zahlung des Kunden
        einbehalten. Bei Stornierung oder Erstattung wird die Provision anteilig berichtigt. Maßgeblich ist der zum Zeitpunkt
        der Buchung geltende Provisionssatz.
      </p>
      <p>
        (5) Umsatzsteuer: Alle Preise für Betriebe sind Nettopreise. Die Umsatzsteuer schuldet der Betrieb als
        Leistungsempfänger (Reverse-Charge-Verfahren). Rechnungen über Mitgliedschaft und Provision erhalten den Hinweis
        „Reverse charge“.
      </p>
      <p>
        (6) Zahlung der Mitgliedschaft: Die Gebühr wird im Voraus über unseren Zahlungsdienstleister eingezogen. Schlägt eine
        Zahlung fehl, wird der Einzug wiederholt. Ist die Gebühr 14 Tage nach Fälligkeit nicht bezahlt, dürfen wir das Profil
        bis zum Zahlungseingang aus der Suche nehmen.
      </p>
      <p>
        (7) Kündigung: Die Kündigung ist jederzeit im Dashboard oder per E-Mail an info@handwerker2go.com möglich. Das Recht zur
        Kündigung aus wichtigem Grund bleibt unberührt.
      </p>
      <p>
        (8) Pflichten des Betriebs: Der Betrieb sichert zu, dass er zur Ausübung der angebotenen Leistungen berechtigt ist
        (insbesondere Gewerbeanmeldung und, soweit erforderlich, Eintragung in die Handwerksrolle), eine angemessene
        Betriebshaftpflichtversicherung unterhält, Preise korrekt und einschließlich Umsatzsteuer angibt, seine Kunden über das
        Widerrufsrecht belehrt und seine steuerlichen Pflichten selbst erfüllt. Änderungen an seinen Angaben teilt er uns
        unverzüglich mit.
      </p>
      <p>
        (9) Wir dürfen ein Profil sperren, wenn der Betrieb gegen diese Bedingungen verstößt, falsche Nachweise eingereicht hat
        oder wiederholt berechtigte Beschwerden eingehen.
      </p>

      <h2>§ 10 Haftung</h2>
      <p>
        (1) Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.
        Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist unsere Haftung auf den vorhersehbaren,
        vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung bei leichter Fahrlässigkeit ausgeschlossen.
      </p>
      <p>
        (2) Für die Ausführung der Handwerkerleistung haftet ausschließlich der beauftragte Betrieb. Wir übernehmen keine Gewähr
        für die ständige Verfügbarkeit der Plattform.
      </p>

      <h2>§ 11 Datenschutz</h2>
      <p>Informationen zur Verarbeitung personenbezogener Daten stehen in der Datenschutzerklärung.</p>

      <h2>§ 12 Änderungen dieser Bedingungen</h2>
      <p>
        Wir können diese Bedingungen mit Wirkung für die Zukunft ändern, wenn sachliche Gründe vorliegen. Registrierte Nutzer
        informieren wir mindestens sechs Wochen vor Inkrafttreten per E-Mail. Widerspricht ein Nutzer nicht bis zum
        Inkrafttreten, gelten die Änderungen als angenommen; darauf weisen wir in der Mitteilung hin. Preisänderungen für
        Betriebe gelten nicht für bereits laufende Abrechnungszeiträume.
      </p>

      <h2>§ 13 Schlussbestimmungen</h2>
      <p>
        (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für Verbraucher gilt diese
        Rechtswahl nur, soweit ihnen dadurch nicht der Schutz zwingender Vorschriften ihres Aufenthaltsstaates entzogen wird.
        [Rechtswahl und Gerichtsstand anwaltlich prüfen lassen.]
      </p>
      <p>(2) Ist der Nutzer Unternehmer, ist Gerichtsstand [Hamburg / Valletta, festlegen].</p>
      <p>(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
    </LegalPage>
  );
}
