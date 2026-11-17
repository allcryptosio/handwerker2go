import type { Metadata } from "next";
import { CustomerRegisterForm } from "@/components/forms/customer-register-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Registrieren", alternates: { canonical: "/registrieren" }, robots: { index: false } };

export default function Page() {
  return (
    <Container className="flex max-w-[560px] flex-col gap-6 py-16">
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Konto erstellen</h1>
      <p className="text-[17px] text-ink-soft">Mit deinem Konto buchst du Handwerker, verwaltest Termine und bewertest erledigte Aufträge.</p>
      <CustomerRegisterForm />
    </Container>
  );
}
