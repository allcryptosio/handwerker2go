"use client";

import { useActionState } from "react";
import { withdrawalStep, type WithdrawalState } from "@/lib/actions/withdrawal-actions";
import { FormAlert } from "./fields";

const input = "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[16px] outline-none focus:border-brand aria-[invalid=true]:border-[#b42318]";
const btn = "min-h-[52px] rounded-full bg-[#b42318] px-7 font-bold text-white hover:bg-[#8a1c12] disabled:opacity-60";

function F({ name, label, type = "text", value, error, required = true, autoComplete }: { name: string; label: string; type?: string; value?: string; error?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`w-${name}`} className="text-sm font-semibold">{label}{!required && <span className="font-normal text-muted"> (falls keine Buchungsnummer)</span>}</label>
      <input id={`w-${name}`} name={name} type={type} defaultValue={value} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `w-${name}-err` : undefined} className={input} />
      {error && <p id={`w-${name}-err`} className="text-[13px] font-semibold text-[#b42318]">{error}</p>}
    </div>
  );
}

/** Hidden-Felder, damit Schritt 2 die Angaben aus Schritt 1 mitschickt */
function Carry({ values }: { values: Record<string, string> }) {
  return <>{Object.entries(values).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}</>;
}

/** Unsichtbares Honeypot-Feld (Spam-Schutz ohne Rätsel) */
function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function WithdrawalForm({ initial }: { initial: Record<string, string> }) {
  const [state, action, pending] = useActionState<WithdrawalState, FormData>(withdrawalStep, { step: 1, values: initial });
  const v = state.values ?? initial;
  const e = state.fieldErrors ?? {};

  if (state.step === 3 && state.receipt) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-panel border-[1.5px] border-brand bg-mint p-6">
        <h2 className="text-xl font-bold text-brand-dark">Widerruf eingegangen</h2>
        <p className="text-[16px]">Ihr Widerruf ist am {state.receipt.date} um {state.receipt.time} Uhr eingegangen. Wir haben Ihnen eine Eingangsbestätigung an {state.receipt.email} geschickt.</p>
      </div>
    );
  }

  if (state.step === 2 && state.summary) {
    return (
      <form action={action} className="relative flex flex-col gap-5">
        <Honeypot />
        <Carry values={v} />
        <FormAlert error={state.error} />
        <dl className="grid gap-3 rounded-panel border border-line p-6 text-[16px] sm:grid-cols-[200px_1fr]">
          <dt className="text-muted">Name</dt><dd className="font-semibold">{v.name}</dd>
          <dt className="text-muted">Vertrag</dt><dd className="font-semibold">{state.summary.reference}</dd>
          {state.summary.details && (
            <>
              <dt className="text-muted">Leistung</dt><dd className="font-semibold">{state.summary.details.service}</dd>
              <dt className="text-muted">Betrieb</dt><dd className="font-semibold">{state.summary.details.provider}</dd>
              <dt className="text-muted">Termin</dt><dd className="font-semibold">{state.summary.details.appointment}</dd>
            </>
          )}
          <dt className="text-muted">Eingangsbestätigung an</dt><dd className="font-semibold">{v.email}</dd>
          <dt className="text-muted">Erklärung</dt><dd className="font-semibold">„Hiermit widerrufe ich den oben bezeichneten Vertrag.“</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" name="intent" value="confirm" disabled={pending} className={btn}>Widerruf bestätigen</button>
          <button type="submit" name="intent" value="back" disabled={pending} className="font-semibold text-brand underline">Angaben ändern</button>
        </div>
      </form>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-5" noValidate>
      <Honeypot />
      <FormAlert error={state.error} />
      <F name="name" label="Ihr Name" value={v.name} error={e.name} autoComplete="name" />
      <F name="bookingNumber" label="Buchungsnummer" value={v.bookingNumber} error={e.bookingNumber} required={false} />
      <fieldset className="flex flex-col gap-4 rounded-panel border border-line p-5">
        <legend className="px-1 text-sm font-semibold">Buchungsnummer nicht zur Hand? Dann bitte diese drei Angaben</legend>
        <F name="bookingDate" label="Datum der Buchung" type="date" value={v.bookingDate} error={e.bookingDate} required={false} />
        <F name="providerName" label="Betrieb" value={v.providerName} error={e.providerName} required={false} />
        <F name="serviceName" label="Leistung" value={v.serviceName} error={e.serviceName} required={false} />
      </fieldset>
      <F name="email" label="E-Mail-Adresse für die Eingangsbestätigung" type="email" value={v.email} error={e.email} autoComplete="email" />
      <div>
        <button type="submit" name="intent" value="preview" disabled={pending} className={btn}>Weiter zur Bestätigung</button>
      </div>
    </form>
  );
}
