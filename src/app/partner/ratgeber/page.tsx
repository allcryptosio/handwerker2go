import type { Metadata } from "next";
import { ArticleCard } from "@/components/ratgeber/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { partnerArticles } from "@/content/partner-ratgeber";

const title = "Ratgeber für Handwerksbetriebe: Kunden, Kosten, Planung";
const description = "Praxiswissen für Handwerksbetriebe: neue Kunden gewinnen, Handwerkerportale richtig vergleichen und Termine ohne Leerlauf planen.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partner/ratgeber" },
  openGraph: { title, description, url: "/partner/ratgeber", type: "website" },
};

export default function PartnerRatgeberPage() {
  return (
    <Container className="flex flex-col gap-10 py-12 sm:py-16">
      <Breadcrumbs items={[{ name: "Für Betriebe", href: "/partner" }, { name: "Ratgeber", href: "/partner/ratgeber" }]} />
      <header className="flex max-w-[760px] flex-col gap-4">
        <span className="self-start rounded-full bg-mint px-3 py-1 text-[13px] font-bold text-brand-dark">Ratgeber für Betriebe</span>
        <h1 className="text-[clamp(36px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-brand-dark">Mehr Aufträge, weniger Leerlauf.</h1>
        <p className="text-lg leading-relaxed text-ink-soft">
          Praxiswissen für Handwerksbetriebe: wie du neue Kunden gewinnst, was Handwerkerportale wirklich kosten und wie du deinen
          Kalender so planst, dass am Ende des Tages mehr übrig bleibt.
        </p>
      </header>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partnerArticles.map((a) => <li key={a.slug}><ArticleCard a={a} basePath="/partner/ratgeber" /></li>)}
      </ul>
    </Container>
  );
}
