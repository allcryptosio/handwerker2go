-- Aufgabe 10: Sofortige Bestätigung nur mit protokollierter Aktivierungserklärung (AGB für Betriebe § 2a Abs. 1). Nur additiv.
-- Bestehende Betriebe mit booking_mode = 'instant' laufen bis zur Bestätigung wie „Betrieb bestätigt selbst“ (kein Datenverlust).
alter table provider_profiles add column if not exists instant_confirm_consent_at timestamptz;
alter table provider_profiles add column if not exists instant_confirm_terms_version text;
alter table provider_profiles add column if not exists instant_confirm_user_id text;
