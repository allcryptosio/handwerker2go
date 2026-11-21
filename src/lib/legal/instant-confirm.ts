/** Aktivierungserklärung für die sofortige Bestätigung (AGB für Betriebe § 2a Abs. 1) */
export const INSTANT_CONFIRM_TEXT =
  "Sofortige Bestätigung. Aktiviert der Betrieb im Dashboard die sofortige Bestätigung, bevollmächtigt er uns, Buchungen von Kunden in seinem Namen anzunehmen, soweit sie den im Profil hinterlegten Leistungen, Festpreisen, Arbeitszeiten, Einsatzgebieten und freien Terminen entsprechen. Die Vollmacht umfasst die Abgabe der Annahmeerklärung sowie die Übermittlung der Vertragsbestätigung und der Widerrufsbelehrung in seinem Namen. Der Betrieb kann die sofortige Bestätigung jederzeit mit Wirkung für künftige Buchungen deaktivieren.";
export const INSTANT_CONFIRM_VERSION = "E-2a1-2026-11-21";

/** SQL-Ausdruck für den wirksamen Buchungsmodus eines Betriebs (Alias p) */
export const EFFECTIVE_BOOKING_MODE_SQL =
  "case when p.booking_mode = 'instant' and p.instant_confirm_consent_at is not null then 'instant' else 'confirm' end";
