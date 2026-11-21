import Link from "next/link";
import { popularProjects } from "@/lib/catalog";
import { photoSrc } from "@/lib/photos";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { PhotoSlot } from "@/components/ui/photo-slot";

const h2 = "text-[clamp(24px,3.4vw,44px)] font-extrabold leading-tight tracking-[-0.03em] text-brand-dark";

/** Beliebte Projekte im selben Mint-Block wie Suche und Kategorien (Variante A): kleine weiße Karten, „Alle Leistungen“ unten rechts */
export function PopularProjects({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  return (
    <div aria-labelledby="projekte-titel" className="mx-auto max-w-[1240px] px-4 pb-10 pt-5 sm:px-7 sm:pb-16 sm:pt-7">
      <h2 id="projekte-titel" className="sr-only">
        Beliebte Projekte in {cityName}
      </h2>
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {popularProjects.map((x) => (
          <li key={x.title}>
            <Link
              href={`/${citySlug}/${x.category}`}
              className="group flex h-full flex-col gap-2 rounded-2xl bg-white p-1.5 shadow-[0_1px_3px_rgba(11,46,31,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(11,46,31,0.10)] sm:p-2"
            >
              <PhotoSlot tone={x.tone} hint={x.photoHint} src={photoSrc(x.photoFile)} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-[4/3] rounded-xl" />
              <span className="px-1.5 pb-1 text-[13.5px] font-bold leading-snug group-hover:text-brand sm:px-2 sm:pb-1.5 sm:text-[15px]">{x.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end sm:mt-6">
        <Link
          href={`/${citySlug}`}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-5 py-2.5 text-[14px] font-bold transition-colors hover:bg-ink hover:text-white sm:text-[15px]"
        >
          Alle Leistungen
          <Icon name="pfeil" size={16} strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
}

/** Bewertungen erscheinen erst, wenn es echte Bewertungen aus abgeschlossenen Buchungen gibt. */
export function ReviewsIntro() {
  return (
    <section aria-labelledby="bewertungen-titel" className="bg-soft py-10 sm:py-[88px]">
      <Container className="flex flex-wrap items-center gap-6 sm:gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <h2 id="bewertungen-titel" className={h2}>
            Bewertungen, auf die du dich verlassen kannst
          </h2>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-ink-soft sm:mt-4 sm:text-[17px]">
            Bewerten kann nur, wer über handwerker2go gebucht hat und dessen Auftrag abgeschlossen ist. Jede Bewertung ist
            mit einer echten Buchung verknüpft. Gekaufte oder importierte Sterne gibt es bei uns nicht.
          </p>
        </div>
        <ol className="grid min-w-0 flex-[1_1_420px] gap-2 sm:gap-3">
          {[
            ["Auftrag erledigt", "Der Betrieb schließt die Buchung ab."],
            ["Einladung zur Bewertung", "Du bekommst eine E-Mail mit einem Link zu deiner Buchung."],
            ["1 bis 5 Sterne und ein paar Worte", "Deine Bewertung erscheint im Profil des Betriebs."],
          ].map(([t, d], i) => (
            <li key={t} className="flex items-center gap-3 rounded-card bg-white p-3.5 sm:gap-4 sm:p-5">
              <span className="inline-flex h-8 w-8 shrink-0 text-[14px] sm:h-9 sm:w-9 sm:text-base items-center justify-center rounded-full bg-brand font-extrabold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block text-[15px] font-bold sm:text-base">{t}</span>
                <span className="block text-[13px] text-muted sm:text-[15px]">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function TrustBanner() {
  const items = [
    { icon: "schild" as const, t: "Geprüfte Betriebe", d: "Jeder Betrieb wird vor der Freischaltung geprüft, inklusive Gewerbenachweis." },
    { icon: "karte" as const, t: "Sichere Zahlung", d: "Bezahlt wird online über Stripe, per Karte, Apple Pay oder Google Pay." },
    { icon: "stern" as const, t: "Echte Bewertungen", d: "Bewertungen gibt es nur nach einem abgeschlossenen Auftrag." },
  ];
  return (
    <section className="py-10 sm:py-[88px]">
      <Container>
        <div className="flex flex-wrap overflow-hidden rounded-banner bg-mint">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5 p-5 sm:gap-7 sm:p-16">
            <h2 className="text-[clamp(24px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-brand-dark">
              Sicher gebucht. Fair bezahlt.
            </h2>
            <ul className="flex flex-col gap-4 sm:gap-[22px]">
              {items.map((x) => (
                <li key={x.t} className="flex gap-3 sm:gap-4">
                  <Icon name={x.icon} size={24} strokeWidth={2} className="shrink-0 text-brand" />
                  <span>
                    <span className="block text-[16px] font-bold sm:text-lg">{x.t}</span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft sm:mt-1 sm:text-[15px]">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <PhotoSlot tone="garten" hint="Foto: Handwerker übergibt fertige Arbeit" src={photoSrc("vertrauen-uebergabe.webp")} className="hidden min-h-[300px] flex-[1_1_380px] !bg-mint-strong md:block" />
        </div>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { t: "Leistung und Adresse wählen", d: "Sag uns, was zu tun ist und wo. Wir zeigen dir passende Betriebe in deiner Nähe.", hint: "Foto: Leistung auswählen", file: "ablauf-1-auswaehlen.webp" },
    { t: "Betrieb und Termin aussuchen", d: "Vergleiche Preise, Bewertungen und freie Termine. Oder frag ein individuelles Angebot an.", hint: "Foto: Betriebe vergleichen", file: "ablauf-2-vergleichen.webp" },
    { t: "Online bezahlen, fertig", d: "Du zahlst sicher online und bekommst sofort eine Bestätigung per E-Mail.", hint: "Foto: Fertig erledigt", file: "ablauf-3-erledigt.webp" },
  ];
  return (
    <section id="so-funktionierts" aria-labelledby="ablauf-titel" className="scroll-mt-6 pb-10 sm:pb-[88px]">
      <Container>
        <h2 id="ablauf-titel" className={`${h2} mb-5 sm:mb-8`}>
          So funktioniert’s
        </h2>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.t} className="flex flex-col gap-1.5 rounded-card bg-soft p-4 md:gap-3.5 md:bg-transparent md:p-0">
              <PhotoSlot tone="neutral" hint={s.hint} src={photoSrc(s.file)} sizes="33vw" className="hidden aspect-[16/10] rounded-card !bg-mint-soft md:block" />
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-extrabold text-white md:h-[34px] md:w-[34px] md:text-base">
                  {i + 1}
                </span>
                <h3 className="text-[16px] font-bold md:text-[19px]">{s.t}</h3>
              </div>
              <p className="pl-11 text-[14px] leading-relaxed text-ink-soft md:pl-0 md:text-[15px]">{s.d}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Dezenter Hinweis für Betriebe. Preise und Konditionen stehen nur im Partner-Bereich (/partner). */
export function ProviderCta() {
  return (
    <section aria-labelledby="betriebe-titel" className="border-t border-line bg-soft">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-8 sm:gap-6 sm:py-12">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2 id="betriebe-titel" className="text-[clamp(22px,2.4vw,28px)] font-extrabold tracking-[-0.02em] text-brand-dark">
            Du führst einen Handwerksbetrieb?
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-soft">
            Werde Partner von handwerker2go und bekomm Aufträge aus deiner Nachbarschaft, direkt in deinen Kalender.
          </p>
        </div>
        <Link href="/partner" className="rounded-full border-[1.5px] border-brand-dark px-6 py-3 font-bold text-brand-dark transition-colors hover:bg-brand-dark hover:text-white">
          Mehr für Betriebe
        </Link>
      </Container>
    </section>
  );
}
