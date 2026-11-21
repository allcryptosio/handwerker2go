"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EarlyStartConsentCheckbox } from "@/components/forms/early-start-consent";
import { FormAlert, TermsCheckbox } from "@/components/forms/fields";
import { acceptOffer, createOffer, type OfferState } from "@/lib/actions/offer-actions";
import { REVIEW_OPTIN_TEXT } from "@/lib/legal/review-optin";

const inp = "min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3 text-[15px]";

export function CreateOfferForm({ bookingId }: { bookingId: string }) {
  const [s, action, pending] = useActionState<OfferState, FormData>(createOffer, {});
  if (s.ok) return <FormAlert message="Angebot verschickt. Der Kunde kann es online annehmen und bezahlen." />;
  const e = s.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <FormAlert error={s.error} />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Positionen (Endpreise inkl. Anfahrt)</span>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <input name={`pos_text_${i}`} placeholder={i === 0 ? "z. B. Kellerraum räumen und entsorgen" : "weitere Position (optional)"} className={inp} />
            <input name={`pos_eur_${i}`} placeholder="Betrag €" inputMode="decimal" className={inp} />
            {e[`pos_${i}`] && <p className="text-[13px] font-semibold text-[#b42318] sm:col-span-2">{e[`pos_${i}`]}</p>}
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">Termin am<input type="date" name="datum" className={inp} />{e.datum && <span className="text-[13px] text-[#b42318]">{e.datum}</span>}</label>
        <label className="flex flex-col gap-1 text-sm font-semibold">um<input type="time" name="zeit" step={900} className={inp} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Dauer (Std.)<input name="dauer" defaultValue="3" inputMode="decimal" className={inp} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Gültig (Tage)<input name="gueltig" defaultValue="14" inputMode="numeric" className={inp} /></label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-semibold">Hinweis an den Kunden (optional)<textarea name="note" rows={3} className={`${inp} py-2`} /></label>
      <button type="submit" disabled={pending} className="self-start rounded-full bg-brand px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "Sendet …" : "Angebot senden"}</button>
    </form>
  );
}

export function AcceptOfferForm({ offerId, needsConsent, cancellationText }: { offerId: string; needsConsent: boolean; cancellationText: string }) {
  const [s, action, pending] = useActionState<OfferState, FormData>(acceptOffer, {});
  const e = s.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="offerId" value={offerId} />
      <FormAlert error={s.error} />
      <div className="flex flex-col gap-4 rounded-panel border border-line bg-soft p-5">
        <TermsCheckbox error={e.terms} />
        {needsConsent && <EarlyStartConsentCheckbox error={e.early_start_consent} />}
        <label className="flex items-start gap-3 text-[15px] leading-snug">
          <input type="checkbox" name="review_optin" className="mt-0.5 h-5 w-5 shrink-0 accent-[#12704f]" />
          <span>{REVIEW_OPTIN_TEXT}</span>
        </label>
        <p className="text-[13px] text-muted">{cancellationText}</p>
        <p className="text-[13px] text-muted">
          Dein Vertragspartner ist der Betrieb. Es gilt die <Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>; du bekommst sie mit der Vertragsbestätigung per E-Mail.
        </p>
      </div>
      <button type="submit" disabled={pending} className="min-h-[52px] self-start rounded-full bg-brand px-7 font-bold text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Bitte warten …" : "Angebot zahlungspflichtig annehmen"}
      </button>
      <p className="text-[13px] text-muted">Weiter zur sicheren Bezahlung bei Stripe</p>
    </form>
  );
}
