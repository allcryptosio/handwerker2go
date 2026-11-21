"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { asSystem, audit } from "@/lib/db";
import { normalizeVatId } from "@/lib/partner/guard";
import { checkVatId } from "@/lib/tax/vies";

export type TaxState = { ok?: string; error?: string };

/** Steuerstatus setzen (Pflicht) und USt-IdNr. nachreichen (Weg A, mit VIES-Prüfung) */
export async function saveTaxDetails(_: TaxState, form: FormData): Promise<TaxState> {
  const u = await currentUser();
  if (!u || u.role !== "provider") return { error: "Nicht angemeldet." };
  const p = z.object({
    tax_status: z.enum(["regelbesteuert", "kleinunternehmer_19"]),
    vat_id: z.string().trim().max(20).optional().default(""),
  }).safeParse({ tax_status: form.get("tax_status"), vat_id: form.get("vat_id") ?? "" });
  if (!p.success) return { error: "Bitte wähle deinen Steuerstatus." };
  const pid = await asSystem(async (db) => (await db.query("select id from provider_profiles where user_id = $1", [u.id])).rows[0]?.id as string | undefined);
  if (!pid) return { error: "Betrieb nicht gefunden." };

  await asSystem(async (db) => {
    await db.query("update provider_profiles set tax_status = $2 where id = $1", [pid, p.data.tax_status]);
    await audit(db, { actorId: u.id, actorRole: "provider", action: "provider.tax_status", entity: "provider_profiles", entityId: pid, after: { tax_status: p.data.tax_status } });
  });

  if (p.data.vat_id) {
    const vat = normalizeVatId(p.data.vat_id);
    const r = await checkVatId(vat);
    await asSystem((db) => db.query(
      "insert into vies_checks (provider_id, vat_id, valid, request_identifier, name, address, error, checked_at, purpose) values ($1,$2,$3,$4,$5,$6,$7,$8,'nachreichen')",
      [pid, vat, r.ok ? r.valid : null, r.ok ? r.requestIdentifier : null, r.ok ? r.name : null, r.ok ? r.address : null, r.ok ? null : r.error, r.checkedAt],
    ));
    if (!r.ok) return { error: "Steuerstatus gespeichert. Die EU-Prüfung (VIES) ist gerade nicht erreichbar; bitte trage die USt-IdNr. später noch einmal ein." };
    if (!r.valid) return { error: "Steuerstatus gespeichert. Diese USt-IdNr. ist laut EU-Prüfung (VIES) nicht gültig." };
    await asSystem(async (db) => {
      await db.query(
        `update provider_profiles set vat_id = $2, vat_id_valid = true, vat_id_checked_at = $3, vies_request_id = $4, vies_name = $5, vies_address = $6, business_proof_type = 'ust_idnr' where id = $1`,
        [pid, vat, r.checkedAt, r.requestIdentifier, r.name, r.address],
      );
      await audit(db, { actorId: u.id, actorRole: "provider", action: "provider.vat_id", entity: "provider_profiles", entityId: pid, after: { vat, request: r.requestIdentifier } });
    });
    revalidatePath("/dashboard");
    return { ok: "Gespeichert. Deine USt-IdNr. ist gültig und geprüft." };
  }
  revalidatePath("/dashboard");
  return { ok: "Steuerstatus gespeichert." };
}
