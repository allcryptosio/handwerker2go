import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewOptOutForm } from "@/components/forms/review-optout-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Bewertungsanfragen abbestellen", robots: { index: false, follow: false } };

async function Form({ searchParams }: PageProps<"/bewertungsmails-abbestellen">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  return <ReviewOptOutForm u={sp.u ?? ""} t={sp.t ?? ""} />;
}

/** Bestätigung per Button (nicht per Aufruf), damit Link-Vorschauen in Mailprogrammen nicht versehentlich abmelden */
export default function Page(props: PageProps<"/bewertungsmails-abbestellen">) {
  return (
    <Container className="flex max-w-[560px] flex-col gap-6 py-16">
      <h1 className="text-[clamp(30px,4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">Bewertungsanfragen abbestellen</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">Nach einem Termin bitten wir dich per E-Mail um eine Bewertung. Wenn du das nicht möchtest, bestätige hier.</p>
      <Suspense fallback={null}>
        <Form {...props} />
      </Suspense>
    </Container>
  );
}
