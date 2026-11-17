import { Icon } from "@/components/ui/icon";

/**
 * Suche ohne JavaScript-Pflicht: Das Formular schickt an /suche,
 * dort wird die passende Kategorie gesucht und weitergeleitet.
 */
export function Hero({ cityName }: { cityName: string }) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-5 pb-14 pt-16 text-center sm:px-7 sm:pt-[72px]">
      <h1 className="max-w-[900px] text-[clamp(38px,5.4vw,72px)] font-extrabold leading-[1.04] tracking-[-0.035em] text-brand-dark">
        Der richtige Handwerker. Direkt in deiner Nähe.
      </h1>
      <p className="max-w-[620px] text-lg leading-normal text-ink-soft sm:text-[19px]">
        Geprüfte Handwerksbetriebe in {cityName}. Festpreis sehen, Termin wählen, online bezahlen.
      </p>
      <form
        action="/suche"
        method="get"
        role="search"
        aria-label="Leistung suchen"
        className="flex w-full max-w-[720px] items-center rounded-full border-[1.5px] border-line-strong bg-white py-1.5 pl-5 pr-1.5 shadow-[0_6px_20px_rgba(11,46,31,0.08)] sm:pl-[22px]"
      >
        <label htmlFor="hero-q" className="sr-only">
          Was soll erledigt werden?
        </label>
        <input
          id="hero-q"
          name="q"
          type="search"
          required
          autoComplete="off"
          placeholder="Was soll erledigt werden?"
          className="min-h-12 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#6b6e6d]"
        />
        <button
          type="submit"
          aria-label="Suchen"
          className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <Icon name="suche" size={20} strokeWidth={2.6} />
        </button>
      </form>
    </div>
  );
}
