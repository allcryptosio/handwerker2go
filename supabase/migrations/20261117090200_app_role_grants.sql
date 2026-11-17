-- Rechte für die App-Rolle des selbst gehosteten Betriebs (h2g_app).
-- Auf Supabase existiert diese Rolle nicht, dann passiert hier nichts.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'h2g_app') then
    grant usage on schema app to h2g_app;
    grant execute on all functions in schema app to h2g_app;
    grant select, insert, update, delete on all tables in schema public to h2g_app;
    grant usage, select on all sequences in schema public to h2g_app;
  end if;
end $$;
