-- Aufgabe 6: Anfahrtskosten als Obergrenze der Stornopauschale. Nur additiv.
alter table provider_profiles add column if not exists anfahrtskosten_cents integer check (anfahrtskosten_cents is null or anfahrtskosten_cents >= 0);
-- Stand bei Buchung (Snapshot), damit spätere Änderungen alte Buchungen nicht verändern
alter table bookings add column if not exists anfahrtskosten_cents integer check (anfahrtskosten_cents is null or anfahrtskosten_cents >= 0);
alter table bookings add column if not exists cancellation_fee_cents integer check (cancellation_fee_cents is null or cancellation_fee_cents >= 0);
alter table bookings add column if not exists no_show_at timestamptz;
