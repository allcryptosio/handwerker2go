import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine } from "@/config/legal";
import { formatCents, formatPercent, providerPricing as p, yearlyPerMonthCents } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "AGB für Betriebe",
  alternates: { canonical: "/agb-betriebe" },
  robots: { index: false },
};

/** Entwurf. Betreiberangaben aus src/config/legal.ts, Preise und Provision aus src/lib/pricing.ts. */
export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen für Handwerksbetriebe">
      <p>Stand: {legal.termsVersion.split("-").reverse().join(".")}</p>

      <h2>§ 1 Geltungsbereich und Anbieter</h2>
      <p>
        (1) Diese Bedingungen gelten für Handwerksbetriebe („Betriebe“), die ihre Leistungen über den Online-Marktplatz
        handwerker2go (handwerker2go.com) anbieten. Betreiber ist {operatorLine()}, USt-IdNr. {legal.vatId} (im Folgenden „wir“).
      </p>
      <p>
        (2) Betriebe nutzen die Plattform ausschließlich als Unternehmer im Sinne des § 14 BGB. Abweichende Bedingungen des
        Betriebs gelten nur, wenn wir ihnen ausdrücklich in Textform zustimmen.
      </p>

      <h2>§ 2 Unsere Rolle</h2>
      <p>
        (1) Wir vermitteln Aufträge zwischen Kunden und Betrieben. Der Vertrag über die Handwerkerleistung kommt ausschließlich
        zwischen dem Kunden und dem Betrieb zustande. Der Betrieb erbringt die Leistung im eigenen Namen und auf eigene
        Verantwortung.
      </p>
      <p>
        (2) Wie die Reihenfolge der Betriebe in den Suchergebnissen entsteht, beschreiben wir auf der Seite{" "}
        <Link href="/ranking" className="underline">So sortieren wir die Suchergebnisse</Link>. Das gewählte Abo-Modell und die
        Höhe der Provision haben darauf keinen Einfluss.
      </p>

      <h2>§ 3 Registrierung, Prüfung und Freischaltung</h2>
      <p>
        (1) Der Betrieb registriert sich mit seinen Unternehmensdaten und lädt einen gewerblichen Nachweis hoch. Wir prüfen die
        Angaben und entscheiden über die Freischaltung. Ein Anspruch auf Freischaltung besteht nicht.
      </p>
      <p>
        (2) Für den Empfang von Zahlungen richtet der Betrieb über den Link im Dashboard ein eigenes Konto beim
        Zahlungsdienstleister Stripe ein. Stripe prüft dabei die Identität, das Unternehmen und die Bankverbindung (KYC). Für
        dieses Konto gelten zusätzlich die Bedingungen von Stripe, denen der Betrieb bei der Einrichtung zustimmt.
      </p>
      <p>
        (3) Buchbar ist ein Betrieb erst, wenn wir ihn freigeschaltet haben und Stripe sein Konto für Zahlungen und Auszahlungen
        freigegeben hat.
      </p>

      <h2>§ 4 Einführungsphase und Mitgliedschaft</h2>
      <p>
        (1) Ab der Freischaltung beginnt eine Einführungsphase von {p.introMonths} Monaten. In dieser Zeit fällt keine Grundgebühr
        an ({formatCents(p.introMonthlyFeeCents)}). Für jede erfolgreich abgeschlossene Buchung berechnen wir eine Provision von{" "}
        {formatPercent(p.introCommissionBps)} des Auftragswerts.
      </p>
      <p>
        (2) Vor dem Ende der Einführungsphase informieren wir den Betrieb rechtzeitig per E-Mail. Eine kostenpflichtige
        Mitgliedschaft entsteht nur, wenn der Betrieb sie ausdrücklich im Dashboard abschließt. Schließt er sie schon während der
        Einführungsphase ab, beginnt die Abrechnung erst mit deren Ende. Zur Wahl stehen:
      </p>
      <ul className="list-disc pl-6">
        <li>
          monatlich: {formatCents(p.monthly.feeCents)} pro Monat und {formatPercent(p.monthly.commissionBps)} Provision, kündbar
          jederzeit zum Ende des laufenden Monats;
        </li>
        <li>
          jährlich: {formatCents(p.yearly.feeCents)} pro Jahr (entspricht {formatCents(yearlyPerMonthCents())} pro Monat) und{" "}
          {formatPercent(p.yearly.commissionBps)} Provision. Die Laufzeit beträgt 12 Monate und verlängert sich um weitere 12
          Monate, wenn der Betrieb nicht bis zum Ende der Laufzeit kündigt. Wir erinnern rechtzeitig vor der Verlängerung.
        </li>
      </ul>
      <p>
        (3) Schließt der Betrieb keine Mitgliedschaft ab, erscheint sein Profil nach der Einführungsphase nicht mehr in der Suche.
        Bereits gebuchte Aufträge laufen normal weiter.
      </p>
      <p>
        (4) Die Mitgliedschaft wird im Voraus über Stripe abgerechnet. Schlägt eine Zahlung fehl, versucht Stripe den Einzug
        erneut. Ist die Gebühr 14 Tage nach Fälligkeit nicht bezahlt, dürfen wir das Profil bis zum Zahlungseingang aus der Suche
        nehmen.
      </p>
      <p>
        (5) Der Betrieb kann jederzeit im Dashboard oder per E-Mail an {legal.email} kündigen. Das Recht zur Kündigung aus
        wichtigem Grund bleibt unberührt.
      </p>

      <h2>§ 5 Zahlungsabwicklung und Provision</h2>
      <p>
        (1) Kunden bezahlen Buchungen online über Stripe. Die Zahlung geht direkt auf das Stripe-Konto des Betriebs; der Betrieb
        ist Empfänger der Zahlung, sein Name erscheint auf dem Kontoauszug des Kunden. Wir nehmen zu keinem Zeitpunkt
        Kundengelder auf eigene Konten entgegen.
      </p>
      <p>
        (2) Unsere Provision wird bei der Zahlung des Kunden automatisch einbehalten (Plattformgebühr). Maßgeblich ist der zum
        Zeitpunkt der Buchung geltende Satz: in der Einführungsphase {formatPercent(p.introCommissionBps)}, danach{" "}
        {formatPercent(p.monthly.commissionBps)} des Auftragswerts. Provision fällt nur für erfolgreich abgeschlossene Buchungen
        an.
      </p>
      <p>
        (3) Stripe zahlt das Guthaben des Betriebs nach dem Auszahlungsplan seines Stripe-Kontos auf sein Bankkonto aus. Den
        Auszahlungsplan legt der Betrieb in seinem Stripe-Konto fest; wir haben darauf keinen Einfluss.
      </p>
      <p>
        (4) Storniert ein Kunde innerhalb der kostenlosen Frist von {legal.freeCancellationHours} Stunden vor dem Termin oder
        widerruft er wirksam, wird ihm der volle Betrag über Stripe aus dem Stripe-Konto des Betriebs erstattet; die Provision
        entfällt dann ebenfalls. Bei späterer
        Stornierung oder Nichterscheinen des Kunden behält der Betrieb die Pauschale nach den AGB für Kunden (
        {legal.lateCancellationPercent} % des Festpreises, höchstens die Anfahrtskosten); die Provision wird anteilig berechnet.
      </p>
      <p>
        (5) Die Gebühren von Stripe für die Zahlungsabwicklung trägt der Betrieb. Stripe verrechnet sie direkt mit seinem
        Stripe-Konto. Rückbuchungen (zum Beispiel bei Kreditkarten-Reklamationen) betreffen ebenfalls das Stripe-Konto des
        Betriebs; Stripe trägt das Ausfallrisiko nach seinen Bedingungen.
      </p>
      <p>
        (6) Die Rechnung über die Handwerkerleistung stellt der Betrieb an den Kunden. Wir rechnen gegenüber dem Betrieb nur unsere
        Provision und die Mitgliedschaft ab. Über die im Vormonat einbehaltenen Provisionen erhält der Betrieb zu Beginn jedes
        Monats eine Rechnung per E-Mail; sie ist bereits beglichen, weil die Provision bei den Kundenzahlungen einbehalten wurde.
      </p>

      <h2>§ 6 Umsatzsteuer</h2>
      <p>
        Alle Preise für Betriebe sind Nettopreise. Wir rechnen Provision und Mitgliedschaft ohne Umsatzsteuer ab, mit dem Hinweis
        „Steuerschuldnerschaft des Leistungsempfängers“ (Reverse-Charge-Verfahren). Die Umsatzsteuer schuldet der Betrieb.
      </p>

      <h2>§ 7 Pflichten des Betriebs</h2>
      <p>
        (1) Der Betrieb sichert zu, dass er zur Ausübung der angebotenen Leistungen berechtigt ist, insbesondere durch eine
        Gewerbeanmeldung und, soweit erforderlich, die Eintragung in die Handwerksrolle. Er unterhält eine angemessene
        Betriebshaftpflichtversicherung.
      </p>
      <p>
        (2) Der Betrieb gibt Preise korrekt und einschließlich Umsatzsteuer an, hält seinen Kalender aktuell, nimmt vereinbarte
        Termine wahr und erfüllt seine steuerlichen Pflichten selbst. Änderungen an seinen Angaben teilt er uns unverzüglich mit.
      </p>
      <p>
        (3) Der Betrieb wickelt über die Plattform vermittelte Aufträge nicht an der Plattform vorbei ab.
      </p>
      <p>
        (4) Wir dürfen ein Profil sperren, wenn der Betrieb gegen diese Bedingungen verstößt, falsche Nachweise eingereicht hat oder
        wiederholt berechtigte Beschwerden eingehen. Vor einer dauerhaften Sperre teilen wir die Gründe mit.
      </p>

      <h2>§ 8 Bewertungen</h2>
      <p>
        Bewertungen stammen ausschließlich von Kunden mit einer abgeschlossenen Buchung. Der Betrieb kann Bewertungen nicht kaufen,
        entfernen lassen oder hervorheben. Unzulässige Inhalte kann er uns zur Prüfung melden.
      </p>

      <h2>§ 9 Haftung</h2>
      <p>
        (1) Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.
        Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist unsere Haftung auf den vorhersehbaren,
        vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung bei leichter Fahrlässigkeit ausgeschlossen.
      </p>
      <p>(2) Eine bestimmte Anzahl von Aufträgen oder eine ständige Verfügbarkeit der Plattform schulden wir nicht.</p>

      <h2>§ 10 Änderungen dieser Bedingungen</h2>
      <p>
        Wir können diese Bedingungen für die Zukunft ändern, wenn es dafür sachliche Gründe gibt. Wir informieren den Betrieb
        mindestens sechs Wochen vorher per E-Mail. Widerspricht er nicht bis zum Inkrafttreten, gelten die Änderungen als
        angenommen; darauf weisen wir in der Mitteilung hin. Preisänderungen gelten nicht für bereits laufende
        Abrechnungszeiträume.
      </p>

      <h2>§ 11 Anwendbares Recht und Gerichtsstand</h2>
      <p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
      <p>
        (2) Ist der Betrieb Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist
        ausschließlicher Gerichtsstand der Sitz des Plattformbetreibers in {legal.operatorCity}. Im Übrigen gelten die
        gesetzlichen Regeln.
      </p>
      <p>(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
    </LegalPage>
  );
}
