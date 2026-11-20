"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Unsere Handwerker kommen in Echtzeit",
  "Freie Termine live, nicht irgendwann",
  "Kein Rückruf, keine Warteschleife",
  "Festpreis sehen, Termin klicken, fertig",
  "Heute buchen, morgen erledigt",
];

/** Wechselnde Zeile mit „Live“-Punkt über der Suchmaske. Ohne Bewegung bei prefers-reduced-motion. */
export function RealtimeTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PHRASES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-white/80 py-2 pl-3 pr-4 sm:gap-3 sm:pr-5 shadow-[0_6px_20px_rgba(11,46,31,0.08)] backdrop-blur">
      <span className="relative flex h-3 w-3 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
      </span>
      <span className="hidden text-[12px] font-extrabold uppercase tracking-[0.12em] text-brand sm:inline">Live</span>
      <span className="sr-only">{PHRASES[0]}</span>
      <span aria-hidden className="relative block h-[22px] overflow-hidden text-left text-[12.5px] font-bold leading-[22px] tracking-[-0.01em] text-brand-dark sm:h-[24px] sm:text-[16px] sm:leading-[24px]">
        {/* Unsichtbarer Platzhalter mit der längsten Zeile hält die Breite stabil */}
        <span className="invisible block whitespace-nowrap">{PHRASES.reduce((a, b) => (b.length > a.length ? b : a))}</span>
        {PHRASES.map((p, n) => (
          <span
            key={p}
            className="absolute inset-0 block whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ transform: `translateY(${n === i ? 0 : n === (i - 1 + PHRASES.length) % PHRASES.length ? -110 : 110}%)`, opacity: n === i ? 1 : 0, filter: n === i ? "none" : "blur(4px)" }}
          >
            {p}
          </span>
        ))}
      </span>
    </div>
  );
}

const CHIPS = [
  "Echtzeit-Verfügbarkeit",
  "Festpreis vor der Buchung",
  "Geprüfte Betriebe",
  "Sicher online bezahlen",
  "24 h vorher kostenlos stornieren",
  "Von Altona bis Wandsbek",
  "Ohne Rückrufbitte",
  "Nur echte Bewertungen",
];

/** Endlos laufendes Band mit Vorteilen. Steht bei prefers-reduced-motion still. */
export function BenefitMarquee() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {CHIPS.map((c) => (
        <li key={c} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold text-white">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-light" />
          {c}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="group relative overflow-hidden bg-brand-dark py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-[h2g-marquee_38s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
