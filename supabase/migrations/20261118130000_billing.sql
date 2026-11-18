-- Mitgliedschaft der Betriebe (Stripe Billing) und monatliche Provisionsrechnungen

alter table provider_profiles
  add column membership_plan text check (membership_plan in ('monthly', 'yearly')),
  add column membership_status text not null default 'none'
    check (membership_status in ('none', 'trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'paused')),
  add column stripe_subscription_id text unique,
  add column membership_period_end timestamptz,
  add column membership_cancel_at_period_end boolean not null default false;

-- Auch Mitgliedschaftsfelder darf nur Admin oder System ändern
create or replace function app.provider_guard() returns trigger language plpgsql as
$$
begin
  if not app.is_admin() and (
    new.status is distinct from old.status or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by or new.slug is distinct from old.slug
    or new.stripe_account_id is distinct from old.stripe_account_id
    or new.stripe_charges_enabled is distinct from old.stripe_charges_enabled
    or new.stripe_payouts_enabled is distinct from old.stripe_payouts_enabled
    or new.stripe_details_submitted is distinct from old.stripe_details_submitted
    or new.membership_plan is distinct from old.membership_plan
    or new.membership_status is distinct from old.membership_status
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    or new.membership_period_end is distinct from old.membership_period_end
    or new.membership_cancel_at_period_end is distinct from old.membership_cancel_at_period_end) then
    raise exception 'Nur Administratoren oder das System dürfen Status, Zahlungs- und Mitgliedschaftsdaten eines Betriebs ändern';
  end if;
  return new;
end
$$;

-- In der Suche sichtbar: freigeschaltet und entweder in der Einführungsphase oder mit laufender Mitgliedschaft.
-- past_due bleibt sichtbar (Stripe versucht den Einzug erneut); AGB § 4 Abs. 4 erlaubt das Ausblenden erst nach 14 Tagen.
create or replace function app.provider_listed(pid uuid) returns boolean language sql stable as
$$ select exists (
     select 1 from provider_profiles p, lateral (select intro_months from pricing_settings where valid_from <= now() order by valid_from desc limit 1) ps
     where p.id = pid and p.status = 'approved'
       and (p.approved_at + make_interval(months => ps.intro_months) > now()
            or p.membership_status in ('trialing', 'active', 'past_due'))) $$;

-- Eine Provisionsrechnung je Betrieb und Monat
create table commission_invoices (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles (id) on delete restrict,
  period_start date not null,
  stripe_invoice_id text unique,
  fee_count integer not null,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (provider_id, period_start)
);
alter table commission_invoices enable row level security;
create policy commission_invoices_read on commission_invoices for select
  using (app.is_admin() or provider_id in (select id from provider_profiles where user_id = app.user_id()));
create policy commission_invoices_admin on commission_invoices for all using (app.is_admin()) with check (app.is_admin());

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant execute on all functions in schema app to h2g_app;
    grant select, insert, update on commission_invoices to h2g_app;
  end if;
end $$;
