import Link from "next/link";
import { popularProjects } from "@/lib/catalog";
import { photoSrc } from "@/lib/photos";
import {
  formatCents,
  formatPercent,
  providerPricing as p,
  providerVatNote,
  yearlyPerMonthCents,
  yearlySavingsPercent,
} from "@/lib/pricing";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { PhotoSlot } from "@/components/ui/photo-slot";

const h2 = "text-[clamp(30px,3.4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark";

export function PopularProjects({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  return (
    <section aria-labelledby="projekte-titel" className="py-[88px]">
      <Container>
        <h2 id="projekte-titel" className={`${h2} mb-8`}>
          Beliebte Projekte in {cityName}
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularProjects.map((x) => (
            <li key={x.title}>
              <Link href={`/${citySlug}/${x.category}`} className="group flex flex-col gap-3">
                <PhotoSlot tone={x.tone} hint={x.photoHint} src={photoSrc(x.photoFile)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] rounded-card" />
                <span className="text-lg font-bold group-hover:text-brand">{x.title}</span>
                <span className="-mt-1.5 text-[15px] text-muted">Preise auf der Leistungsseite</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={`/${citySlug}`}
          className="mt-8 inline-block rounded-full border-[1.5px] border-ink px-[22px] py-[13px] font-bold transition-colors hover:bg-ink hover:text-white"
        >
          Alle Leistungen in {cityName}
        </Link>
      </Container>
    </section>
  );
}

/** Bewertungen erscheinen erst, wenn es echte Bewertungen aus abgeschlossenen Buchungen gibt. */
export function ReviewsIntro() {
  return (
    <section aria-labelledby="bewertungen-titel" className="bg-soft py-[88px]">
      <Container className="flex flex-wrap items-center gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <h2 id="bewertungen-titel" className={h2}>
            Bewertungen, auf die du dich verlassen kannst
          </h2>
          <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-ink-soft">
            Bewerten kann nur, wer über handwerker2go gebucht hat und dessen Auftrag abgeschlossen ist. Jede Bewertung ist
            mit einer echten Buchung verknüpft. Gekaufte oder importierte Sterne gibt es bei uns nicht.
          </p>
        </div>
        <ol className="grid min-w-0 flex-[1_1_420px] gap-3">
          {[
            ["Auftrag erledigt", "Der Betrieb schließt die Buchung ab."],
            ["Einladung zur Bewertung", "Du bekommst eine E-Mail mit einem Link zu deiner Buchung."],
            ["1 bis 5 Sterne und ein paar Worte", "Deine Bewertung erscheint im Profil des Betriebs."],
          ].map(([t, d], i) => (
            <li key={t} className="flex items-center gap-4 rounded-card bg-white p-5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-extrabold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block font-bold">{t}</span>
                <span className="block text-[15px] text-muted">{d}</span>
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
    <section className="py-[88px]">
      <Container>
        <div className="flex flex-wrap overflow-hidden rounded-banner bg-mint">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-7 p-7 sm:p-16">
            <h2 className="text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-brand-dark">
              Sicher gebucht. Fair bezahlt.
            </h2>
            <ul className="flex flex-col gap-[22px]">
              {items.map((x) => (
                <li key={x.t} className="flex gap-4">
                  <Icon name={x.icon} size={28} strokeWidth={2} className="shrink-0 text-brand" />
                  <span>
                    <span className="block text-lg font-bold">{x.t}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-soft">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <PhotoSlot tone="garten" hint="Foto: Handwerker übergibt fertige Arbeit" src={photoSrc("vertrauen-uebergabe.webp")} className="min-h-[300px] flex-[1_1_380px] !bg-mint-strong" />
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
    <section id="so-funktionierts" aria-labelledby="ablauf-titel" className="scroll-mt-6 pb-[88px]">
      <Container>
        <h2 id="ablauf-titel" className={`${h2} mb-8`}>
          So funktioniert’s
        </h2>
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="flex flex-col gap-3.5">
              <PhotoSlot tone="neutral" hint={s.hint} src={photoSrc(s.file)} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[16/10] rounded-card !bg-mint-soft" />
              <div className="flex items-center gap-3">
                <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="text-[19px] font-bold">{s.t}</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function ProviderCta() {
  const cards = [
    { label: `Monat 1 bis ${p.introMonths}`, price: formatCents(p.introMonthlyFeeCents), note: `${formatPercent(p.introCommissionBps)} Provision` },
    { label: "Monatlich", price: formatCents(p.monthly.feeCents), note: `${formatPercent(p.monthly.commissionBps)} Provision` },
    {
      label: "Jährlich",
      price: formatCents(yearlyPerMonthCents()),
      note: `pro Monat, ${formatCents(p.yearly.feeCents)} im Jahr`,
      highlight: true,
    },
  ];
  return (
    <section aria-labelledby="betriebe-titel" className="bg-brand-dark text-white">
      <Container className="flex flex-wrap items-center gap-12 py-20">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[18px]">
          <h2 id="betriebe-titel" className="text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-0.03em]">
            Du bist Handwerker? Gewinne neue Kunden in deiner Nähe.
          </h2>
          <p className="text-[17px] leading-relaxed text-[#cfe3d7]">
            Eigenes Profil, Kalender, Buchungen und Auszahlungen an einem Ort. Die ersten {p.introMonths} Monate ohne
            Grundgebühr. Das Jahresabo ist rund {yearlySavingsPercent()} % günstiger als monatlich.
          </p>
          <Link
            href="/fuer-handwerker"
            className="self-start rounded-full bg-white px-[26px] py-[15px] font-bold text-brand-dark transition-colors hover:bg-mint"
          >
            Jetzt als Handwerker anmelden
          </Link>
        </div>
        <dl className="grid min-w-0 flex-[1_1_420px] grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-card bg-brand-deep p-5 ${c.highlight ? "outline-2 outline-brand-light" : ""}`}>
              <dt className="text-xs font-semibold text-[#cfe3d7]">{c.label}</dt>
              <dd className="mt-2 text-[30px] font-extrabold">{c.price}</dd>
              <dd className="mt-1 text-[13px] text-[#cfe3d7]">{c.note}</dd>
            </div>
          ))}
        </dl>
        <p className="w-full text-[13px] text-[#cfe3d7]">{providerVatNote}</p>
      </Container>
    </section>
  );
}
