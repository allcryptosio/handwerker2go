# Löschkonzept (Entwurf)

Stand 20.11.2026. Grundlage: Datenschutzerklärung Abschnitt 16 „Speicherdauer“ (`src/app/datenschutz/page.tsx`).
Keine Rechtsberatung, vor Livegang prüfen lassen.

## Umsetzung (seit 20.11.2026 automatisch)

Täglicher Wartungs-Job `scripts/maintenance.mts` (systemd `handwerker2go-maintenance.timer`, 04:30 Uhr), Probelauf mit
`pnpm maintenance -- --dry-run`. Buchungen mit `legal_hold = true` werden nie angefasst; `charge.dispute.created` setzt die
Sperre automatisch, Aufheben manuell nach Erledigung des Streits.

| Kategorie | Wo | Frist | Umsetzung |
| --- | --- | --- | --- |
| Fotos (e) | `booking_photos` + Dateien `STORAGE_DIR/auftragsfotos` | 12 Monate nach Abschluss | Datei und Zeile löschen |
| Freitext Angebotsanfragen (e) | `bookings.notes` bei `price_type = 'quote'` | 12 Monate nach Abschluss | `notes = null` |
| Buchungsdaten (b) | Kontaktdaten, Adresse, Koordinaten, Hinweise, Kundenbezug | 3 Jahre ab Ende des Abschlussjahres | Anonymisierung, `anonymized_at` |
| Erklärungen vorzeitiger Beginn (b) | `consents` | wie (b) | löschen |
| Abrechnungsteil (c) | `bookings` (Rest), `commission_invoices` | 9 Jahre | löschen; Rechnungen bei Stripe nach Stripes Aufbewahrung |
| Protokoll | `audit_logs` | 9 Jahre | löschen (Trigger erlaubt nur dem System Einträge > 9 Jahre) |
| Sitzungen, Bestätigungslinks | `session`, `verification` | 30 Tage nach Ablauf | löschen |
| Server-Protokolle (f) | nginx, Journal | 14 bzw. 7 Tage | logrotate, journald |
| Sicherungen | restic lokal und R2 | 12 Monate | Sicherungsrotation |

Kontolöschung: `bookings.customer_id` und `consents.user_id` werden bei Löschung des Kontos auf `null` gesetzt, die Buchung
bleibt mit Abrechnungsteil erhalten (Migration `20261120120000_retention.sql`).

Getestet am 20.11.2026 in der Testdatenbank mit künstlich gealterten Daten: Foto gelöscht, Freitext entfernt, Buchung von
2021 anonymisiert (Betrag erhalten), Buchung mit Streit-Sperre unverändert, 10 Jahre alter Protokolleintrag gelöscht,
neuer Protokolleintrag weiter unlöschbar.

## Noch offen

Siehe docs/RECHTLICHE-PRUEFUNGEN.md: Frist für `email_outbox` und Gewerbenachweise.
