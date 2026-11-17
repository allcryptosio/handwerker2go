import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mein Konto", robots: { index: false } };

async function Account() {
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role === "provider") redirect("/dashboard");
  return (
    <>
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Hallo {u.name}</h1>
      <dl className="grid gap-4 rounded-panel border border-line p-6 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Name</dt><dd className="mt-1 font-semibold">{u.name}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">E-Mail</dt><dd className="mt-1 font-semibold">{u.email}</dd></div>
      </dl>
      <section className="rounded-panel bg-mint p-6">
        <h2 className="text-xl font-bold">Deine Buchungen</h2>
        <p className="mt-2 text-[15px] text-ink-soft">Noch keine Buchungen. Sobald die ersten Betriebe freigeschaltet sind, kannst du hier buchen und deine Termine verwalten.</p>
        <Link href="/hamburg" className="mt-4 inline-block rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">Leistungen ansehen</Link>
      </section>
      <SignOutButton />
    </>
  );
}

export default function Page() {
  return (
    <Container className="flex max-w-[760px] flex-col gap-6 py-16">
      <Suspense fallback={<p>Lädt …</p>}>
        <Account />
      </Suspense>
    </Container>
  );
}
