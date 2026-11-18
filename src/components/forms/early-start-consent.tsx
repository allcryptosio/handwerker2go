import { EARLY_START_CONSENT_TEXT } from "@/lib/legal/early-start";

/** Pflicht-Checkbox für Buchungen innerhalb der Widerrufsfrist. Nie vorausgewählt. */
export function EarlyStartConsentCheckbox({ error }: { error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-3 text-[15px] leading-snug">
        <input type="checkbox" name="early_start_consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#12704f]" aria-invalid={!!error} />
        <span>{EARLY_START_CONSENT_TEXT}</span>
      </label>
      {error && <p className="text-[13px] font-semibold text-[#b42318]">{error}</p>}
    </div>
  );
}
