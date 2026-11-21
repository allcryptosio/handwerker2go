"use client";

import { useActionState } from "react";
import { customerCancelAction } from "@/lib/actions/booking-actions";

export function CustomerCancelButton({ id, refundText }: { id: string; refundText: string }) {
  const [state, action, pending] = useActionState(customerCancelAction, {});
  if (state.ok) return <p className="font-semibold text-brand-dark">Storniert. {state.message ?? refundText}</p>;
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Buchung wirklich stornieren?")) e.preventDefault(); }} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="self-start rounded-full border-[1.5px] border-[#b42318] px-5 py-2.5 font-bold text-[#b42318] hover:bg-[#fef3f2] disabled:opacity-60">
        {pending ? "Bitte warten …" : "Buchung stornieren"}
      </button>
      {state.error && <p role="alert" className="text-[14px] font-semibold text-[#b42318]">{state.error}</p>}
    </form>
  );
}
