# handwerker2go: rechtlich startklar (Branch `legal/startklar-2026-11`)

Stand 21.11.2026. Technische Umsetzung der Vorabprüfung vom 21.11.2026. **Keine Rechtsberatung.** Nichts ist gemergt oder deployt. Es wurden keine E-Mails an echte Empfänger verschickt und keine Produktivdaten verändert.

- **Geprüft:** Build, Typecheck und Lint sind sauber. 35 Unit- und Integrationstests sind grün. Der E2E-Test für den Widerruf ist grün.
- **Getestet gegen:** die Testdatenbank `h2g_branchtest`, mit Stripe-Mock, VIES-Mock und Mail-Ausgang statt Versand.

---

## 1. Änderungen je Aufgabe

| Nr. | Was | Neue Tabellen/Spalten | Neue Routen | Tests |
|---|---|---|---|---|
| 1 | Zentrale Betreiber-Config `LEGAL` (`src/config/legal-data.json` + `src/config/legal.ts`). Impressum und `scripts/stripe-setup.mjs` lesen daraus. Die bisherige Schnittstelle `legal` ist ein Alias darauf. | – | – | – |
| 2 | Elektronische Widerrufsfunktion (siehe Details unter der Tabelle) | `withdrawals` | `/vertrag-widerrufen`, `/admin/widerrufe` | `tests/e2e/widerruf.e2e.cjs` |
| 3 | Widerrufsbelehrung nach Anhang A (siehe Details unter der Tabelle) | – | – | im E2E-Test |
| 4 | Checkbox zum vorzeitigen Beginn (siehe Details unter der Tabelle) | – | – | – |
| 5 | Angebote nach der Besichtigung (siehe Details unter der Tabelle) | `offers`, `bookings.offer_id` | `/angebot/[id]` | – |
| 6 | Stornierung und Pauschale (siehe Details unter der Tabelle) | `provider_profiles.anfahrtskosten_cents`; `bookings.anfahrtskosten_cents` (Stand bei Buchung), `cancellation_fee_cents`, `no_show_at` | – | `tests/cancellation.test.ts` |
| 7 | Steuerstatus und Preisanzeige je Preis (`src/lib/booking/price-label.ts`) in Suche, Buchungsseite, Formular, Buchungsdetails, Angebot und Mails. Gebucht werden kann nur mit Steuerstatus. Die SEO-Seiten `/hamburg/*` und der Ratgeber enthalten keine Preisangaben, dort war nichts anzupassen. | `provider_profiles.tax_status`, `vat_id_valid`, `vat_id_checked_at`, `vies_request_id`, `vies_name`, `vies_address`, `steuernummer`, `business_proof_type`, `business_proof_file_ids`, `unternehmer_declaration_at`, `unternehmer_declaration_text_version`; `bookings.provider_tax_status` | – | `tests/price-label.test.ts` |
| 8 | Unternehmer-Nachweis (siehe Details unter der Tabelle) | `vies_checks`, `legal_declarations` | – | `tests/vies.test.ts` |
| 9 | Eigene Rechnungen (siehe Details unter der Tabelle) | `invoices`, `invoice_counters`, Trigger `app.invoices_append_only` | `/admin/rechnungen`, `/api/rechnung/[id]`, `/api/admin/zm-export` | `tests/invoice-document.test.ts`, `tests/invoice-numbering.test.ts` |
| 10 | AGB für Betriebe nach Anhang E und Schalter „Sofortige Bestätigung“ (siehe Details unter der Tabelle) | `provider_profiles.instant_confirm_consent_at`, `instant_confirm_terms_version`, `instant_confirm_user_id` | – | – |
| 11 | Kunden-AGB nach Anhang D (§ 4 Abs. 2, § 4a, § 5 Abs. 1, § 6 neu, § 7 Abs. 3, § 8a). Steuerkasten F.3 auf `/partner`. Datenschutzerklärung nach Anhang G. Impressum mit Betreiber aus `LEGAL` und der DSA-Kontaktstelle. | – | – | – |
| 12 | Nur geprüft, siehe Abschnitt 3 | – | – | – |
| 13 | Bewertungsmails nur mit Opt-in (siehe Details unter der Tabelle) | `bookings.review_optin`, `review_optin_at`, `review_optin_text_version`; `review_mail_blocklist` | `/bewertungsmails-abbestellen` (neu gefasst) | `tests/review-optin.test.ts` |
| 14 | „Inhalt melden“ und DSA (siehe Details unter der Tabelle) | `content_reports` | `/inhalt-melden`, `/kontakt-dsa`, `/admin/meldungen` | – |
| 15 | Link „So sortieren wir die Suchergebnisse“ sichtbar direkt über der Ergebnisliste. Vorher lag er nur in einem eingeklappten Bereich. | – | – | – |
| 16 | AGB für Betriebe § 13 Abs. 2: Gerichtsstand Hamburg, nicht ausschließlich; Malta gestrichen. Steckt im Commit von Aufgabe 10. Die Kunden-AGB bleiben ohne Gerichtsstand. | – | – | – |
| 17 | Löschjob nur mit `RETENTION_DELETE_ENABLED=1`, Standard ist der Probelauf. Neue Fristen für Widerrufe, Meldungen, Einwilligungen zur Bewertungsmail und VIES-Prüfungen. Rechnungen werden nie gelöscht. | – | – | – |
| – | Statischer Check: Die Migrationen enthalten kein `DROP`, `RENAME`, `ALTER … TYPE`, `DELETE` oder `TRUNCATE` | – | – | `tests/migrations-additive.test.ts` |

**Aufgabe 2, Widerrufsfunktion (§ 356a BGB):**
- Button „Vertrag widerrufen“ im Footer jeder Seite. Er hat eine Kontrastfarbe, steht in einem eigenen Block und ist kein Textlink zwischen den Rechtstexten.
- Weitere Einstiege: im Kundenkonto bei jeder Buchung, auf der Buchungsseite und als Link in jeder Buchungs- und Angebotsbestätigung.
- Seite `/vertrag-widerrufen`: öffentlich, zweistufig, ohne Feld für einen Grund. Spam-Schutz über Honeypot und Rate-Limit pro IP.
- Eingangsbestätigung nach B.1 mit Datum und Uhrzeit (Europe/Berlin), Kopie an den Betrieb.
- Liegt der Termin in der Zukunft, wird automatisch erstattet.
- Hat die Leistung schon begonnen, entscheidet der Betrieb über den Wertersatz. Ab Tag 10 gibt es eine Erinnerung, an Tag 14 wird automatisch voll erstattet.
- Ist die Frist abgelaufen oder der Widerruf nicht zuzuordnen, entscheidet ein Mensch über `/admin/widerrufe`, mit Textbaustein B.2 als vorbereiteter E-Mail.
- Code: `src/lib/booking/withdrawal.ts`.

**Aufgabe 3, Widerrufsbelehrung nach Anhang A:**
- Amtliches Muster in Sie-Form, Textquelle `src/lib/legal/withdrawal-notice.ts`.
- Steht auf `/widerruf` und vollständig im Mailtext jeder Buchungsbestätigung.
- Mit Online-Satz nach Gestaltungshinweis 3, Muster-Widerrufsformular und den Zusatzhinweisen außerhalb des Musters.

**Aufgabe 4, vorzeitiger Beginn:**
- Checkbox im Wortlaut C.1, nie vorausgewählt.
- Gespeichert in `consents` mit Zeitstempel, Textversion (`…|C.1-2026-11-21`) und Buchungsnummer.
- Der Wortlaut wird in der Bestätigung wiederholt.

**Aufgabe 5, Angebote nach der Besichtigung:**
- Der Betrieb erstellt das Angebot auf der Buchungsseite der Besichtigung: Positionen, Termin, Dauer, Gültigkeit. Dazu der Pflichthinweis C.2, auch im Dashboard.
- Der Kunde nimmt auf `/angebot/[id]` mit „Angebot zahlungspflichtig annehmen“ an und zahlt über Stripe wie bei Festpreis-Buchungen. Danach bekommt er die Vertragsbestätigung mit Belehrung.
- Die Besichtigung bleibt kostenlos und ohne Pauschale.

**Aufgabe 6, Stornierung und Pauschale:**
- Innerhalb der Widerrufsfrist gilt jede Stornierung als Widerruf und wird in `withdrawals` mit `source = cancel_flow` gespeichert.
- Danach: kostenlos bis 24 Std. vor dem Termin, sonst Pauschale `min(25 %, Anfahrtskosten)` und Erstattung des Rests.
- No-Show: Betrieb meldet „Kunde nicht angetroffen“. Nach der Frist gilt die Pauschale, innerhalb der Frist wird ein Admin-Fall daraus.
- Pflichtfeld Anfahrtskosten:
  - bei Registrierung und in den Einstellungen,
  - Freischaltung und Suche werden ohne Wert gesperrt,
  - Hinweis im Dashboard.
- Der Hinweistext steht vor der Buchung und in der Bestätigung.

**Aufgabe 8, Unternehmer-Nachweis:**
- **Weg A:** USt-IdNr. mit sofortiger VIES-Prüfung. MT33258727 ist Requester, damit eine `requestIdentifier` zurückkommt. Jede Prüfung wird in `vies_checks` protokolliert. Bei „ungültig“ oder API-Ausfall wird Weg B angeboten.
- **Weg B:** Steuernummer, Gewerbeanmeldung bzw. Handwerksrolle und Erklärung F.1. Die Erklärung wird in `legal_declarations` gespeichert. Dazu der Hinweis F.2.
- Steuerstatus nachtragen und USt-IdNr. nachreichen geht im Dashboard. Der Admin sieht die Nachweise.

**Aufgabe 9, eigene Rechnungen an Betriebe:**
- **Nummernkreis:** Format `H2G-JJJJ-00001`. Die Nummer kommt aus einem Zähler je Jahr in derselben Transaktion. Das ist lückenlos, auch bei Rollback und Parallelität.
- **Inhalt:** alle Pflichtangaben aus 9.1.
- **Ablage:** PDF mit pdf-lib, nur anhängend gespeichert, SHA-256-Hash in der DB. Ein Trigger verhindert Ändern und Löschen.
- **Stornierung:** nur per Gutschrift mit eigener Nummer und Bezug.
- **Provision:** monatliche Sammelrechnung aus der DB mit Einzelaufstellung. Sie ersetzt die bisherigen Stripe-Rechnungen: `scripts/commission-invoices.mts`, die alte `.mjs` ist entfernt.
- **Mitgliedschaft:** Rechnung bei Stripe-Ereignis `invoice.paid`.
- **VIES-Prüfung:** erneut vor jeder Rechnung. Ist die Nummer ungültig, wird die Rechnung angehalten (`on_hold`, noch ohne Nummer) und der Admin alarmiert.
- **Export für die Zusammenfassende Meldung:**
  - CSV und XLSX, je Quartal oder Monat.
  - Eigenes Blatt für Weg B.
  - Kopfzeile „Prüfung durch Steuerberater vor Abgabe.“

**Aufgabe 10, AGB für Betriebe und sofortige Bestätigung:**
- AGB für Betriebe nach Anhang E: § 2, § 2a neu, § 3 Abs. 1, § 4 Abs. 3, § 5 Abs. 4, § 6 neu, § 7 Abs. 2, § 13 Abs. 2. Version und Datum: 2026-11-21.
- Der Schalter „Sofortige Bestätigung“ wirkt nur mit der Aktivierungserklärung § 2a Abs. 1. Protokolliert werden Zeitpunkt, Nutzer und AGB-Version.
- Bestandsbetriebe bestätigen einmalig im Dashboard. Bis dahin laufen ihre Buchungen als „Betrieb bestätigt selbst“, ohne Datenverlust.
- Änderungsmitteilung E.2 liegt als Skript `scripts/agb-change-notice.mts` bereit. Ohne `--send` läuft es nur zur Probe und verschickt nichts.

**Aufgabe 13, Bewertungsmails nur mit Opt-in:**
- Checkbox C.3 in Checkout und Angebotsannahme, nie vorausgewählt.
- Die Bitte geht nur mit Opt-in raus, einmal, frühestens 24 Std. nach Terminende.
- Abmeldelink mit einem Klick ohne Login. Die Sperrliste gilt je E-Mail-Adresse für alle künftigen Buchungen.
- Fußzeile nach C.3. Bewerten im Kundenkonto geht weiterhin ohne Opt-in.

**Aufgabe 14, „Inhalt melden“ und DSA:**
- Link an jeder Bewertung und an jedem Betriebsprofil. Formular ohne Login, mit Pflichtbegründung und Erklärung „in gutem Glauben“.
- Eingangsbestätigung an Meldende, die eine E-Mail angeben.
- Admin-Entscheidung: Betroffene bekommen eine Begründung nach H.2, Meldende das Ergebnis.
- Kontaktstelle nach H.1 auf `/kontakt-dsa`, im Impressum und in der Datenschutzerklärung.

**Infrastruktur:**
- `sendMail` liefert jetzt die IDs der Mail zurück und kann Anhänge mitschicken.
- Test-Schalter `STRIPE_MOCK=1` (wird bei Live-Schlüsseln ignoriert) und `VIES_MOCK=valid|invalid|error`.
- Neue Abhängigkeiten: `pdf-lib`, `exceljs`.

## 2. Fundstellen Betreibername

| Datei | Vorher | Jetzt |
|---|---|---|
| `src/app/impressum/page.tsx` | „Joe Becker“ und die Anschrift fest im Text | `LEGAL.operatorName` und `LEGAL.addressLines` |
| `src/config/legal.ts` | Name und Anschrift als Felder | `LEGAL` aus `src/config/legal-data.json`, `operatorLine()` liest daraus |
| `scripts/stripe-setup.mjs` | Anschrift fest im Code | liest `legal-data.json` |
| `src/app/agb-betriebe/page.tsx` | Gerichtsstand mit festem Ort | `LEGAL.jurisdictionCourt` |
| `docs/ARCHITEKTUR.md` | Hinweis mit Namen | Verweis auf die Config |

- **Nur noch aus der Config:** AGB, Widerrufsbelehrung, Datenschutzerklärung, alle Mails und die Rechnungen.
- **Übrige Treffer für „Becker“:** stehen nur in den Postleitzahl-Rohdaten (`data/geonames-…`) und haben mit dem Betreiber nichts zu tun.

## 3. Stripe-Befund (Aufgabe 12)

- **Charge-Typ: Direct Charges.** Das ist der Soll-Zustand. Kein Umbau nötig.
- **Buchungen:**
  - Datei: `src/lib/stripe/payments.ts`, Funktion `createBookingCheckout`, Zeilen 26–44.
  - Die Checkout-Session wird mit `{ stripeAccount: providerAccountId }` auf dem Konto des Betriebs angelegt.
  - Die Provision läuft über `payment_intent_data.application_fee_amount`.
- **Keine anderen Muster:** Im ganzen Repository gibt es kein `transfer_data`, kein `on_behalf_of`, kein `transfers.create` und keine `paymentIntents.create` oder `charges.create` auf dem Plattformkonto.
- **Erstattungen:** `refundBookingPayment` in `src/lib/stripe/payments.ts` setzt `refund_application_fee: true` und `stripeAccount`. Die neuen Erstattungen aus den Aufgaben 2 und 6 nutzen genau diese Funktion.
- **Statement Descriptor:** Der Code setzt keinen eigenen. Bei Direct Charges nutzt Stripe deshalb den Descriptor des Betriebskontos, auf dem Kontoauszug steht also der Betrieb.
- **Mitgliedschaft:** Checkout auf dem Plattformkonto (`src/lib/stripe/billing.ts:51`). Das ist richtig, weil handwerker2go hier selbst der Leistende ist.

## 4. Abweichungen von den Anhängen und offene technische Punkte

1. **Amtliches Muster:** Am 21.11.2026 gegen gesetze-im-internet.de geprüft (Anlage 1 und Anlage 2 zu Art. 246a EGBGB). Anhang A stimmt wörtlich überein, mit Textbaustein a, Gestaltungshinweis 3 und Gestaltungshinweis 6. Keine Abweichung.
2. **Preisanzeige (7):** Statt „ · “ als Trenner steht ein Komma, z. B. „Festpreis 99,00 € inkl. 19 % MwSt., Anfahrt inklusive“ oder „Festpreis 99,00 €, Endpreis, keine USt nach § 19 UStG, Anfahrt inklusive“. Wortlaut und Inhalt bleiben gleich, nur die Darstellung entspricht der Gestaltungsregel der Seite.
3. **Automatische Erstattung beim Online-Widerruf (2.5):**
   - **Regel:** Automatisch erstattet wird nur, wenn die Zuordnung gesichert ist: eingeloggter Kunde oder angegebene E-Mail gleich der E-Mail der Buchung.
   - **Grund:** Sonst könnte jeder, der eine Buchungsnummer kennt, ohne Login eine fremde Buchung erstatten lassen.
   - **Was trotzdem passiert:** Der Widerruf wird in jedem Fall angenommen und bestätigt. Fälle ohne gesicherte Zuordnung landen als Admin-Fall.
4. **Rechnungsangabe Weg B (9.1 Nr. 4):** Statt „Gewerbeanmeldung vom …“ steht „Gewerbeanmeldung vorgelegt am …“, also das Datum des Uploads. Das Datum auf dem Dokument selbst wird nicht erfasst.
5. **Neue Tabelle `legal_declarations`:** Die Tabelle `consents` erlaubt per Prüfregel nur `early_start_withdrawal`. Sie zu ändern bräuchte `DROP CONSTRAINT`, und das ist verboten. Deshalb liegen Unternehmer-Erklärung, Opt-in zur Bewertungsmail und Erklärung zur sofortigen Bestätigung in der neuen, additiven Tabelle `legal_declarations`.
6. **Dashboard-Benachrichtigung zum Widerruf (2.3):** Es gibt kein allgemeines Benachrichtigungssystem. Widerrufe erscheinen als roter Block auf Dashboard → Termine, und der Betrieb bekommt eine E-Mail.
7. **Bewertungsmail (13):** Sie geht zusätzlich nur zwischen 9 und 20 Uhr Berliner Zeit raus und höchstens 7 Tage nach dem Termin.
8. **Stripe-Webhook (9.2):** Das Ereignis `invoice.paid` muss am Plattform-Webhook im Stripe-Dashboard **noch aktiviert werden**. Bisher sind dort 7 Ereignisse abonniert. Ohne `invoice.paid` entsteht keine eigene Abo-Rechnung.
9. **Stripe-Abo-Belege (9.2):** Stripe verschickt für die Mitgliedschaft weiter eigene Belege. Im Dashboard und in der Rechnungsmail stehen sie als „nur Zahlungsquittung“. Maßgeblich ist die eigene PDF.
10. **Löschjob (17), wichtig:** Der Wartungsjob löscht bisher live, seit dem 20.11.2026. Mit diesem Branch läuft er nur noch als Probelauf, bis `RETENTION_DELETE_ENABLED=1` in `/opt/handwerker2go/.env.local` gesetzt wird. Server-Logs sind schon abgedeckt: nginx-Rotation 14 Tage, Journal 7 Tage.
11. **Deploy-Hinweise:**
    - Migrationen 20261121100000 bis 20261121170000 ausführen.
    - `deploy/handwerker2go-commission.service` neu nach `/etc/systemd/system` kopieren, dann `systemctl daemon-reload`. Er ruft jetzt die `.mts`-Datei mit tsx auf.
    - Kein Merge und kein Deploy in diesem Durchgang.
12. **Testumgebung:** `STORAGE_DIR` im Worktree zeigt auf denselben Upload-Ordner wie die Live-Seite. Beim Test entstandene Rechnungs-PDFs habe ich dort wieder entfernt. Empfehlung: einen eigenen Ordner für Tests einrichten.
13. **Bestandsdaten:** Live gibt es derzeit keine Betriebe, deshalb sind keine Bestandsdaten betroffen. Freigeschaltete Betriebe ohne Steuerstatus oder Anfahrtskosten wären nicht buchbar, bis sie die Angaben im Dashboard nachtragen.

## 5. Offene Aufgaben für Aleks (manuell)

- [ ] **Google Workspace:**
  - Admin-Konsole → Konto → Kontoeinstellungen → Rechtliches und Compliance → „Cloud Data Processing Addendum“ → Review and Accept (als Super-Admin).
  - Unter „Supervisory Authority“ IDPC Malta eintragen.
  - Screenshot ablegen.
- [ ] **AV-Verträge als PDF ablegen**, jeweils mit Abrufdatum:
  - Hostinger DPA (hostinger.com/legal/dpa),
  - Cloudflare DPA (cloudflare.com/cloudflare-customer-dpa),
  - Stripe DPA,
  - Google CDPA.
- [ ] **Steuerberater, Registrierung und Rechnungen:**
  - Die Registrierung MT33258727 läuft nach **Art. 12** VAT Act (Reverse Charge, keine maltesische USt).
  - Klären, welche Erklärungen und Recapitulative Statements mit welchen Fristen fällig sind.
  - Die maltesischen Pflichtangaben auf Rechnungen gegen die Vorlage prüfen.
  - Das Vorgehen bei Kleinunternehmern ohne USt-IdNr. absegnen (Weg B, Reverse Charge mit Gewerbenachweis).
- [ ] **Steuerberater, DAC7:** Klären, ob Joe Becker als natürliche Person „Platform Operator“ nach S.L. 123.127 ist. Falls ja, ist die Meldung bis 31.01. für das Vorjahr fällig.
- [ ] **Anwalt, einmal gegenlesen:** Anhänge A bis H, vor allem die Vollmacht in Anhang E und die Widerrufsbelehrung.
- [ ] **Bestandsbetriebe:** die vorbereitete AGB-Änderungsmail (Anhang E.2) freigeben und versenden. Befehl: `node --conditions=react-server --import tsx --env-file=.env.local scripts/agb-change-notice.mts --inkrafttreten=JJJJ-MM-TT --send` (mindestens 6 Wochen Vorlauf).
- [ ] **Löschjob:**
  - Probelauf-Ergebnis prüfen: `pnpm maintenance -- --dry-run` bzw. das Journal von `handwerker2go-maintenance`.
  - Dann `RETENTION_DELETE_ENABLED=1` setzen.
- [ ] **Stripe-Dashboard:** Am Plattform-Webhook das Ereignis `invoice.paid` aktivieren (siehe Abschnitt 4, Punkt 8).
- [ ] **Stripe-Befund „nicht Direct Charges“:** entfällt, der Charge-Typ ist korrekt.

---

## Deploy am 21.11.2026

- **Live:** Branch nach `phase3-buchung` und `main` übernommen, Abhängigkeiten installiert (`pdf-lib`, `exceljs`), 8 Migrationen auf der Live-Datenbank, Build, Neustart.
- **Systemdienste:** `handwerker2go-commission`, `-reminders` und `-maintenance` sind neu installiert (daemon-reload).
- **Reverse Charge nach Malta VAT Act Art. 12:**
  - Beim Abo-Abschluss rechnet Stripe keine Steuer mehr (`automatic_tax` aus).
  - Alle Rechnungen an Betriebe laufen ohne Umsatzsteuer, mit Reverse-Charge-Vermerk.
- **Stripe:** Ereignis `invoice.paid` am Plattform-Webhook `we_1UdIClE5NDOqrw3b7iBTSuNO` aktiviert.
- **Löschjob:**
  - Live-Probelauf: nichts zu löschen.
  - Danach `RETENTION_DELETE_ENABLED=1` in `/opt/handwerker2go/.env.local` gesetzt.
- **Testumgebung:** eigener Ablageordner `/var/lib/handwerker2go-test/uploads`. Drei Testdateien sind aus dem Live-Ordner dorthin verschoben.
- **Prüfungen nach dem Deploy:**
  - Alle Rechtsseiten antworten mit 200, der Widerrufs-Button ist auf jeder Seite.
  - Erinnerungsjob läuft.
  - VIES ist vom Server aus erreichbar.
  - Provisions-Probelauf ohne Fehler.
- **AGB-Mitteilung E.2:** entfällt, weil es live keine Bestandsbetriebe gibt.
- **Offen für Aleks:** Google CDPA, AV-Verträge als PDF ablegen, Steuerberater (Art. 12, Weg B, DAC7), Anwalt (Anhänge gegenlesen).
