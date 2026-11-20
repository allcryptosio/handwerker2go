"use client";

import { useActionState } from "react";
import { optOutReviewMails, type ReviewFormState } from "@/lib/actions/review-actions";
import { FormAlert, SubmitButton } from "./fields";

export function ReviewOptOutForm({ u, t }: { u: string; t: string }) {
  const [state, action] = useActionState<ReviewFormState, FormData>(optOutReviewMails, {});
  if (state.ok) return <FormAlert message="Erledigt. Du bekommst keine Bitten um Bewertung mehr. Buchungsbestätigungen und Terminerinnerungen schicken wir dir weiterhin." />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormAlert error={state.error} />
      <input type="hidden" name="u" value={u} />
      <input type="hidden" name="t" value={t} />
      <SubmitButton>Bewertungsanfragen abbestellen</SubmitButton>
    </form>
  );
}
