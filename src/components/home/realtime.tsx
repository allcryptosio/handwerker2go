
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
