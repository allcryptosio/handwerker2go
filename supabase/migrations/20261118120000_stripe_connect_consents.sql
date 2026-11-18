-- Stripe Connect (Express) für Betriebe, Webhook-Idempotenz, gespeicherte Zustimmungen

alter table provider_profiles
  add column stripe_account_id text unique,
  add column stripe_charges_enabled boolean not null default false,
  add column stripe_payouts_enabled boolean not null default false,
  add column stripe_details_submitted boolean not null default false,
  add column stripe_synced_at timestamptz;

-- Status- und Stripe-Felder darf nur Admin oder System ändern (nicht der Betrieb selbst)
create or replace function app.provider_guard() returns trigger language plpgsql as
$$
begin
  if not app.is_admin() and (
    new.status is distinct from old.status or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by or new.slug is distinct from old.slug
    or new.stripe_account_id is distinct from old.stripe_account_id
    or new.stripe_charges_enabled is distinct from old.stripe_charges_enabled
    or new.stripe_payouts_enabled is distinct from old.stripe_payouts_enabled
    or new.stripe_details_submitted is distinct from old.stripe_details_submitted) then
    raise exception 'Nur Administratoren oder das System dürfen Status und Zahlungsdaten eines Betriebs ändern';
  end if;
  return new;
end
$$;

-- Buchbar = freigeschaltet und von Stripe für Zahlungen und Auszahlungen freigegeben
create or replace function app.provider_bookable(pid uuid) returns boolean language sql stable as
$$ select exists (select 1 from provider_profiles p where p.id = pid and p.status = 'approved'
                  and p.stripe_charges_enabled and p.stripe_payouts_enabled) $$;

-- Jedes Stripe-Ereignis wird genau einmal verarbeitet
create table stripe_events (
  id text primary key,
  type text not null,
  livemode boolean not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);
alter table stripe_events enable row level security;
create policy stripe_events_admin on stripe_events for all using (app.is_admin()) with check (app.is_admin());

-- Ausdrückliche Erklärungen von Kunden, z. B. vorzeitiger Leistungsbeginn vor Ablauf der Widerrufsfrist
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  kind text not null check (kind in ('early_start_withdrawal')),
  terms_version text not null,
  text_snapshot text not null,
  booking_ref text,
  accepted_at timestamptz not null default now()
);
create index consents_user_idx on consents (user_id, kind);
alter table consents enable row level security;
create policy consents_own on consents for select using (user_id = app.user_id() or app.is_admin());
create policy consents_insert on consents for insert with check (user_id = app.user_id() or app.is_admin());

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant execute on all functions in schema app to h2g_app;
    grant select, insert, update, delete on stripe_events, consents to h2g_app;
  end if;
end $$;
