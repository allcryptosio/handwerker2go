"use client";

import { useActionState, useState } from "react";
import { UNTERNEHMER_DECLARATION_TEXT, WEG_B_HINT } from "@/lib/legal/unternehmer";
import { registerProvider, type FormState } from "@/lib/actions/auth-actions";
import { Field, FormAlert, SubmitButton, TermsCheckbox } from "./fields";

export function ProviderRegisterForm({ categories }: { categories: { slug: string; label: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(registerProvider, {});
  const [way, setWay] = useState<"ust_idnr" | "gewerbe_nachweis">("ust_idnr");
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
      </fieldset>

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>Steuerangaben</legend>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Steuerstatus deines Betriebs</span>
          <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="tax_status" value="regelbesteuert" className="mt-1 h-4 w-4 accent-[#12704f]" />
            <span><b>Regelbesteuert.</b> Ich berechne Kunden Umsatzsteuer. Preise werden als „inkl. 19 % MwSt.“ angezeigt.</span></label>
          <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="tax_status" value="kleinunternehmer_19" className="mt-1 h-4 w-4 accent-[#12704f]" />
            <span><b>Kleinunternehmer nach § 19 UStG.</b> Ich berechne keine Umsatzsteuer. Preise werden als „Endpreis, keine USt nach § 19 UStG“ angezeigt.</span></label>
          {e.tax_status && <p className="text-[13px] font-semibold text-[#b42318]">{e.tax_status}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Nachweis, dass du Unternehmer bist (nötig für unsere Rechnungen ohne Umsatzsteuer)</span>
          <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="proof_way" value="ust_idnr" checked={way === "ust_idnr"} onChange={() => setWay("ust_idnr")} className="mt-1 h-4 w-4 accent-[#12704f]" />
            <span><b>Mit USt-IdNr.</b> Wir prüfen sie sofort bei der EU (VIES).</span></label>
          <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="proof_way" value="gewerbe_nachweis" checked={way === "gewerbe_nachweis"} onChange={() => setWay("gewerbe_nachweis")} className="mt-1 h-4 w-4 accent-[#12704f]" />
            <span><b>Ohne USt-IdNr.</b> Mit Gewerbeanmeldung, Steuernummer und Unternehmer-Erklärung (z. B. Kleinunternehmer).</span></label>
          {e.proof_way && <p className="text-[13px] font-semibold text-[#b42318]">{e.proof_way}</p>}
        </div>
        {way === "ust_idnr" ? (
          <Field name="vat_id" label="USt-IdNr." error={e.vat_id} hint="Format DE123456789" />
        ) : (
          <>
            <Field name="steuernummer" label="Steuernummer" error={e.steuernummer} hint="Wie auf deinen Bescheiden vom Finanzamt, z. B. 12/345/67890" />
            <p className="rounded-card bg-mint p-4 text-[14px] text-brand-dark">{WEG_B_HINT}</p>
            <label className="flex items-start gap-3 text-[15px] leading-snug">
              <input type="checkbox" name="unternehmer_declaration" className="mt-0.5 h-5 w-5 shrink-0 accent-[#12704f]" aria-invalid={!!e.unternehmer_declaration} />
              <span>{UNTERNEHMER_DECLARATION_TEXT}</span>
            </label>
            {e.unternehmer_declaration && <p className="text-[13px] font-semibold text-[#b42318]">{e.unternehmer_declaration}</p>}
          </>
        )}
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
        <Field name="anfahrtskosten" label="Anfahrtskosten in Euro" inputMode="text" error={e.anfahrtskosten}
          hint="Die Anfahrt ist in deinen Festpreisen immer enthalten. Der Betrag ist die Obergrenze der Pauschale bei später Stornierung oder wenn niemand angetroffen wird (höchstens 25 % des Festpreises)." />
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
          hint="Was macht ihr, seit wann, was zeichnet euch aus? Mindestens 40 Zeichen. Bitte keine Telefonnummern, E-Mail-Adressen oder Links: Kunden bekommen deine Kontaktdaten nach der Buchung automatisch." />
      </fieldset>

      <fieldset className={section}>
        <legend className={`${h} mb-1`}>4. Nachweise</legend>
        <p className="text-[15px] text-ink-soft">
          PDF, JPG oder PNG, je Datei höchstens 5 MB. Die Nachweise sieht nur unser Prüfteam, sie werden nicht veröffentlicht.
        </p>
        {[
          { name: "doc_gewerbe", label: "Gewerbeanmeldung", hint: "Pflicht" },
          { name: "doc_versicherung", label: "Betriebshaftpflicht (Versicherungsbestätigung)", hint: "Pflicht" },
          { name: "doc_handwerksrolle", label: "Eintragung in die Handwerksrolle (Handwerkskarte)", hint: "Pflicht für Elektro, Sanitär und Maler" },
        ].map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label htmlFor={`f-${f.name}`} className="text-sm font-semibold">
              {f.label} <span className="font-normal text-muted">({f.hint})</span>
            </label>
            <input id={`f-${f.name}`} name={f.name} type="file" accept="application/pdf,image/jpeg,image/png" aria-invalid={!!e[f.name]}
              className="rounded-xl border-[1.5px] border-dashed border-line-strong bg-soft p-4 text-[15px]" />
            {e[f.name] && <p className="text-[13px] font-semibold text-[#b42318]">{e[f.name]}</p>}
          </div>
        ))}
      </fieldset>

      <TermsCheckbox error={e.terms} termsHref="/agb-betriebe" termsLabel="AGB für Betriebe" />
      <p className="text-[14px] text-muted">
        Nach der Registrierung prüfen wir deine Angaben. Erst nach der Freigabe ist dein Profil öffentlich sichtbar. Die Einführungsphase
        ohne Grundgebühr beginnt mit der Freigabe.
      </p>
      <div><SubmitButton>Betrieb registrieren</SubmitButton></div>
    </form>
  );
}
