import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Email } from "@/components/legal/email";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL, legal, operatorLine, termsDate } from "@/config/legal";
import { formatCents, formatPercent, providerPricing as p, yearlyPerMonthCents } from "@/lib/pricing";

export const metadata: Metadata = pageMeta({
  title: "AGB für Betriebe",
  description: "Allgemeine Geschäftsbedingungen für Handwerksbetriebe auf dem Marktplatz handwerker2go: Mitgliedschaft, Provision, Zahlung über Stripe.",
  path: "/agb-betriebe",
});

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
        auf eigene Verantwortung.
      </p>
      <p>
        (2) Die Reihenfolge der Betriebe in den Suchergebnissen richtet sich nach diesen Hauptparametern, absteigend gewichtet:
        Entfernung zum Einsatzort, freier Termin zur gewünschten Zeit, Bewertungen, Zuverlässigkeit (Antwortzeit auf Anfragen und
        Absagequote) und Vollständigkeit des Profils. Einzelheiten stehen auf der Seite{" "}
        <Link href="/ranking" className="underline">So sortieren wir die Suchergebnisse</Link>. Das gewählte Abo-Modell und die Höhe
        der Provision haben keinen Einfluss auf das Ranking; bezahlte Platzierungen gibt es nicht.
      </p>

      <h2>§ 2a Vollmacht, Empfangsvollmacht und Widerrufsfunktion</h2>
      <p>
        (1) <strong>Sofortige Bestätigung.</strong> Aktiviert der Betrieb im Dashboard die sofortige Bestätigung, bevollmächtigt er uns,
        Buchungen von Kunden in seinem Namen anzunehmen, soweit sie den im Profil hinterlegten Leistungen, Festpreisen, Arbeitszeiten,
        Einsatzgebieten und freien Terminen entsprechen. Die Vollmacht umfasst die Abgabe der Annahmeerklärung sowie die Übermittlung
        der Vertragsbestätigung und der Widerrufsbelehrung in seinem Namen. Der Betrieb kann die sofortige Bestätigung jederzeit mit
        Wirkung für künftige Buchungen deaktivieren.
      </p>
      <p>
        (2) <strong>Empfangsvollmacht.</strong> Der Betrieb bevollmächtigt uns, für alle über die Plattform geschlossenen Verträge
        Erklärungen der Kunden in seinem Namen entgegenzunehmen, insbesondere Widerrufs- und Stornierungserklärungen. Eine Erklärung,
        die bei uns eingeht, gilt als beim Betrieb eingegangen. Wir leiten sie unverzüglich an den Betrieb weiter.
      </p>
      <p>
        (3) <strong>Widerrufsbelehrung und Widerrufsfunktion.</strong> Der Betrieb beauftragt uns, den Kunden in seinem Namen die
        Widerrufsbelehrung nach dem gesetzlichen Muster zu erteilen und auf der Plattform die elektronische Widerrufsfunktion nach
        § 356a BGB bereitzustellen, einschließlich der Eingangsbestätigung an den Kunden.
      </p>
      <p>
        (4) <strong>Rückzahlungen.</strong> Der Betrieb ermächtigt uns, nach einem wirksamen Widerruf, nach einer kostenlosen
        Stornierung oder nach einer Stornierung, die nach den AGB für Kunden als Widerruf gilt, die Rückzahlung über sein Stripe-Konto
        auszulösen. Hat der Betrieb auf ausdrückliches Verlangen des Kunden bereits mit der Leistung begonnen, teilt er uns den
        Wertersatz innerhalb von 10 Tagen nach Eingang des Widerrufs mit; andernfalls erstatten wir am 14. Tag den vollen Betrag.
      </p>
      <p>
        (5) <strong>Angebote.</strong> Angebote nach einem Besichtigungstermin erstellt der Betrieb über die Plattform; der Vertrag
        kommt durch Online-Annahme des Kunden zustande. Der Betrieb lässt Angebote zu über die Plattform vermittelten Aufträgen nicht
        vor Ort annehmen.
      </p>

      <h2>§ 3 Registrierung, Prüfung und Freischaltung</h2>
      <p>
        (1) Der Betrieb registriert sich mit seinen Unternehmensdaten und lädt die Gewerbeanmeldung, den Nachweis seiner
        Betriebshaftpflichtversicherung und, für zulassungspflichtige Gewerke wie Elektro, Sanitär und Maler, die Eintragung in die
        Handwerksrolle hoch. Außerdem gibt der Betrieb seinen Steuerstatus an (regelbesteuert oder Kleinunternehmer nach § 19 UStG),
        die Höhe seiner Anfahrtskosten in Euro und einen Unternehmer-Nachweis nach § 6 Abs. 2. Wir prüfen die
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
        (3) Schließt der Betrieb keine Mitgliedschaft ab, erscheint sein Profil nach der Einführungsphase nicht mehr in der Suche;
        bereits gebuchte Aufträge laufen normal weiter. Zur Umsatzsteuer siehe § 6.
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
      <p>
        (6) Abweichend von Abs. 1 bis 3 und § 5 Abs. 2 gelten für Betriebe, die sich mit einem von uns ausgegebenen Partnercode
        registriert haben oder denen wir einen solchen Code zugeordnet haben, die zu diesem Code vereinbarten Konditionen. Diese
        werden im Dashboard angezeigt.
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
        (4) Storniert ein Kunde kostenlos, widerruft er wirksam, gilt seine Stornierung nach den AGB für Kunden als Widerruf, oder
        lehnt der Betrieb eine Buchung ab, wird dem Kunden der Betrag über Stripe aus dem Stripe-Konto des Betriebs erstattet
        (abzüglich eines etwaigen Wertersatzes); die Provision wird im gleichen Verhältnis erstattet. Storniert der Kunde nach Ablauf
        der Widerrufsfrist später als {legal.freeCancellationHours} Stunden vor dem Termin oder erscheint er nicht, behält der Betrieb
        die Pauschale nach den AGB für Kunden ({legal.lateCancellationPercent} % des Festpreises, höchstens die im Profil angegebenen
        Anfahrtskosten); die Provision wird auf die Pauschale berechnet. Für kostenlose Besichtigungstermine fällt keine Pauschale an.
        Mit der kostenlosen Stornierung bis {legal.freeCancellationHours} Stunden vor dem Termin und der Pauschalregelung verzichtet der
        Betrieb gegenüber dem Kunden auf weitergehende Ansprüche wegen der Kündigung (§ 648 BGB).
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

      <h2>§ 6 Umsatzsteuer und Unternehmer-Nachweis</h2>
      <p>
        (1) Alle Preise für Betriebe sind Nettopreise. Unsere Leistungen (Provision und Mitgliedschaft) erbringen wir als in Malta
        ansässiger Unternehmer (USt-IdNr. {LEGAL.vatId}) an den Betrieb als Unternehmer. Ort der Leistung ist Deutschland. Wir stellen
        unsere Leistungen ohne Umsatzsteuer in Rechnung, mit dem Hinweis „Reverse Charge – Steuerschuldnerschaft des
        Leistungsempfängers (Art. 196 MwStSystRL, § 13b UStG)“.
      </p>
      <p>
        (2) Voraussetzung für die Teilnahme ist der Nachweis, dass der Betrieb Unternehmer ist, durch (a) eine gültige deutsche
        USt-IdNr., die wir über das Bestätigungsverfahren der EU (VIES) prüfen, oder (b) bei Betrieben ohne USt-IdNr. die
        Gewerbeanmeldung, bei zulassungspflichtigen Gewerken die Eintragung in die Handwerksrolle, die Steuernummer und eine
        Erklärung des Betriebs, dass er die Leistungen für sein Unternehmen bezieht. Wir empfehlen auch Kleinunternehmern, beim
        Bundeszentralamt für Steuern eine USt-IdNr. zu beantragen und nachzureichen.
      </p>
      <p>
        (3) <strong>Wichtig:</strong> Der Betrieb schuldet auf unsere Provision und Mitgliedschaft die deutsche Umsatzsteuer nach
        § 13b UStG und meldet sie bei seinem Finanzamt an. <strong>Das gilt auch für Kleinunternehmer nach § 19 UStG</strong>: Sie
        müssen die Steuer für die betreffenden Zeiträume anmelden und abführen und können sie nicht als Vorsteuer abziehen.
        Regelbesteuerte Betriebe können die Steuer in der Regel zugleich als Vorsteuer abziehen. Die steuerliche Behandlung beim
        Betrieb liegt in seiner Verantwortung; im Zweifel sollte er seinen Steuerberater fragen.
      </p>
      <p>
        (4) Der Betrieb teilt uns Änderungen seines Steuerstatus oder seiner USt-IdNr. unverzüglich mit. Wird eine USt-IdNr. ungültig,
        dürfen wir die Abrechnung bis zur Klärung anhalten.
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
        seine steuerlichen Pflichten selbst. Änderungen an seinen Angaben teilt er uns unverzüglich mit. Der Betrieb kennzeichnet
        seinen Steuerstatus wahrheitsgemäß; danach zeigen wir seine Preise als „inkl. 19 % MwSt.“ oder „Endpreis, keine USt nach
        § 19 UStG“ an. Die Anfahrt ist im Festpreis enthalten.
      </p>
      <p>
        (3) Der Betrieb wickelt über die Plattform vermittelte Aufträge nicht an der Plattform vorbei ab. In öffentlichen
        Profilangaben sind Telefonnummern, E-Mail-Adressen, Links und Hinweise auf Kontakt außerhalb der Plattform nicht erlaubt;
        Kontaktdaten erhalten Kunde und Betrieb nach der Buchung.
      </p>
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
        (2) Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist {LEGAL.jurisdictionCourt} (Deutschland). Dieser
        Gerichtsstand ist nicht ausschließlich; jede Partei kann auch an den gesetzlich zuständigen Gerichten klagen.
      </p>
      <p>(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
    </LegalPage>
  );
}
