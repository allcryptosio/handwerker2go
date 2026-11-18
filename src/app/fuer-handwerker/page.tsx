import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import {
  formatCents,
  formatPercent,
  providerPricing as p,
  providerVatNote,
  yearlyPerMonthCents,
  yearlySavingsPercent,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Für Handwerker: neue Kunden in deiner Nähe",
  description: `Dein Betrieb auf handwerker2go: eigenes Profil, Kalender, Buchungen und Auszahlungen. Die ersten ${p.introMonths} Monate ohne Grundgebühr.`,
  alternates: { canonical: "/fuer-handwerker" },
};

export default function ProviderLandingPage() {
  const features = [
    { icon: "schild" as const, t: "Eigenes Unternehmensprofil", d: "Logo, Bilder, Leistungen, Qualifikationen und Einsatzgebiet." },
    { icon: "karte" as const, t: "Buchungen und Auszahlungen", d: "Kunden zahlen online, dein Anteil kommt über Stripe Connect." },
    { icon: "werkzeug" as const, t: "Leistungen und Kalender", d: "Festpreise, Arbeitszeiten, Urlaub und blockierte Zeiten selbst pflegen." },
    { icon: "stern" as const, t: "Echte Bewertungen", d: "Nur Kunden mit abgeschlossenem Auftrag können dich bewerten." },
  ];
  const plans = [
    {
      name: "Einführungsphase",
      when: `Monat 1 bis ${p.introMonths}, ab Freischaltung`,
      price: formatCents(p.introMonthlyFeeCents),
      unit: "Grundgebühr",
      commission: formatPercent(p.introCommissionBps),
    },
    {
      name: "Monatlich",
      when: `ab Monat ${p.introMonths + 1}`,
      price: formatCents(p.monthly.feeCents),
      unit: "pro Monat",
      commission: formatPercent(p.monthly.commissionBps),
    },
    {
      name: "Jährlich",
      when: `ab Monat ${p.introMonths + 1}, ${formatCents(p.yearly.feeCents)} im Jahr`,
      price: formatCents(yearlyPerMonthCents()),
      unit: "pro Monat effektiv",
      commission: formatPercent(p.yearly.commissionBps),
      highlight: `rund ${yearlySavingsPercent()} % günstiger`,
    },
  ];

  return (
    <>
      <section className="bg-brand-dark text-white">
        <Container className="flex flex-col gap-5 py-20">
          <h1 className="max-w-[860px] text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.04] tracking-[-0.035em]">
            Neue Kunden aus deiner Nachbarschaft.
          </h1>
          <p className="max-w-[640px] text-lg leading-relaxed text-[#cfe3d7]">
            Kunden geben ihre Adresse ein und finden deinen Betrieb, wenn er in ihrem Gebiet arbeitet. Du verwaltest Leistungen,
            Termine und Einnahmen in einem Dashboard. Die ersten {p.introMonths} Monate ohne Grundgebühr.
          </p>
          <Link href="/fuer-handwerker/registrieren" className="self-start rounded-full bg-white px-7 py-4 font-bold text-brand-dark hover:bg-mint">
            Jetzt Betrieb registrieren
          </Link>
        </Container>
      </section>

      <Container className="py-20">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.t} className="flex flex-col gap-3">
              <Icon name={f.icon} size={30} className="text-brand" />
              <span className="text-lg font-bold">{f.t}</span>
              <span className="text-[15px] leading-relaxed text-ink-soft">{f.d}</span>
            </li>
          ))}
        </ul>
      </Container>

      <section id="konditionen" aria-labelledby="konditionen-titel" className="scroll-mt-6 bg-mint">
        <Container className="py-20">
          <h2 id="konditionen-titel" className="text-[clamp(30px,3.6vw,46px)] font-extrabold tracking-[-0.03em] text-brand-dark">
            Konditionen
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {plans.map((pl) => (
              <li key={pl.name} className={`flex flex-col gap-4 rounded-panel bg-white p-7 ${pl.highlight ? "outline-2 outline-brand" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold">{pl.name}</span>
                  {pl.highlight && <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand-dark">{pl.highlight}</span>}
                </div>
                <div>
                  <span className="text-[44px] font-extrabold tracking-[-0.03em]">{pl.price}</span>{" "}
                  <span className="text-muted">{pl.unit}</span>
                </div>
                <dl className="grid grid-cols-2 border-t border-line pt-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Provision</dt>
                    <dd className="mt-1 text-lg font-extrabold">{pl.commission}</dd>
                  </div>
                  <div className="border-l border-line pl-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Gilt</dt>
                    <dd className="mt-1 font-semibold">{pl.when}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <ul className="mt-8 flex max-w-[820px] flex-col gap-2 text-[15px] leading-relaxed text-ink-soft">
            <li>Provision fällt nur auf erfolgreich abgeschlossene Buchungen an und wird bei der Zahlung über Stripe automatisch einbehalten.</li>
            <li>Alle Bedingungen stehen in den <Link href="/agb-betriebe" className="underline">AGB für Betriebe</Link>. Wie Suchergebnisse sortiert werden, erklären wir <Link href="/ranking" className="underline">hier</Link>; Abo und Provision haben darauf keinen Einfluss.</li>
            <li>Nach der Einführungsphase wird nichts automatisch kostenpflichtig. Du entscheidest dich aktiv für monatlich oder jährlich.</li>
            <li>Wir erinnern dich rechtzeitig vor Ende der Einführungsphase. Kündigen geht jederzeit im Dashboard.</li>
            <li>{providerVatNote} Deine Rechnungen von uns sind Nettorechnungen mit dem Hinweis „Reverse charge“.</li>
          </ul>
          <Link href="/fuer-handwerker/registrieren" className="mt-8 inline-block rounded-full bg-brand px-7 py-4 font-bold text-white hover:bg-brand-dark">
            Jetzt Betrieb registrieren
          </Link>
        </Container>
      </section>
    </>
  );
}
