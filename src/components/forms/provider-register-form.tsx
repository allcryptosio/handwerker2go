"use client";

import { useActionState } from "react";
import { registerProvider, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton, TermsCheckbox } from "./fields";

export function ProviderRegisterForm({ categories }: { categories: { slug: string; label: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(registerProvider, {});
  if (state.ok) return <FormAlert message={state.message} />;
  const e = state.fieldErrors ?? {};
  const section = "flex flex-col gap-5 rounded-panel border border-line bg-white p-6 sm:p-8";
  const h = "text-xl font-extrabold tracking-[-0.02em] text-brand-dark";
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormAlert error={state.error} />

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>1. Unternehmen</legend>
        <Field name="company_name" label="Firmenname" autoComplete="organization" error={e.company_name} />
        <Field name="legal_form" label="Rechtsform" required={false} hint="z. B. Einzelunternehmen, GmbH, GbR" error={e.legal_form} />
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1.5fr]">
          <Field name="street" label="Straße und Hausnummer" autoComplete="street-address" error={e.street} />
          <Field name="postal_code" label="PLZ" inputMode="numeric" autoComplete="postal-code" error={e.postal_code} />
          <Field name="city" label="Ort" autoComplete="address-level2" error={e.city} />
        </div>
        <Field name="vat_id" label="USt-IdNr." required={false} error={e.vat_id} hint="Wir rechnen Provision und Abo netto im Reverse-Charge-Verfahren ab. Bitte angeben, falls vorhanden." />
      </fieldset>

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>2. Ansprechperson und Zugang</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="contact_name" label="Vor- und Nachname" autoComplete="name" error={e.contact_name} />
          <Field name="phone" label="Telefonnummer" type="tel" autoComplete="tel" inputMode="tel" error={e.phone} />
        </div>
        <Field name="email" label="E-Mail-Adresse" type="email" autoComplete="email" inputMode="email" error={e.email} />
        <Field name="password" label="Passwort" type="password" autoComplete="new-password" hint="Mindestens 10 Zeichen" error={e.password} />
      </fieldset>

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>3. Leistungen und Einsatzgebiet</legend>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Welche Leistungen bietest du an?</span>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <label key={c.slug} className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line-strong px-4 py-2.5 text-[15px] font-semibold has-[:checked]:border-brand has-[:checked]:bg-mint">
                <input type="checkbox" name="categories" value={c.slug} className="h-4 w-4 accent-[#12704f]" />
                {c.label}
              </label>
            ))}
          </div>
          {e.categories && <p className="text-[13px] font-semibold text-[#b42318]">{e.categories}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <Field name="area_label" label="Mittelpunkt des Einsatzgebiets" hint="PLZ oder Stadtteil, z. B. 22767 Hamburg-Altona" error={e.area_label} />
          <Field name="radius_km" label="Umkreis in km" type="number" inputMode="numeric" defaultValue="15" error={e.radius_km} />
        </div>
        <Field name="description" label="Beschreibung deines Betriebs" textarea error={e.description}
          hint="Was macht ihr, seit wann, was zeichnet euch aus? Mindestens 40 Zeichen." />
      </fieldset>

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>4. Gewerblicher Nachweis</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-document_kind" className="text-sm font-semibold">Art des Nachweises</label>
          <select id="f-document_kind" name="document_kind" className="min-h-12 rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[16px]">
            <option value="gewerbeanmeldung">Gewerbeanmeldung</option>
            <option value="handwerksrolle">Eintragung in die Handwerksrolle</option>
            <option value="versicherung">Betriebshaftpflicht</option>
            <option value="sonstiges">Sonstiger Nachweis</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-document" className="text-sm font-semibold">Datei</label>
          <input id="f-document" name="document" type="file" accept="application/pdf,image/jpeg,image/png" required aria-invalid={!!e.document}
            className="rounded-xl border-[1.5px] border-dashed border-line-strong bg-soft p-4 text-[15px]" />
          <p className="text-[13px] text-muted">PDF, JPG oder PNG, höchstens 10 MB. Nur für unser Prüfteam sichtbar.</p>
          {e.document && <p className="text-[13px] font-semibold text-[#b42318]">{e.document}</p>}
        </div>
      </fieldset>

      <TermsCheckbox error={e.terms} />
      <p className="text-[14px] text-muted">
        Nach der Registrierung prüfen wir deine Angaben. Erst nach der Freigabe ist dein Profil öffentlich sichtbar. Die Einführungsphase
        ohne Grundgebühr beginnt mit der Freigabe.
      </p>
      <div><SubmitButton>Betrieb registrieren</SubmitButton></div>
    </form>
  );
}
