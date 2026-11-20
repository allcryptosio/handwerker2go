# Löschkonzept (Entwurf)

Stand 20.11.2026. Grundlage: Datenschutzerklärung Abschnitt 16 „Speicherdauer“ (`src/app/datenschutz/page.tsx`).
Keine Rechtsberatung, vor Livegang prüfen lassen.

## Ist-Stand der technischen Umsetzung

| Kategorie (Datenschutzerklärung) | Wo gespeichert | Frist | Automatisch umgesetzt? |
| --- | --- | --- | --- |
| (a) Laufende Buchung | `bookings`, `booking_photos`, `consents` | solange die Buchung läuft | ja (keine Löschung nötig) |
| (b) Buchungsdaten nach Abschluss | `bookings.contact_*`, `street`, `postal_code`, `location`, `notes` (Festpreis), `consents` | 3 Jahre ab Ende des Kalenderjahres des Abschlusses | **nein**, Entwurf in `scripts/retention-cleanup.mjs` |
| (c) Abrechnungsdaten | `bookings` (Nummer, Datum, Betrag, Provision, Betrieb, `stripe_*`), `commission_invoices`; Rechnungen und Belege bei Stripe | 9 Jahre nach Abschluss des Vorgangs | **nein** (erst ab 2035 relevant); Daten bei Stripe nach Stripes eigener Aufbewahrung |
| (d) DAC7-Meldedaten | `provider_profiles` (Name, Anschrift, USt-IdNr.), Stripe-Konto | mind. 5 Jahre ab Jahresende, als Steuerunterlage 9 Jahre | **nein**; Anwendbarkeit offen |
| (e) Fotos und Freitext aus Angebotsanfragen | `booking_photos` + Dateien unter `STORAGE_DIR/auftragsfotos`, `bookings.notes` bei `price_type = 'quote'` | 12 Monate nach Abschluss | **nein**, Entwurf in `scripts/retention-cleanup.mjs` |
| (f) Server-Protokolle | nginx `/var/log/nginx` (logrotate täglich, 14 Rotationen); systemd-Journal | 14 Tage | **ja**: nginx 14 Tage, Journal 7 Tage (`MaxRetentionSec=7day`) |
| (f) Kontodaten | `user`, `account`, `session`, `customer_profiles`, `provider_profiles` | bis zur Kontolöschung | **teilweise**: Löschung nur manuell auf Anfrage, siehe Lücke 1 |
| Sicherungskopien | restic lokal und Cloudflare R2 | bis 12 Monate | ja (bestehende Sicherungsrotation) |

## Entwurf Cleanup-Job (nicht ausführend)

`scripts/retention-cleanup.mjs` läuft in einer Nur-Lese-Transaktion, zählt die betroffenen Datensätze je Stufe und zeigt
die geplanten Befehle. Es gibt bewusst keinen Ausführungsmodus.

Geplantes Vorgehen nach Freigabe:

1. **Fotos (e), Hard-Delete:** Datei im Speicher löschen, dann Zeile in `booking_photos`. 12 Monate nach Abschluss.
2. **Freitext aus Angebotsanfragen (e), Soft-Delete:** `bookings.notes = null` bei `price_type = 'quote'`, 12 Monate nach Abschluss.
3. **Buchungsdaten (b), Anonymisierung statt Löschung:** Kontaktdaten, Adresse, Koordinaten und Hinweise leeren; Abrechnungsteil
   (Nummer, Datum, Betrag, Provision, Betrieb, Stripe-Kennungen) bleibt für (c). 3 Jahre ab Ende des Kalenderjahres des Abschlusses.
   Zugehörige `consents` löschen.
4. **Abrechnungsteil (c), Hard-Delete:** nach 9 Jahren.
5. **Sperre bei anhängigem Streit:** Stufen 1–3 überspringen, solange `legal_hold_until` in der Zukunft liegt.
6. Ausführung monatlich per systemd-Timer, Protokoll in `audit_logs` (nur Anzahl und Kennungen, keine Inhalte).

## Technische Lücken [prüfen: technische Umsetzung]

1. **Kontolöschung blockiert:** `bookings.customer_id` verweist mit `ON DELETE RESTRICT` auf `user`. Ein Konto mit Buchungen lässt
   sich deshalb nicht löschen. Vorschlag: Spalte nullable machen und bei Kontolöschung auf `null` setzen (additive Migration),
   Buchung bleibt mit Abrechnungsteil erhalten.
2. **Kein Streit-Kennzeichen:** Vorschlag: `bookings.legal_hold_until timestamptz` (additiv). Setzen bei `charge.dispute.created`
   (Webhook verarbeitet das Ereignis bisher nicht) sowie manuell im Admin bei Beschwerden.
3. **Beschreibung vs. Freitext:** Beide liegen in `bookings.notes`. Abgrenzung derzeit über `price_type`
   (Angebotsanfrage = `quote` → 12 Monate, Festpreis → 3 Jahre). Fachlich prüfen, ob das so gewollt ist.
4. **E-Mail-Ausgang:** `email_outbox` speichert den vollständigen Mailinhalt (Namen, Adressen, Termine). Keine Frist in der
   Datenschutzerklärung. Vorschlag: Inhalt nach erfolgreichem Versand leeren, Metadaten kurz behalten. [prüfen: Frist]
5. **Protokoll (`audit_logs`):** unveränderbar (Trigger), enthält teils personenbezogene Werte. Abschnitt 11 der
   Datenschutzerklärung hat noch „[Aufbewahrungsdauer festlegen]“. [prüfen: Frist]
6. **Gewerbenachweise (`provider_documents` + Dateien):** keine eigene Frist definiert. [prüfen: Frist]
7. **Abgelaufene Sitzungen (`session`, `verification`):** werden von Better Auth nicht automatisch entfernt. Unkritisch,
   Vorschlag: monatlich Einträge löschen, die seit 30 Tagen abgelaufen sind.
