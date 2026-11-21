"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { WINDOWS, formatDateLong, windowLabel } from "@/lib/booking/format";

export interface ServiceChoice {
  slug: string;
  name: string;
  categoryLabel: string;
  mode: "festpreis" | "angebot";
}

export interface SearchValues {
  leistung: string;
  ort: string;
  datum: string;
  zeit?: string;
  fenster?: string;
}

const TIMES = Array.from({ length: 26 }, (_, i) => `${String(7 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`); // 07:00–19:30
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/** Heute und jetzt in Berlin */
function berlinNow() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const addDaysIso = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

type Panel = "service" | "place" | "date" | "time" | null;

export function BookingSearch({
  services,
  initial,
  onSearch,
  compact = false,
}: {
  services: ServiceChoice[];
  initial?: Partial<SearchValues>;
  /** Ohne onSearch wird zur Ergebnisseite navigiert */
  onSearch?: (v: SearchValues) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [leistung, setLeistung] = useState(initial?.leistung ?? "");
  const [serviceQuery, setServiceQuery] = useState(services.find((s) => s.slug === initial?.leistung)?.name ?? "");
  const [ort, setOrt] = useState(initial?.ort ?? "");
  const [datum, setDatum] = useState(initial?.datum ?? "");
  const [zeit, setZeit] = useState(initial?.zeit);
  const [fenster, setFenster] = useState(initial?.fenster);
  const [error, setError] = useState<string | null>(null);

  // Klick außerhalb und Escape schließen das offene Feld
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const service = services.find((s) => s.slug === leistung);
  const timeText = zeit ? `${zeit} Uhr` : fenster ? windowLabel(fenster) : "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = !leistung ? "service" : ort.trim().length < 2 ? "place" : !datum ? "date" : !zeit && !fenster ? "time" : null;
    if (missing) {
      setError(
        { service: "Bitte wähle eine Leistung.", place: "Bitte gib PLZ oder Ort ein.", date: "Bitte wähle einen Tag.", time: "Bitte wähle eine Uhrzeit oder ein Zeitfenster." }[missing],
      );
      setPanel(missing as Panel);
      return;
    }
    setError(null);
    setPanel(null);
    const v: SearchValues = { leistung, ort: ort.trim(), datum, ...(zeit ? { zeit } : { fenster }) };
    if (onSearch) onSearch(v);
    else router.push(`/termin?${new URLSearchParams(v as unknown as Record<string, string>)}`);
  }

  // Handy: Tabellenzeilen (Bezeichnung links, Wert daneben, Pfeil rechts); ab sm: Pillenleiste wie bisher
  const seg = "relative flex min-h-[56px] min-w-0 flex-1 items-center px-4 text-left transition-colors hover:bg-soft sm:min-h-0 sm:flex-col sm:items-stretch sm:justify-center sm:rounded-full sm:px-6 sm:py-2.5";
  const active = "bg-mint/70 hover:bg-mint/70 sm:bg-white sm:shadow-[0_6px_24px_rgba(11,46,31,0.12)] sm:hover:bg-white";
  const label = "w-[78px] shrink-0 text-[12px] font-bold uppercase tracking-[0.04em] text-brand-dark sm:w-auto";
  const value = "min-w-0 flex-1 truncate text-[15px] text-ink-soft";
  const rowBtn = "flex w-full items-center gap-3 py-3 text-left sm:block sm:py-0";
  const field = "flex w-full items-center gap-3 py-3 sm:block sm:py-0";

  return (
    <form
      ref={root}
      onSubmit={submit}
      role="search"
      aria-label="Handwerker suchen und buchen"
      className={`relative w-full ${compact ? "max-w-[1040px]" : "max-w-[980px]"}`}
    >
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-[22px] border-[1.5px] border-line-strong bg-white text-left shadow-[0_10px_30px_rgba(11,46,31,0.10)] sm:flex-row sm:items-stretch sm:divide-y-0 sm:overflow-visible sm:rounded-full sm:p-1.5">
        {/* Leistung */}
        <div className={`${seg} ${panel === "service" ? active : ""} sm:flex-[1.4]`}>
          <div className={field}>
          <label htmlFor="bs-service" className={label}>Leistung</label>
          <input
            id="bs-service"
            value={serviceQuery}
            onChange={(e) => {
              setServiceQuery(e.target.value);
              setLeistung("");
              setPanel("service");
            }}
            onFocus={() => setPanel("service")}
            placeholder="Was soll erledigt werden?"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#6b6e6d] focus-visible:outline-none sm:w-full"
          />
          </div>
          {panel === "service" && (
            <ServicePanel
              services={services}
              query={leistung ? "" : serviceQuery}
              onPick={(s) => {
                setLeistung(s.slug);
                setServiceQuery(s.name);
                setPanel(ort ? (datum ? "time" : "date") : "place");
              }}
            />
          )}
        </div>
        <Divider />
        {/* Ort */}
        <div className={`${seg} ${panel === "place" ? active : ""}`}>
          <div className={field}>
          <label htmlFor="bs-place" className={label}>Wo</label>
          <input
            id="bs-place"
            value={ort}
            onChange={(e) => {
              setOrt(e.target.value);
              setPanel("place");
            }}
            onFocus={() => setPanel("place")}
            placeholder="PLZ oder Ort"
            autoComplete="postal-code"
            inputMode="text"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#6b6e6d] focus-visible:outline-none sm:w-full"
          />
          </div>
          {panel === "place" && (
            <PlacePanel
              query={ort}
              onPick={(p) => {
                setOrt(p);
                setPanel(datum ? (zeit || fenster ? null : "time") : "date");
              }}
            />
          )}
        </div>
        <Divider />
        {/* Tag */}
        <div className={`${seg} ${panel === "date" ? active : ""}`}>
          <button type="button" onClick={() => setPanel(panel === "date" ? null : "date")} className={rowBtn} aria-haspopup="dialog" aria-expanded={panel === "date"}>
            <span className={`block ${label}`}>Tag</span>
            <span className={`block ${value} ${datum ? "text-ink" : ""}`}>{datum ? formatDateLong(datum) : "Datum wählen"}</span>
            <Chevron />
          </button>
          {panel === "date" && (
            <DatePanel
              value={datum}
              leistung={leistung}
              ort={ort}
              onPick={(d) => {
                setDatum(d);
                // heute bereits vergangene Uhrzeit verwerfen
                const now = berlinNow();
                if (zeit && d === now.date && Number(zeit.slice(0, 2)) * 60 + Number(zeit.slice(3)) <= now.minutes) setZeit(undefined);
                setPanel("time");
              }}
              onClose={() => setPanel(null)}
            />
          )}
        </div>
        <Divider />
        {/* Uhrzeit */}
        <div className={`${seg} ${panel === "time" ? active : ""}`}>
          <button type="button" onClick={() => setPanel(panel === "time" ? null : "time")} className={rowBtn} aria-haspopup="dialog" aria-expanded={panel === "time"}>
            <span className={`block ${label}`}>Uhrzeit</span>
            <span className={`block ${value} ${timeText ? "text-ink" : ""}`}>{timeText || "Zeit wählen"}</span>
            <Chevron />
          </button>
          {panel === "time" && (
            <TimePanel
              datum={datum}
              zeit={zeit}
              fenster={fenster}
              onPick={(z, f) => {
                setZeit(z);
                setFenster(f);
                setPanel(null);
              }}
              onClose={() => setPanel(null)}
            />
          )}
        </div>
        <button
          type="submit"
          className="m-2 inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-2xl !border-0 bg-brand px-6 font-bold text-white transition-colors hover:bg-brand-dark sm:m-0 sm:min-h-[52px] sm:rounded-full"
        >
          <Icon name="suche" size={18} strokeWidth={2.6} />
          <span>Finden</span>
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-center text-[14px] font-semibold text-[#b42318]">{error}</p>}
      {service?.mode === "angebot" && !error && (
        <p className="mt-3 text-center text-[13px] text-muted">„{service.name}“ hat keinen Festpreis: Du buchst einen kostenlosen Termin zur Besichtigung und bekommst danach ein Angebot.</p>
      )}
    </form>
  );
}

function Chevron() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-muted sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

function Divider() {
  return <span aria-hidden className="mx-0 hidden w-px self-stretch bg-line sm:my-3 sm:block" />;
}

/** Klappfenster: am Handy als Blatt vom unteren Rand, sonst unter dem Feld */
function Popover({ children, title, onClose, wide = false }: { children: React.ReactNode; title: string; onClose?: () => void; wide?: boolean }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={title}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-[h2g-up_.18s_ease-out] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-[calc(100%+10px)] sm:max-h-[70vh] sm:rounded-3xl sm:border sm:border-line ${wide ? "sm:w-[400px]" : "sm:w-[360px]"}`}
      >
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <span className="font-bold">{title}</span>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-[14px] font-semibold text-brand">Fertig</button>
        </div>
        {children}
      </div>
    </>
  );
}

function ServicePanel({ services, query, onPick }: { services: ServiceChoice[]; query: string; onPick: (s: ServiceChoice) => void }) {
  const q = query.trim().toLowerCase();
  const list = q ? services.filter((s) => `${s.name} ${s.categoryLabel}`.toLowerCase().includes(q)) : services;
  const groups = useMemo(() => {
    const m = new Map<string, ServiceChoice[]>();
    for (const s of list) m.set(s.categoryLabel, [...(m.get(s.categoryLabel) ?? []), s]);
    return [...m.entries()];
  }, [list]);
  return (
    <Popover title="Leistung wählen" wide>
      {groups.length === 0 && <p className="text-[15px] text-muted">Keine passende Leistung gefunden.</p>}
      <div className="flex flex-col gap-4">
        {groups.map(([cat, items]) => (
          <div key={cat}>
            <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{cat}</div>
            <ul className="flex flex-col">
              {items.map((s) => (
                <li key={s.slug}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-mint">
                    <span>{s.name}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.mode === "festpreis" ? "bg-mint text-brand-dark" : "bg-soft text-muted"}`}>
                      {s.mode === "festpreis" ? "Festpreis" : "Angebot"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Popover>
  );
}

function PlacePanel({ query, onPick }: { query: string; onPick: (label: string) => void }) {
  const [places, setPlaces] = useState<{ postalCode: string; place: string }[]>([]);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/orte?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setPlaces(d.places ?? []))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);
  if (query.trim().length < 2) return null;
  return (
    <Popover title="Ort wählen">
      {places.length === 0 ? (
        <p className="text-[15px] text-muted">Postleitzahl oder Ort eingeben, z. B. 20095 oder Hamburg.</p>
      ) : (
        <ul className="flex flex-col">
          {places.map((p) => (
            <li key={`${p.postalCode}-${p.place}`}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(`${p.postalCode} ${p.place}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-mint">
                <span className="font-semibold tabular-nums">{p.postalCode}</span>
                <span className="text-ink-soft">{p.place}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}

function DatePanel({ value, leistung, ort, onPick, onClose }: { value: string; leistung: string; ort: string; onPick: (d: string) => void; onClose: () => void }) {
  const today = berlinNow().date;
  const maxDate = addDaysIso(today, 180);
  const start = value || today;
  const [ym, setYm] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
  const first = iso(ym.y, ym.m, 1);
  const enabled = !!leistung && ort.trim().length >= 2;
  const reqKey = `${leistung}|${ort}|${first < today ? today : first}`;
  const [loaded, setLoaded] = useState<{ key: string; days: Set<string> } | null>(null);
  // Verfügbare Tage laden, sobald Leistung und Ort feststehen
  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    fetch(`/api/verfuegbarkeit/tage?${new URLSearchParams({ leistung, ort, von: first < today ? today : first })}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setLoaded({ key: reqKey, days: new Set(d.days ?? []) }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [enabled, leistung, ort, first, today, reqKey]);
  const available = enabled && loaded?.key === reqKey ? loaded.days : null;
  const loading = enabled && loaded?.key !== reqKey;

  const daysInMonth = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(ym.y, ym.m, 1)).getUTCDay() + 6) % 7; // Montag = 0
  const canPrev = first > today.slice(0, 8) + "01";
  const canNext = iso(ym.y, ym.m, daysInMonth) < maxDate;
  const move = (n: number) => setYm(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  return (
    <Popover title="Tag wählen" onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} disabled={!canPrev} aria-label="Vorheriger Monat"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-soft disabled:opacity-30">‹</button>
        <span className="font-bold">{MONTHS[ym.m]} {ym.y}</span>
        <button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Nächster Monat"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-soft disabled:opacity-30">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => <span key={w} className="pb-1 text-[12px] font-semibold text-muted">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = iso(ym.y, ym.m, i + 1);
          const past = d < today || d > maxDate;
          const free = available ? available.has(d) : true;
          const disabled = past || (available !== null && !free);
          const selected = d === value;
          return (
            <button key={d} type="button" disabled={disabled} onClick={() => onPick(d)} aria-pressed={selected}
              aria-label={`${formatDateLong(d)}${available && !past ? (free ? ", Termine frei" : ", keine Termine frei") : ""}`}
              className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[15px] tabular-nums transition-colors
                ${selected ? "bg-brand font-bold text-white" : disabled ? "text-[#b8bdba]" : "font-semibold hover:bg-mint"}
                ${d === today && !selected ? "ring-1 ring-line-strong" : ""}`}>
              {i + 1}
              {available && free && !past && !selected && <span aria-hidden className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] text-muted">
        {loading ? "Verfügbarkeit wird geladen …" : available ? (
          <><span className="h-1.5 w-1.5 rounded-full bg-brand" /> Tage mit freien Terminen</>
        ) : "Wähle Leistung und Ort, um freie Tage zu sehen."}
      </p>
    </Popover>
  );
}

function TimePanel({ datum, zeit, fenster, onPick, onClose }: { datum: string; zeit?: string; fenster?: string; onPick: (z?: string, f?: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"zeit" | "fenster">(fenster ? "fenster" : "zeit");
  const now = berlinNow();
  const isToday = datum === now.date;
  const passed = (t: string) => isToday && Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) <= now.minutes;
  return (
    <Popover title="Uhrzeit wählen" onClose={onClose} wide>
      <div role="tablist" className="mb-4 grid grid-cols-2 rounded-full bg-soft p-1 text-[14px] font-semibold">
        {(["zeit", "fenster"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-full py-2 transition-colors ${tab === t ? "bg-white shadow-sm" : "text-muted"}`}>
            {t === "zeit" ? "Genaue Uhrzeit" : "Zeitfenster"}
          </button>
        ))}
      </div>
      {!datum && <p className="mb-3 text-[13px] text-muted">Tipp: Wähle zuerst den Tag.</p>}
      {tab === "zeit" ? (
        <div className="grid grid-cols-4 gap-2">
          {TIMES.map((t) => (
            <button key={t} type="button" disabled={passed(t)} onClick={() => onPick(t, undefined)} aria-pressed={zeit === t}
              className={`rounded-xl border py-2.5 text-[14px] font-semibold tabular-nums transition-colors
                ${zeit === t ? "border-brand bg-brand text-white" : "border-line hover:border-brand hover:bg-mint"} disabled:border-line disabled:bg-soft disabled:text-[#b8bdba]`}>
              {t}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {WINDOWS.map((w) => (
            <button key={w.id} type="button" disabled={passed(w.label.slice(6, 11))} onClick={() => onPick(undefined, w.id)} aria-pressed={fenster === w.id}
              className={`rounded-xl border py-3 text-[14px] font-semibold tabular-nums transition-colors
                ${fenster === w.id ? "border-brand bg-brand text-white" : "border-line hover:border-brand hover:bg-mint"} disabled:border-line disabled:bg-soft disabled:text-[#b8bdba]`}>
              {w.label} Uhr
            </button>
          ))}
          <p className="col-span-2 mt-1 text-[13px] text-muted">Wir zeigen dir Betriebe, die in diesem Zeitfenster ankommen können.</p>
        </div>
      )}
    </Popover>
  );
}
