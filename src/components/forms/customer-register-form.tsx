"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerCustomer, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton, TermsCheckbox } from "./fields";

export function CustomerRegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerCustomer, {});
  if (state.ok) return <FormAlert message={state.message} />;
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormAlert error={state.error} />
      <Field name="name" label="Vor- und Nachname" autoComplete="name" error={e.name} />
      <Field name="email" label="E-Mail-Adresse" type="email" autoComplete="email" inputMode="email" error={e.email} />
      <Field name="password" label="Passwort" type="password" autoComplete="new-password" hint="Mindestens 10 Zeichen" error={e.password} />
      <Field name="phone" label="Telefonnummer" type="tel" autoComplete="tel" inputMode="tel" required={false} error={e.phone}
        hint="Hilft dem Betrieb, dich bei Rückfragen zu erreichen" />
      <TermsCheckbox error={e.terms} />
      <p className="text-[13px] leading-snug text-muted">
        Nach einem Termin bitten wir dich per E-Mail, den Betrieb zu bewerten. Dem kannst du jederzeit widersprechen, zum Beispiel über den Link in jeder dieser E-Mails.
      </p>
      <SubmitButton>Konto erstellen</SubmitButton>
      <p className="text-[15px] text-ink-soft">
        Schon ein Konto? <Link href="/anmelden" className="font-semibold text-brand underline">Anmelden</Link>
      </p>
    </form>
  );
}
