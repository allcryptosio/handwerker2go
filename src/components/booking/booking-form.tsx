"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { EarlyStartConsentCheckbox } from "@/components/forms/early-start-consent";
import { Field, FormAlert, SubmitButton, TermsCheckbox } from "@/components/forms/fields";
import { type BookingFormState, createBooking } from "@/lib/actions/booking-actions";

export function BookingForm({
  hidden,
  defaults,
  needsConsent,
  fixed,
  priceText,
  cancellationText,
}: {
  hidden: { providerId: string; leistung: string; datum: string; zeit: string };
  defaults: { street?: string; postal_code: string; city: string; contact_name: string; contact_phone?: string };
  needsConsent: boolean;
  fixed: boolean;
  priceText: string;
  cancellationText: string;
}) {
  const [state, action] = useActionState<BookingFormState, FormData>(createBooking, {});
  const e = state.fieldErrors ?? {};
  const [previews, setPreviews] = useState<string[]>([]);
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <FormAlert error={state.error} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-lg font-bold">Einsatzort</legend>
        <Field name="street" label="Straße und Hausnummer" autoComplete="street-address" defaultValue={defaults.street} error={e.street} />
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <Field name="postal_code" label="PLZ" inputMode="numeric" autoComplete="postal-code" defaultValue={defaults.postal_code} error={e.postal_code} />
          <Field name="city" label="Ort" autoComplete="address-level2" defaultValue={defaults.city} error={e.city} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-lg font-bold">Kontakt</legend>
        <Field name="contact_name" label="Name" autoComplete="name" defaultValue={defaults.contact_name} error={e.contact_name} />
        <Field name="contact_phone" label="Telefon" type="tel" inputMode="tel" autoComplete="tel" defaultValue={defaults.contact_phone}
          hint="Der Betrieb ruft dich nur bei Fragen zum Auftrag an." error={e.contact_phone} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-lg font-bold">Zum Auftrag</legend>
        <Field name="notes" label="Hinweise für den Betrieb" textarea rows={4} required={false}
          hint="Zum Beispiel: Etage, Zugang, Material vorhanden, Besonderheiten." error={e.notes} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-photos" className="text-sm font-semibold">Fotos <span className="font-normal text-muted">(optional, bis zu 5, je höchstens 4 MB)</span></label>
          <input id="f-photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={(ev) => setPreviews([...(ev.target.files ?? [])].slice(0, 5).map((f) => URL.createObjectURL(f)))}
            className="text-[15px] file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-mint file:px-4 file:font-semibold file:text-brand-dark" />
          {previews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previews.map((src) => <img key={src} src={src} alt="" className="h-20 w-20 rounded-xl border border-line object-cover" />)}
            </div>
          )}
          {e.photos && <p className="text-[13px] font-semibold text-[#b42318]">{e.photos}</p>}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-panel border border-line bg-soft p-5">
        <TermsCheckbox error={e.terms} />
        {needsConsent && <EarlyStartConsentCheckbox error={e.early_start_consent} />}
        <p className="text-[13px] text-muted">{cancellationText}</p>
        <p className="text-[13px] text-muted">
          Dein Vertragspartner für die Leistung ist der Betrieb. Es gilt die <Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>.
          Wie wir mit deinen Daten umgehen, steht in der <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link>.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[13px] text-muted">{fixed ? "Gesamtpreis inkl. MwSt." : "Preis"}</div>
          <div className="text-2xl font-extrabold">{priceText}</div>
        </div>
        <SubmitButton>{fixed ? "Zahlungspflichtig buchen" : "Termin verbindlich buchen"}</SubmitButton>
      </div>
      {fixed && <p className="-mt-3 text-right text-[13px] text-muted">Weiter zur sicheren Bezahlung bei Stripe</p>}
    </form>
  );
}
