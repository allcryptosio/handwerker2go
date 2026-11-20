import type { Metadata } from "next";
import { ArticleCard } from "@/components/ratgeber/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { articles } from "@/content/ratgeber";

export const metadata: Metadata = {
  title: "Ratgeber: Tipps rund um Handwerker, Kosten und Ablauf",
  description: "Kosten, Ablauf, Tipps: Unser Ratgeber erklärt kurz und ehrlich, was du vor dem Handwerker-Termin wissen musst. Von Entrümpelung bis Maler.",
  alternates: { canonical: "/ratgeber" },
  openGraph: {
    title: "Ratgeber: Tipps rund um Handwerker, Kosten und Ablauf",
    description: "Kosten, Ablauf, Tipps: kurz und ehrlich erklärt, bevor der Handwerker klingelt.",
    url: "/ratgeber",
    type: "website",
  },
};

export default function RatgeberPage() {
  return (
    <Container className="flex flex-col gap-10 py-12 sm:py-16">
      <Breadcrumbs items={[{ name: "Startseite", href: "/" }, { name: "Ratgeber", href: "/ratgeber" }]} />
      <header className="flex max-w-[760px] flex-col gap-4">
        <span className="self-start rounded-full bg-mint px-3 py-1 text-[13px] font-bold text-brand-dark">Ratgeber</span>
        <h1 className="text-[clamp(36px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-brand-dark">
          Erst checken, dann buchen.
        </h1>
        <p className="text-lg leading-relaxed text-ink-soft">
          Was kostet das? Darf ich das selbst? Wie bereite ich mich vor? Unsere Guides geben dir die Antworten, kurz, ehrlich und ohne
          Fachchinesisch. Damit dein Termin genau so läuft, wie du ihn dir vorstellst.
        </p>
      </header>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <ArticleCard a={a} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
