-- Aufgabe 2: elektronische Widerrufsfunktion (§ 356a BGB). Nur additiv.
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings (id) on delete set null,
  name text not null,
  contract_reference_text text not null,
  confirmation_email text not null,
  received_at timestamptz not null default now(),
  ip text,
  user_agent text,
  declaration_text text not null,
  confirmation_email_message_id text,
  confirmation_sent_at timestamptz,
  status text not null default 'received'
    check (status in ('received', 'refunded', 'partially_refunded', 'rejected_late', 'rejected_excluded', 'unmatched')),
  refund_id text,
  wertersatz_amount_cents integer check (wertersatz_amount_cents is null or wertersatz_amount_cents >= 0),
  handled_by text,
  handled_at timestamptz,
  notes text,
  -- Herkunft: Online-Formular oder Stornierung innerhalb der Widerrufsfrist (Aufgabe 6)
  source text not null default 'online_form' check (source in ('online_form', 'cancel_flow')),
  -- Zuordnung geprüft (E-Mail passt zur Buchung oder eingeloggter Kunde); nur dann automatische Erstattung
  verified boolean not null default false,
  reminder_sent_at timestamptz,
  legal_hold boolean not null default false
);
create index if not exists withdrawals_booking_idx on withdrawals (booking_id);
create index if not exists withdrawals_open_idx on withdrawals (received_at) where status in ('received', 'unmatched');

alter table withdrawals enable row level security;
create policy withdrawals_read on withdrawals for select using (
  app.is_admin()
  or exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = app.user_id() or app.owns_provider(b.provider_id)))
);
create policy withdrawals_admin on withdrawals for all using (app.is_admin()) with check (app.is_admin());

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert, update on withdrawals to h2g_app;
  end if;
end $$;

-- Fallart für die Bearbeitung: auto = sofort erstattet, wertersatz = Leistung begonnen (Betrieb entscheidet, Tag 14 automatisch voll),
-- pruefung = Mensch prüft (Frist/Erlöschen/Zuordnung), unmatched = keine Buchung gefunden
alter table withdrawals add column if not exists case_kind text check (case_kind in ('auto', 'wertersatz', 'pruefung', 'unmatched'));
