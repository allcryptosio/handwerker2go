-- Speicherdauer (Datenschutzerklärung Abschnitt 16) technisch umsetzen. Nur additiv bzw. Lockerung für das System.

-- Sperre bei anhängigem Streit (Rückbuchung, Beschwerde, Verfahren): solange gesetzt, wird nichts gelöscht oder anonymisiert
alter table bookings add column legal_hold boolean not null default false;
alter table bookings add column legal_hold_reason text;
alter table bookings add column anonymized_at timestamptz;

-- Erinnerung vor dem Ende der Einführungsphase nur einmal schicken
alter table provider_profiles add column intro_reminder_sent_at timestamptz;

-- Kunden-Konten mit Buchungen sollen löschbar sein: Buchung bleibt (Abrechnungsteil), verliert nur den Kontobezug
alter table bookings alter column customer_id drop not null;
alter table bookings drop constraint bookings_customer_id_fkey;
alter table bookings add constraint bookings_customer_id_fkey foreign key (customer_id) references "user" (id) on delete set null;

-- Erklärungen zum vorzeitigen Leistungsbeginn sind Nachweise (3 Jahre) und dürfen nicht mit dem Konto verschwinden
alter table consents alter column user_id drop not null;
alter table consents drop constraint consents_user_id_fkey;
alter table consents add constraint consents_user_id_fkey foreign key (user_id) references "user" (id) on delete set null;

-- Protokoll bleibt unveränderlich; nur das System darf Einträge löschen, die älter als 9 Jahre sind
create or replace function app.audit_logs_immutable() returns trigger language plpgsql as
$$
begin
  if tg_op = 'DELETE' and app.role() = 'system' and old.created_at < now() - interval '9 years' then
    return old;
  end if;
  raise exception 'audit_logs sind unveränderlich';
end
$$;
