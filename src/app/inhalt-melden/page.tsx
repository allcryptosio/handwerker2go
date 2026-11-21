import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReportForm } from "@/components/forms/report-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Inhalt melden", robots: { index: false, follow: false } };

async function Form({ searchParams }: PageProps<"/inhalt-melden">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const type = sp.typ === "profil" ? "provider_profile" : sp.typ === "bewertung" ? "review" : null;
  if (!type || !/^[0-9a-f-]{36}$/.test(sp.id ?? "")) notFound();
  return <ReportForm type={type} id={sp.id!} url={(sp.url ?? "").slice(0, 300)} />;
}

export default function Page(props: PageProps<"/inhalt-melden">) {
  return (
    <Container className="flex max-w-[680px] flex-col gap-6 py-14">
      <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Inhalt melden</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">Melden Sie uns Inhalte, die Sie für rechtswidrig halten. Wir prüfen jede Meldung zeitnah und sorgfältig.</p>
      <Suspense fallback={null}><Form {...props} /></Suspense>
    </Container>
  );
}
