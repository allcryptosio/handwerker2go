# handwerker2go: Architektur und Entwicklungsplan

Stand 17.11.2026, Ende Phase 1. Dieses Dokument beschreibt, wie die Plattform aufgebaut wird und in welcher Reihenfolge.
Steuer- und Rechtsfragen sind als Architekturentscheidungen beschrieben, nicht als Beratung. Sie müssen von Steuerberatung
und Rechtsanwalt bestätigt werden (siehe RECHTLICHE-PRUEFUNGEN.md).

## 1. Projektanalyse

- Ausgangslage: leeres Verzeichnis, kein bestehender Code. Neues Projekt unter `/opt/handwerker2go`.
- Server: Next.js-Projekte auf diesem VPS laufen als eigener Systembenutzer hinter nginx und Cloudflare, Port pro Projekt.
  handwerker2go nutzt Port 3012.
- Design: Entwurf G („Zuhause“) vom Design-Canvas. Freundlich, Mint und Waldgrün, Inter, runde Formen.
  Aufbau nach TaskRabbit: zentrale Suche, Kategorie-Reiter mit Unterleistungen, beliebte Projekte, Vertrauen, Ablauf, Betriebe.

## 2. Gesamtarchitektur

```
Browser ──► Cloudflare ──► nginx ──► Next.js (App Router, Server Components, Server Actions, Route Handlers)
                                        │
                                        ├── Supabase Postgres (+ PostGIS, RLS)   Daten
                                        ├── Supabase Auth                         Konten, E-Mail-Verifizierung
                                        ├── Supabase Storage                      Logos, Bilder, Nachweise (privat)
                                        ├── Stripe Connect + Billing + Tax        Zahlungen, Abos, Auszahlungen
                                        ├── Resend                                 E-Mails
                                        └── Mapbox                                 Geocoding, Karte
```

Grundsätze:
- Alle Geschäftslogik serverseitig (Server Actions / Route Handlers), Eingaben mit Zod validiert.
- Datenbank ist die Quelle der Wahrheit für Buchungen, Stripe-Webhooks für den Zahlungsstatus.
- Keine Stadt, kein Preis und kein Provisionssatz im Code fest verdrahtet. Phase 1 nutzt `src/lib/catalog.ts` und
  `src/lib/pricing.ts` als Übergang, beide werden in Phase 2 bzw. 5 durch Datenbanktabellen ersetzt.
- Rollen: `customer`, `provider_owner`, `provider_staff` (später), `admin`. Rollen liegen in `users.role`, Rechte werden
  zusätzlich in RLS-Policies durchgesetzt.

## 3. Datenmodell (Phase 2, versionierte Migrationen unter `supabase/migrations`)

| Tabelle | Zweck, wichtige Felder |
| --- | --- |
| users | Spiegel von auth.users: role, status, created_at |
| customer_profiles | user_id, name, phone, marketing_consent |
| provider_profiles | user_id, company_name, legal_form, slug, description, logo_path, status (`pending`, `approved`, `suspended`), approved_at, stripe_account_id, rating_avg, rating_count |
| provider_documents | provider_id, type (Gewerbeanmeldung, Handwerksrolle …), storage_path (privat), review_status |
| cities | slug, name, active, center geography(Point) |
| service_categories | slug, name, icon, sort, seo_texts je Stadt (eigene Tabelle `category_city_content`) |
| services | provider_id, category_id, name, description, mode (`fixed`, `quote`), price_cents, duration_min, active |
| service_areas | provider_id, area geography(Polygon) oder center + radius_km |
| customer_addresses | user_id, Adresse, location geography(Point) |
| availability | provider_id, Wochentag-Regeln, Pausen, Ausnahmen (Urlaub, blockiert) |
| bookings | customer_id, provider_id, service_id, address_id, slot tstzrange, status, price_cents, commission_bps, currency |
| booking_status_history | booking_id, from, to, actor, reason, at |
| quote_requests | customer_id, category_id, description, photos, address_id, status |
| quotes | quote_request_id, provider_id, price_cents, valid_until, status |
| reviews | booking_id (unique), stars 1–5, text, status (`visible`, `hidden`), moderated_by |
| payments | booking_id, stripe_payment_intent_id (unique), amount, status, refunded_amount |
| payouts | provider_id, stripe_payout_id, amount, status |
| commissions | booking_id (unique), rate_bps, amount_cents, stripe_application_fee_id |
| subscriptions | provider_id, plan (`intro`, `monthly`, `yearly`), status, current_period_end, stripe_subscription_id |
| subscription_history | subscription_id, Änderung, at |
| invoices | type (`commission`, `subscription`, `customer_service`, `credit_note`), issuer, recipient, Beträge, tax_treatment, pdf_path |
| tax_profiles | Partei (Plattform, Betrieb, Kunde), country, vat_id, vat_id_valid, is_business, small_business_scheme |
| notifications | user_id, type, payload, sent_at, channel |
| support_requests | user_id, booking_id, subject, status |
| audit_logs | actor, action, entity, before, after, at (append-only, keine Updates/Deletes per RLS) |

Zusätzlich `pricing_settings` (Grundgebühren, Provisionssätze, Einführungsmonate, gültig ab) und `stripe_events`
(event_id unique, für Idempotenz).

### Doppelbuchungen technisch verhindern

```sql
alter table bookings add constraint no_overlap
  exclude using gist (provider_id with =, slot with &&)
  where (status in ('pending_payment', 'confirmed'));
```

Die Datenbank lehnt überlappende Termine ab, auch wenn zwei Kunden gleichzeitig buchen. Zahlungsausstehende Buchungen
halten den Slot nur für eine kurze Zeit (z. B. 15 Minuten), danach gibt ein Job den Slot frei.

### Umkreissuche

PostGIS: Kundenadresse wird über Mapbox geocodiert (serverseitig, Ergebnis gecacht). Treffer sind Betriebe, deren
`service_areas` den Punkt enthalten, sortiert nach `ST_Distance`. Index: GiST auf allen Geometrien.

### Row Level Security (Kurzfassung)

- Kunde: liest und schreibt nur eigene Profile, Adressen, Buchungen, Anfragen und Bewertungen.
- Betrieb: liest nur eigene Buchungen, Anfragen in seiner Kategorie und seinem Gebiet, eigene Leistungen und Finanzen.
- Öffentlich lesbar: nur freigegebene Betriebe, aktive Leistungen, sichtbare Bewertungen, aktive Städte und Kategorien.
- Admin: über `service_role` nur in Server-Code, nie im Browser. Jede Admin-Änderung an Finanzdaten schreibt `audit_logs`.
- Nachweis-Dokumente liegen in einem privaten Storage-Bucket, Zugriff nur über kurzlebige Signed URLs.

## 4. Abonnement- und Provisionslogik

Abo-Status und Provisionssatz werden getrennt gespeichert. Der Provisionssatz wird bei jeder Buchung in
`bookings.commission_bps` eingefroren, damit spätere Preisänderungen alte Buchungen nicht verändern.

```
registriert ──► pending (Prüfung) ──► approved = Beginn Einführungsphase (intro, 0 €, 10 %)
                                         │  Erinnerung per E-Mail 14 und 3 Tage vor Ende
                                         ▼
                        Betrieb wählt aktiv monatlich oder jährlich (Stripe Checkout, Zustimmung)
                           │                                   │
                           ▼                                   ▼
                     active (15 %)                       keine Wahl bis Ende
                           │                                   │
            Zahlung fehlgeschlagen ──► past_due          ──► paused: Profil nicht buchbar,
            (Stripe Smart Retries)        │                      Daten bleiben erhalten
                           Kündigung ──► canceled zum Periodenende
```

- Kein automatischer kostenpflichtiger Übergang: Das Stripe-Abo entsteht erst nach aktiver Auswahl. Die Einführungsphase
  ist ein Status in unserer Datenbank, kein Stripe-Trial mit hinterlegter Karte.
- Ohne aktives Abo nach der Einführungsphase ist das Profil nicht buchbar (`paused`), bestehende Buchungen laufen weiter.
- Kündigung über Stripe Customer Portal oder eigenen Kündigungsbutton.

## 5. Zahlungen mit Stripe (Code vorbereitet, nur Testmodus)

- Betriebe: Stripe **Accounts v2** mit Managed Risk (`fees_collector`/`losses_collector = stripe`, `dashboard: full`),
  `src/lib/stripe/connect.ts`. Stripe übernimmt KYC, Bankverbindung, Auszahlungen und das Ausfallrisiko.
- **Buchbar** erst, wenn `status = approved` und Stripe `charges_enabled` und `payouts_enabled` meldet (`isBookable`,
  Datenbankfunktion `app.provider_bookable`). Stripe-Felder kann nur Admin/System ändern (Trigger `app.provider_guard`).
- Zahlung: **Direct Charge** über Stripe Checkout auf dem Konto des Betriebs, Provision als `application_fee_amount`
  (`createBookingCheckout` in `src/lib/stripe/payments.ts`). Satz aus `src/lib/pricing.ts` über `commissionBpsAt`.
  Der Betrieb ist Händler; die Plattform nimmt keine Kundengelder auf eigene Konten. Stripe-Gebühren trägt der Betrieb.
- Auszahlung nach dem Auszahlungsplan des Betriebskontos (Stripe).
- Erstattung (Stornierung in der Frist, Widerruf, Restbetrag nach Pauschale): `refundBookingPayment` auf dem Konto des
  Betriebs mit `refund_application_fee`.
- Webhook `/api/stripe/webhook`: Signaturprüfung, Idempotenz über Tabelle `stripe_events`; `account.updated` synchronisiert
  den Kontostatus. Buchungsereignisse folgen mit Phase 3.
- Sicherheitssperre: `sk_live_…` wird abgelehnt, solange `STRIPE_ALLOW_LIVE` nicht `1` ist.
- Vorzeitiger Leistungsbeginn: `src/lib/legal/early-start.ts` und `EarlyStartConsentCheckbox`; Zustimmungen in Tabelle
  `consents` (mit Zeitstempel und AGB-Version). Einbindung in den Buchungsablauf in Phase 3.

## 6. Steuerarchitektur (zu bestätigen durch Steuerberatung)

Grundregel im Code: Es wird nie automatisch eine Steuerbefreiung angewendet. Jede Rechnung bekommt eine
`tax_treatment`-Angabe aus einer konfigurierbaren Regeltabelle (`tax_rules`), die nach Prüfung freigeschaltet wird.

| Leistung | Leistender | Empfänger | Zu klärende Behandlung |
| --- | --- | --- | --- |
| Handwerkerleistung | Betrieb | Kunde | Rechnung im Namen des Betriebs, deutsche USt des Betriebs oder Kleinunternehmer-Hinweis |
| Vermittlungsprovision | Plattform (Einzelunternehmer, Malta) | Betrieb | **Festgelegt (wie deinminijob.com):** Nettorechnung mit Hinweis „Reverse charge“, keine maltesische MwSt.; der Betrieb schuldet die deutsche USt (§ 13b UStG) |
| Abo-Gebühr | Plattform (Einzelunternehmer, Malta) | Betrieb | **Festgelegt:** wie Provision, Nettorechnung, Reverse charge |
| Erstattung, Gutschrift | jeweils wie Ursprung | | Korrektur der ursprünglichen Rechnung |

Stripe Tax eignet sich für die Abo-Rechnungen der Plattform. Für die Handwerkerrechnungen im Namen der Betriebe ist zu
prüfen, ob sie über Stripe oder eine eigene Rechnungsstellung laufen. DAC7-Meldepflichten der Plattform sind vorzusehen
(Datenfelder in `tax_profiles`, Jahresexport).

## 7. SEO

- Serverseitiges Rendering, statisch vorgerenderte Stadt- und Kategorieseiten (`/hamburg/elektriker`).
- Jede Landingpage hat eigenen Einleitungstext, Leistungen, FAQ, interne Links und strukturierte Daten
  (BreadcrumbList, Service mit OfferCatalog). Organization und WebSite im Layout.
- Bewertungen werden erst ausgezeichnet, wenn echte Bewertungen existieren.
- Unbekannte Städte oder Kategorien liefern 404. Neue Städte erscheinen automatisch in Sitemap und Navigation, sobald
  sie aktiv geschaltet sind.
- Ab Phase 2 werden Stadt-Kategorie-Seiten ohne freigeschaltete Betriebe und ohne eigenen Text auf `noindex` gesetzt,
  damit keine inhaltsarmen Massen-Seiten entstehen.

## 8. Entwicklungsphasen

| Phase | Inhalt | Status |
| --- | --- | --- |
| 1 | Analyse, Architektur, Designsystem, Startseite, Navigation, SEO-Grundgerüst, Rechtstext-Entwürfe | erledigt |
| 2 | PostgreSQL + PostGIS (Supabase-kompatibel), Migrationen, RLS, Better Auth mit E-Mail-Bestätigung, Kunden- und Betriebsregistrierung mit Nachweis, Dashboards, Admin-Freigabe, Audit-Log | erledigt |
| 3 | Mapbox-Geocoding, Umkreissuche, Suchergebnisse, Leistungen, Kalender, Festpreis-Buchung | als Nächstes |
| 4 | Kunden-, Betriebs- und Admin-Dashboard, Bewertungen, Angebotsanfragen | |
| 5 | Stripe Connect, Billing, Provisionen, Abos, Rechnungen, Resend-E-Mails, Steuerregeln | |
| 6 | SEO-Feinschliff, Performance, Sicherheit, Datenschutz, Tests, Deployment mit Domain | |

## 9. Was für Phase 2 gebraucht wird

- Supabase: neues Projekt in Frankfurt. Blockiert, weil das Supabase-Konto das Limit von 2 kostenlosen Projekten erreicht hat (Upgrade auf Pro oder ein Projekt pausieren).
- Domain: handwerker2go.com (DNS auf Cloudflare legen, dann nginx-vhost und SSL einrichten).
- Absenderadresse für E-Mails (für Resend ab Phase 5, für Auth-Mails schon in Phase 2 über Supabase SMTP).
- Impressum: Anschrift, E-Mail und Telefon fehlen noch (Betreiber Joe Becker, Sole Trader, MT33258727 sind eingetragen).
