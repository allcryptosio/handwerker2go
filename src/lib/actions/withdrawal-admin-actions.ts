"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { asSystem, audit, withDb } from "@/lib/db";
import { decideWertersatz, matchBooking, processWithdrawal } from "@/lib/booking/withdrawal";

const id = z.string().uuid();
const cents = (v: FormDataEntryValue | null) => Math.round(Number(String(v ?? "0").replace(",", ".")) * 100);

async function admin() {
  const u = await currentUser();
  if (!u || u.role !== "admin") redirect("/");
  return u;
}

/** Admin: volle Erstattung oder Erstattung abzüglich Wertersatz */
export async function adminRefundWithdrawal(form: FormData) {
  const u = await admin();
  const wid = id.parse(form.get("id"));
  const keep = Math.max(0, cents(form.get("wertersatz")));
  await decideWertersatz(wid, keep, u.id);
  revalidatePath("/admin/widerrufe");
}

/** Admin: nach manueller Prüfung als verspätet bzw. ausgeschlossen markieren (Antwort mit Textbaustein B.2 schickt ein Mensch) */
export async function adminRejectWithdrawal(form: FormData) {
  const u = await admin();
  const wid = id.parse(form.get("id"));
  const status = form.get("kind") === "excluded" ? "rejected_excluded" : "rejected_late";
  const note = String(form.get("note") ?? "").slice(0, 500);
  await asSystem(async (db) => {
    await db.query("update withdrawals set status = $2, handled_by = $3, handled_at = now(), notes = coalesce(notes || E'\\n', '') || $4 where id = $1 and status in ('received', 'unmatched')", [wid, status, u.id, `Manuell: ${status}. ${note}`]);
    await audit(db, { actorId: u.id, actorRole: "admin", action: `withdrawal.${status}`, entity: "withdrawals", entityId: wid, after: { note } });
  });
  revalidatePath("/admin/widerrufe");
}

/** Admin: nicht zugeordneten Widerruf einer Buchung zuordnen (gilt danach als geprüft) und bearbeiten */
export async function adminAssignWithdrawal(form: FormData) {
  const u = await admin();
  const wid = id.parse(form.get("id"));
  const b = await matchBooking({ bookingNumber: String(form.get("number") ?? "") });
  if (!b) return;
  await asSystem(async (db) => {
    await db.query("update withdrawals set booking_id = $2, status = 'received', verified = true, case_kind = null, notes = coalesce(notes || E'\\n', '') || $3 where id = $1", [wid, b.id, `Zugeordnet durch Admin zu ${b.number}`]);
    await audit(db, { actorId: u.id, actorRole: "admin", action: "withdrawal.assign", entity: "withdrawals", entityId: wid, after: { booking: b.number } });
  });
  await processWithdrawal(wid);
  revalidatePath("/admin/widerrufe");
}

/** Betrieb: Wertersatz mitteilen (nur bei eigenen Buchungen, nur bei gespeicherter Erklärung zum vorzeitigen Beginn) */
export async function providerDecideWertersatz(form: FormData) {
  const u = await currentUser();
  if (!u || u.role !== "provider") redirect("/");
  const wid = id.parse(form.get("id"));
  const ok = await withDb({ userId: u.id, role: "provider" }, async (db) =>
    (await db.query(
      `select 1 from withdrawals w join bookings b on b.id = w.booking_id join provider_profiles p on p.id = b.provider_id
        where w.id = $1 and p.user_id = $2 and w.status = 'received' and w.case_kind = 'wertersatz'`,
      [wid, u.id],
    )).rowCount === 1,
  );
  if (!ok) redirect("/dashboard/termine");
  await decideWertersatz(wid, Math.max(0, cents(form.get("wertersatz"))), u.id);
  revalidatePath("/dashboard/termine");
}
