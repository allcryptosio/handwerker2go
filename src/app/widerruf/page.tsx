import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine } from "@/config/legal";

export const metadata: Metadata = { title: "Widerrufsbelehrung", alternates: { canonical: "/widerruf" }, robots: { index: false } };

/**
 * Entwurf nach Muster-Widerrufsbelehrung (Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB) für Dienstleistungen.
 * Vertragspartner der Handwerkerleistung ist der Betrieb; handwerker2go nimmt Widerrufe als Empfangsbote entgegen.
 */
export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <p>
        Diese Belehrung gilt für Verbraucher, die über handwerker2go eine Handwerkerleistung bei einem Betrieb buchen. Dein
        Vertragspartner ist der jeweilige Betrieb, dessen Name und Anschrift in der Buchungsbestätigung stehen. Du kannst deinen
        Widerruf auch an handwerker2go richten; wir leiten ihn unverzüglich an den Betrieb weiter.
      </p>

      <h2>Widerrufsrecht</h2>
      <p>
        Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt
        vierzehn Tage ab dem Tag des Vertragsabschlusses.
      </p>
      <p>
        Um dein Widerrufsrecht auszuüben, musst du uns ({operatorLine()}, E-Mail: {legal.email}, Telefon: {legal.phone}) oder
        dem Betrieb mittels einer eindeutigen Erklärung (z. B. ein
        mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du
        kannst dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
      </p>
      <p>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
        Widerrufsfrist absendest.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn du diesen Vertrag widerrufst, sind alle Zahlungen, die du erhalten hast, unverzüglich und spätestens binnen vierzehn
        Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags eingegangen ist. Für diese
        Rückzahlung wird dasselbe Zahlungsmittel verwendet, das du bei der ursprünglichen Transaktion eingesetzt hast, es sei
        denn, mit dir wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden dir wegen dieser Rückzahlung Entgelte
        berechnet.
      </p>
      <p>
        Hast du verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so hast du einen angemessenen Betrag
        zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem du den Betrieb von der Ausübung des Widerrufsrechts
        hinsichtlich dieses Vertrags unterrichtest, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im
        Vertrag vorgesehenen Dienstleistungen entspricht.
      </p>

      <h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
      <p>
        Das Widerrufsrecht erlischt, wenn die Dienstleistung vollständig erbracht wurde und du vor Beginn der Ausführung
        ausdrücklich zugestimmt und zur Kenntnis genommen hast, dass du dein Widerrufsrecht bei vollständiger Vertragserfüllung
        verlierst. Bei dringenden Reparatur- oder Instandhaltungsarbeiten, zu denen du den Betrieb ausdrücklich aufgefordert
        hast, besteht kein Widerrufsrecht (§ 312g Abs. 2 Nr. 11 BGB).
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>(Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende es zurück.)</p>
      <p>
        An: {operatorLine()}, {legal.email} (zur Weiterleitung an den Betrieb, dessen Name in der Buchungsbestätigung steht)
      </p>
      <p>
        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden
        Dienstleistung (*):
        <br />
        ______________________________________
        <br />
        Bestellt am (*) / erhalten am (*): ____________
        <br />
        Buchungsnummer: ____________
        <br />
        Name des/der Verbraucher(s): ____________
        <br />
        Anschrift des/der Verbraucher(s): ____________
        <br />
        Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________
        <br />
        Datum: ____________
      </p>
      <p>(*) Unzutreffendes streichen.</p>
      <p>
        Neben dem Widerrufsrecht gilt die kostenlose Stornierung bis {legal.freeCancellationHours} Stunden vor dem Termin nach den{" "}
        <Link href="/agb" className="underline">AGB für Kunden</Link>.
      </p>
    </LegalPage>
  );
}
