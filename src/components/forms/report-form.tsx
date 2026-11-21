"use client";

import { useActionState } from "react";
import { submitReport, type ReportState } from "@/lib/actions/report-actions";
import { REPORT_REASONS } from "@/lib/legal/report-reasons";
import { FormAlert } from "./fields";

const inp = "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[16px] outline-none focus:border-brand";

export function ReportForm({ type, id, url }: { type: "review" | "provider_profile"; id: string; url: string }) {
  const [s, action, pending] = useActionState<ReportState, FormData>(submitReport, {});
  if (s.ok) return <FormAlert message="Danke, Ihre Meldung ist eingegangen. Wir prüfen sie zeitnah und sorgfältig. Haben Sie eine E-Mail-Adresse angegeben, erhalten Sie eine Eingangsbestätigung und später das Ergebnis." />;
  const e = s.fieldErrors ?? {};
  return (
    <form action={action} className="relative flex flex-col gap-5" noValidate>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <FormAlert error={s.error} />
      <input type="hidden" name="content_type" value={type} />
      <input type="hidden" name="content_id" value={id} />
      <input type="hidden" name="content_url" value={url} />
      <p className="rounded-card bg-soft p-4 text-[14px]">Gemeldeter Inhalt: {type === "review" ? "Bewertung" : "Betriebsprofil"}, {url}</p>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Grund
        <select name="reason" defaultValue="" className={inp}>
          <option value="" disabled>Bitte wählen</option>
          {Object.entries(REPORT_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {e.reason && <span className="text-[13px] text-[#b42318]">{e.reason}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Begründung
        <textarea name="explanation" rows={5} className={`${inp} py-3`} />
        {e.explanation && <span className="text-[13px] text-[#b42318]">{e.explanation}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Name <span className="font-normal text-muted">(optional)</span><input name="reporter_name" className={inp} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">E-Mail <span className="font-normal text-muted">(optional, für eine Rückmeldung nötig)</span><input name="reporter_email" type="email" className={inp} />
          {e.reporter_email && <span className="text-[13px] text-[#b42318]">{e.reporter_email}</span>}</label>
      </div>
      <label className="flex items-start gap-3 text-[15px]">
        <input type="checkbox" name="good_faith" className="mt-0.5 h-5 w-5 shrink-0 accent-[#12704f]" />
        <span>Ich bin in gutem Glauben überzeugt, dass die Angaben richtig und vollständig sind.</span>
      </label>
      {e.good_faith && <p className="text-[13px] font-semibold text-[#b42318]">{e.good_faith}</p>}
      <button type="submit" disabled={pending} className="self-start rounded-full bg-brand px-6 py-3 font-bold text-white disabled:opacity-60">{pending ? "Sendet …" : "Meldung absenden"}</button>
    </form>
  );
}
