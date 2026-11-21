-- Aufgabe 9: eigene Rechnungen an Betriebe (Provision und Mitgliedschaft), Reverse Charge, lückenloser Nummernkreis. Nur additiv.
-- Lückenlos: Nummer wird in derselben Transaktion wie die Rechnung aus einem Zähler je Jahr vergeben (Zeilensperre), nie wiederverwendet.
create table if not exists invoice_counters (
  year integer primary key,
  last_number integer not null default 0
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  -- Nummer, Jahr und laufende Nummer erst bei Ausstellung (angehaltene Rechnungen verbrauchen keine Nummer)
  number text unique,
  year integer,
  seq integer,
  kind text not null check (kind in ('commission', 'membership', 'credit_note')),
  provider_id uuid references provider_profiles (id) on delete set null,
  period_start date not null,
  period_end date not null,
  issued_at timestamptz not null default now(),
  recipient jsonb not null,
  description text not null default '',
  lines jsonb not null default '[]'::jsonb,
  net_cents integer not null,
  tax_rate_percent numeric(5,2) not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'EUR',
  payment_note text not null,
  reverse_charge_note text not null,
  status text not null default 'issued' check (status in ('issued', 'on_hold', 'cancelled')),
  credit_for uuid references invoices (id),
  stripe_invoice_id text,
  pdf_key text,
  pdf_sha256 text,
  sent_at timestamptz,
  hold_reason text,
  unique (year, seq),
  unique (kind, provider_id, period_start, stripe_invoice_id)
);
create index if not exists invoices_provider_idx on invoices (provider_id, issued_at);

-- Unveränderbarkeit: Nummer, Beträge, Empfänger und PDF-Hash dürfen nach dem Speichern nicht mehr geändert werden; kein Löschen.
create or replace function app.invoices_append_only() returns trigger language plpgsql as
$$
begin
  if tg_op = 'DELETE' then raise exception 'Rechnungen dürfen nicht gelöscht werden (Stornierung nur per Gutschrift)'; end if;
  if (old.number is not null and (new.number is distinct from old.number or new.seq is distinct from old.seq or new.year is distinct from old.year))
     or new.net_cents is distinct from old.net_cents or new.total_cents is distinct from old.total_cents or new.tax_cents is distinct from old.tax_cents
     or new.recipient is distinct from old.recipient or new.lines is distinct from old.lines or new.description is distinct from old.description
     or (old.pdf_sha256 is not null and new.pdf_sha256 is distinct from old.pdf_sha256)
     or (old.pdf_key is not null and new.pdf_key is distinct from old.pdf_key) then
    raise exception 'Rechnungen sind unveränderbar';
  end if;
  return new;
end
$$;
create trigger invoices_append_only before update or delete on invoices for each row execute function app.invoices_append_only();

alter table invoices enable row level security;
create policy invoices_read on invoices for select using (app.is_admin() or app.owns_provider(provider_id));
create policy invoices_admin on invoices for all using (app.is_admin()) with check (app.is_admin());
alter table invoice_counters enable row level security;
create policy invoice_counters_admin on invoice_counters for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert, update on invoices, invoice_counters to h2g_app;
  end if;
end $$;
