-- handwerker2go Kernschema (Phase 2)
-- Läuft auf eigenem PostgreSQL und unverändert auf Supabase (Postgres + PostGIS).
-- Zugriffsmodell: Die App verbindet sich als nicht-besitzende Rolle. Pro Anfrage setzt sie
-- app.user_id und app.role (siehe src/lib/db.ts). RLS-Policies lesen diese Werte.

create extension if not exists postgis;
create extension if not exists btree_gist;
create extension if not exists citext;
create extension if not exists pgcrypto;

create schema if not exists app;

create or replace function app.user_id() returns text language sql stable as
$$ select nullif(current_setting('app.user_id', true), '') $$;

create or replace function app.role() returns text language sql stable as
$$ select coalesce(nullif(current_setting('app.role', true), ''), 'anon') $$;

create or replace function app.is_admin() returns boolean language sql stable as
$$ select app.role() in ('admin', 'system') $$;

create or replace function app.touch_updated_at() returns trigger language plpgsql as
$$ begin new."updatedAt" := now(); return new; end $$;

create or replace function app.touch_updated_at_snake() returns trigger language plpgsql as
$$ begin new.updated_at := now(); return new; end $$;

-- ---------------------------------------------------------------------------
-- Konten (Schema von Better Auth, erzeugt mit better-auth getMigrations)
-- ---------------------------------------------------------------------------
create table "user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null,
  "role" text not null default 'customer' check ("role" in ('customer', 'provider', 'admin'))
);
create table "session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);
create table "account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null
);
create table "verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null
);
create index "session_userId_idx" on "session" ("userId");
create index "account_userId_idx" on "account" ("userId");
create index "verification_identifier_idx" on "verification" ("identifier");

-- ---------------------------------------------------------------------------
-- Stammdaten
-- ---------------------------------------------------------------------------
create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  active boolean not null default false,
  center geography(Point, 4326) not null,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  label text not null,
  trade text not null,
  icon text not null,
  summary text not null default '',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Standardleistungen je Kategorie (Vorlagen, die Betriebe übernehmen und bepreisen)
create table service_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references service_categories (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  mode text not null check (mode in ('fixed', 'quote')),
  duration_min int check (duration_min is null or duration_min > 0),
  sort int not null default 0,
  unique (category_id, slug)
);

-- Konditionen für Betriebe, versioniert über valid_from (nie überschreiben, neue Zeile anlegen)
create table pricing_settings (
  id uuid primary key default gen_random_uuid(),
  valid_from timestamptz not null default now(),
  intro_months int not null check (intro_months >= 0),
  intro_fee_cents int not null check (intro_fee_cents >= 0),
  intro_commission_bps int not null check (intro_commission_bps between 0 and 10000),
  monthly_fee_cents int not null check (monthly_fee_cents >= 0),
  monthly_commission_bps int not null check (monthly_commission_bps between 0 and 10000),
  yearly_fee_cents int not null check (yearly_fee_cents >= 0),
  yearly_commission_bps int not null check (yearly_commission_bps between 0 and 10000),
  created_by text references "user" ("id"),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------------
create table customer_profiles (
  user_id text primary key references "user" ("id") on delete cascade,
  phone text,
  accepted_terms_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user" ("id") on delete cascade,
  slug text unique check (slug ~ '^[a-z0-9-]+$'),
  company_name text not null,
  legal_form text,
  contact_name text not null,
  phone text not null,
  street text not null,
  postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  city text not null,
  vat_id text,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  status_reason text,
  approved_at timestamptz,
  approved_by text references "user" ("id"),
  accepted_terms_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index provider_profiles_status_idx on provider_profiles (status);

create table provider_categories (
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  category_id uuid not null references service_categories (id) on delete restrict,
  primary key (provider_id, category_id)
);

-- Einsatzgebiet: Mittelpunkt (PLZ/Ort) und Radius. center wird ab Phase 3 per Geocoding gefüllt.
create table service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  city_id uuid references cities (id),
  label text not null,
  center geography(Point, 4326),
  radius_km numeric(5, 1) not null check (radius_km > 0 and radius_km <= 200),
  created_at timestamptz not null default now()
);
create index service_areas_center_idx on service_areas using gist (center);

create table provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles (id) on delete cascade,
  kind text not null check (kind in ('gewerbeanmeldung', 'handwerksrolle', 'versicherung', 'sonstiges')),
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes int not null check (size_bytes > 0),
  review_status text not null default 'pending' check (review_status in ('pending', 'accepted', 'rejected')),
  uploaded_at timestamptz not null default now()
);

create table customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  label text,
  street text not null,
  postal_code text not null,
  city text not null,
  location geography(Point, 4326),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- System
-- ---------------------------------------------------------------------------
create table email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text not null,
  html text not null,
  text_body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  provider_message_id text,
  error text,
  attempts int not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_outbox_status_idx on email_outbox (status, created_at);

-- Revisionssicheres Protokoll: nur Einfügen erlaubt, Ändern und Löschen per Trigger gesperrt
create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id text,
  actor_role text not null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
create or replace function app.audit_logs_immutable() returns trigger language plpgsql as
$$ begin raise exception 'audit_logs sind unveränderlich'; end $$;
create trigger audit_logs_no_update before update or delete on audit_logs
  for each row execute function app.audit_logs_immutable();

-- Status und Freigabe eines Betriebs darf nur ein Admin ändern
create or replace function app.provider_guard() returns trigger language plpgsql as
$$
begin
  if not app.is_admin() and (
    new.status is distinct from old.status or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by or new.slug is distinct from old.slug) then
    raise exception 'Nur Administratoren dürfen den Status eines Betriebs ändern';
  end if;
  return new;
end
$$;
create trigger provider_profiles_guard before update on provider_profiles
  for each row execute function app.provider_guard();
create or replace function app.provider_insert_guard() returns trigger language plpgsql as
$$
begin
  if not app.is_admin() then
    new.status := 'pending'; new.approved_at := null; new.approved_by := null; new.slug := null;
  end if;
  return new;
end
$$;
create trigger provider_profiles_insert_guard before insert on provider_profiles
  for each row execute function app.provider_insert_guard();

create trigger user_touch before update on "user" for each row execute function app.touch_updated_at();
create trigger cities_touch before update on cities for each row execute function app.touch_updated_at_snake();
create trigger categories_touch before update on service_categories for each row execute function app.touch_updated_at_snake();
create trigger customer_profiles_touch before update on customer_profiles for each row execute function app.touch_updated_at_snake();
create trigger provider_profiles_touch before update on provider_profiles for each row execute function app.touch_updated_at_snake();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Konten-Tabellen ("user", session, account, verification) verwaltet Better Auth serverseitig.
-- ---------------------------------------------------------------------------
alter table cities enable row level security;
alter table service_categories enable row level security;
alter table service_templates enable row level security;
alter table pricing_settings enable row level security;
alter table customer_profiles enable row level security;
alter table provider_profiles enable row level security;
alter table provider_categories enable row level security;
alter table service_areas enable row level security;
alter table provider_documents enable row level security;
alter table customer_addresses enable row level security;
alter table email_outbox enable row level security;
alter table audit_logs enable row level security;

-- Öffentliche Stammdaten
create policy cities_read on cities for select using (active or app.is_admin());
create policy cities_admin on cities for all using (app.is_admin()) with check (app.is_admin());
create policy categories_read on service_categories for select using (active or app.is_admin());
create policy categories_admin on service_categories for all using (app.is_admin()) with check (app.is_admin());
create policy templates_read on service_templates for select using (true);
create policy templates_admin on service_templates for all using (app.is_admin()) with check (app.is_admin());
create policy pricing_read on pricing_settings for select using (true);
create policy pricing_admin on pricing_settings for insert with check (app.is_admin());

-- Kunden sehen nur sich selbst
create policy customer_own on customer_profiles for all
  using (user_id = app.user_id() or app.is_admin()) with check (user_id = app.user_id() or app.is_admin());
create policy addresses_own on customer_addresses for all
  using (user_id = app.user_id() or app.is_admin()) with check (user_id = app.user_id() or app.is_admin());

-- Betriebe: öffentlich nur freigegebene, sonst nur der eigene
create policy providers_read on provider_profiles for select
  using (status = 'approved' or user_id = app.user_id() or app.is_admin());
create policy providers_insert on provider_profiles for insert
  with check (user_id = app.user_id() or app.is_admin());
create policy providers_update on provider_profiles for update
  using (user_id = app.user_id() or app.is_admin()) with check (user_id = app.user_id() or app.is_admin());

create or replace function app.owns_provider(pid uuid) returns boolean language sql stable as
$$ select exists (select 1 from provider_profiles p where p.id = pid and p.user_id = app.user_id()) $$;
create or replace function app.provider_public(pid uuid) returns boolean language sql stable as
$$ select exists (select 1 from provider_profiles p where p.id = pid and p.status = 'approved') $$;

create policy provider_categories_read on provider_categories for select
  using (app.provider_public(provider_id) or app.owns_provider(provider_id) or app.is_admin());
create policy provider_categories_write on provider_categories for all
  using (app.owns_provider(provider_id) or app.is_admin()) with check (app.owns_provider(provider_id) or app.is_admin());
create policy areas_read on service_areas for select
  using (app.provider_public(provider_id) or app.owns_provider(provider_id) or app.is_admin());
create policy areas_write on service_areas for all
  using (app.owns_provider(provider_id) or app.is_admin()) with check (app.owns_provider(provider_id) or app.is_admin());

-- Nachweise: nie öffentlich
create policy documents_own on provider_documents for select using (app.owns_provider(provider_id) or app.is_admin());
create policy documents_insert on provider_documents for insert with check (app.owns_provider(provider_id) or app.is_admin());
create policy documents_admin on provider_documents for update using (app.is_admin()) with check (app.is_admin());

-- System
create policy outbox_insert on email_outbox for insert with check (true);
create policy outbox_admin on email_outbox for select using (app.is_admin());
create policy outbox_admin_update on email_outbox for update using (app.is_admin()) with check (app.is_admin());
create policy audit_insert on audit_logs for insert with check (true);
create policy audit_read on audit_logs for select using (app.is_admin());
