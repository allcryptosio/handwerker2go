import { BookingSearch } from "@/components/booking/booking-search";
import { serviceChoices } from "@/lib/booking/service-choices";

/** Zentrale Buchungsmaske: Leistung, Ort, Tag, Uhrzeit → /termin */
export function Hero({ cityName }: { cityName: string }) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-5 pb-14 pt-16 text-center sm:px-7 sm:pt-[72px]">
      <h1 className="max-w-[900px] text-[clamp(38px,5.4vw,72px)] font-extrabold leading-[1.04] tracking-[-0.035em] text-brand-dark">
        Der richtige Handwerker. Direkt in deiner Nähe.
      </h1>
      <p className="max-w-[620px] text-lg leading-normal text-ink-soft sm:text-[19px]">
        Geprüfte Handwerksbetriebe in {cityName}. Leistung, Ort und Wunschtermin wählen: Wir zeigen dir nur Betriebe, die dann wirklich Zeit haben.
      </p>
      <BookingSearch services={serviceChoices()} />
    </div>
  );
}
