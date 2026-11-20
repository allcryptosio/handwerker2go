"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/lib/actions/review-actions";
import { FormAlert, SubmitButton } from "@/components/forms/fields";

const words = ["", "Schlecht", "Geht so", "In Ordnung", "Gut", "Sehr gut"];

export function ReviewForm({ bookingId, companyName }: { bookingId: string; companyName: string }) {
  const [state, action] = useActionState<ReviewFormState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  if (state.ok) return <FormAlert message="Danke für deine Bewertung! Sie hilft anderen Kunden bei der Wahl." />;
  const e = state.fieldErrors ?? {};
  const shown = hover || rating;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert error={state.error} />
      <input type="hidden" name="bookingId" value={bookingId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Wie zufrieden warst du mit {companyName}?</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} className="peer sr-only" checked={rating === n} onChange={() => setRating(n)} aria-label={`${n} von 5 Sternen`} />
              <span className={`block text-[36px] leading-none transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand ${n <= shown ? "text-star" : "text-line-strong"}`} aria-hidden="true">★</span>
            </label>
          ))}
          <span className="ml-3 text-[15px] font-semibold text-ink-soft" aria-live="polite">{words[shown]}</span>
        </div>
        {e.rating && <p className="text-[13px] font-semibold text-[#b42318]">{e.rating}</p>}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-body" className="text-sm font-semibold">Was war gut, was nicht? <span className="font-normal text-muted">(optional)</span></label>
        <textarea id="f-body" name="body" rows={4} maxLength={1000} aria-invalid={!!e.body} aria-describedby={e.body ? "f-body-err" : "f-body-hint"}
          className="w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] outline-none focus:border-brand aria-[invalid=true]:border-[#b42318]" />
        <p id="f-body-hint" className="text-[13px] text-muted">Öffentlich sichtbar sind nur Sterne, Text und Datum, nicht dein Name. Bitte sachlich bleiben.</p>
        {e.body && <p id="f-body-err" className="text-[13px] font-semibold text-[#b42318]">{e.body}</p>}
      </div>
      <SubmitButton>Bewertung abschicken</SubmitButton>
    </form>
  );
}
