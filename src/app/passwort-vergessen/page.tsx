import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/password-forms";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Passwort vergessen", alternates: { canonical: "/passwort-vergessen" }, robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <Container className="flex max-w-[520px] flex-col gap-6 py-16">
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Passwort vergessen</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">Gib die E-Mail-Adresse deines Kontos ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.</p>
      <ForgotPasswordForm />
    </Container>
  );
}
