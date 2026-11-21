-- Aufgabe 13: Bewertungsmails nur mit Opt-in, Sperrliste für Abmeldungen. Nur additiv.
alter table bookings add column if not exists review_optin boolean not null default false;
alter table bookings add column if not exists review_optin_at timestamptz;
alter table bookings add column if not exists review_optin_text_version text;
create table if not exists review_mail_blocklist (
  email text primary key,
  blocked_at timestamptz not null default now(),
  source text not null default 'link'
);
alter table review_mail_blocklist enable row level security;
create policy review_mail_blocklist_admin on review_mail_blocklist for all using (app.is_admin()) with check (app.is_admin());
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant select, insert on review_mail_blocklist to h2g_app;
  end if;
end $$;
