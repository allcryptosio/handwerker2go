-- Startdaten: Hamburg, Kategorien, Standardleistungen, Konditionen
insert into cities (slug, name, active, center, sort) values
  ('hamburg', 'Hamburg', true, st_setsrid(st_makepoint(9.9937, 53.5511), 4326)::geography, 1);

insert into service_categories (slug, label, trade, icon, summary, sort) values
  ('entruempelung', 'Entrümpelung', 'Entrümpelung', 'entruempelung', 'Keller, Dachboden, Wohnung oder Garage: ausräumen, trennen, fachgerecht entsorgen.', 1),
  ('moebelmontage', 'Möbelmontage', 'Möbelmontage', 'montage', 'Auf- und Abbau von Möbeln inklusive Auspacken und Aufräumen.', 2),
  ('wandmontage', 'Wandmontage', 'Wandmontage', 'wand', 'Fernseher, Regale, Spiegel und Lampen sicher an der Wand.', 3),
  ('elektriker', 'Elektro', 'Elektriker', 'elektro', 'Arbeiten an Strom nur durch eingetragene Elektrofachbetriebe.', 4),
  ('sanitaer', 'Sanitär', 'Sanitär', 'sanitaer', 'Armaturen, Abflüsse, WC und Dusche.', 5),
  ('maler', 'Maler', 'Maler', 'maler', 'Streichen, tapezieren, lackieren.', 6),
  ('umzugshilfe', 'Umzug', 'Umzugshilfe', 'umzug', 'Tragen, Transport und Verladen.', 7),
  ('gartenpflege', 'Garten', 'Gartenpflege', 'garten', 'Hecke, Rasen, Laub und Baumschnitt.', 8);

insert into service_templates (category_id, slug, name, mode, duration_min, sort)
select c.id, t.slug, t.name, t.mode, t.duration_min, t.sort
from (values
  ('entruempelung', 'keller-entruempeln', 'Keller entrümpeln', 'quote', null, 1),
  ('entruempelung', 'wohnung-entruempeln', 'Wohnung entrümpeln', 'quote', null, 2),
  ('entruempelung', 'dachboden-entruempeln', 'Dachboden entrümpeln', 'quote', null, 3),
  ('entruempelung', 'sperrmuell-abholen', 'Sperrmüll abholen', 'fixed', 60, 4),
  ('entruempelung', 'haushaltsaufloesung', 'Haushaltsauflösung', 'quote', null, 5),
  ('moebelmontage', 'kleiderschrank-aufbauen', 'Kleiderschrank aufbauen', 'fixed', 150, 1),
  ('moebelmontage', 'bett-aufbauen', 'Bett aufbauen', 'fixed', 90, 2),
  ('moebelmontage', 'kueche-montieren', 'Küche montieren', 'quote', null, 3),
  ('moebelmontage', 'moebel-abbauen', 'Möbel abbauen', 'fixed', 60, 4),
  ('wandmontage', 'fernseher-aufhaengen', 'Fernseher aufhängen', 'fixed', 60, 1),
  ('wandmontage', 'regale-anbringen', 'Regale anbringen', 'fixed', 60, 2),
  ('wandmontage', 'bilder-aufhaengen', 'Bilder aufhängen', 'fixed', 45, 3),
  ('wandmontage', 'gardinenstange-montieren', 'Gardinenstange montieren', 'fixed', 45, 4),
  ('elektriker', 'lampe-anschliessen', 'Lampe anschließen', 'fixed', 60, 1),
  ('elektriker', 'steckdose-setzen', 'Steckdose setzen', 'fixed', 60, 2),
  ('elektriker', 'lichtschalter-tauschen', 'Lichtschalter tauschen', 'fixed', 45, 3),
  ('elektriker', 'herd-anschliessen', 'Herd anschließen', 'fixed', 60, 4),
  ('elektriker', 'elektroinstallation', 'Elektroinstallation', 'quote', null, 5),
  ('sanitaer', 'wasserhahn-tauschen', 'Wasserhahn tauschen', 'fixed', 60, 1),
  ('sanitaer', 'abfluss-reinigen', 'Abfluss reinigen', 'fixed', 60, 2),
  ('sanitaer', 'wc-reparieren', 'WC reparieren', 'fixed', 60, 3),
  ('sanitaer', 'duschkopf-montieren', 'Duschkopf montieren', 'fixed', 30, 4),
  ('sanitaer', 'bad-sanieren', 'Bad sanieren', 'quote', null, 5),
  ('maler', 'zimmer-streichen', 'Zimmer streichen', 'fixed', 300, 1),
  ('maler', 'decke-streichen', 'Decke streichen', 'fixed', 180, 2),
  ('maler', 'tapezieren', 'Tapezieren', 'quote', null, 3),
  ('maler', 'tueren-lackieren', 'Türen lackieren', 'quote', null, 4),
  ('maler', 'wohnung-streichen', 'Wohnung streichen', 'quote', null, 5),
  ('umzugshilfe', 'umzugshilfe', 'Umzugshilfe', 'fixed', 120, 1),
  ('umzugshilfe', 'moebeltransport', 'Möbeltransport', 'quote', null, 2),
  ('umzugshilfe', 'halteverbotszone', 'Halteverbotszone beantragen', 'quote', null, 3),
  ('gartenpflege', 'hecke-schneiden', 'Hecke schneiden', 'fixed', 120, 1),
  ('gartenpflege', 'rasen-maehen', 'Rasen mähen', 'fixed', 60, 2),
  ('gartenpflege', 'laub-entfernen', 'Laub entfernen', 'fixed', 120, 3),
  ('gartenpflege', 'baum-zurueckschneiden', 'Baum zurückschneiden', 'quote', null, 4)
) as t(category, slug, name, mode, duration_min, sort)
join service_categories c on c.slug = t.category;

insert into pricing_settings (intro_months, intro_fee_cents, intro_commission_bps,
  monthly_fee_cents, monthly_commission_bps, yearly_fee_cents, yearly_commission_bps)
values (3, 0, 1000, 2999, 1500, 29988, 1500);
