-- Antwortzeit der Betriebe für das Ranking („wie schnell der Betrieb auf Anfragen antwortet“, /ranking)
-- Nur additiv: neue Spalte, keine Daten werden verändert oder gelöscht.
alter table bookings add column responded_at timestamptz;
comment on column bookings.responded_at is 'Zeitpunkt, zu dem der Betrieb eine Anfrage (status requested) bestätigt oder abgelehnt hat';
