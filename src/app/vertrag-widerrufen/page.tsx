import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { WithdrawalForm } from "@/components/forms/withdrawal-form";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";
import { asSystem } from "@/lib/db";

export const metadata: Metadata = { title: "Vertrag widerrufen", alternates: { canonical: "/vertrag-widerrufen" }, robots: { index: false, follow: true } };

/** Eingeloggt: Felder vorausfüllen; mit ?b= die eigene Buchung */
async function Prefilled({ searchParams }: PageProps<"/vertrag-widerrufen">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const number = (sp.b ?? "").slice(0, 40);
  const u = await currentUser();
  const initial: Record<string, string> = { name: "", bookingNumber: number, bookingDate: "", providerName: "", serviceName: "", email: "" };
  if (u) {
    initial.name = u.name;
    initial.email = u.email;
    if (number) {
      const own = await asSystem(async (db) => (await db.query("select contact_name, contact_email from bookings where upper(number) = upper($1) and customer_id = $2", [number, u.id])).rows[0]);
      if (own) { initial.name = own.contact_name; initial.email = own.contact_email; }
    }
  }
  return <WithdrawalForm initial={initial} />;
}

export default function Page(props: PageProps<"/vertrag-widerrufen">) {
  return (
    <Container className="flex max-w-[680px] flex-col gap-6 py-14">
      <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Vertrag widerrufen</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">
        Hier können Sie einen über handwerker2go geschlossenen Vertrag widerrufen. Ein Grund ist nicht nötig. Sie erhalten sofort eine
        Eingangsbestätigung per E-Mail. Mehr dazu in der <Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>.
      </p>
      <Suspense fallback={<div className="h-[420px] animate-pulse rounded-panel bg-soft" />}>
        <Prefilled {...props} />
      </Suspense>
    </Container>
  );
}
