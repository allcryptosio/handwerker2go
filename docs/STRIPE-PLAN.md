# Stripe-Integrationsplan für handwerker2go

Stand 18.11.2026. Erstellt aus der Stripe-Dokumentation und Tests in der Sandbox (Plattform-Konto Malta, EUR,
Connect aktiv, Stripe Tax aktiv mit Ursprung MT und maltesischer Registrierung, eigene USt-IdNr. MT33258727 hinterlegt). Der Stripe-Planer
(stripe_implementation_planner) war in dieser Sitzung nicht verfügbar.

## Sandbox-Befunde

1. Stripe lehnt für diese Plattform neue Konten mit `type: "express"` (Accounts v1) ab. Verlangt wird **Accounts v2**
   mit `defaults.responsibilities.losses_collector = "stripe"` (Managed Risk). Der bisherige Code in
   `src/lib/stripe/connect.ts` muss deshalb auf `stripe.v2.core.accounts` umgestellt werden.
2. Accounts v2 mit `fees_collector = stripe` und `losses_collector = stripe` ließ sich anlegen, mit Express-Dashboard
   (Preview-API `2026-10-28.preview`) und mit Full-Dashboard.
3. Bei Managed Risk trägt Stripe Betrugs- und Verlustrisiko der Betriebskonten. Destination Charges setzen dagegen
   voraus, dass die Plattform die Verlusthaftung übernimmt (Bestätigung im Plattformprofil).
4. Das Plattform-Konto hat `charges_enabled = false`. Vor dem Livegang müssen die Unternehmensdaten im Dashboard
   vervollständigt werden.

## Gewähltes Modell: Variante A (Entscheidung des Betreibers am 18.11.2026)

| Baustein | Umsetzung |
| --- | --- |
| Betriebe | Accounts v2, `dashboard: full` (GA; Express mit Managed Risk ist nur Vorschau), Konfiguration `merchant`, Stripe trägt Gebühren und Verluste, gehostetes Onboarding über Account Links. Der Betrieb legt dabei ein eigenes Stripe-Login an |
| Buchbar | erst bei aktiver Fähigkeit `card_payments` und Auszahlungen (v2: `merchant` aktiv, `stripe_balance.payouts` aktiv) |
| Kundenzahlung | **Direct Charge** auf dem Konto des Betriebs über **Stripe Checkout** (gehostete Seite, Apple Pay und Google Pay automatisch), Provision als `payment_intent_data.application_fee_amount` aus `pricing.ts` |
| Vertragspartner | Betrieb ist Händler der Zahlung (passt zu AGB: Vertrag zwischen Kunde und Betrieb) |
| Buchung anlegen | erst nach Webhook `checkout.session.completed` (Connect-Ereignis), idempotent |
| Erstattung | Refund auf dem Konto des Betriebs mit `refund_application_fee: true` |
| Auszahlung | nach dem Auszahlungsplan des Betriebskontos (Stripe-Standard); eine Auszahlung erst nach Auftragsabschluss ist mit Managed Risk nicht vorgesehen |
| Rückbuchungen | trägt das Konto des Betriebs; Stripe übernimmt das Ausfallrisiko |

### Alternative B: Destination Charges (wie bisher geplant)

Plattform ist Abwicklungsplattform und übernimmt die Verlusthaftung (nicht einbringliche negative Salden, Betrug).
Erlaubt Auszahlung erst nach Auftragsabschluss. Erfordert Bestätigung im Stripe-Plattformprofil und eigenes
Risikomanagement. Für einen Einzelbetreiber mit wenig Erfahrung in Zahlungsrisiken nicht empfohlen.

## Mitgliedschaft der Betriebe (Billing)

- Produkte „Mitgliedschaft monatlich“ (29,99 € netto) und „Mitgliedschaft jährlich“ (299,88 € netto) als Preise;
  Beträge aus `pricing.ts` beim Anlegen übernehmen, Preis-IDs in `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`.
- Einführungsphase bleibt in unserer Datenbank (kein Stripe-Trial mit Karte). Abo entsteht nur durch aktive Wahl im
  Dashboard über Checkout im Modus `subscription`.
- Kündigung und Zahlungsmethode über das Stripe-Kundenportal; fehlgeschlagene Zahlungen mit Smart Retries; Status über
  Webhooks `customer.subscription.*` und `invoice.payment_failed`.
- Kunde des Abos: das v2-Konto des Betriebs mit Konfiguration `customer` (kein separates Customer-Objekt nötig).
- **Umgesetzt** (`src/lib/stripe/billing.ts`, Dashboard-Abschnitt „Mitgliedschaft“): Checkout mit `customer_account`,
  `trial_end` = Ende der Einführungsphase (nur wenn mehr als 48 h entfernt), `automatic_tax`, USt-IdNr.-Abfrage, eigene
  USt-IdNr. auf jeder Rechnung (`account_tax_ids`). Kundenportal mit Zahlungsmethode, Rechnungen, Wechsel monatlich/jährlich
  (ohne anteilige Verrechnung) und Kündigung zum Laufzeitende. Status in `provider_profiles.membership_*` über Webhooks.
- Sichtbarkeit in der Suche: `app.provider_listed()` = freigeschaltet und (Einführungsphase oder Abo `trialing`/`active`/`past_due`).
  Die Suche (Phase 3) muss diese Funktion verwenden.

## Steuern (Stripe Tax) und Rechnungen (Invoicing)

- In Stripe Tax die maltesische Registrierung (MT33258727) eintragen.
- Abos mit `automatic_tax: { enabled: true }`; USt-IdNr. des Betriebs als `eu_vat` hinterlegen. Bei gültiger
  USt-IdNr. rechnet Stripe Tax die Reverse-Charge-Behandlung automatisch und schreibt den Hinweis auf die Rechnung.
  Text auf „Steuerschuldnerschaft des Leistungsempfängers“ prüfen bzw. per Rechnungsfußzeile ergänzen.
- Provision: Plattformgebühren erzeugen keine Rechnung. **Umgesetzt** in `scripts/commission-invoices.mjs`
  (`pnpm stripe:commission`, Timer in `deploy/`): je Betrieb und Monat eine Rechnung über die einbehaltenen Provisionen
  (`automatic_tax`, Reverse Charge). Der Betrag wird vorher als Kundenguthaben gutgeschrieben, damit die Rechnung mit
  „Fälliger Betrag 0,00 €“ abschließt (`paid_out_of_band` hätte im PDF weiter „fällig“ gezeigt). Doppelte Rechnungen
  verhindern `commission_invoices (provider_id, period_start)` und Idempotenzschlüssel.
- Handwerkerleistung: Rechnung stellt der Betrieb. Bei Direct Charges kann er dafür sein Stripe-Dashboard nutzen;
  Kunden erhalten zusätzlich die Stripe-Zahlungsbestätigung.
- Betriebe ohne USt-IdNr. (Kleinunternehmer): Stripe Tax würde maltesische MwSt. berechnen, solange keine gültige
  USt-IdNr. vorliegt. Mit der Steuerberatung klären.

## Webhooks

- Ein Endpunkt `/api/stripe/webhook` für Plattform-Ereignisse und ein zweiter Connect-Endpunkt (oder ein Endpunkt mit
  beiden Ereignisarten) für Ereignisse auf den Betriebskonten. Signaturprüfung und Idempotenz sind vorhanden
  (`stripe_events`).
- Ereignisse: `v2.core.account[configuration.merchant].capability_status_updated` (Freigabe des Betriebs),
  `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`, `customer.subscription.*`,
  `invoice.paid`, `invoice.payment_failed`.

## Reihenfolge der Umsetzung

1. ~~Entscheidung~~: Variante A gewählt.
2. ~~`connect.ts` auf Accounts v2 umstellen, Onboarding-Link v2~~ (erledigt; Status-Abgleich über Dashboard-Aufruf und `account.updated`, v2-Thin-Events noch offen).
3. ~~AGB anpassen~~ (erledigt: Auszahlung nach Stripe-Plan, Stripe-Gebühren und Rückbuchungen beim Betrieb).
4. Checkout für Buchungen (zusammen mit dem Buchungsablauf in Phase 3).
5. ~~Billing für die Mitgliedschaft, Kundenportal~~ (erledigt, in der Sandbox getestet: Checkout, Webhooks, Portal).
6. ~~Stripe Tax mit maltesischer Registrierung, monatliche Provisionsrechnungen~~ (erledigt; `pnpm stripe:setup` legt
   Registrierung, USt-IdNr., Produkte, Preise und Portal idempotent an).
7. End-to-End-Test der Kundenzahlung: braucht ein fertig eingerichtetes Test-Betriebskonto. Das gehostete Onboarding
   zeigt automatisierten Browsern ein hCaptcha und muss einmal von Hand durchlaufen werden (Testdaten siehe unten).
8. Live: Plattform-Konto aktivieren, im Live-Modus `pnpm stripe:setup` ausführen, Webhook-Endpunkte anlegen,
   Live-Schlüssel setzen (durch den Betreiber).

## Testdaten für das Onboarding (Sandbox)

| Feld | Wert |
| --- | --- |
| SMS-Code | `000000` |
| Geburtsdatum | 01.01.1901 |
| Adresse | `address_full_match`, 20095 Hamburg |
| IBAN | `DE89370400440532013000` |
| USt-IdNr. Checkout | `DE000000000` (gilt als geprüft) |
| Karte | `4242 4242 4242 4242`, beliebiges Datum in der Zukunft, CVC 123 |

## Live-Konto (eingerichtet am 18.11.2026)

Konto `acct_1UdFmtE5NDOqrw3b`. Eingerichtet: Steuer-Standard netto (`exclusive`), Registrierung Malta
(`taxreg_1UdGlRE5NDOqrw3bmr5Qw0c3`), Produkte, Preise, Kundenportal. Werte für die Live-`.env.local`:

```
STRIPE_PRICE_MONTHLY=price_1UdGlxE5NDOqrw3bohSRMS9E
STRIPE_PRICE_YEARLY=price_1UdGlyE5NDOqrw3bLhfaZM7Y
STRIPE_PRODUCT_COMMISSION=prod_VeZvGXAmphLrXG
STRIPE_PORTAL_CONFIG=bpc_1UdGm6E5NDOqrw3b9O0Xv76f
```

Reverse Charge im Live-Modus geprüft (Rechnungsvorschau): Betrieb in DE mit USt-IdNr. ergibt `reverse_charge`, 0 € Steuer.
Ohne USt-IdNr. ergibt sich `not_collecting` (keine Steuer, kein Hinweis). Deshalb ist die USt-IdNr. im Checkout Pflicht
(`tax_id_collection.required = if_supported`), und Provisionsrechnungen ohne Reverse Charge bleiben als Entwurf liegen.
Betriebe ohne USt-IdNr. (Kleinunternehmer): mit der Steuerberatung klären (OSS-Registrierung oder USt-IdNr. verlangen).

Offen im Dashboard (nicht per API möglich): eigene USt-IdNr. MT33258727 unter Einstellungen → Billing → Rechnungen →
Steuer-IDs hinterlegen (der Code liest sie dann automatisch für jede Rechnung) und unter Unternehmensdaten als `company.vat_id`.

## Zahlungsarten

Karte mit Apple Pay und Google Pay, SEPA-Lastschrift und PayPal. `scripts/stripe-setup.mjs` legt dafür die Zahlungsart-Konfiguration
„handwerker2go Mitgliedschaft“ an (alle anderen Methoden aus); ihre ID gehört nach `STRIPE_PAYMENT_METHOD_CONFIG`.
Sandbox: `pmc_1UdHMuEKlgMVBqXlyiZSf3VS`. Live: entsteht beim ersten Lauf von `pnpm stripe:setup` mit dem Live-Schlüssel.
Die Standardkonfiguration des Live-Kontos (`pmc_1UdFnOE5NDOqrw3boPqAlw1K`) hatte u. a. BLIK, EPS, Kakao Pay, Klarna, MB Way,
Naver Pay, Payco, Pix, Samsung Pay und Satispay aktiv; über den Stripe-Connector lässt sie sich nicht ändern.
Buchungszahlungen (Direct Charges auf den Betriebskonten) brauchen in Phase 3 eine eigene Connect-Konfiguration.

## Live geschaltet (18.11.2026)

- Eingeschränkter Schlüssel (`rk_live_…`) nur in `/opt/handwerker2go/.env.local`, `STRIPE_ALLOW_LIVE=1`.
- Webhook-Endpunkte: `we_1UdIClE5NDOqrw3b7iBTSuNO` (eigenes Konto, `STRIPE_WEBHOOK_SECRET`) und
  `we_1UdIClE5NDOqrw3bmatw8fAV` (Betriebskonten, `STRIPE_WEBHOOK_SECRET_CONNECT`). Signatur beider Geheimnisse getestet.
- Zahlungsarten-Konfiguration live: `pmc_1UdICLE5NDOqrw3bsp7XfDl5`. SEPA und PayPal sind eingeschaltet, werden aber erst nach
  Freischaltung im Dashboard angezeigt.
- Fehlendes Schlüsselrecht: Accounts v2 (Schreiben). Ohne dieses Recht schlägt „Stripe-Konto verbinden“ fehl.
