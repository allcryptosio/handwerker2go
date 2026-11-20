import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/password-forms";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Neues Passwort festlegen", alternates: { canonical: "/passwort-neu" }, robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <Container className="flex max-w-[520px] flex-col gap-6 py-16">
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Neues Passwort festlegen</h1>
      <Suspense fallback={<div className="h-[260px] animate-pulse rounded-panel bg-soft" />}>
        <ResetPasswordForm />
      </Suspense>
    </Container>
  );
}
