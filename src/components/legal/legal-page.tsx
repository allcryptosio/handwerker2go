import { Container } from "@/components/ui/container";

/** Rahmen für Rechtstexte. Offene Prüfpunkte stehen intern in docs/RECHTLICHE-PRUEFUNGEN.md, nicht auf der Website. */
export function LegalPage({ title, children, draft = false }: { title: string; children: React.ReactNode; draft?: boolean }) {
  return (
    <Container className="max-w-[820px] py-16">
      <h1 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-0.03em] text-brand-dark">{title}</h1>
      {draft && <p role="note" className="mt-6 rounded-card border-[1.5px] border-[#e0a800] bg-[#fff8e1] p-4 text-[15px] leading-relaxed">
        Entwurf mit Platzhaltern. Dieser Text ist nicht anwaltlich geprüft und muss vor dem Livegang von einer Rechtsanwältin
        oder einem Rechtsanwalt geprüft und vervollständigt werden.
      </p>}
      <div className="mt-8 flex flex-col gap-5 text-[16px] leading-relaxed text-ink-soft [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        {children}
      </div>
    </Container>
  );
}
