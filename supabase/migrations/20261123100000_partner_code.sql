-- Partnercode (z. B. FCKSTP für Freunde): dauerhafte Sonderkonditionen eines Betriebs.
-- Nur Admin/System dürfen den Code setzen oder ändern; Betriebe selbst nicht.
alter table provider_profiles add column if not exists partner_code text;
alter table provider_profiles add column if not exists partner_code_at timestamptz;

create or replace function app.provider_partner_code_guard() returns trigger language plpgsql as
$$
begin
  if tg_op = 'INSERT' then
    if not app.is_admin() then new.partner_code := null; new.partner_code_at := null; end if;
  elsif not app.is_admin() and (new.partner_code is distinct from old.partner_code or new.partner_code_at is distinct from old.partner_code_at) then
    raise exception 'Nur Administratoren dürfen den Partnercode ändern';
  end if;
  return new;
end
$$;
create trigger provider_profiles_partner_code_guard before insert or update on provider_profiles
  for each row execute function app.provider_partner_code_guard();
