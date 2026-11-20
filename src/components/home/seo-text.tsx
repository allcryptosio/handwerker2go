import Link from "next/link";
import { ArticleCard } from "@/components/ratgeber/article-card";
import { Container } from "@/components/ui/container";
import { articles } from "@/content/ratgeber";
import { categories } from "@/lib/catalog";

const h2 = "text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-brand-dark";

const points = [
  {
    h: "Echtzeit statt Rückrufbitte",
    t: "Fünf Betriebe anrufen, zweimal Mailbox, einmal „wir melden uns“, und dann passiert nix? Nicht hier. Wir rechnen live aus den Kalendern der Betriebe, wer zu deinem Wunschtermin wirklich kann, inklusive Anfahrt und Pufferzeit. Du siehst nur, wer Zeit hat.",
  },
  {
    h: "Festpreis statt Überraschung",
    t: "Bei vielen Leistungen steht der Preis schon vor der Buchung fest. Kein „kommt drauf an“, keine Nachverhandlung an der Tür. Du zahlst sicher online, und das Geld geht direkt an den Betrieb.",
  },
  {
    h: "Geprüft statt Glücksspiel",
    t: "Jeder Betrieb lädt einen gewerblichen Nachweis hoch, bevor wir ihn freischalten. Bewertungen gibt es nur von Leuten, die wirklich gebucht haben. Fake-Sterne? Haben wir nicht.",
  },
  {
    h: "Ganz Hamburg, ein Klick",
    t: "Ob WG in Altona, Altbau in Eimsbüttel, Neubau in der HafenCity oder Reihenhaus in Bergedorf: Du gibst deine PLZ ein, wir finden Betriebe, deren Einsatzgebiet dich abdeckt.",
  },
];

export function SeoText({ citySlug }: { citySlug: string }) {
  return (
    <section aria-labelledby="seo-titel" className="py-[88px]">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 id="seo-titel" className={h2}>
            Handwerker in Hamburg? Easy. Ohne Warteschleife.
          </h2>
          <p className="text-[18px] leading-relaxed text-ink-soft">
            Lampe hängt schief, Schrank liegt seit Wochen im Karton, der Keller platzt aus allen Nähten? Mit handwerker2go findest du
            geprüfte Handwerker in Hamburg, die genau dann Zeit haben, wann du sie brauchst. Leistung wählen, PLZ rein, Wunschtermin
            klicken, fertig. Kein Telefonmarathon, kein Angebots-Pingpong.
          </p>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {points.map((p, i) => (
            <li key={p.h} className="flex gap-5 rounded-panel border border-line bg-white p-6">
              <span aria-hidden className="text-[44px] font-extrabold leading-none text-mint-strong">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-bold text-ink">{p.h}</h3>
                <p className="text-[16px] leading-relaxed text-ink-soft">{p.t}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 rounded-panel bg-soft p-6 sm:p-8">
          <h3 className="text-[20px] font-bold text-ink">Beliebt in Hamburg</h3>
          <p className="text-[16px] text-ink-soft">
            Von der Entrümpelung über den Elektriker bis zum Maler: Such dir aus, was ansteht. Alle Leistungen mit Festpreis oder
            kostenloser Besichtigung.
          </p>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${citySlug}/${c.slug}`} className="inline-flex rounded-full border border-line-strong bg-white px-4 py-2 text-[15px] font-semibold hover:border-brand hover:text-brand">
                  {c.trade} Hamburg
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export function RatgeberTeaser() {
  return (
    <section aria-labelledby="ratgeber-titel" className="bg-mint py-[88px]">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-[640px] flex-col gap-3">
            <span className="self-start rounded-full bg-white px-3 py-1 text-[13px] font-bold text-brand-dark">Ratgeber</span>
            <h2 id="ratgeber-titel" className={h2}>Erst checken, dann buchen.</h2>
            <p className="text-[17px] text-ink-soft">Was kostet das? Darf ich das selbst? Kurze, ehrliche Guides, bevor der Handwerker klingelt.</p>
          </div>
          <Link href="/ratgeber" className="rounded-full border-[1.5px] border-brand-dark px-5 py-3 font-bold text-brand-dark hover:bg-brand-dark hover:text-white">
            Alle Artikel
          </Link>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}
        </ul>
      </Container>
    </section>
  );
}
