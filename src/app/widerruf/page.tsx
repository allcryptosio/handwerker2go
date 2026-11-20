import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Email } from "@/components/legal/email";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, operatorLine, termsDate } from "@/config/legal";

export const metadata: Metadata = pageMeta({
  title: "Widerrufsbelehrung",
  description: "Widerrufsbelehrung für Handwerkerleistungen, die du über handwerker2go bei einem Handwerksbetrieb buchst, mit Muster-Widerrufsformular.",
  path: "/widerruf",
});

/**
 * Nach Muster-Widerrufsbelehrung für Dienstleistungen (Anlage 1 zu Art. 246a § 1 Abs. 2 S. 2 EGBGB) und
 * Muster-Widerrufsformular (Anlage 2). Angepasst nur, wo nötig: Du-Form, Vertragspartner ist der Betrieb,
 * handwerker2go nimmt Widerrufe zur Weiterleitung entgegen. Offene Prüfpunkte: docs/RECHTLICHE-PRUEFUNGEN.md.
 */
export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung für die über handwerker2go gebuchte Handwerkerleistung">
      <p>Stand: {termsDate()}</p>
      <p>
        Diese Belehrung gilt für Verbraucherinnen und Verbraucher, die über handwerker2go eine Handwerkerleistung bei einem
        Handwerksbetrieb buchen. Dein Vertragspartner ist der Betrieb; sein Name, seine Anschrift, Telefonnummer und
        E-Mail-Adresse stehen in deiner Buchungsbestätigung. handwerker2go vermittelt nur und nimmt deinen Widerruf auch selbst
        entgegen, um ihn an den Betrieb weiterzuleiten.
      </p>

      <h2>Widerrufsrecht</h2>
      <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
      <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
      <p>
        Um dein Widerrufsrecht auszuüben, musst du den Betrieb (Name, Anschrift, Telefonnummer und E-Mail-Adresse laut
        Buchungsbestätigung) oder handwerker2go ({operatorLine()}, E-Mail: <Email />, Telefon: {legal.phone}) mittels einer
        eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss, diesen Vertrag
        zu widerrufen, informieren. Du kannst dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht
        vorgeschrieben ist.
      </p>
      <p>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
        Widerrufsfrist absendest.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn du diesen Vertrag widerrufst, hat der Betrieb dir alle Zahlungen, die er von dir erhalten hat, unverzüglich und
        spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags
        beim Betrieb oder bei handwerker2go eingegangen ist. Für diese Rückzahlung wird dasselbe Zahlungsmittel verwendet, das du
        bei der ursprünglichen Transaktion eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas anderes vereinbart; in
        keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet. Die Rückzahlung läuft über den Zahlungsdienstleister
        Stripe.
      </p>
      <p>
        Hast du verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so hast du dem Betrieb einen
        angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem du den Betrieb oder handwerker2go von der
        Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichtest, bereits erbrachten Dienstleistungen im Vergleich
        zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
      </p>

      <h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
      <p>
        Das Widerrufsrecht erlischt, wenn der Betrieb die Dienstleistung vollständig erbracht hat und mit der Ausführung erst
        begonnen hat, nachdem du dazu deine ausdrückliche Zustimmung gegeben und gleichzeitig deine Kenntnis davon bestätigt hast,
        dass du dein Widerrufsrecht bei vollständiger Vertragserfüllung durch den Betrieb verlierst. Diese Erklärung gibst du bei
        der Buchung ab, wenn dein Termin innerhalb der Widerrufsfrist liegt; wir wiederholen sie in der Buchungsbestätigung.
      </p>
      <p>
        Kein Widerrufsrecht besteht, wenn du den Betrieb ausdrücklich aufgefordert hast, dich aufzusuchen, um dringende Reparatur-
        oder Instandhaltungsarbeiten vorzunehmen (§ 312g Abs. 2 Nr. 11 BGB).
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>(Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende es zurück.)</p>
      <div className="rounded-card border border-line-strong bg-soft p-5 font-mono text-[14px] leading-relaxed text-ink">
        <p>
          An: ______________________________ (Name und Anschrift des Betriebs laut Buchungsbestätigung)
          <br />
          oder an: {operatorLine()}, E-Mail: <Email />
        </p>
        <p className="mt-4">
          Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden
          Dienstleistung (*):
          <br />
          ______________________________________________
        </p>
        <p className="mt-4">
          Vertrag geschlossen am: ____________
          <br />
          Buchungsnummer: ____________
          <br />
          Name des/der Verbraucher(s): ______________________________
          <br />
          Anschrift des/der Verbraucher(s): ______________________________
          <br />
          Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________
          <br />
          Datum: ____________
        </p>
        <p className="mt-4">(*) Unzutreffendes streichen.</p>
      </div>

      <h2>Hinweis zur kostenlosen Stornierung</h2>
      <p>
        Unabhängig von deinem Widerrufsrecht kannst du eine Buchung bis {legal.freeCancellationHours} Stunden vor dem Termin
        kostenlos stornieren, nach den <Link href="/agb" className="underline">AGB für Kunden</Link>. Die Stornierungsregeln
        schränken dein gesetzliches Widerrufsrecht nicht ein.
      </p>
    </LegalPage>
  );
}
