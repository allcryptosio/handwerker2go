"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { asSystem, audit } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { findContactData } from "@/lib/partner/guard";
import { verifyReviewOptOut } from "@/lib/review-optout";

export type ReviewFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  bookingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Bitte vergib 1 bis 5 Sterne").max(5, "Bitte vergib 1 bis 5 Sterne"),
  body: z.string().trim().max(1000, "Höchstens 1.000 Zeichen").optional().default(""),
});

const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";

/**
 * Bewertung abgeben (AGB für Kunden § 7): nur der Kunde der Buchung, nur nach dem Termin,
 * nur wenn der Betrieb den Auftrag nicht abgesagt hat, eine Bewertung pro Buchung.
 */
export async function submitReview(_: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const u = await currentUser();
  if (!u) return { error: "Bitte melde dich an." };
  const parsed = schema.safeParse({ bookingId: form.get("bookingId"), rating: form.get("rating") ?? 0, body: form.get("body") ?? "" });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    if (fe.bookingId) return { error: "Diese Buchung wurde nicht gefunden." };
    return { fieldErrors: fe };
  }
  const { bookingId, rating, body } = parsed.data;
  if (body && findContactData(body)) return { fieldErrors: { body: "Bitte keine Telefonnummern, E-Mail-Adressen oder Links in die Bewertung schreiben." } };

  const result = await asSystem(async (db) => {
    const b = (await db.query(
      `select b.id, b.customer_id, b.provider_id, b.status, b.ends_at, b.service_name, p.company_name, pu.email p_email
         from bookings b join provider_profiles p on p.id = b.provider_id join "user" pu on pu.id = p.user_id where b.id = $1`,
      [bookingId],
    )).rows[0];
    if (!b || b.customer_id !== u.id) return { error: "Diese Buchung gehört nicht zu deinem Konto." };
    const done = b.status === "completed" || (b.status === "confirmed" && new Date(b.ends_at) < new Date());
    if (!done) return { error: "Bewerten kannst du nach dem Termin." };
    const r = await db.query(
      `insert into reviews (booking_id, provider_id, customer_id, rating, body) values ($1, $2, $3, $4, nullif($5, ''))
         on conflict (booking_id) do nothing returning id`,
      [b.id, b.provider_id, u.id, rating, body],
    );
    if (!r.rowCount) return { error: "Du hast diese Buchung schon bewertet." };
    await audit(db, { actorId: u.id, actorRole: "customer", action: "review.create", entity: "reviews", entityId: r.rows[0].id, after: { rating } });
    return { ok: true as const, b };
  });
  if ("error" in result) return { error: result.error };

  const { b } = result;
  await sendMail({
    to: b.p_email,
    template: "review_new_provider",
    subject: `Neue Bewertung: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`,
    heading: "Du hast eine neue Bewertung",
    paragraphs: [
      `Ein Kunde hat deinen Auftrag „${b.service_name}“ mit ${rating} von 5 Sternen bewertet.`,
      ...(body ? [`„${body}“`] : []),
      "Bewertungen zählen in die Reihenfolge der Suchergebnisse. Hältst du eine Bewertung für unzulässig, antworte einfach auf diese E-Mail.",
    ],
    button: { label: "Zum Dashboard", url: `${base()}/dashboard` },
  }).catch(console.error);

  revalidatePath(`/buchung/${bookingId}`);
  return { ok: true };
}

/** Admin: Bewertung ausblenden oder wieder einblenden (nur bei unzulässigen Inhalten, AGB § 7 Abs. 2) */
export async function moderateReview(form: FormData) {
  const u = await currentUser();
  if (!u || u.role !== "admin") redirect("/");
  const id = z.string().uuid().parse(form.get("id"));
  const show = form.get("show") === "1";
  const reason = String(form.get("reason") ?? "").trim().slice(0, 300) || null;
  await asSystem(async (db) => {
    const before = (await db.query("select visible, hidden_reason from reviews where id = $1", [id])).rows[0];
    await db.query(
      show
        ? "update reviews set visible = true, hidden_reason = null, hidden_at = null where id = $1"
        : "update reviews set visible = false, hidden_reason = $2, hidden_at = now() where id = $1",
      show ? [id] : [id, reason],
    );
    await audit(db, { actorId: u.id, actorRole: "admin", action: show ? "review.show" : "review.hide", entity: "reviews", entityId: id, before, after: { visible: show, reason } });
  });
  revalidatePath("/admin/bewertungen");
}

/** Widerspruch gegen Bewertungsanfragen per E-Mail (Link in jeder Anfrage, ohne Login) */
export async function optOutReviewMails(_: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const userId = String(form.get("u") ?? "");
  const token = String(form.get("t") ?? "");
  if (!userId || !verifyReviewOptOut(userId, token)) return { error: "Der Link ist ungültig. Schreib uns einfach eine E-Mail, dann tragen wir dich aus." };
  await asSystem(async (db) => {
    await db.query("update customer_profiles set review_mails_opt_out_at = coalesce(review_mails_opt_out_at, now()) where user_id = $1", [userId]);
    await audit(db, { actorId: userId, actorRole: "customer", action: "review_mails.opt_out", entity: "customer_profiles", entityId: userId });
  });
  return { ok: true };
}
