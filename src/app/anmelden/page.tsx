import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { Container } from "@/components/ui/container";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Anmelden", alternates: { canonical: "/anmelden" }, robots: { index: false } };

async function RedirectIfSignedIn() {
  const u = await currentUser();
  if (u) redirect(u.role === "admin" ? "/admin" : u.role === "provider" ? "/dashboard" : "/konto");
  return null;
}

export default function LoginPage() {
  return (
    <Container className="flex max-w-[520px] flex-col gap-6 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-[clamp(32px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Anmelden</h1>
      <Suspense fallback={<div className="h-[260px] animate-pulse rounded-panel bg-soft" />}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
