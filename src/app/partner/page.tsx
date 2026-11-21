import type { Metadata } from "next";
import { ogFromPhoto, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArticleCard } from "@/components/ratgeber/article-card";
import { Container } from "@/components/ui/container";
import { partnerArticles } from "@/content/partner-ratgeber";
import { Icon } from "@/components/ui/icon";
import {
  formatCents,
  formatPercent,
  providerPricing as p,
  providerVatNote,
  yearlyPerMonthCents,
  yearlySavingsPercent,
} from "@/lib/pricing";

const metaTitle = "Mehr Aufträge für Handwerker in Hamburg";
const metaDescription = `Kunden aus Hamburg buchen deinen Handwerksbetrieb direkt in freie Termine und zahlen vorab online. Die ersten ${p.introMonths} Monate ohne Grundgebühr.`;

export const metadata: Metadata = pageMeta({
  title: metaTitle,
  socialTitle: "Partner werden: Mehr Aufträge für deinen Handwerksbetrieb",
  description: metaDescription,
  path: "/partner",
  image: ogFromPhoto("vertrauen-uebergabe.webp"),
});

const h2 = "text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-brand-dark";

export default function PartnerLandingPage() {
  const benefits = [
    { icon: "karte" as const, t: "Aufträge direkt in den Kalender", d: "Kunden sehen nur deine wirklich freien Zeiten und buchen selbst. Kein Telefon-Pingpong, keine Angebote für Kleinkram." },
    { icon: "werkzeug" as const, t: "Du bestimmst", d: "Leistungen, Festpreise, Dauer, Arbeitszeiten, Urlaub, Einsatzgebiet und Pufferzeiten legst du selbst fest." },
    { icon: "schild" as const, t: "Geld sicher vorab", d: "Kunden zahlen bei der Buchung online. Das Geld geht über Stripe direkt auf dein Konto, ohne Mahnungen." },
    { icon: "stern" as const, t: "Echte Bewertungen", d: "Nur Kunden mit abgeschlossenem Auftrag können dich bewerten. Gute Arbeit bringt dich in der Suche nach oben." },
  ];
  const steps = [
    { t: "Registrieren", d: "Firmendaten, Leistungen, Einsatzgebiet und Nachweise hochladen. Dauert etwa zehn Minuten." },
    { t: "Prüfung", d: "Wir prüfen Gewerbeanmeldung, Versicherung und, wo nötig, die Eintragung in die Handwerksrolle." },
    { t: "Auszahlung einrichten", d: "Du verbindest dein Konto bei Stripe. Stripe prüft Identität und Bankverbindung." },
    { t: "Leistungen und Kalender", d: "Preise, Dauer und Arbeitszeiten eintragen. Danach bist du für Kunden buchbar." },
    { t: "Aufträge erhalten", d: "Neue Buchungen landen sofort in deinem Kalender, mit Adresse, Fotos und Hinweisen." },
  ];
  const protections = [
    { t: "Nur geprüfte Betriebe", d: "Gewerbeanmeldung, Betriebshaftpflicht und für Elektro, Sanitär und Maler die Eintragung in die Handwerksrolle. Jeder Betrieb wird vor der Freischaltung geprüft." },
    { t: "Identität über Stripe", d: "Stripe prüft Identität, Unternehmen und Bankverbindung jedes Betriebs. Ohne geprüftes Konto keine Buchungen mit Zahlung." },
    { t: "Kein Geschäft am Rand vorbei", d: "Kontaktdaten tauschen Kunde und Betrieb erst nach der Buchung aus. Telefonnummern, E-Mails oder Links im Profil lassen wir nicht zu." },
    { t: "Bezahlt wird immer über die Plattform", d: "Der Preis steht vor der Buchung fest, der Kunde zahlt online, die Provision wird automatisch einbehalten. Kein Bargeld, keine Diskussionen." },
    { t: "Ehrliche Bewertungen", d: "Bewerten kann nur, wer gebucht und bezahlt hat. Gekaufte oder selbst geschriebene Sterne gibt es nicht." },
    { t: "Zuverlässigkeit zählt", d: "Wer oft absagt oder spät antwortet, rutscht in der Suche nach unten. Wer zuverlässig arbeitet, wird zuerst gefunden." },
  ];
  const plans = [
    { name: "Einführungsphase", when: `Monat 1 bis ${p.introMonths} ab Freischaltung`, price: formatCents(p.introMonthlyFeeCents), unit: "Grundgebühr", commission: formatPercent(p.introCommissionBps) },
    { name: "Monatlich", when: `ab Monat ${p.introMonths + 1}, monatlich kündbar`, price: formatCents(p.monthly.feeCents), unit: "pro Monat", commission: formatPercent(p.monthly.commissionBps) },
    {
      name: "Jährlich",
      when: `ab Monat ${p.introMonths + 1}, ${formatCents(p.yearly.feeCents)} im Jahr`,
      price: formatCents(yearlyPerMonthCents()),
      unit: "pro Monat effektiv",
      commission: formatPercent(p.yearly.commissionBps),
      highlight: `rund ${yearlySavingsPercent()} % günstiger`,
    },
  ];
  const faq = [
    { q: "Was kostet mich handwerker2go?", a: `Die ersten ${p.introMonths} Monate keine Grundgebühr, nur ${formatPercent(p.introCommissionBps)} Provision auf abgeschlossene Buchungen. Danach entscheidest du selbst, ob du monatlich oder jährlich weitermachst. Nichts wird automatisch kostenpflichtig.` },
    { q: "Wann bekomme ich mein Geld?", a: "Der Kunde zahlt bei der Buchung. Stripe zahlt dein Guthaben nach deinem eigenen Auszahlungsplan auf dein Bankkonto aus. Die Provision ist dann schon abgezogen." },
    { q: "Welche Nachweise brauche ich?", a: "Eine Gewerbeanmeldung und den Nachweis deiner Betriebshaftpflicht. Für Elektro, Sanitär und Maler zusätzlich die Eintragung in die Handwerksrolle (Handwerkskarte)." },
    { q: "Muss ich jeden Auftrag annehmen?", a: "Nein. Du kannst einstellen, dass du jede Buchung selbst bestätigst. Lehnst du ab, bekommt der Kunde sein Geld vollständig zurück." },
    { q: "Was passiert, wenn ein Kunde absagt?", a: "Bis 24 Stunden vorher ist die Stornierung für Kunden kostenlos. Danach steht dir eine Pauschale von 25 % des Festpreises zu, höchstens deine Anfahrtskosten." },
    { q: "Wie werde ich in der Suche gefunden?", a: "Entscheidend sind Entfernung, freie Termine, Bewertungen, Zuverlässigkeit und ein vollständiges Profil. Abo und Provision haben keinen Einfluss, bezahlte Platzierungen gibt es nicht." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-brand-dark text-white">
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="self-start rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-brand-light">Für Handwerksbetriebe in Hamburg</span>
            <h1 className="text-[clamp(38px,5.2vw,68px)] font-extrabold leading-[1.02] tracking-[-0.035em]">Mehr Aufträge für deinen Handwerksbetrieb. Weniger Telefonieren.</h1>
            <p className="max-w-[580px] text-lg leading-relaxed text-[#cfe3d7]">
              Kunden aus deiner Nachbarschaft buchen dich direkt in deine freien Termine und zahlen online. Du kümmerst dich um das, was
              du am besten kannst: dein Handwerk.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/partner/registrieren" className="rounded-full bg-white px-7 py-4 font-bold text-brand-dark transition-colors hover:bg-mint">
                Jetzt Partner werden
              </Link>
              <span className="text-[15px] text-[#cfe3d7]">{p.introMonths} Monate ohne Grundgebühr</span>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Keine Akquise", "Kunden finden dich über Leistung, Ort und Wunschtermin."],
              ["Keine offenen Rechnungen", "Bezahlt wird bei der Buchung, vor dem Termin."],
              ["Keine Bindung am Anfang", `${p.introMonths} Monate testen, danach frei entscheiden.`],
            ].map(([t, d]) => (
              <li key={t} className="rounded-panel bg-brand-deep p-5">
                <div className="text-[17px] font-bold">{t}</div>
                <div className="mt-1 text-[15px] text-[#cfe3d7]">{d}</div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-20">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((f) => (
            <li key={f.t} className="flex flex-col gap-3">
              <Icon name={f.icon} size={30} className="text-brand" />
              <span className="text-lg font-bold">{f.t}</span>
              <span className="text-[15px] leading-relaxed text-ink-soft">{f.d}</span>
            </li>
          ))}
        </ul>
      </Container>

      <section id="ablauf" aria-labelledby="ablauf-titel" className="scroll-mt-6 bg-soft">
        <Container className="flex flex-col gap-10 py-20">
          <h2 id="ablauf-titel" className={h2}>In fünf Schritten startklar</h2>
          <ol className="grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.t} className="flex flex-col gap-3 rounded-panel bg-white p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand font-extrabold text-white">{i + 1}</span>
                <span className="text-[17px] font-bold">{s.t}</span>
                <span className="text-[15px] leading-relaxed text-ink-soft">{s.d}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="schutz" aria-labelledby="schutz-titel" className="scroll-mt-6">
        <Container className="flex flex-col gap-10 py-20">
          <div className="flex max-w-[760px] flex-col gap-4">
            <h2 id="schutz-titel" className={h2}>Fair für alle. Auch für dich.</h2>
            <p className="text-[17px] leading-relaxed text-ink-soft">
              Ein Marktplatz funktioniert nur, wenn sich alle an die Regeln halten. Deshalb schützen wir Kunden und ehrliche Betriebe
              vor schwarzen Schafen. Die Regeln stehen auch in den <Link href="/agb-betriebe" className="underline">AGB für Betriebe</Link>.
            </p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {protections.map((x) => (
              <li key={x.t} className="flex flex-col gap-2 rounded-panel border border-line p-6">
                <span className="flex items-center gap-2 text-[17px] font-bold"><span aria-hidden className="h-2 w-2 rounded-full bg-brand" />{x.t}</span>
                <span className="text-[15px] leading-relaxed text-ink-soft">{x.d}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="konditionen" aria-labelledby="konditionen-titel" className="scroll-mt-6 bg-mint">
        <Container className="py-20">
          <h2 id="konditionen-titel" className={h2}>Konditionen</h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {plans.map((pl) => (
              <li key={pl.name} className={`flex flex-col gap-4 rounded-panel bg-white p-7 ${pl.highlight ? "outline-2 outline-brand" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold">{pl.name}</span>
                  {pl.highlight && <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand-dark">{pl.highlight}</span>}
                </div>
                <div>
                  <span className="text-[44px] font-extrabold tracking-[-0.03em]">{pl.price}</span> <span className="text-muted">{pl.unit}</span>
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
            <li>Die Gebühren von Stripe für die Zahlungsabwicklung verrechnet Stripe direkt mit deinem Stripe-Konto.</li>
            <li>Nach der Einführungsphase wird nichts automatisch kostenpflichtig. Wir erinnern dich vorher per E-Mail, du entscheidest aktiv.</li>
            <li>{providerVatNote} Auch Kleinunternehmer können mitmachen, mit USt-IdNr. oder mit Gewerbenachweis. Wichtig zur Umsatzsteuer: siehe unten.</li>
          </ul>
          <div id="umsatzsteuer" className="mt-8 max-w-[820px] rounded-panel border-[1.5px] border-brand bg-white p-6 text-[15px] leading-relaxed text-ink-soft">
            <h3 className="mb-2 text-lg font-bold text-brand-dark">Umsatzsteuer, kurz erklärt</h3>
            <p>
              handwerker2go sitzt in Malta. Unsere Rechnungen über Provision und Mitgliedschaft enthalten deshalb keine Umsatzsteuer
              („Reverse Charge“). Die deutsche Umsatzsteuer darauf (19 %) <strong>schuldest du selbst</strong> und meldest sie bei deinem
              Finanzamt an (§ 13b UStG). Regelbesteuerte Betriebe ziehen sie in der Regel gleich wieder als Vorsteuer ab.{" "}
              <strong>Kleinunternehmer</strong> müssen sie ebenfalls anmelden und zahlen, können sie aber nicht abziehen; für sie kosten
              Provision und Mitgliedschaft also effektiv 19 % mehr. Zum Mitmachen brauchst du eine USt-IdNr. oder, als Kleinunternehmer,
              deine Gewerbeanmeldung und Steuernummer. Im Zweifel frag deinen Steuerberater.
            </p>
          </div>
        </Container>
      </section>

      <section id="fragen" aria-labelledby="fragen-titel" className="scroll-mt-6">
        <Container className="flex max-w-[880px] flex-col gap-6 py-20">
          <h2 id="fragen-titel" className={h2}>Häufige Fragen</h2>
          <div className="flex flex-col gap-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-card border border-line px-5 py-4">
                <summary className="cursor-pointer list-none font-bold marker:hidden">
                  <span className="flex items-center justify-between gap-4">{f.q}<span aria-hidden className="text-brand transition-transform group-open:rotate-45">+</span></span>
                </summary>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="partner-ratgeber-titel" className="bg-soft">
        <Container className="flex flex-col gap-8 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="partner-ratgeber-titel" className={h2}>Ratgeber für Betriebe</h2>
            <Link href="/partner/ratgeber" className="rounded-full border-[1.5px] border-brand-dark px-5 py-3 font-bold text-brand-dark hover:bg-brand-dark hover:text-white">Alle Artikel</Link>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {partnerArticles.map((a) => <li key={a.slug}><ArticleCard a={a} basePath="/partner/ratgeber" /></li>)}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-dark text-white">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-16">
          <h2 className="text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.03em]">Bereit für neue Aufträge?</h2>
          <Link href="/partner/registrieren" className="rounded-full bg-white px-7 py-4 font-bold text-brand-dark transition-colors hover:bg-mint">
            Jetzt Partner werden
          </Link>
        </Container>
      </section>
    </>
  );
}
