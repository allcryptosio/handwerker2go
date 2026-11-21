"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { LEGAL } from "@/config/legal";
import { currentUser } from "@/lib/auth";
import { asSystem, audit } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { REPORT_REASONS } from "@/lib/legal/report-reasons";

export type ReportState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";

const schema = z.object({
  content_type: z.enum(["review", "provider_profile"]),
  content_id: z.string().uuid(),
  content_url: z.string().max(300).optional().default(""),
  reason: z.enum(["rechtswidrig", "beleidigung", "falsche_tatsachen", "urheberrecht", "sonstiges"], { message: "Bitte einen Grund wählen" }),
  explanation: z.string().trim().min(10, "Bitte begründen Sie die Meldung (mindestens 10 Zeichen)").max(3000),
  reporter_name: z.string().trim().max(120).optional().default(""),
  reporter_email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben")]).optional().default(""),
});

/** Meldung entgegennehmen (ohne Login), Eingangsbestätigung an den Meldenden, Hinweis an den Admin */
export async function submitReport(_: ReportState, form: FormData): Promise<ReportState> {
  if (String(form.get("website") ?? "")) return { error: "Die Meldung konnte nicht verarbeitet werden." };
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) {
    const fe: Record<string, string> = {};
    for (const i of p.error.issues) fe[String(i.path[0])] ??= i.message;
    return { fieldErrors: fe };
  }
  if (form.get("good_faith") !== "on") return { fieldErrors: { good_faith: "Bitte bestätigen Sie diese Erklärung" } };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const d = p.data;
  const row = await asSystem(async (db) => {
    const recent = (await db.query("select count(*)::int n from content_reports where ip = $1 and created_at > now() - interval '1 hour'", [ip])).rows[0].n;
    if (ip && recent >= 10) return null;
    const r = await db.query(
      `insert into content_reports (content_type, content_id, content_url, reason, explanation, reporter_name, reporter_email, good_faith, ip)
       values ($1,$2,nullif($3,''),$4,$5,nullif($6,''),nullif($7,''),true,$8) returning id, created_at`,
      [d.content_type, d.content_id, d.content_url, d.reason, d.explanation, d.reporter_name, d.reporter_email, ip],
    );
    await audit(db, { actorRole: "anon", action: "content_report.received", entity: "content_reports", entityId: r.rows[0].id, after: { type: d.content_type, reason: d.reason } });
    return r.rows[0] as { id: string; created_at: Date };
  });
  if (!row) return { error: "Zu viele Meldungen. Bitte versuchen Sie es später erneut oder schreiben Sie an " + LEGAL.dsaContactEmail + "." };
  if (d.reporter_email) {
    await sendMail({
      to: d.reporter_email, template: "content_report_receipt", subject: "Eingangsbestätigung Ihrer Meldung",
      heading: d.reporter_name ? `Guten Tag ${d.reporter_name},` : "Guten Tag,",
      paragraphs: [
        `wir haben Ihre Meldung vom ${new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date(row.created_at))} Uhr erhalten (Grund: ${REPORT_REASONS[d.reason]}).`,
        "Wir prüfen sie zeitnah und sorgfältig und teilen Ihnen das Ergebnis mit.",
        `handwerker2go, ${LEGAL.operatorName}, ${LEGAL.address}`,
      ],
    }).catch(console.error);
  }
  if (process.env.ADMIN_EMAIL) {
    await sendMail({ to: process.env.ADMIN_EMAIL, template: "content_report_admin", subject: "Neue Meldung eines Inhalts", heading: "Neue Meldung", paragraphs: [`Grund: ${REPORT_REASONS[d.reason]}. ${d.explanation.slice(0, 300)}`], button: { label: "Meldungen prüfen", url: `${base()}/admin/meldungen` } }).catch(console.error);
  }
  return { ok: true };
}

/** Admin entscheidet: entfernen, einschränken oder zurückweisen. Betroffener erhält Begründung (H.2), Meldender das Ergebnis. */
export async function decideReport(form: FormData) {
  const u = await currentUser();
  if (!u || u.role !== "admin") redirect("/");
  const p = z.object({
    id: z.string().uuid(),
    decision: z.enum(["removed", "restricted", "rejected"]),
    reason: z.string().trim().min(5).max(500),
    facts: z.string().trim().min(5).max(1000),
    measure: z.string().trim().max(300).optional().default(""),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) redirect("/admin/meldungen?fehler=1");
  const d = p.data;
  const r = await asSystem(async (db) => {
    const rep = (await db.query("select * from content_reports where id = $1 and status = 'received'", [d.id])).rows[0];
    if (!rep) return null;
    let affectedEmail: string | null = null, summary = "";
    if (rep.content_type === "review") {
      const rv = (await db.query(`select r.id, r.body, cu.email from reviews r join "user" cu on cu.id = r.customer_id where r.id = $1`, [rep.content_id])).rows[0];
      affectedEmail = rv?.email ?? null; summary = `Bewertung: „${(rv?.body ?? "ohne Text").slice(0, 120)}“`;
      if (rv && d.decision !== "rejected") await db.query("update reviews set visible = false, hidden_reason = $2, hidden_at = now() where id = $1", [rep.content_id, `DSA-Meldung: ${d.reason}`]);
    } else {
      const pv = (await db.query(`select p.company_name, u.email from provider_profiles p join "user" u on u.id = p.user_id where p.id = $1`, [rep.content_id])).rows[0];
      affectedEmail = pv?.email ?? null; summary = `Profil von ${pv?.company_name ?? "Betrieb"}`;
    }
    await db.query("update content_reports set status = $2, decision_reason = $3, decision_facts = $4, decided_by = $5, decided_at = now() where id = $1", [d.id, d.decision, d.reason, d.facts, u.id]);
    await audit(db, { actorId: u.id, actorRole: "admin", action: `content_report.${d.decision}`, entity: "content_reports", entityId: d.id, after: { reason: d.reason } });
    return { rep, affectedEmail, summary };
  });
  if (!r) redirect("/admin/meldungen");
  const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date());
  if (d.decision !== "rejected" && r.affectedEmail) {
    await sendMail({
      to: r.affectedEmail, template: "content_decision_affected", subject: "Entscheidung zu Ihrem Inhalt auf handwerker2go",
      heading: "Entscheidung zu Ihrem Inhalt",
      paragraphs: [
        `Wir haben folgenden Inhalt ${d.decision === "removed" ? "entfernt" : `eingeschränkt (${d.measure || "Sichtbarkeit beschränkt"})`}: ${r.summary}${r.rep.content_url ? `, ${r.rep.content_url}` : ""}. Datum: ${date}.`,
        `Grund: ${d.reason}`,
        `Tatsachen: ${d.facts}. Die Entscheidung beruht auf einer Meldung und wurde nicht automatisiert getroffen.`,
        "Ihre Möglichkeiten: Sie können der Entscheidung per Antwort auf diese E-Mail widersprechen; wir prüfen sie dann erneut. Daneben steht Ihnen der Rechtsweg offen.",
      ],
    }).catch(console.error);
    await asSystem((db) => db.query("update content_reports set affected_notified_at = now() where id = $1", [d.id]));
  }
  if (r.rep.reporter_email) {
    await sendMail({
      to: r.rep.reporter_email, template: "content_report_result", subject: "Ergebnis Ihrer Meldung",
      heading: "Ergebnis Ihrer Meldung",
      paragraphs: [
        d.decision === "rejected" ? `Wir haben den gemeldeten Inhalt geprüft und nicht entfernt. Begründung: ${d.reason}` : `Wir haben den gemeldeten Inhalt ${d.decision === "removed" ? "entfernt" : "eingeschränkt"}. Begründung: ${d.reason}`,
        "Die Entscheidung wurde nicht automatisiert getroffen. Sie können per Antwort auf diese E-Mail widersprechen; daneben steht Ihnen der Rechtsweg offen.",
      ],
    }).catch(console.error);
    await asSystem((db) => db.query("update content_reports set reporter_notified_at = now() where id = $1", [d.id]));
  }
  revalidatePath("/admin/meldungen");
}
