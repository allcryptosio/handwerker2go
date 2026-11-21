"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { issueCreditNote, releaseOnHold } from "@/lib/invoices/service";

/** Angehaltene Rechnung nach Klärung freigeben (erneute Prüfung, dann Nummer) */
export async function releaseInvoice(form: FormData) {
  const u = await currentUser();
  if (!u || u.role !== "admin") redirect("/");
  const r = await releaseOnHold(z.string().uuid().parse(form.get("id")), u.id);
  revalidatePath("/admin/rechnungen");
  if (!r.ok) redirect(`/admin/rechnungen?fehler=${encodeURIComponent(r.reason ?? "nicht freigegeben")}`);
}

/** Ausgestellte Rechnung stornieren: nur per Gutschrift mit eigener Nummer */
export async function creditInvoice(form: FormData) {
  const u = await currentUser();
  if (!u || u.role !== "admin") redirect("/");
  await issueCreditNote(z.string().uuid().parse(form.get("id")), u.id);
  revalidatePath("/admin/rechnungen");
}
