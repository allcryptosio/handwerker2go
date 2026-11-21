-- Aufgaben 7 und 8: Steuerstatus der Betriebe, Unternehmer-Nachweis (VIES oder Gewerbenachweis). Nur additiv.
alter table provider_profiles add column if not exists tax_status text check (tax_status in ('regelbesteuert', 'kleinunternehmer_19'));
alter table provider_profiles add column if not exists vat_id_valid boolean;
alter table provider_profiles add column if not exists vat_id_checked_at timestamptz;
alter table provider_profiles add column if not exists vies_request_id text;
alter table provider_profiles add column if not exists vies_name text;
alter table provider_profiles add column if not exists vies_address text;
alter table provider_profiles add column if not exists steuernummer text;
alter table provider_profiles add column if not exists business_proof_type text check (business_proof_type in ('ust_idnr', 'gewerbe_nachweis'));
alter table provider_profiles add column if not exists business_proof_file_ids uuid[];
alter table provider_profiles add column if not exists unternehmer_declaration_at timestamptz;
alter table provider_profiles add column if not exists unternehmer_declaration_text_version text;
-- Steuerstatus zum Zeitpunkt der Buchung (für Preisanzeige in Bestätigung und Rechnung)
alter table bookings add column if not exists provider_tax_status text check (provider_tax_status in ('regelbesteuert', 'kleinunternehmer_19'));

-- Protokoll jeder VIES-Prüfung (Nachweis für Reverse Charge)
create table if not exists vies_checks (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider_profiles (id) on delete set null,
  vat_id text not null,
  valid boolean,
  request_identifier text,
  name text,
  address text,
  error text,
  checked_at timestamptz not null default now(),
  purpose text not null default 'onboarding'
);
alter table vies_checks enable row level security;
create policy vies_checks_admin on vies_checks for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert on vies_checks to h2g_app;
  end if;
end $$;

-- Protokoll neuer Erklärungen (Unternehmer-Erklärung, sofortige Bestätigung usw.); consents bleibt unverändert
create table if not exists legal_declarations (
  id uuid primary key default gen_random_uuid(),
  user_id text references "user" (id) on delete set null,
  provider_id uuid references provider_profiles (id) on delete set null,
  booking_id uuid references bookings (id) on delete set null,
  kind text not null,
  text_version text not null,
  text_snapshot text not null,
  legal_version text,
  accepted_at timestamptz not null default now()
);
create index if not exists legal_declarations_provider_idx on legal_declarations (provider_id, kind);
alter table legal_declarations enable row level security;
create policy legal_declarations_read on legal_declarations for select using (app.is_admin() or user_id = app.user_id());
create policy legal_declarations_admin on legal_declarations for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert on legal_declarations to h2g_app;
  end if;
end $$;
