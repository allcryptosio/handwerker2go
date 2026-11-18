import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine } from "@/config/legal";

export const metadata: Metadata = { title: "AGB für Kunden", alternates: { canonical: "/agb" }, robots: { index: false } };

/** Entwurf. Betreiberangaben kommen aus src/config/legal.ts. */
export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen für Kunden">
      <p>Stand: {legal.termsVersion.split("-").reverse().join(".")}</p>
      <p>
        Für Handwerksbetriebe gelten die <Link href="/agb-betriebe" className="underline">AGB für Betriebe</Link>.
      </p>

      <h2>§ 1 Geltungsbereich und Anbieter</h2>
      <p>
        (1) Diese Bedingungen gelten für die Nutzung des Online-Marktplatzes handwerker2go (handwerker2go.com) durch Kundinnen und
        Kunden („Kunden“). Betreiber ist {operatorLine()} (im Folgenden „wir“).
      </p>
      <p>(2) Abweichende Bedingungen von Kunden gelten nur, wenn wir ihnen ausdrücklich in Textform zustimmen.</p>

      <h2>§ 2 Unsere Rolle</h2>
      <p>
        (1) Wir stellen eine Plattform bereit, auf der Kunden selbstständige Handwerksbetriebe („Betriebe“) finden, Leistungen und
        Preise vergleichen, Termine buchen und Angebote anfragen können. Die Nutzung ist für Kunden kostenlos.
      </p>
      <p>
        (2) Wir erbringen selbst keine Handwerkerleistungen. Der Vertrag über die Handwerkerleistung kommt ausschließlich zwischen
        dem Kunden und dem Betrieb zustande. Der Betrieb ist für die Ausführung und die Gewährleistung verantwortlich. Alle Betriebe
        sind Unternehmer.
      </p>
      <p>
        (3) Wir prüfen Betriebe vor der Freischaltung anhand ihrer Unternehmensdaten und Nachweise. Diese Prüfung ist keine Garantie
        für die Qualität einzelner Leistungen.
      </p>
      <p>
        (4) Wie wir die Reihenfolge der Betriebe in den Suchergebnissen festlegen, erklären wir auf der Seite{" "}
        <Link href="/ranking" className="underline">So sortieren wir die Suchergebnisse</Link>.
      </p>

      <h2>§ 3 Kundenkonto</h2>
      <p>
        (1) Für Buchungen ist ein Konto erforderlich. Die Angaben müssen wahr sein. Die E-Mail-Adresse wird über einen Link
        bestätigt.
      </p>
      <p>
        (2) Zugangsdaten sind geheim zu halten. Bei Verdacht auf Missbrauch informiere uns bitte sofort unter {legal.email}.
      </p>
      <p>
        (3) Du kannst dein Konto jederzeit per E-Mail an {legal.email} löschen lassen, soweit keine offenen Aufträge oder
        gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>§ 4 Buchung und Angebotsanfrage</h2>
      <p>
        (1) Festpreis-Buchung: Du wählst eine Leistung, einen freien Termin und den Einsatzort und schließt die Buchung mit dem
        Button „zahlungspflichtig buchen“ ab. Damit gibst du ein verbindliches Angebot an den Betrieb ab. Der Vertrag kommt
        zustande, sobald die Zahlung erfolgreich ist und wir dir die Buchung im Namen des Betriebs per E-Mail bestätigen.
      </p>
      <p>
        (2) Angebotsanfrage: Du beschreibst dein Vorhaben, auf Wunsch mit Fotos. Betriebe können dir ein Angebot machen. Der
        Vertrag kommt zustande, wenn du ein Angebot auf der Plattform annimmst und bezahlst.
      </p>
      <p>
        (3) Deine Angaben zum Einsatzort und zum Umfang müssen stimmen. Weicht der Aufwand wegen falscher oder unvollständiger
        Angaben erheblich ab, kann der Betrieb dir einen angepassten Preis anbieten. Lehnst du ihn ab, kann der Betrieb vom Vertrag
        zurücktreten; bereits gezahlte Beträge werden dann erstattet.
      </p>
      <p>
        (4) Liegt dein Termin innerhalb der {legal.withdrawalDays}-tägigen Widerrufsfrist, kannst du nur buchen, wenn du
        ausdrücklich verlangst, dass der Betrieb vor Ablauf der Widerrufsfrist mit der Leistung beginnt. Du bestätigst dabei, dass
        du dein Widerrufsrecht verlierst, wenn die Leistung vollständig erbracht ist, und dass du bei einem Widerruf für die bis
        dahin erbrachte Leistung anteiligen Wertersatz schuldest. Wir speichern diese Erklärung mit Zeitpunkt und wiederholen sie
        in der Buchungsbestätigung.
      </p>

      <h2>§ 5 Preise und Zahlung</h2>
      <p>
        (1) Die angezeigten Preise sind Endpreise des Betriebs einschließlich gesetzlicher Umsatzsteuer, soweit der Betrieb
        Umsatzsteuer berechnet.
      </p>
      <p>
        (2) Du bezahlst online über den Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd., Irland) auf einer
        Bezahlseite von Stripe. Der Betrag geht über Stripe direkt an den Betrieb; auf deinem Kontoauszug erscheint der Name des
        Betriebs. Wir nehmen zu keinem Zeitpunkt Zahlungen auf eigene Konten entgegen. Die Rechnung über die
        Handwerkerleistung stellt dir der Betrieb aus.
      </p>
      <p>
        (3) Erstattungen, zum Beispiel nach einer Stornierung oder einem Widerruf, erfolgen über Stripe auf das Zahlungsmittel, mit
        dem du bezahlt hast. Die Gutschrift dauert je nach Bank in der Regel 5 bis 10 Bankarbeitstage.
      </p>

      <h2>§ 6 Stornierung</h2>
      <p>
        (1) Du kannst eine Buchung bis {legal.freeCancellationHours} Stunden vor dem vereinbarten Termin kostenlos stornieren,
        im Kundenkonto oder per E-Mail an {legal.email}. Du erhältst den vollen Betrag zurück.
      </p>
      <p>
        (2) Stornierst du später oder ist bei dem Termin niemand am Einsatzort anzutreffen, kann der Betrieb eine Pauschale
        verlangen. Sie beträgt {legal.lateCancellationPercent} % des Festpreises, höchstens jedoch die Anfahrtskosten des Betriebs.
        Der übrige Betrag wird erstattet.
      </p>
      <p>
        (3) Dir bleibt der Nachweis gestattet, dass dem Betrieb kein oder ein wesentlich geringerer Schaden entstanden ist.
      </p>
      <p>
        (4) Dein gesetzliches Widerrufsrecht von {legal.withdrawalDays} Tagen bleibt davon unberührt. Einzelheiten und das
        Muster-Widerrufsformular findest du in der <Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>.
      </p>

      <h2>§ 7 Bewertungen</h2>
      <p>
        (1) Nur Kunden mit einer über handwerker2go gebuchten und abgeschlossenen Leistung können den Betrieb bewerten (1 bis 5
        Sterne und Text). Jede Bewertung ist mit der zugrunde liegenden Buchung verknüpft.
      </p>
      <p>
        (2) Bewertungen müssen wahr und sachlich sein. Beleidigende, rechtswidrige oder nicht auf die Leistung bezogene Inhalte
        dürfen wir entfernen. Kritische, aber zulässige Bewertungen löschen wir nicht. Betriebe können nicht dafür bezahlen,
        Bewertungen zu entfernen oder hervorzuheben.
      </p>

      <h2>§ 8 Pflichten der Kunden</h2>
      <p>
        Du darfst die Plattform nicht missbräuchlich nutzen, insbesondere keine falschen Angaben machen, keine Rechte Dritter
        verletzen und keine Schadsoftware einbringen. Bei Verstößen können wir Inhalte entfernen und Konten vorübergehend oder
        dauerhaft sperren.
      </p>

      <h2>§ 9 Haftung</h2>
      <p>
        (1) Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.
        Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist unsere Haftung auf den vorhersehbaren,
        vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung bei leichter Fahrlässigkeit ausgeschlossen.
      </p>
      <p>
        (2) Für die Ausführung der Handwerkerleistung haftet ausschließlich der beauftragte Betrieb. Eine ständige Verfügbarkeit
        der Plattform schulden wir nicht.
      </p>

      <h2>§ 10 Datenschutz</h2>
      <p>
        Wie wir mit deinen Daten umgehen, steht in der <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link>.
      </p>

      <h2>§ 11 Änderungen dieser Bedingungen</h2>
      <p>
        Wir können diese Bedingungen für die Zukunft ändern, wenn es dafür sachliche Gründe gibt. Wir informieren dich mindestens
        sechs Wochen vorher per E-Mail. Bereits gebuchte Aufträge sind von Änderungen nicht betroffen.
      </p>

      <h2>§ 12 Anwendbares Recht</h2>
      <p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
      <p>
        (2) Bist du Verbraucher, bleiben die zwingenden Verbraucherschutzvorschriften des Staates, in dem du deinen gewöhnlichen
        Aufenthalt hast, unberührt.
      </p>
      <p>(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
    </LegalPage>
  );
}
