import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { termsDate } from "@/config/legal";
import { type NoticeBlock, withdrawalExtraNotes, withdrawalNotice } from "@/lib/legal/withdrawal-notice";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Widerrufsbelehrung",
  description: "Widerrufsbelehrung für Handwerkerleistungen, die Sie über handwerker2go bei einem Handwerksbetrieb buchen, mit Muster-Widerrufsformular und Online-Widerruf.",
  path: "/widerruf",
});

function Blocks({ blocks, skipFirstHeading = false }: { blocks: NoticeBlock[]; skipFirstHeading?: boolean }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "h") return skipFirstHeading && i === 0 ? null : <h2 key={i}>{b.text}</h2>;
        if (b.kind === "li") return <p key={i} className="pl-1">{b.text}</p>;
        return <p key={i}>{b.text}</p>;
      })}
    </>
  );
}

/**
 * Amtliches Muster (Sie-Form), Angaben zum Betrieb stehen in der Buchungsbestätigung.
 * Textquelle: src/lib/legal/withdrawal-notice.ts (nicht hier ändern).
 */
export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <p>Stand: {termsDate()}</p>
      <p className="rounded-card border-[1.5px] border-brand bg-mint p-4">
        Sie möchten einen Vertrag widerrufen?{" "}
        <Link href="/vertrag-widerrufen" className="font-bold text-brand-dark underline">Vertrag online widerrufen</Link>
      </p>
      <Blocks blocks={withdrawalNotice(null)} skipFirstHeading />
      <div className="mt-8 border-t border-line pt-8">
        <Blocks blocks={withdrawalExtraNotes()} />
      </div>
    </LegalPage>
  );
}
