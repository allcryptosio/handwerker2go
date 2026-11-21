/** Einwilligung in die Bewertungsmail (Anhang C.3), nie vorausgewählt */
export const REVIEW_OPTIN_TEXT =
  "Ja, handwerker2go darf mich nach dem Termin einmal per E-Mail bitten, den Betrieb zu bewerten. Ich kann das jederzeit über den Link in der E-Mail oder per Nachricht an info@handwerker2go.com widerrufen.";
export const REVIEW_OPTIN_VERSION = "C.3-2026-11-21";
/** Fußzeile jeder Bewertungsmail */
export const reviewMailFooter = (unsubscribeUrl: string) =>
  `Sie erhalten diese E-Mail, weil Sie bei Ihrer Buchung eingewilligt haben. Keine weiteren Bewertungsanfragen: ${unsubscribeUrl}`;
