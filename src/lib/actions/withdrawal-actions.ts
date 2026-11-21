"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { contractReference, fmtDate, fmtTime, isVerified, matchBooking, rateLimited, submitWithdrawal } from "@/lib/booking/withdrawal";

export type WithdrawalState = {
  step: 1 | 2 | 3;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  summary?: { reference: string; matched: boolean; details?: { service: string; provider: string; appointment: string } };
  receipt?: { date: string; time: string; email: string };
};

const schema = z
  .object({
    name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an").max(120),
    bookingNumber: z.string().trim().max(40).optional().default(""),
    bookingDate: z.string().trim().optional().default(""),
    providerName: z.string().trim().max(120).optional().default(""),
    serviceName: z.string().trim().max(120).optional().default(""),
    email: z.string().trim().toLowerCase().email("Bitte geben Sie eine gültige E-Mail-Adresse an").max(254),
  })
  .refine((d) => d.bookingNumber || (d.bookingDate && d.providerName && d.serviceName), {
    path: ["bookingNumber"],
    message: "Bitte die Buchungsnummer angeben oder Datum der Buchung, Betrieb und Leistung",
  });

async function clientMeta() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent") };
}

const pick = (form: FormData) => Object.fromEntries(["name", "bookingNumber", "bookingDate", "providerName", "serviceName", "email"].map((k) => [k, String(form.get(k) ?? "")]));

/** Schritt 1 → 2: Angaben prüfen und Zusammenfassung zeigen. Buchungsdetails nur, wenn die Zuordnung sicher ist. */
export async function previewWithdrawal(_: WithdrawalState, form: FormData): Promise<WithdrawalState> {
  const values = pick(form);
  if (String(form.get("website") ?? "")) return { step: 1, values, error: "Die Anfrage konnte nicht verarbeitet werden." }; // Honeypot
  if (form.get("back") === "1") return { step: 1, values };
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    return { step: 1, values, fieldErrors: fe };
  }
  const u = await currentUser();
  const b = await matchBooking(parsed.data);
  const sure = b ? isVerified(b, parsed.data.email, u?.id) : false;
  return {
    step: 2,
    values,
    summary: {
      reference: contractReference(parsed.data, sure ? b : null),
      matched: !!b,
      details: b && sure ? { service: b.service_name, provider: b.company_name, appointment: `${fmtDate(new Date(b.starts_at))}, ${fmtTime(new Date(b.starts_at))} Uhr` } : undefined,
    },
  };
}

/** Schritt 2 → 3: „Widerruf bestätigen“ */
export async function confirmWithdrawal(prev: WithdrawalState, form: FormData): Promise<WithdrawalState> {
  const values = pick(form);
  if (String(form.get("website") ?? "")) return { step: 1, values, error: "Die Anfrage konnte nicht verarbeitet werden." };
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { step: 1, values, error: "Bitte prüfen Sie Ihre Angaben." };
  const meta = await clientMeta();
  if (await rateLimited(meta.ip)) return { ...prev, step: 2, values, error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut oder schreiben Sie an info@handwerker2go.com." };
  const u = await currentUser();
  const r = await submitWithdrawal({ ...parsed.data, ...meta, userId: u?.id ?? null, source: "online_form" });
  return { step: 3, values, receipt: { date: fmtDate(r.receivedAt), time: fmtTime(r.receivedAt), email: parsed.data.email } };
}

/** Ein Einstieg für das zweistufige Formular: intent = preview | confirm | back */
export async function withdrawalStep(prev: WithdrawalState, form: FormData): Promise<WithdrawalState> {
  const intent = String(form.get("intent") ?? "preview");
  if (intent === "back") return { step: 1, values: pick(form) };
  if (intent === "confirm") return confirmWithdrawal(prev, form);
  return previewWithdrawal(prev, form);
}
