"use client";

import { useActionState } from "react";
import { saveTaxDetails, type TaxState } from "@/lib/actions/tax-actions";

export function TaxForm({ taxStatus, vatId, vatValid, proofType }: { taxStatus: string | null; vatId: string | null; vatValid: boolean | null; proofType: string | null }) {
  const [s, action, pending] = useActionState<TaxState, FormData>(saveTaxDetails, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Steuerstatus (Pflicht, bestimmt die Preisanzeige)</legend>
        <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="tax_status" value="regelbesteuert" defaultChecked={taxStatus === "regelbesteuert"} className="mt-1 h-4 w-4 accent-[#12704f]" />
          <span><b>Regelbesteuert</b>: Preise „inkl. 19 % MwSt.“</span></label>
        <label className="flex items-start gap-3 text-[15px]"><input type="radio" name="tax_status" value="kleinunternehmer_19" defaultChecked={taxStatus === "kleinunternehmer_19"} className="mt-1 h-4 w-4 accent-[#12704f]" />
          <span><b>Kleinunternehmer nach § 19 UStG</b>: Preise „Endpreis, keine USt nach § 19 UStG“</span></label>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-semibold">USt-IdNr. {vatId && vatValid ? `(geprüft: ${vatId})` : "(nachreichen)"}
        <input name="vat_id" placeholder="DE123456789" className="min-h-11 rounded-xl border-[1.5px] border-line-strong px-3 font-normal" />
        <span className="font-normal text-muted">Nachweis bisher: {proofType === "ust_idnr" ? "USt-IdNr. (VIES)" : proofType === "gewerbe_nachweis" ? "Gewerbeanmeldung, Steuernummer und Unternehmer-Erklärung" : "noch keiner"}. Wird eine USt-IdNr. eingetragen, prüfen wir sie sofort bei der EU.</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-brand px-5 py-2.5 font-bold text-white disabled:opacity-60">{pending ? "Prüft …" : "Steuerangaben speichern"}</button>
        {s.ok && <span role="status" className="text-[14px] font-semibold text-brand-dark">{s.ok}</span>}
        {s.error && <span role="alert" className="text-[14px] font-semibold text-[#b42318]">{s.error}</span>}
      </div>
    </form>
  );
}
