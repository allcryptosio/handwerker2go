"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookingSearch, type SearchValues, type ServiceChoice } from "@/components/booking/booking-search";
import { formatDateLong, windowLabel } from "@/lib/booking/format";

interface Hit {
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
  start: string;
  arrival: string;
  travelMin: number;
}
interface Response {
  error?: string;
  place?: { postalCode: string; place: string };
  service?: { name: string; categoryLabel: string };
  hits?: Hit[];
  funnel?: { total: number; available: number; reasons: { reason: string; count: number }[] };
}

type Sort = "empfohlen" | "zeit" | "entfernung" | "bewertung" | "preis";
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const durationText = (m: number) => (m < 60 ? `${m} Min.` : m % 60 ? `${Math.floor(m / 60)} Std. ${m % 60} Min.` : `${m / 60} Std.`);

export function SearchResults({ services }: { services: ServiceChoice[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const values: Partial<SearchValues> = {
    leistung: params.get("leistung") ?? "",
    ort: params.get("ort") ?? "",
    datum: params.get("datum") ?? "",
    zeit: params.get("zeit") ?? undefined,
    fenster: params.get("fenster") ?? undefined,
  };
  const key = params.toString();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<Sort>("empfohlen");

  useEffect(() => {
    if (!values.leistung || !values.ort || !values.datum || (!values.zeit && !values.fenster)) return setData(null);
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/verfuegbarkeit?${key}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const hits = useMemo(() => {
    const list = [...(data?.hits ?? [])];
    const price = (h: Hit) => (h.priceType === "fixed" && h.priceCents ? h.priceCents : Number.MAX_SAFE_INTEGER);
    list.sort((a, b) =>
      sort === "entfernung" ? a.distanceKm - b.distanceKm
      : sort === "bewertung" ? (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount
      : sort === "preis" ? price(a) - price(b)
      : sort === "zeit" ? a.start.localeCompare(b.start) || a.distanceKm - b.distanceKm
      : 0, // empfohlen: Reihenfolge vom Server (Kriterien auf /ranking)
    );
    return list;
  }, [data, sort]);

  const when = values.datum ? `${formatDateLong(values.datum)}, ${values.zeit ? `${values.zeit} Uhr` : `${windowLabel(values.fenster)} Uhr`}` : "";
  const bookHref = (h: Hit) =>
    `/buchen/${h.providerId}?${new URLSearchParams({ leistung: values.leistung!, ort: values.ort!, datum: values.datum!, zeit: h.arrival })}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <BookingSearch
          key={key}
          services={services}
          initial={values}
          compact
          onSearch={(v) => router.replace(`/termin?${new URLSearchParams(v as unknown as Record<string, string>)}`, { scroll: false })}
        />
      </div>

      {!data && !loading && (
        <p className="text-center text-[16px] text-muted">Wähle Leistung, Ort, Tag und Uhrzeit. Wir zeigen dir nur Betriebe, die dann wirklich Zeit haben.</p>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Suche läuft">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-[210px] animate-pulse rounded-panel bg-soft" />)}
        </div>
      )}

      {!loading && data?.error && <p role="alert" className="text-center font-semibold text-[#b42318]">{data.error}</p>}

      {!loading && data?.hits && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-brand-dark">
                {hits.length === 0 ? "Leider niemand frei" : `${hits.length} ${hits.length === 1 ? "Betrieb" : "Betriebe"} verfügbar`}
              </h1>
              <p className="mt-1 text-[15px] text-ink-soft">
                {data.service?.name} in {data.place?.postalCode} {data.place?.place}, {when}
              </p>
            </div>
            {hits.length > 1 && (
              <label className="flex items-center gap-2 text-[14px] font-semibold">
                Sortieren
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                  className="min-h-11 rounded-full border-[1.5px] border-line-strong bg-white px-4 text-[15px] font-normal outline-none focus:border-brand">
                  <option value="empfohlen">Empfohlen</option>
                  <option value="zeit">Früheste Ankunft</option>
                  <option value="entfernung">Entfernung</option>
                  <option value="bewertung">Bewertung</option>
                  <option value="preis">Preis</option>
                </select>
              </label>
            )}
          </div>

          {hits.length === 0 ? (
            <div className="rounded-panel border border-line bg-soft p-8 text-center">
              <p className="text-[16px] text-ink-soft">
                {data.funnel && data.funnel.total > 0
                  ? "Zu diesem Zeitpunkt hat kein passender Betrieb Zeit. Probiere ein Zeitfenster oder einen anderen Tag: Im Kalender sind Tage mit freien Terminen markiert."
                  : "In deiner Gegend gibt es für diese Leistung noch keinen freigeschalteten Betrieb. Wir nehmen gerade neue Betriebe auf."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {hits.map((h, i) => (
                <li key={h.providerId} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }} className="min-w-0 animate-[h2g-up_.25s_ease-out_both]">
                  <ProviderCard hit={h} href={bookHref(h)} />
                </li>
              ))}
            </ul>
          )}

          {data.funnel && data.funnel.total > 0 && (
            <details className="text-[14px] text-muted">
              <summary className="cursor-pointer select-none">So haben wir gesucht</summary>
              <p className="mt-2">
                {data.funnel.total} {data.funnel.total === 1 ? "Betrieb bietet" : "Betriebe bieten"} diese Leistung an, {data.funnel.available} {data.funnel.available === 1 ? "kann" : "können"} den Termin übernehmen.
                {data.funnel.reasons.length > 0 && " Nicht angezeigt: " + data.funnel.reasons.map((r) => `${r.count} ${r.reason}`).join(", ") + "."}
              </p>
              <p className="mt-1">Berücksichtigt sind Einsatzgebiet, Arbeitszeiten, freie Tage, gebuchte Termine, Auftragsdauer, Anfahrt und Pufferzeit. <Link href="/ranking" className="underline">So sortieren wir</Link></p>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function ProviderCard({ hit: h, href }: { hit: Hit; href: string }) {
  const initials = h.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <article className="flex h-full min-w-0 flex-col gap-4 rounded-panel border border-line bg-white p-5 transition-shadow hover:shadow-[0_10px_30px_rgba(11,46,31,0.10)]">
      <div className="flex items-start gap-4">
        {h.logoKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/logo/${h.providerId}`} alt="" className="h-14 w-14 shrink-0 rounded-2xl border border-line object-cover" />
        ) : (
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint text-lg font-extrabold text-brand-dark">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-bold text-ink">{h.name}</h2>
          <p className="truncate text-[14px] text-muted">{h.categories.join(", ")}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
            {h.rating !== null ? (
              <span className="font-semibold"><span className="text-star">★</span> {h.rating.toLocaleString("de-DE")} <span className="font-normal text-muted">({h.reviewCount})</span></span>
            ) : (
              <span className="rounded-full bg-mint px-2 py-0.5 text-[12px] font-bold text-brand-dark">Neu</span>
            )}
            <span className="text-muted">{h.jobCount} {h.jobCount === 1 ? "Auftrag" : "Aufträge"}</span>
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-brand sm:hidden"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> Verfügbar</span>
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[12px] font-bold text-brand-dark sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Verfügbar
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2 rounded-2xl bg-soft p-3 text-[13px] sm:gap-3">
        <div><dt className="text-muted">Ankunft</dt><dd className="text-[16px] font-bold tabular-nums">{h.arrival} Uhr</dd></div>
        <div><dt className="text-muted">Entfernung</dt><dd className="text-[16px] font-bold tabular-nums">{h.distanceKm < 1 ? "unter 1 km" : `${h.distanceKm.toLocaleString("de-DE")} km`}</dd></div>
        <div><dt className="text-muted">{h.priceType === "fixed" ? "Festpreis" : "Preis"}</dt><dd className="text-[16px] font-bold tabular-nums">{h.priceType === "fixed" && h.priceCents ? eur(h.priceCents) : "nach Angebot"}</dd></div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] text-muted">
          ca. {durationText(h.durationMin)}{h.bookingMode === "confirm" ? ", Betrieb bestätigt" : ", sofort bestätigt"}
        </span>
        <Link href={href} className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-bold text-white transition-colors hover:bg-brand-dark">
          Jetzt buchen
        </Link>
      </div>
    </article>
  );
}
