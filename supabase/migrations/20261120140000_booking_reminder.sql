-- Terminerinnerung 24 Stunden vorher: merkt sich, dass die Mail raus ist (nie doppelt)
alter table bookings add column if not exists reminder_sent_at timestamptz;
create index if not exists bookings_reminder_due_idx on bookings (starts_at) where status = 'confirmed' and reminder_sent_at is null;
