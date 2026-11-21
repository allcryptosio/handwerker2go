-- Aufgabe 14: Meldungen rechtswidriger Inhalte (Art. 16 DSA) und Begründung von Entscheidungen (Art. 17 DSA). Nur additiv.
create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('review', 'provider_profile')),
  content_id uuid not null,
  content_url text,
  reason text not null check (reason in ('rechtswidrig', 'beleidigung', 'falsche_tatsachen', 'urheberrecht', 'sonstiges')),
  explanation text not null,
  reporter_name text,
  reporter_email text,
  good_faith boolean not null default false,
  ip text,
  status text not null default 'received' check (status in ('received', 'removed', 'restricted', 'rejected')),
  decision_reason text,
  decision_facts text,
  decided_by text,
  decided_at timestamptz,
  affected_notified_at timestamptz,
  reporter_notified_at timestamptz,
  created_at timestamptz not null default now(),
  legal_hold boolean not null default false
);
create index if not exists content_reports_open_idx on content_reports (created_at) where status = 'received';
alter table content_reports enable row level security;
create policy content_reports_admin on content_reports for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert, update on content_reports to h2g_app;
  end if;
end $$;
