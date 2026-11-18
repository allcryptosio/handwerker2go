"use client";

import { useFormStatus } from "react-dom";

const inputCls =
  "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[16px] outline-none transition-colors focus:border-brand aria-[invalid=true]:border-[#b42318]";

export function Field({
  name, label, type = "text", error, hint, autoComplete, required = true, defaultValue, inputMode, textarea, rows = 5,
}: {
  name: string; label: string; type?: string; error?: string; hint?: string; autoComplete?: string; required?: boolean;
  defaultValue?: string; inputMode?: "numeric" | "tel" | "email" | "text"; textarea?: boolean; rows?: number;
}) {
  const id = `f-${name}`;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={rows} required={required} defaultValue={defaultValue} aria-invalid={!!error} aria-describedby={describedBy}
          className={`${inputCls} py-3`} />
      ) : (
        <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} defaultValue={defaultValue} inputMode={inputMode}
          aria-invalid={!!error} aria-describedby={describedBy} className={inputCls} />
      )}
      {hint && <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="text-[13px] font-semibold text-[#b42318]">{error}</p>}
    </div>
  );
}

export function TermsCheckbox({ error, termsHref = "/agb", termsLabel = "AGB" }: { error?: string; termsHref?: string; termsLabel?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-3 text-[15px] leading-snug">
        <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#12704f]" aria-invalid={!!error} />
        <span>
          Ich akzeptiere die <a href={termsHref} target="_blank" className="font-semibold text-brand underline">{termsLabel}</a> und habe die{" "}
          <a href="/datenschutz" target="_blank" className="font-semibold text-brand underline">Datenschutzerklärung</a> gelesen.
        </span>
      </label>
      {error && <p className="text-[13px] font-semibold text-[#b42318]">{error}</p>}
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="min-h-[52px] rounded-full bg-brand px-7 font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
      {pending ? "Bitte warten …" : children}
    </button>
  );
}

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error) return <p role="alert" className="rounded-xl border-[1.5px] border-[#b42318] bg-[#fef3f2] p-4 text-[15px]">{error}</p>;
  if (message) return <p role="status" className="rounded-xl border-[1.5px] border-brand bg-mint p-4 text-[15px]">{message}</p>;
  return null;
}
