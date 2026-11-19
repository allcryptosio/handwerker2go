-- Phase 3: Postleitzahlen, Kalender der Betriebe, Leistungen mit Preisen, Buchungen, Bewertungen

-- Postleitzahlen mit Koordinaten (GeoNames, CC BY 4.0), geladen mit scripts/import-postal-codes.mjs
create table postal_codes (
  id serial primary key,
  postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  place text not null,
  state text,
  location geography(Point, 4326) not null
);
create index postal_codes_code_idx on postal_codes (postal_code);
create index postal_codes_place_idx on postal_codes (lower(place) text_pattern_ops);
alter table postal_codes enable row level security;
create policy postal_codes_read on postal_codes for select using (true);
create policy postal_codes_admin on postal_codes for all using (app.is_admin()) with check (app.is_admin());

-- Einstellungen des Betriebs für die Terminplanung
alter table provider_profiles
  add column buffer_minutes integer not null default 30 check (buffer_minutes between 0 and 240),
  add column min_notice_hours integer not null default 12 check (min_notice_hours between 0 and 168),
  add column booking_mode text not null default 'instant' check (booking_mode in ('instant', 'confirm')),
  add column logo_key text;

-- Wöchentliche Arbeitszeiten (ISO-Wochentag: 1 = Montag … 7 = Sonntag), mehrere Blöcke pro Tag möglich
create table provider_working_hours (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  starts time not null,
  ends time not null,
  check (ends > starts)
);
create index provider_working_hours_idx on provider_working_hours (provider_id, weekday);

-- Urlaub, freie Tage, einzelne Sperren
create table provider_time_off (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  during tstzrange not null check (not isempty(during)),
  reason text,
  created_at timestamptz not null default now()
);
create index provider_time_off_idx on provider_time_off using gist (provider_id, during);

-- Leistungen des Betriebs mit eigenem Preis und eigener Dauer
create table provider_services (
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  template_id uuid not null references service_templates (id) on delete restrict,
  price_type text not null check (price_type in ('fixed', 'quote')),
  price_cents integer check (price_cents is null or price_cents between 100 and 10000000),
  duration_min integer not null check (duration_min between 15 and 1440),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (provider_id, template_id),
  check (price_type = 'quote' or price_cents is not null)
);

-- Buchungen
create table bookings (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('H2G-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id text not null references "user" (id) on delete restrict,
  provider_id uuid not null references provider_profiles (id) on delete restrict,
  template_id uuid references service_templates (id) on delete set null,
  service_name text not null,
  status text not null check (status in ('pending_payment', 'requested', 'confirmed', 'declined', 'cancelled', 'expired', 'completed')),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  -- belegte Zeit im Kalender des Betriebs: Anfahrt davor, Pufferzeit danach
  blocked tstzrange not null,
  travel_minutes integer not null default 0,
  street text not null,
  postal_code text not null,
  city text not null,
  location geography(Point, 4326),
  distance_km numeric(6, 1),
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  notes text,
  price_type text not null check (price_type in ('fixed', 'quote')),
  price_cents integer,
  commission_bps integer,
  application_fee_cents integer,
  early_start_consent_at timestamptz,
  terms_version text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  hold_expires_at timestamptz,
  refunded_cents integer not null default 0,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  -- Kein Betrieb kann zwei aktive Termine haben, die sich überschneiden (inkl. Anfahrt und Puffer)
  constraint bookings_no_overlap exclude using gist (provider_id with =, blocked with &&)
    where (status in ('pending_payment', 'requested', 'confirmed'))
);
create index bookings_customer_idx on bookings (customer_id, starts_at desc);
create index bookings_provider_idx on bookings (provider_id, starts_at);
create trigger bookings_touch before update on bookings for each row execute function app.touch_updated_at_snake();

create table booking_photos (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  storage_key text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

-- Bewertungen: nur zu abgeschlossenen Buchungen, eine pro Buchung
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings (id) on delete cascade,
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  customer_id text not null references "user" (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index reviews_provider_idx on reviews (provider_id) where visible;

-- Zugriffsrechte: Lesen für Beteiligte, Schreiben nur über geprüfte Server-Aktionen (Rolle system) oder Admin
alter table provider_working_hours enable row level security;
alter table provider_time_off enable row level security;
alter table provider_services enable row level security;
alter table bookings enable row level security;
alter table booking_photos enable row level security;
alter table reviews enable row level security;

create policy pwh_read on provider_working_hours for select using (app.provider_public(provider_id) or app.owns_provider(provider_id) or app.is_admin());
create policy pwh_write on provider_working_hours for all using (app.owns_provider(provider_id) or app.is_admin()) with check (app.owns_provider(provider_id) or app.is_admin());
create policy pto_read on provider_time_off for select using (app.owns_provider(provider_id) or app.is_admin());
create policy pto_write on provider_time_off for all using (app.owns_provider(provider_id) or app.is_admin()) with check (app.owns_provider(provider_id) or app.is_admin());
create policy ps_read on provider_services for select using (app.provider_public(provider_id) or app.owns_provider(provider_id) or app.is_admin());
create policy ps_write on provider_services for all using (app.owns_provider(provider_id) or app.is_admin()) with check (app.owns_provider(provider_id) or app.is_admin());
create policy bookings_read on bookings for select using (customer_id = app.user_id() or app.owns_provider(provider_id) or app.is_admin());
create policy bookings_admin on bookings for all using (app.is_admin()) with check (app.is_admin());
create policy booking_photos_read on booking_photos for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = app.user_id() or app.owns_provider(b.provider_id))) or app.is_admin());
create policy booking_photos_admin on booking_photos for all using (app.is_admin()) with check (app.is_admin());
create policy reviews_read on reviews for select using (visible or customer_id = app.user_id() or app.owns_provider(provider_id) or app.is_admin());
create policy reviews_admin on reviews for all using (app.is_admin()) with check (app.is_admin());

-- Einstellungen der Terminplanung darf der Betrieb selbst ändern (provider_guard prüft nur Status-/Zahlungsfelder)

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select on postal_codes to h2g_app;
    grant select, insert, update, delete on provider_working_hours, provider_time_off, provider_services to h2g_app;
    grant select, insert, update on bookings, booking_photos, reviews to h2g_app;
    grant execute on all functions in schema app to h2g_app;
  end if;
end $$;
