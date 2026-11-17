import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Anmelden", alternates: { canonical: "/anmelden" }, robots: { index: false } };

/** Phase 2 ersetzt diese Seite durch die Anmeldung mit Supabase Auth. */
export default function LoginPage() {
  return (
    <Container className="flex max-w-[560px] flex-col gap-5 py-20">
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Anmelden</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">
        Kundenkonten und das Dashboard für Betriebe gehen in Kürze an den Start. Bis dahin kannst du dich über die Leistungen
        in Hamburg informieren.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/hamburg" className="rounded-full bg-brand px-6 py-3.5 font-bold text-white hover:bg-brand-dark">Leistungen ansehen</Link>
        <Link href="/fuer-handwerker" className="rounded-full border-[1.5px] border-ink px-6 py-3.5 font-bold hover:bg-ink hover:text-white">Für Handwerker</Link>
      </div>
    </Container>
  );
}
