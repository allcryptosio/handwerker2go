-- Aufgabe 5: Angebote nach dem Besichtigungstermin, Annahme nur online. Nur additiv.
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('ANG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  inspection_booking_id uuid not null references bookings (id) on delete cascade,
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  customer_id text not null references "user" (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  price_cents integer not null check (price_cents > 0),
  provider_tax_status text check (provider_tax_status in ('regelbesteuert', 'kleinunternehmer_19')),
  planned_start timestamptz not null,
  planned_end timestamptz not null check (planned_end > planned_start),
  valid_until timestamptz not null,
  note text,
  status text not null default 'sent' check (status in ('sent', 'accepted', 'expired', 'withdrawn', 'declined')),
  accepted_booking_id uuid references bookings (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists offers_inspection_idx on offers (inspection_booking_id);
create index if not exists offers_customer_idx on offers (customer_id);
alter table bookings add column if not exists offer_id uuid references offers (id) on delete set null;

alter table offers enable row level security;
create policy offers_read on offers for select using (customer_id = app.user_id() or app.owns_provider(provider_id) or app.is_admin());
create policy offers_admin on offers for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert, update on offers to h2g_app;
  end if;
end $$;
