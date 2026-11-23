import "server-only";
import { asSystem } from "@/lib/db";
import { type Candidate, type Exclusion, earliestSlot, rankScore, timesBetween } from "@/lib/booking/engine";
import { addDays, berlinToDate, berlinTime, isoWeekday, minutesOf } from "@/lib/booking/time";
import { EFFECTIVE_BOOKING_MODE_SQL } from "@/lib/legal/instant-confirm";

export interface Place {
  postalCode: string;
  place: string;
  lat: number;
  lon: number;
}

/** Vorschläge für das Ortsfeld: PLZ-Anfang oder Ortsname */
export async function suggestPlaces(q: string): Promise<Place[]> {
  const s = q.trim();
  if (s.length < 2) return [];
  return asSystem(async (db) => {
    const isCode = /^\d+$/.test(s);
    const r = await db.query(
      `select distinct on (postal_code, place) postal_code, place, ST_Y(location::geometry) lat, ST_X(location::geometry) lon
         from postal_codes
        where ${isCode ? "postal_code like $1 || '%'" : "lower(place) like lower($1) || '%'"}
          and place !~ '(AG|GmbH|Bank|Versand|Postfach|Verlag|Großkunde)\\M' 
        order by postal_code, place
        limit 8`,
      [s],
    );
    return r.rows.map((x) => ({ postalCode: x.postal_code, place: x.place, lat: Number(x.lat), lon: Number(x.lon) }));
  });
}

/** Eingabe wie „20095“, „20095 Hamburg“ oder „Hamburg“ in einen Ort mit Koordinaten auflösen */
export async function resolvePlace(input: string): Promise<Place | null> {
  const code = input.match(/\b(\d{5})\b/)?.[1];
  const name = input.replace(/\b\d{5}\b/, "").replace(/[,]/g, " ").trim();
  return asSystem(async (db) => {
    const r = code
      ? await db.query(
          `select postal_code, place, ST_Y(location::geometry) lat, ST_X(location::geometry) lon from postal_codes
            where postal_code = $1 order by (lower(place) = lower($2)) desc, length(place) limit 1`,
          [code, name],
        )
      : await db.query(
          `select postal_code, place, ST_Y(location::geometry) lat, ST_X(location::geometry) lon from postal_codes
            where lower(place) = lower($1) or lower(place) like lower($1) || ' %' order by length(place), postal_code limit 1`,
          [name],
        );
    const x = r.rows[0];
    return x ? { postalCode: x.postal_code, place: x.place, lat: Number(x.lat), lon: Number(x.lon) } : null;
  });
}

export interface ServiceOption {
  templateId: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryLabel: string;
  mode: "fixed" | "quote";
}

/** Alle buchbaren Leistungen für das Leistungsfeld */
export async function serviceOptions(): Promise<ServiceOption[]> {
  return asSystem(async (db) =>
    (await db.query(
      `select t.id, t.slug, t.name, t.mode, c.slug cslug, c.label from service_templates t
         join service_categories c on c.id = t.category_id where c.active order by c.sort, t.sort`,
    )).rows.map((r) => ({ templateId: r.id, slug: r.slug, name: r.name, categorySlug: r.cslug, categoryLabel: r.label, mode: r.mode })),
  );
}

/** Leistung über ihren Kurznamen (z. B. "lampe-anschliessen") */
export async function templateBySlug(slug: string): Promise<ServiceOption | null> {
  return asSystem(async (db) => {
    const r = (await db.query(
      `select t.id, t.slug, t.name, t.mode, c.slug cslug, c.label from service_templates t
         join service_categories c on c.id = t.category_id where t.slug = $1 and c.active limit 1`,
      [slug],
    )).rows[0];
    return r ? { templateId: r.id, slug: r.slug, name: r.name, categorySlug: r.cslug, categoryLabel: r.label, mode: r.mode } : null;
  });
}

export interface ProviderInfo {
  providerId: string;
  slug: string;
  name: string;
  logoKey: string | null;
  categories: string[];
  rating: number | null;
  reviewCount: number;
  jobCount: number;
  distanceKm: number;
  priceType: "fixed" | "quote";
  priceCents: number | null;
  durationMin: number;
  bookingMode: "instant" | "confirm";
  bufferMin: number;
  stripeAccountId: string | null;
  radiusKm: number;
  providerCancelRate: number | null;
  offeredServices: number;
  avgResponseHours: number | null;
  approvedAt: string;
  /** Partnercode mit Sonderkonditionen (Provision) */
  partnerCode: string | null;
  /** Anfahrtskosten des Betriebs (Obergrenze der Stornopauschale, im Festpreis enthalten) */
  anfahrtskostenCents: number;
  /** Steuerstatus für die Preisanzeige */
  taxStatus: "regelbesteuert" | "kleinunternehmer_19";
}

interface Loaded {
  info: ProviderInfo;
  candidate: Candidate;
}

/** Betriebe der Kategorie mit allen Daten, die die Verfügbarkeitsprüfung im Zeitraum [fromDate, toDate] braucht */
async function loadCandidates(opts: { templateId: string; lat: number; lon: number; fromDate: string; toDate: string; providerId?: string }): Promise<Loaded[]> {
  const rangeStart = berlinToDate(opts.fromDate, "00:00");
  const rangeEnd = berlinToDate(addDays(opts.toDate, 1), "00:00");
  return asSystem(async (db) => {
    // Bevor gerechnet wird: abgelaufene Zahlungs-Reservierungen freigeben
    await db.query(`update bookings set status = 'expired' where status = 'pending_payment' and hold_expires_at < now()`);
    const rows = (await db.query(
      `select p.id, p.slug, p.company_name, p.logo_key, p.buffer_minutes, p.stripe_account_id, p.approved_at, p.partner_code, p.min_notice_hours, ${EFFECTIVE_BOOKING_MODE_SQL} booking_mode, p.anfahrtskosten_cents, p.tax_status,
              (p.stripe_charges_enabled and p.stripe_payouts_enabled) payable,
              sa.radius_km, case when sa.center is null then null else ST_Distance(sa.center, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography) / 1000 end distance_km,
              ps.price_type, ps.price_cents, coalesce(ps.duration_min, t.duration_min, 60) duration_min, ps.template_id is not null offers,
              (select array_agg(c2.label order by c2.sort) from provider_categories pc2 join service_categories c2 on c2.id = pc2.category_id where pc2.provider_id = p.id) cats,
              (select round(avg(rating)::numeric, 1) from reviews r where r.provider_id = p.id and r.visible) rating,
              (select count(*) from reviews r where r.provider_id = p.id and r.visible) review_count,
              (select count(*) from bookings b where b.provider_id = p.id and b.status = 'completed') job_count,
              (select count(*) from bookings b where b.provider_id = p.id and b.status in ('confirmed', 'completed', 'declined', 'cancelled')) decided_count,
              (select count(*) from bookings b where b.provider_id = p.id and (b.status = 'declined' or (b.status = 'cancelled' and coalesce(b.cancel_reason, '') not in ('Storniert durch Kunden', 'Termin bereits vergeben')))) provider_cancel_count,
              (select count(*) from provider_services s2 where s2.provider_id = p.id and s2.active) offered_services,
              (select avg(extract(epoch from (b.responded_at - b.created_at)) / 3600) from bookings b
                 where b.provider_id = p.id and b.responded_at is not null and b.created_at > now() - interval '12 months') avg_response_hours
         from service_templates t
         join provider_categories pc on pc.category_id = t.category_id
         join provider_profiles p on p.id = pc.provider_id
         join lateral (select * from service_areas s where s.provider_id = p.id order by s.created_at limit 1) sa on true
         left join provider_services ps on ps.provider_id = p.id and ps.template_id = t.id and ps.active
        where t.id = $1 and p.status = 'approved' and app.provider_listed(p.id) and p.anfahrtskosten_cents is not null and p.tax_status is not null ${opts.providerId ? "and p.id = $4" : ""}`,
      opts.providerId ? [opts.templateId, opts.lat, opts.lon, opts.providerId] : [opts.templateId, opts.lat, opts.lon],
    )).rows;
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const hours = (await db.query(
      `select provider_id, weekday, extract(epoch from starts)::int / 60 f, extract(epoch from ends)::int / 60 t from provider_working_hours where provider_id = any($1)`,
      [ids],
    )).rows;
    const off = (await db.query(
      `select provider_id, lower(during) s, upper(during) e from provider_time_off where provider_id = any($1) and during && tstzrange($2, $3)`,
      [ids, rangeStart, rangeEnd],
    )).rows;
    const busy = (await db.query(
      `select provider_id, lower(blocked) s, upper(blocked) e from bookings
        where provider_id = any($1) and status in ('pending_payment', 'requested', 'confirmed') and blocked && tstzrange($2, $3)`,
      [ids, new Date(rangeStart.getTime() - 86_400_000), new Date(rangeEnd.getTime() + 86_400_000)],
    )).rows;
    return rows.map((r) => {
      const h: Candidate["hours"] = {};
      for (const x of hours.filter((x) => x.provider_id === r.id)) (h[x.weekday] ??= []).push({ from: x.f, to: x.t });
      const distanceKm = r.distance_km === null ? null : Math.round(Number(r.distance_km) * 10) / 10;
      const candidate: Candidate = {
        providerId: r.id,
        distanceKm,
        radiusKm: Number(r.radius_km),
        offersService: r.offers,
        priceType: r.price_type,
        payable: r.payable,
        durationMin: Number(r.duration_min),
        bufferMin: r.buffer_minutes,
        minNoticeHours: r.min_notice_hours,
        hours: h,
        timeOff: off.filter((x) => x.provider_id === r.id).map((x) => ({ start: new Date(x.s).getTime(), end: new Date(x.e).getTime() })),
        busy: busy.filter((x) => x.provider_id === r.id).map((x) => ({ start: new Date(x.s).getTime(), end: new Date(x.e).getTime() })),
      };
      const info: ProviderInfo = {
        providerId: r.id,
        slug: r.slug,
        name: r.company_name,
        logoKey: r.logo_key,
        categories: r.cats ?? [],
        rating: r.rating === null ? null : Number(r.rating),
        reviewCount: Number(r.review_count),
        jobCount: Number(r.job_count),
        distanceKm: distanceKm ?? 0,
        priceType: r.price_type ?? "quote",
        priceCents: r.price_cents,
        durationMin: Number(r.duration_min),
        bookingMode: r.booking_mode,
        bufferMin: r.buffer_minutes,
        stripeAccountId: r.stripe_account_id,
        radiusKm: Number(r.radius_km),
        providerCancelRate: Number(r.decided_count) > 0 ? Number(r.provider_cancel_count) / Number(r.decided_count) : null,
        offeredServices: Number(r.offered_services),
        avgResponseHours: r.avg_response_hours === null ? null : Number(r.avg_response_hours),
        approvedAt: new Date(r.approved_at).toISOString(),
        partnerCode: r.partner_code ?? null,
        anfahrtskostenCents: Number(r.anfahrtskosten_cents),
        taxStatus: r.tax_status,
      };
      return { info, candidate };
    });
  });
}

export interface SearchInput {
  templateId: string;
  place: Place;
  date: string;
  /** exakte Uhrzeit "HH:MM" oder Zeitfenster */
  time?: string;
  window?: { from: string; to: string };
}

export interface SearchHit extends ProviderInfo {
  score: number;
  start: string; // ISO
  end: string;
  arrival: string; // "HH:MM"
  travelMin: number;
}

export interface SearchResult {
  hits: SearchHit[];
  funnel: { total: number; available: number; excluded: Partial<Record<Exclusion, number>> };
}

/** Kern der Suche: nur Betriebe, die zum gewünschten Zeitpunkt wirklich können */
export async function searchAvailability(input: SearchInput, providerId?: string): Promise<SearchResult> {
  const loaded = await loadCandidates({ templateId: input.templateId, lat: input.place.lat, lon: input.place.lon, fromDate: input.date, toDate: input.date, providerId });
  const times = input.time ? [input.time] : timesBetween(input.window!.from, input.window!.to);
  const now = new Date();
  const hits: SearchHit[] = [];
  const excluded: Partial<Record<Exclusion, number>> = {};
  const wish = minutesOf(times[0]);
  const windowMin = input.window ? minutesOf(input.window.to) - minutesOf(input.window.from) : 0;
  for (const { info, candidate } of loaded) {
    const r = earliestSlot(candidate, input.date, times, now);
    if (r.ok) {
      const arrival = berlinTime(r.start);
      const score = rankScore({
        distanceKm: info.distanceKm, radiusKm: info.radiusKm, delayMin: minutesOf(arrival) - wish, windowMin,
        rating: info.rating, reviewCount: info.reviewCount, providerCancelRate: info.providerCancelRate,
        hasLogo: !!info.logoKey, offeredServices: info.offeredServices, avgResponseHours: info.avgResponseHours,
      });
      hits.push({ ...info, score, start: r.start.toISOString(), end: r.end.toISOString(), arrival, travelMin: r.travelMin });
    } else {
      excluded[r.reason] = (excluded[r.reason] ?? 0) + 1;
    }
  }
  // Empfohlene Reihenfolge nach den veröffentlichten Kriterien (/ranking)
  hits.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
  return { hits, funnel: { total: loaded.length, available: hits.length, excluded } };
}

/** Tage eines Zeitraums, an denen mindestens ein Betrieb irgendwann zwischen 07 und 20 Uhr kann (für den Kalender) */
export async function availableDays(input: { templateId: string; place: Place; fromDate: string; days: number }): Promise<string[]> {
  const toDate = addDays(input.fromDate, input.days - 1);
  const loaded = await loadCandidates({ templateId: input.templateId, lat: input.place.lat, lon: input.place.lon, fromDate: input.fromDate, toDate });
  const times = timesBetween("07:00", "20:00");
  const now = new Date();
  const out: string[] = [];
  for (let i = 0; i < input.days; i++) {
    const date = addDays(input.fromDate, i);
    if (loaded.some(({ candidate }) => (candidate.hours[isoWeekday(date)]?.length ?? 0) > 0 && earliestSlot(candidate, date, times, now).ok)) out.push(date);
  }
  return out;
}
