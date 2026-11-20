/**
 * Sprüche, die in grüner Schrift verteilt im Hero aufploppen (nur CSS, kein JavaScript).
 * Desktop: über der Überschrift und unter der Suchmaske verteilt, nie über Text oder Suchfeld.
 * Mobil: nacheinander an einer Stelle über der Überschrift.
 * Bei „Bewegung reduzieren“ steht nur der erste Spruch still da.
 */
const PHRASES = [
  "Unsere Handwerker kommen in Echtzeit",
  "Kein Rückruf. Keine Warteschleife.",
  "Freie Termine live, nicht irgendwann",
  "Festpreis sehen, klicken, fertig",
  "Heute buchen, morgen erledigt",
];

// Plätze auf dem Desktop, abwechselnd oben und unten, damit nie zwei nah beieinander aufploppen
const SLOTS: React.CSSProperties[] = [
  { left: "3%", top: "34px", rotate: "-5deg" },
  { right: "5%", bottom: "34px", rotate: "-3deg" },
  { right: "3%", top: "70px", rotate: "4deg" },
  { left: "6%", bottom: "54px", rotate: "3deg" },
  { left: "34%", top: "8px", rotate: "-2deg" },
];

const DURATION = 10; // Sekunden für einen Durchlauf aller Sprüche (muss zu den animate-Klassen passen)
const text = "whitespace-nowrap font-extrabold tracking-[-0.02em] text-brand [background:linear-gradient(transparent_64%,var(--color-mint-strong)_64%,var(--color-mint-strong)_92%,transparent_92%)] px-1";

export function FloatingPhrasesDesktop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden select-none lg:block">
      {PHRASES.map((p, i) => (
        <span
          key={p}
          className={`absolute text-[clamp(20px,1.8vw,27px)] opacity-0 ${text} animate-[h2g-pop_10s_ease-out_infinite] motion-reduce:animate-none ${i === 0 ? "motion-reduce:opacity-100" : ""}`}
          style={{ ...SLOTS[i], animationDelay: `${i * (DURATION / PHRASES.length)}s` }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

export function FloatingPhrasesMobile() {
  return (
    <div aria-hidden className="pointer-events-none relative h-9 w-full select-none lg:hidden">
      {PHRASES.map((p, i) => (
        <span
          key={p}
          className={`absolute inset-x-0 mx-auto w-fit max-w-full text-[clamp(14px,4.3vw,19px)] opacity-0 ${text} animate-[h2g-pop-solo_10s_ease-out_infinite] motion-reduce:animate-none ${i === 0 ? "motion-reduce:opacity-100" : ""}`}
          style={{ rotate: i % 2 ? "2deg" : "-2deg", animationDelay: `${i * (DURATION / PHRASES.length)}s` }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

/** Für Screenreader einmal als normaler Text */
export const floatingPhrasesText = PHRASES.join(". ");
