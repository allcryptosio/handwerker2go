import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { legal } from "@/config/legal";
import { rankingCriteria } from "@/config/ranking";

export const metadata: Metadata = {
  title: "So sortieren wir die Suchergebnisse",
  description: "Nach welchen Kriterien handwerker2go die Reihenfolge der Handwerksbetriebe in den Suchergebnissen festlegt.",
  alternates: { canonical: "/ranking" },
};

/** Transparenz zum Ranking nach Art. 5 der P2B-Verordnung (EU) 2019/1150 und § 5b Abs. 2 UWG. */
export default function RankingPage() {
  return (
    <Container className="max-w-[820px] py-16">
      <h1 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-0.03em] text-brand-dark">
        So sortieren wir die Suchergebnisse
      </h1>
      <div className="mt-8 flex flex-col gap-5 text-[16px] leading-relaxed text-ink-soft">
        <p>
          Wenn du nach einer Leistung suchst, zeigen wir dir nur Betriebe, deren Einsatzgebiet deine Adresse abdeckt. Die
          Reihenfolge dieser Betriebe richtet sich nach den folgenden Kriterien. Das erste Kriterium hat das größte Gewicht, das
          letzte das kleinste.
        </p>
        <ol className="flex flex-col gap-3">
          {rankingCriteria.map((c, i) => (
            <li key={c.title} className="flex gap-4 rounded-card border border-line p-5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-extrabold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block font-bold text-ink">{c.title}</span>
                <span className="block text-[15px]">{c.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="rounded-card bg-mint p-5 font-semibold text-brand-dark">
          Das gewählte Abo-Modell (monatlich oder jährlich) und die Höhe der Provision haben keinen Einfluss auf das Ranking.
          Bezahlte Platzierungen gibt es nicht.
        </p>
        <p>
          Bewertungen stammen nur von Kunden, die über handwerker2go gebucht haben und deren Auftrag abgeschlossen ist. Mehr dazu
          steht in den <Link href="/agb" className="underline">AGB für Kunden</Link> und den{" "}
          <Link href="/agb-betriebe" className="underline">AGB für Betriebe</Link>.
        </p>
        <p>Fragen zum Ranking beantworten wir gern unter {legal.email}.</p>
      </div>
    </Container>
  );
}
