# Offene rechtliche und steuerliche Prüfpunkte

Stand 21.11.2026. Weiterleitbare Fassung mit Prioritäten: docs/rechtsfragen-fuer-beratung.html. **Intern, nicht auf der Website.** Die öffentlichen Rechtstexte (/datenschutz, /agb, /agb-betriebe,
/widerruf, /impressum) sind so formuliert, dass sie keine unbestätigten Fakten behaupten. Die folgenden Punkte sollte eine
Rechtsanwältin bzw. ein Datenschutzberater und die Steuerberatung prüfen. Dies ist keine Rechtsberatung.

## Datenschutzerklärung

- [ ] **Auftragsverarbeitung:** Die DSE sagt, dass Hostinger, Cloudflare und Google Workspace im Auftrag verarbeiten (Art. 28). Die AV-Verträge sind bei allen drei Bestandteil der Standard-Vertragsbedingungen; bitte in den Konten bestätigen (Google: Admin-Konsole, Konto, Rechtliches und Compliance, Data Processing Amendment; Cloudflare: Self-Serve Subscription Agreement mit DPA; Hostinger: DPA in den AGB).
- [ ] **Hostinger:** Standort Frankfurt am Main laut IP-Registrierung (AS47583); Vertragspartner und Anschrift im Hostinger-Konto prüfen.
- [ ] **Stripe-Rolle:** Die DSE beschreibt Stripe als in eigener Verantwortung tätig (Betrugsprävention, KYC, gesetzliche Pflichten). Für den Zahlungsvorgang selbst prüfen, ob Stripe teils als Auftragsverarbeiter zu nennen ist.
- [ ] **Drittland:** DPF-Zertifizierung von Cloudflare, Stripe und Google sowie die SCC in deren Verträgen bestätigen.
- [ ] **Cloudflare:** Bei aktivem Bot-Schutz kann Cloudflare das Cookie `__cf_bm` setzen; derzeit beim ersten Aufruf kein Cookie beobachtet. Bei Änderung in die Cookie-Tabelle aufnehmen.
- [ ] **Login-Cookie:** Name `__Secure-better-auth.session_token`, 30 Tage, technisch geprüft am 20.11.2026; Einordnung unter § 25 Abs. 2 Nr. 2 TDDDG bestätigen.
- [x] **Bewertungen:** Eingabe gebaut (20.11.2026). Öffentlich nur Sterne, Text, Datum und Leistung; kein Name.
- [ ] **Bewertungsanfrage per E-Mail:** gilt nach BGH VI ZR 225/17 als Werbung. Umgesetzt nach § 7 Abs. 3 UWG: Hinweis bei der Registrierung, Abmeldelink in jeder Anfrage, DSE Abschnitt 11, eine Anfrage pro Buchung. Prüfen, ob die Voraussetzungen (eigene ähnliche Leistungen, Adresse aus dem Verkauf) hier tragen, weil der Vertrag mit dem Betrieb zustande kommt.
- [ ] **Speicherfristen:** 3 Jahre (§§ 195, 199 BGB, Art. 6 Rom I), 9 Jahre (ITMA Cap. 372 Art. 19(5), deckt VAT Act Cap. 406 Art. 48(4) und Commercial Code Cap. 13 Art. 26), 12 Monate für Fotos und Freitext, 9 Jahre Protokoll: bestätigen. Companies Act Art. 163 bewusst nicht angewendet (nur für Gesellschaften).
- [ ] **Abgrenzung Beschreibung/Freitext:** beide in `bookings.notes`; 12 Monate bei Angebotsanfragen (`price_type = 'quote'`), 3 Jahre bei Festpreis-Buchungen.
- [x] **E-Mail-Ausgang:** 3 Jahre ab Ende des Versandjahres (festgelegt 20.11.2026, umgesetzt).
- [x] **Gewerbenachweise:** 6 Monate nach Ablehnung, sonst bis zur Löschung des Betriebskontos (festgelegt 20.11.2026, umgesetzt).
- [ ] **DAC7:** Anwendbarkeit von S.L. 123.127 auf einen Einzelunternehmer (natürliche Person) als meldenden Plattformbetreiber, ab wann, und ob die Ausnahme für kleine Plattformen greift. Reg. 13(12)(i) (5 Jahre) bestätigen. Das deutsche PStTG gilt für Plattformbetreiber mit Sitz in Deutschland; Bezug für Malta prüfen.
- [ ] **Aufsicht:** IDPC Malta als federführende Behörde bestätigen.
- [ ] **Datenschutzbeauftragter:** Pflicht verneint (Einzelunternehmer, keine umfangreiche Verarbeitung besonderer Kategorien); bestätigen.

## AGB für Kunden

- [ ] **Vertragsschluss:** Bestätigung „im Namen des Betriebs“ (Vollmacht des Betriebs in den AGB für Betriebe, § 2 Abs. 1).
- [ ] **Stornopauschale:** 25 % des Festpreises, höchstens Anfahrtskosten, mit Gegenbeweis; Wirksamkeit nach §§ 307 ff., 309 Nr. 5 BGB.
- [ ] **Besichtigungstermin:** kostenloser Termin als eigener Vertrag zwischen Kunde und Betrieb; der Werkvertrag entsteht erst mit Angebotsannahme.
- [ ] **Änderungsklausel:** ohne Zustimmungsfiktion für Verbraucher umgesetzt (Zustimmung bei der nächsten Buchung).
- [ ] **Bewertungen:** Angaben nach § 5b Abs. 3 UWG (wie Echtheit sichergestellt wird) stehen in AGB § 7 und auf /ranking.

## AGB für Betriebe

- [ ] **P2B-Verordnung:** Anwendbarkeit (Betriebe als gewerbliche Nutzer, Kunden in der EU). Umgesetzt: Gründe für Einschränkung und Aussetzung, Begründung per E-Mail, 30 Tage Frist bei Beendigung, Ausnahmen nach Art. 4 Abs. 4, Ranking-Hauptparameter (Art. 5), Datenzugang (Art. 9).
- [ ] **Beschwerdesystem (Art. 11) und Mediation (Art. 12):** gelten nicht für kleine Unternehmen; KMU-Status bestätigen. Ein einfacher E-Mail-Beschwerdeweg ist umgesetzt (§ 10 Abs. 3).
- [ ] **DSA:** Pflichten als Online-Plattform, Meldeverfahren nach Art. 16 (Meldung unzulässiger Inhalte per E-Mail umgesetzt), Nachverfolgbarkeit von Unternehmern (Art. 30, entfällt bei Kleinst- und Kleinunternehmen), Kontaktstellen (Art. 11, 12).
- [ ] **Zustimmungsfiktion bei Änderungen (§ 12):** gegenüber Unternehmern mit Hinweis und Kündigungsrecht; Wirksamkeit prüfen.
- [ ] **Gerichtsstand Malta (§ 13)** bei deutschem Recht: Wirksamkeit gegenüber Kaufleuten prüfen. Alternative: Gerichtsstand am Sitz des Betriebs oder Hamburg.
- [ ] **Umgehungsverbot (§ 7 Abs. 3):** Reichweite (nur über die Plattform vermittelte Aufträge) prüfen.
- [ ] **DAC7-Mitwirkung (§ 7 Abs. 4):** Sperre nach zwei erfolglosen Erinnerungen; Pflichtenkreis prüfen.
- [ ] **USt-IdNr. freiwillig (seit 21.11.2026):** Kleinunternehmer ohne USt-IdNr. können die Mitgliedschaft abschließen. Steuerberatung klären: Wie rechnet ein maltesischer Plattformbetreiber Abo und Provision an deutsche Unternehmer ohne USt-IdNr. ab (Nachweis der Unternehmereigenschaft z. B. über Gewerbeanmeldung, § 13b UStG, oder maltesische bzw. deutsche USt)? Stripe Tax behandelt Kunden ohne Steuernummer derzeit nach den hinterlegten Registrierungen; Ergebnis auf einer Testrechnung prüfen.
- [ ] **Erinnerung vor Verlängerung des Jahresabos:** umgesetzt über das Stripe-Ereignis `invoice.upcoming`. Den Vorlauf stellst du im Stripe-Dashboard ein (Einstellungen, Billing, Abonnements, „Upcoming renewal events“), empfohlen 30 Tage.

## Widerrufsbelehrung

- [ ] **Du-Form:** Abweichung vom Muster (Sie-Form) kann die Gesetzlichkeitsfiktion (Art. 246a § 1 Abs. 2 S. 2 EGBGB) gefährden; prüfen, ob die Sie-Form sicherer ist.
- [ ] **Wer belehrt:** Die Belehrung erfolgt für den Betrieb; handwerker2go als zusätzlicher Empfänger. Prüfen, ob die Plattform als Empfangsbote so genannt werden kann.
- [ ] **Dauerhafter Datenträger:** Die vollständige Belehrung mit den Daten des Betriebs steht jetzt in der Buchungsbestätigung per E-Mail.
- [ ] **§ 312g Abs. 2 Nr. 11 BGB (dringende Reparaturen):** Hinweis bleibt drin; prüfen, ob er für die angebotenen Leistungen passt.
- [ ] **Widerrufsbutton (PRIORITÄT):** RL (EU) 2023/2673 verlangt seit 19.06.2026 eine elektronische Widerrufsfunktion für online geschlossene Verbraucherverträge. Prüfen, ob und wie die Plattform sie bereitstellen muss; danach technisch nachrüsten.

## Zahlungen und Steuern

- [ ] **ZAG:** Erlaubnisfreiheit bei Direct Charges über Stripe Connect (Zahlung direkt an den Betrieb, Plattform behält nur Provision ein).
- [ ] **Umsatzsteuer der Plattform:** Registrierung MT33258727 (Artikel 10 oder 11, Malta); Reverse Charge für Provision und Mitgliedschaft an deutsche Unternehmer.
- [ ] **Kleinunternehmer-Betriebe (§ 19 UStG):** schulden die Umsatzsteuer nach § 13b UStG, ohne Vorsteuerabzug; Hinweis an Betriebe prüfen.
- [ ] **PAngV:** Festpreise als Endpreise inkl. USt, soweit der Betrieb USt berechnet; Kennzeichnung bei Kleinunternehmer-Betrieben (§ 19 UStG) prüfen.
- [ ] **Betriebsstätte:** Entsteht durch Vertrieb vor Ort in Hamburg eine Betriebsstätte oder ein ständiger Vertreter in Deutschland?
- [ ] **Vertrieb an Betriebe:** Telefonische Erstansprache (mutmaßliche Einwilligung), E-Mail erst nach Zustimmung; Zulässigkeit bestätigen.
