import type { Metadata } from "next";
import Link from "next/link";
import { Email } from "@/components/legal/email";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine, termsDate } from "@/config/legal";
import { formatCents, formatPercent, providerPricing as p, yearlyPerMonthCents } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "AGB für Betriebe",
  description: "Allgemeine Geschäftsbedingungen für Handwerksbetriebe auf dem Marktplatz handwerker2go: Mitgliedschaft, Provision, Zahlung über Stripe.",
  alternates: { canonical: "/agb-betriebe" },
};

/**
 * AGB für Handwerksbetriebe (Unternehmer, § 14 BGB), ausgerichtet an der P2B-Verordnung (EU) 2019/1150.
 * Betreiberangaben aus src/config/legal.ts, Preise und Provision aus src/lib/pricing.ts.
 * Offene Prüfpunkte (u. a. Gerichtsstand, Zustimmungsfiktion, DAC7): docs/RECHTLICHE-PRUEFUNGEN.md.
 */
export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen für Handwerksbetriebe">
      <p>Stand: {termsDate()}</p>

      <h2>§ 1 Geltungsbereich und Betreiber</h2>
      <p>
        (1) Diese Bedingungen gelten für Handwerksbetriebe („Betriebe“), die ihre Leistungen über den Online-Marktplatz
        handwerker2go (handwerker2go.com) anbieten. Betreiber ist {operatorLine()}, E-Mail: <Email />, Telefon: {legal.phone},
        USt-IdNr. {legal.vatId} (im Folgenden „wir“).
      </p>
      <p>
        (2) Betriebe nutzen die Plattform ausschließlich als Unternehmer im Sinne des § 14 BGB. Abweichende Bedingungen des
        Betriebs gelten nur, wenn wir ihnen ausdrücklich in Textform zustimmen.
      </p>

      <h2>§ 2 Unsere Rolle</h2>
      <p>
        (1) Wir vermitteln Aufträge zwischen Kunden und Betrieben. Der Vertrag über die Handwerkerleistung kommt ausschließlich
        zwischen dem Kunden und dem Betrieb zustande. Der Betrieb erbringt die Leistung im eigenen Namen, auf eigene Rechnung und
        auf eigene Verantwortung. Bei Betrieben mit sofortiger Bestätigung bestätigen wir Buchungen im Namen des Betriebs.
      </p>
      <p>
        (2) Die Reihenfolge der Betriebe in den Suchergebnissen richtet sich nach diesen Hauptparametern, absteigend gewichtet:
        Entfernung zum Einsatzort, freier Termin zur gewünschten Zeit, Bewertungen, Zuverlässigkeit (Antwortzeit auf Anfragen und
        Absagequote) und Vollständigkeit des Profils. Einzelheiten stehen auf der Seite{" "}
        <Link href="/ranking" className="underline">So sortieren wir die Suchergebnisse</Link>. Das gewählte Abo-Modell und die Höhe
        der Provision haben keinen Einfluss auf das Ranking; bezahlte Platzierungen gibt es nicht.
      </p>

      <h2>§ 3 Registrierung, Prüfung und Freischaltung</h2>
      <p>
        (1) Der Betrieb registriert sich mit seinen Unternehmensdaten und lädt einen gewerblichen Nachweis hoch. Wir prüfen die
        Angaben und entscheiden über die Freischaltung. Ein Anspruch auf Freischaltung besteht nicht; eine Ablehnung begründen wir
        per E-Mail.
      </p>
      <p>
        (2) Für den Empfang von Zahlungen richtet der Betrieb über den Link im Dashboard ein eigenes Konto beim
        Zahlungsdienstleister Stripe ein. Stripe prüft dabei Identität, Unternehmen und Bankverbindung. Für dieses Konto gelten
        zusätzlich die Bedingungen von Stripe, denen der Betrieb bei der Einrichtung zustimmt.
      </p>
      <p>
        (3) Buchbar ist ein Betrieb erst, wenn wir ihn freigeschaltet haben, er Leistungen mit Preisen, Arbeitszeiten und
        Einsatzgebiet hinterlegt hat und, für Festpreis-Leistungen, Stripe sein Konto für Zahlungen und Auszahlungen
        freigegeben hat.
      </p>

      <h2>§ 4 Einführungsphase und Mitgliedschaft</h2>
      <p>
        (1) Ab der Freischaltung beginnt eine Einführungsphase von {p.introMonths} Monaten. In dieser Zeit fällt keine Grundgebühr
        an ({formatCents(p.introMonthlyFeeCents)}). Für jede erfolgreich abgeschlossene Buchung berechnen wir eine Provision von{" "}
        {formatPercent(p.introCommissionBps)} des Auftragswerts.
      </p>
      <p>
        (2) Vor dem Ende der Einführungsphase informieren wir den Betrieb per E-Mail. Eine kostenpflichtige Mitgliedschaft entsteht
        nur, wenn der Betrieb sie ausdrücklich im Dashboard abschließt. Schließt er sie schon während der Einführungsphase ab,
        beginnt die Abrechnung erst mit deren Ende. Zur Wahl stehen:
      </p>
      <ul className="list-disc pl-6">
        <li>
          monatlich: {formatCents(p.monthly.feeCents)} pro Monat und {formatPercent(p.monthly.commissionBps)} Provision. Die Laufzeit
          beträgt einen Monat und verlängert sich jeweils um einen Monat; Kündigung jederzeit zum Ende des laufenden Monats.
        </li>
        <li>
          jährlich: {formatCents(p.yearly.feeCents)} pro Jahr (entspricht {formatCents(yearlyPerMonthCents())} pro Monat) und{" "}
          {formatPercent(p.yearly.commissionBps)} Provision. Die Laufzeit beträgt 12 Monate und verlängert sich um weitere 12
          Monate, wenn der Betrieb nicht bis zum Ende der Laufzeit kündigt. Vor jeder Verlängerung erinnern wir den Betrieb per
          E-Mail.
        </li>
      </ul>
      <p>
        (3) Für die Mitgliedschaft gibt der Betrieb eine gültige Umsatzsteuer-Identifikationsnummer an. Schließt der Betrieb keine
        Mitgliedschaft ab, erscheint sein Profil nach der Einführungsphase nicht mehr in der Suche; bereits gebuchte Aufträge
        laufen normal weiter.
      </p>
      <p>
        (4) Die Mitgliedschaft wird im Voraus über Stripe abgerechnet. Schlägt eine Zahlung fehl, versucht Stripe den Einzug
        erneut, und wir informieren den Betrieb per E-Mail. Ist die Gebühr 14 Tage nach Fälligkeit nicht bezahlt, dürfen wir das
        Profil bis zum Zahlungseingang aus der Suche nehmen.
      </p>
      <p>
        (5) Der Betrieb kündigt die Mitgliedschaft im Dashboard unter „Mitgliedschaft und Rechnungen verwalten“ oder per E-Mail an{" "}
        <Email />, jeweils zum Ende der laufenden Laufzeit. Das Recht zur Kündigung aus wichtigem Grund bleibt unberührt.
      </p>

      <h2>§ 5 Zahlungsabwicklung und Provision</h2>
      <p>
        (1) Kunden bezahlen Buchungen online über Stripe. Die Zahlung geht direkt auf das Stripe-Konto des Betriebs; der Betrieb
        ist Empfänger der Zahlung. Wir nehmen zu keinem Zeitpunkt Kundengelder auf eigene Konten entgegen.
      </p>
      <p>
        (2) Unsere Provision wird bei der Zahlung des Kunden automatisch über Stripe einbehalten. Maßgeblich ist der zum Zeitpunkt
        der Buchung geltende Satz: in der Einführungsphase {formatPercent(p.introCommissionBps)}, danach{" "}
        {formatPercent(p.monthly.commissionBps)} des Auftragswerts. Provision fällt nur für erfolgreich abgeschlossene Buchungen an.
      </p>
      <p>
        (3) Stripe zahlt das Guthaben des Betriebs nach dem Auszahlungsplan seines Stripe-Kontos auf sein Bankkonto aus. Den
        Auszahlungsplan legt der Betrieb in seinem Stripe-Konto fest.
      </p>
      <p>
        (4) Storniert ein Kunde innerhalb der kostenlosen Frist von {legal.freeCancellationHours} Stunden vor dem Termin, widerruft
        er wirksam oder lehnt der Betrieb eine Buchung ab, wird dem Kunden der volle Betrag über Stripe aus dem Stripe-Konto des
        Betriebs erstattet; die Provision wird dann ebenfalls erstattet. Bei späterer Stornierung oder Nichterscheinen des Kunden
        behält der Betrieb die Pauschale nach den AGB für Kunden ({legal.lateCancellationPercent} % des Festpreises, höchstens die
        Anfahrtskosten); die Provision wird anteilig berechnet.
      </p>
      <p>
        (5) Die Gebühren von Stripe für die Zahlungsabwicklung trägt der Betrieb; Stripe verrechnet sie direkt mit seinem
        Stripe-Konto. Rückbuchungen (Chargebacks) betreffen ebenfalls das Stripe-Konto des Betriebs; Stripe trägt das
        Ausfallrisiko nach seinen Bedingungen.
      </p>
      <p>
        (6) Die Rechnung über die Handwerkerleistung stellt der Betrieb an den Kunden. Wir rechnen gegenüber dem Betrieb nur unsere
        Provision und die Mitgliedschaft ab. Über die im Vormonat einbehaltenen Provisionen erhält der Betrieb zu Beginn jedes
        Monats eine Rechnung per E-Mail; sie ist bereits beglichen, weil die Provision bei den Kundenzahlungen einbehalten wurde.
      </p>

      <h2>§ 6 Umsatzsteuer</h2>
      <p>
        Alle Preise für Betriebe sind Nettopreise. Wir stellen Provision und Mitgliedschaft ohne Umsatzsteuer in Rechnung, mit dem
        Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ (Reverse-Charge-Verfahren). Die steuerliche Behandlung beim
        Betrieb liegt in seiner Verantwortung.
      </p>

      <h2>§ 7 Pflichten des Betriebs</h2>
      <p>
        (1) Der Betrieb sichert zu, dass er zur Ausübung der angebotenen Leistungen berechtigt ist, insbesondere durch eine
        Gewerbeanmeldung und, soweit erforderlich, die Eintragung in die Handwerksrolle. Er unterhält eine angemessene
        Betriebshaftpflichtversicherung.
      </p>
      <p>
        (2) Der Betrieb gibt Preise korrekt und als Endpreise einschließlich Umsatzsteuer an, soweit er Umsatzsteuer berechnet,
        hält Kalender, Arbeitszeiten und freie Tage aktuell, nimmt vereinbarte Termine wahr, beantwortet Anfragen zügig und erfüllt
        seine steuerlichen Pflichten selbst. Änderungen an seinen Angaben teilt er uns unverzüglich mit.
      </p>
      <p>(3) Der Betrieb wickelt über die Plattform vermittelte Aufträge nicht an der Plattform vorbei ab.</p>
      <p>
        (4) Soweit wir als Plattformbetreiber zu Meldungen an Steuerbehörden verpflichtet sind (Richtlinie (EU) 2021/514, „DAC7“),
        stellt der Betrieb uns auf Anforderung die dafür nötigen Angaben wahrheitsgemäß zur Verfügung, etwa Steuer-
        identifikationsnummer, Anschrift und Bankverbindung, und hält sie aktuell. Macht der Betrieb diese Angaben trotz zweier
        Erinnerungen nicht, dürfen wir sein Profil bis zur Nachreichung sperren.
      </p>

      <h2>§ 8 Daten der Kunden</h2>
      <p>
        (1) Für jede Buchung erhält der Betrieb die Angaben, die er zur Ausführung braucht: Name, Einsatzadresse, Telefonnummer,
        E-Mail-Adresse, Hinweise, Beschreibung und Fotos des Kunden. Der Betrieb verarbeitet diese Daten als eigener
        Verantwortlicher nur für die Durchführung des Auftrags und beachtet die Datenschutzgesetze.
      </p>
      <p>
        (2) Der Betrieb hat im Dashboard Zugang zu seinen eigenen Buchungen, Umsätzen, Provisionen und Bewertungen. Daten anderer
        Betriebe und Daten von Kunden, die ihn nicht gebucht haben, erhält er nicht. Wir selbst nutzen die Daten der Plattform für
        die Vermittlung, die Abrechnung und die Verbesserung der Plattform, wie in der{" "}
        <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link> beschrieben.
      </p>

      <h2>§ 9 Bewertungen</h2>
      <p>
        Bewertungen stammen ausschließlich von Kunden mit einer abgeschlossenen Buchung. Der Betrieb kann Bewertungen nicht kaufen,
        entfernen lassen oder hervorheben. Unzulässige Bewertungen oder Inhalte kann er uns unter <Email /> zur Prüfung
        melden; wir teilen ihm das Ergebnis mit.
      </p>

      <h2>§ 10 Einschränkung, Aussetzung und Beendigung</h2>
      <p>
        (1) Wir dürfen die Sichtbarkeit eines Betriebs einschränken oder sein Profil aussetzen, wenn der Betrieb gegen diese
        Bedingungen verstößt, falsche Angaben oder Nachweise eingereicht hat, wiederholt berechtigte Beschwerden von Kunden
        eingehen, er Termine wiederholt nicht wahrnimmt, die Mitgliedschaft nach § 4 Abs. 4 nicht bezahlt ist oder Angaben nach
        § 7 Abs. 4 fehlen. Die Gründe teilen wir dem Betrieb spätestens mit Wirksamwerden per E-Mail mit.
      </p>
      <p>
        (2) Wir können das Vertragsverhältnis mit einer Frist von 30 Tagen beenden; die Gründe teilen wir dem Betrieb per E-Mail
        mit. Ohne Frist dürfen wir nur beenden, wenn wir gesetzlich oder behördlich dazu verpflichtet sind oder der Betrieb
        wiederholt gegen diese Bedingungen verstoßen hat; auch dann nennen wir die Gründe per E-Mail.
      </p>
      <p>
        (3) Der Betrieb kann den Sachverhalt jederzeit per E-Mail an <Email /> klären oder eine Entscheidung beanstanden. Wir
        prüfen seine Beschwerde und teilen ihm das Ergebnis mit. Ergibt sich, dass die Maßnahme unbegründet war, heben wir sie
        unverzüglich auf.
      </p>
      <p>
        (4) Der Betrieb kann sein Konto jederzeit per E-Mail kündigen; eine laufende Mitgliedschaft endet zum Ende ihrer Laufzeit.
      </p>
      <p>
        (5) Nach der Beendigung erscheint das Profil nicht mehr auf der Plattform, auch nicht seine Bewertungen. Bereits gebuchte
        Aufträge werden abgewickelt oder mit voller Erstattung an die Kunden storniert. Daten bewahren wir nur so lange auf, wie
        es die <Link href="/datenschutz#speicherdauer" className="underline">Datenschutzerklärung</Link> vorsieht.
      </p>

      <h2>§ 11 Haftung</h2>
      <p>
        (1) Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit.
        Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist unsere Haftung auf den vorhersehbaren,
        vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung bei leichter Fahrlässigkeit ausgeschlossen.
      </p>
      <p>(2) Eine bestimmte Anzahl von Aufträgen oder eine ständige Verfügbarkeit der Plattform schulden wir nicht.</p>

      <h2>§ 12 Änderungen dieser Bedingungen</h2>
      <p>
        (1) Wir können diese Bedingungen für die Zukunft ändern, wenn es dafür sachliche Gründe gibt. Wir informieren den Betrieb
        mindestens sechs Wochen vor dem Inkrafttreten per E-Mail; die gesetzliche Mindestfrist von 15 Tagen unterschreiten wir
        nie.
      </p>
      <p>
        (2) Der Betrieb kann bis zum Inkrafttreten widersprechen oder das Vertragsverhältnis kündigen. Widerspricht er nicht und
        nutzt er die Plattform nach dem Inkrafttreten weiter, gelten die Änderungen als angenommen; darauf weisen wir in der
        Mitteilung ausdrücklich hin. Preisänderungen gelten nicht für bereits laufende Abrechnungszeiträume.
      </p>

      <h2>§ 13 Anwendbares Recht und Gerichtsstand</h2>
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
