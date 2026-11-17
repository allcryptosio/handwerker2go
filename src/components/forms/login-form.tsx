"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton } from "./fields";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormAlert error={state.error} />
      <Field name="email" label="E-Mail-Adresse" type="email" autoComplete="email" inputMode="email" error={e.email} />
      <Field name="password" label="Passwort" type="password" autoComplete="current-password" error={e.password} />
      <SubmitButton>Anmelden</SubmitButton>
      <p className="text-[15px] text-ink-soft">
        Noch kein Konto? <Link href="/registrieren" className="font-semibold text-brand underline">Als Kunde registrieren</Link> oder{" "}
        <Link href="/fuer-handwerker/registrieren" className="font-semibold text-brand underline">Betrieb anmelden</Link>
      </p>
    </form>
  );
}
