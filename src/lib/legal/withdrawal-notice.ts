import { LEGAL } from "@/config/legal";

/**
 * Widerrufsbelehrung nach dem amtlichen Muster (Anlage 1 zu Art. 246a § 1 Abs. 2 S. 2 EGBGB, Textbaustein a für
 * Dienstleistungen, Gestaltungshinweis 3 Online-Widerrufsfunktion, Gestaltungshinweis 6 Wertersatz) und
 * Muster-Widerrufsformular (Anlage 2). Wortlaut verglichen mit gesetze-im-internet.de am 21.11.2026, keine Abweichung.
 * NICHT verändern außer den Angaben zum Betrieb (Sie-Form, wie im Muster).
 */
export type NoticeBlock = { kind: "h" | "p" | "li" | "small"; text: string };

export type BusinessContact = { name: string; address: string; phone: string; email: string };

/** Auf der statischen Seite /widerruf stehen statt der Betriebsdaten Hinweise auf die Buchungsbestätigung */
export const STATIC_BUSINESS_PLACEHOLDER = "[Name, Anschrift, Telefonnummer und E-Mail-Adresse des Betriebs – stehen in Ihrer Buchungsbestätigung]";

export function withdrawalNotice(b: BusinessContact | null): NoticeBlock[] {
  const contact = b ? `${b.name}, ${b.address}, Telefon: ${b.phone}, E-Mail: ${b.email}` : STATIC_BUSINESS_PLACEHOLDER;
  const formTo = b ? `${b.name}, ${b.address}, E-Mail: ${b.email}` : STATIC_BUSINESS_PLACEHOLDER;
  return [
    { kind: "h", text: "Widerrufsbelehrung" },
    { kind: "h", text: "Widerrufsrecht" },
    { kind: "p", text: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen." },
    { kind: "p", text: "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses." },
    {
      kind: "p",
      text:
        `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${contact}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. ` +
        `Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. ` +
        `Sie können Ihr Widerrufsrecht auch online unter ${LEGAL.withdrawalUrl} ausüben. ` +
        `Wenn Sie diese Online-Funktion nutzen, übermitteln wir Ihnen auf einem dauerhaften Datenträger (z. B. durch eine E-Mail) unverzüglich eine Eingangsbestätigung mit Informationen zum Inhalt der Widerrufserklärung sowie dem Datum und der Uhrzeit ihres Eingangs.`,
    },
    { kind: "p", text: "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden." },
    { kind: "h", text: "Folgen des Widerrufs" },
    {
      kind: "p",
      text:
        "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. " +
        "Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
    },
    {
      kind: "p",
      text:
        "Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.",
    },
    { kind: "h", text: "Muster-Widerrufsformular" },
    { kind: "p", text: "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)" },
    { kind: "li", text: `– An ${formTo}:` },
    { kind: "li", text: "– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)" },
    { kind: "li", text: "– Bestellt am (*)/erhalten am (*)" },
    { kind: "li", text: "– Name des/der Verbraucher(s)" },
    { kind: "li", text: "– Anschrift des/der Verbraucher(s)" },
    { kind: "li", text: "– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)" },
    { kind: "li", text: "– Datum" },
    { kind: "p", text: "(*) Unzutreffendes streichen." },
  ];
}

/** Eigener Block außerhalb des Musters, mit Abstand und eigener Überschrift (Anhang A, unterer Teil) */
export function withdrawalExtraNotes(): NoticeBlock[] {
  return [
    { kind: "h", text: "Weitere Hinweise zum Widerrufsrecht" },
    {
      kind: "li",
      text: `Vertragspartner: Ihr Vertragspartner für die Handwerkerleistung ist der oben genannte Betrieb. handwerker2go (${LEGAL.operatorName}, handelnd unter „${LEGAL.tradingName}“, ${LEGAL.address}) vermittelt den Vertrag und ist vom Betrieb bevollmächtigt, Ihren Widerruf entgegenzunehmen und die Rückzahlung über den Zahlungsdienstleister Stripe auszulösen. Ein Widerruf an ${LEGAL.email} oder über die Online-Funktion gilt als beim Betrieb eingegangen.`,
    },
    {
      kind: "li",
      text: "Vorzeitiges Erlöschen: Das Widerrufsrecht erlischt, wenn der Betrieb die Dienstleistung vollständig erbracht hat und mit der Ausführung erst begonnen hat, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch den Betrieb verlieren.",
    },
    {
      kind: "li",
      text: "Ausschluss: Ein Widerrufsrecht besteht nicht bei Verträgen, bei denen Sie den Betrieb ausdrücklich aufgefordert haben, Sie aufzusuchen, um dringende Reparatur- oder Instandhaltungsarbeiten vorzunehmen; dies gilt nicht für weitere bei dem Besuch erbrachte Dienstleistungen, die Sie nicht ausdrücklich verlangt haben (§ 312g Abs. 2 Nr. 11 BGB).",
    },
    {
      kind: "li",
      text: "Stornierung: Unabhängig vom Widerrufsrecht können Sie bis 24 Stunden vor dem Termin kostenlos stornieren. Innerhalb der Widerrufsfrist behandeln wir jede Stornierung als Widerruf.",
    },
  ];
}

/** Als Absätze für E-Mails (Textform, § 312f BGB): vollständige Belehrung im Mailtext */
export function withdrawalNoticeForMail(b: BusinessContact): string[] {
  const lines = [...withdrawalNotice(b), { kind: "p" as const, text: "" }, ...withdrawalExtraNotes()].map((x) => (x.kind === "h" ? x.text.toUpperCase() : x.text));
  return [...lines.filter((l) => l !== ""), `Vertrag online widerrufen: ${LEGAL.withdrawalUrl}`];
}

/** Text der Erklärung, die über die Online-Funktion abgegeben wird (Anhang B.1) */
export const WITHDRAWAL_DECLARATION_TEXT = "Hiermit widerrufe ich den oben bezeichneten Vertrag.";
