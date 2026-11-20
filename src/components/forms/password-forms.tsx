"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton } from "./fields";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});
  if (state.ok) return <FormAlert message={state.message} />;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormAlert error={state.error} />
      <Field name="email" label="E-Mail-Adresse" type="email" autoComplete="email" inputMode="email" error={e.email} />
      <SubmitButton>Link anfordern</SubmitButton>
      <p className="text-[15px] text-ink-soft">
        Doch wieder eingefallen? <Link href="/anmelden" className="font-semibold text-brand underline">Zur Anmeldung</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, action] = useActionState<FormState, FormData>(resetPassword, {});
  const e = state.fieldErrors ?? {};
  if (!token || params.get("error")) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert error="Der Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an." />
        <Link href="/passwort-vergessen" className="self-start font-semibold text-brand underline">Neuen Link anfordern</Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormAlert error={state.error} />
      <input type="hidden" name="token" value={token} />
      <Field name="password" label="Neues Passwort" type="password" autoComplete="new-password" hint="Mindestens 10 Zeichen" error={e.password} />
      <Field name="password2" label="Neues Passwort wiederholen" type="password" autoComplete="new-password" error={e.password2} />
      <SubmitButton>Passwort speichern</SubmitButton>
      {state.error && <Link href="/passwort-vergessen" className="self-start font-semibold text-brand underline">Neuen Link anfordern</Link>}
    </form>
  );
}
