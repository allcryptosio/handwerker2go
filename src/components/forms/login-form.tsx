"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton } from "./fields";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("weiter") ?? undefined;
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next?.startsWith("/buchen/") && (
        <p className="rounded-card bg-mint p-4 text-[15px] text-brand-dark">Melde dich an, um deine Buchung abzuschließen. Deine Auswahl bleibt erhalten.</p>
      )}
      {params.get("passwort") === "neu" && !state.error && (
        <FormAlert message="Dein neues Passwort ist gespeichert. Melde dich jetzt damit an." />
      )}
      <FormAlert error={state.error} />
      {next && <input type="hidden" name="weiter" value={next} />}
      <Field name="email" label="E-Mail-Adresse" type="email" autoComplete="email" inputMode="email" error={e.email} />
      <div className="flex flex-col gap-2">
        <Field name="password" label="Passwort" type="password" autoComplete="current-password" error={e.password} />
        <Link href="/passwort-vergessen" className="self-end text-[14px] font-semibold text-brand underline">Passwort vergessen?</Link>
      </div>
      <SubmitButton>Anmelden</SubmitButton>
      <p className="text-[15px] text-ink-soft">
        Noch kein Konto? <Link href="/registrieren" className="font-semibold text-brand underline">Als Kunde registrieren</Link> oder{" "}
        <Link href="/partner/registrieren" className="font-semibold text-brand underline">Betrieb anmelden</Link>
      </p>
    </form>
  );
}
