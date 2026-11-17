"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, currentUser } from "@/lib/auth";
import { asSystem, audit, withDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { detectDocumentType, storage } from "@/lib/storage";

export type FormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; message?: string };

const password = z.string().min(10, "Mindestens 10 Zeichen").max(128, "Höchstens 128 Zeichen");
const email = z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse eingeben").max(254);
const terms = z.literal("on", { error: "Bitte stimme den AGB und der Datenschutzerklärung zu" });

function fieldErrors(e: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

function authMessage(e: unknown): string {
  if (e instanceof APIError) {
    const code = (e.body as { code?: string } | undefined)?.code ?? "";
    if (code.includes("USER_ALREADY_EXISTS")) return "Mit dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich an.";
    if (code.includes("EMAIL_NOT_VERIFIED")) return "Bitte bestätige zuerst deine E-Mail-Adresse. Wir haben dir den Link noch einmal geschickt.";
    if (code.includes("INVALID_EMAIL_OR_PASSWORD")) return "E-Mail-Adresse oder Passwort sind nicht korrekt.";
    if (code.includes("PASSWORD")) return "Das Passwort erfüllt die Anforderungen nicht.";
  }
  console.error(e);
  return "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";
}


/**
 * Better Auth meldet bei bereits registrierter E-Mail absichtlich Erfolg mit einer Schein-ID
 * (Schutz vor Konto-Ausspähen). Wir prüfen deshalb, ob das Konto wirklich neu angelegt wurde,
 * und informieren sonst die bestehende Adresse per E-Mail, ohne das auf der Seite zu verraten.
 */
async function isNewUser(id: string) {
  return asSystem(async (db) => (await db.query(`select 1 from "user" where id = $1`, [id])).rowCount === 1);
}
async function notifyExistingAccount(to: string) {
  await sendMail({
    to, template: "account-exists", subject: "Du hast bereits ein Konto bei handwerker2go",
    heading: "Hallo,",
    paragraphs: [
      "jemand hat gerade versucht, mit dieser E-Mail-Adresse ein neues Konto anzulegen. Es gibt aber schon ein Konto mit dieser Adresse.",
      "Warst du das? Dann melde dich einfach an. Wenn nicht, kannst du diese E-Mail ignorieren.",
    ],
    button: { label: "Zur Anmeldung", url: `${process.env.BETTER_AUTH_URL}/anmelden` },
  }).catch(console.error);
}

// ---------------------------------------------------------------- Kunde
const customerSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein").max(120),
  email,
  password,
  phone: z.string().trim().max(40).optional(),
  terms,
});

export async function registerCustomer(_: FormState, form: FormData): Promise<FormState> {
  const parsed = customerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  try {
    const res = await auth.api.signUpEmail({ body: { name: d.name, email: d.email, password: d.password, callbackURL: "/konto?bestaetigt=1" } });
    if (!(await isNewUser(res.user.id))) {
      await notifyExistingAccount(d.email);
    } else await asSystem(async (db) => {
      await db.query("insert into customer_profiles (user_id, phone, accepted_terms_at) values ($1, $2, now())", [res.user.id, d.phone || null]);
      await audit(db, { actorId: res.user.id, actorRole: "customer", action: "register", entity: "user", entityId: res.user.id });
    });
  } catch (e) {
    return { error: authMessage(e) };
  }
  return { ok: true, message: `Fast geschafft! Wir haben eine E-Mail an ${d.email} geschickt. Bitte bestätige deine Adresse über den Link darin.` };
}

// ---------------------------------------------------------------- Betrieb
const providerSchema = z.object({
  company_name: z.string().trim().min(2, "Bitte gib den Firmennamen ein").max(160),
  legal_form: z.string().trim().max(60).optional(),
  contact_name: z.string().trim().min(2, "Bitte gib eine Ansprechperson an").max(120),
  email,
  phone: z.string().trim().min(5, "Bitte gib eine Telefonnummer an").max(40),
  password,
  street: z.string().trim().min(3, "Bitte gib Straße und Hausnummer an").max(160),
  postal_code: z.string().trim().regex(/^\d{5}$/, "Bitte eine fünfstellige PLZ eingeben"),
  city: z.string().trim().min(2, "Bitte gib den Ort an").max(80),
  vat_id: z.string().trim().max(20).optional(),
  description: z.string().trim().min(40, "Bitte beschreibe deinen Betrieb in mindestens 40 Zeichen").max(2000),
  area_label: z.string().trim().min(2, "Bitte gib den Mittelpunkt deines Einsatzgebiets an").max(120),
  radius_km: z.coerce.number().min(1, "Mindestens 1 km").max(200, "Höchstens 200 km"),
  document_kind: z.enum(["gewerbeanmeldung", "handwerksrolle", "versicherung", "sonstiges"]),
  terms,
});

export async function registerProvider(_: FormState, form: FormData): Promise<FormState> {
  const parsed = providerSchema.safeParse(Object.fromEntries(form));
  const categories = form.getAll("categories").map(String);
  const file = form.get("document");
  const errors: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);
  if (categories.length === 0) errors.categories = "Bitte wähle mindestens eine Leistung";
  let doc: { buf: Buffer; type: { ext: string; mime: string }; name: string } | null = null;
  if (!(file instanceof File) || file.size === 0) errors.document = "Bitte lade einen gewerblichen Nachweis hoch";
  else if (file.size > 10 * 1024 * 1024) errors.document = "Die Datei ist größer als 10 MB";
  else {
    const buf = Buffer.from(await file.arrayBuffer());
    const type = detectDocumentType(buf);
    if (!type) errors.document = "Bitte als PDF, JPG oder PNG hochladen";
    else doc = { buf, type, name: file.name.slice(0, 200) };
  }
  if (!parsed.success || Object.keys(errors).length || !doc) return { fieldErrors: errors };
  const d = parsed.data;

  let userId: string;
  try {
    const res = await auth.api.signUpEmail({ body: { name: d.contact_name, email: d.email, password: d.password, callbackURL: "/dashboard?bestaetigt=1" } });
    userId = res.user.id;
  } catch (e) {
    return { error: authMessage(e) };
  }
  const successMessage = `Danke! Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir an ${d.email} geschickt haben. Danach prüfen wir deine Angaben und melden uns.`;
  if (!(await isNewUser(userId))) {
    await notifyExistingAccount(d.email);
    return { ok: true, message: successMessage };
  }

  try {
    const key = await storage.put("nachweise", doc.buf, doc.type.ext);
    await asSystem((db) => db.query(`update "user" set role = 'provider' where id = $1`, [userId]));
    await withDb({ userId, role: "provider" }, async (db) => {
      const p = await db.query(
        `insert into provider_profiles (user_id, company_name, legal_form, contact_name, phone, street, postal_code, city, vat_id, description, accepted_terms_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) returning id`,
        [userId, d.company_name, d.legal_form || null, d.contact_name, d.phone, d.street, d.postal_code, d.city, d.vat_id || null, d.description],
      );
      const pid: string = p.rows[0].id;
      await db.query(
        "insert into provider_categories (provider_id, category_id) select $1, id from service_categories where slug = any($2::text[]) and active",
        [pid, categories],
      );
      const city = await db.query("select id from cities where active order by sort limit 1");
      await db.query("insert into service_areas (provider_id, city_id, label, radius_km) values ($1,$2,$3,$4)", [pid, city.rows[0]?.id ?? null, d.area_label, d.radius_km]);
      await db.query(
        "insert into provider_documents (provider_id, kind, storage_key, original_name, mime_type, size_bytes) values ($1,$2,$3,$4,$5,$6)",
        [pid, d.document_kind, key, doc!.name, doc!.type.mime, doc!.buf.length],
      );
      await audit(db, { actorId: userId, actorRole: "provider", action: "register", entity: "provider_profiles", entityId: pid, after: { company: d.company_name, categories } });
    });
  } catch (e) {
    console.error(e);
    // Konto zurücknehmen, damit die Registrierung erneut möglich ist
    await asSystem((db) => db.query(`delete from "user" where id = $1`, [userId])).catch(() => {});
    return { error: "Die Registrierung konnte nicht gespeichert werden. Bitte versuche es noch einmal." };
  }

  if (process.env.ADMIN_EMAIL) {
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      template: "admin-new-provider",
      subject: `Neuer Betrieb wartet auf Prüfung: ${d.company_name}`,
      heading: "Neuer Betrieb registriert",
      paragraphs: [`${d.company_name} (${d.postal_code} ${d.city}) hat sich registriert und wartet auf die Prüfung.`],
      button: { label: "Zur Prüfung", url: `${process.env.BETTER_AUTH_URL}/admin` },
    }).catch(console.error);
  }
  return { ok: true, message: successMessage };
}

// ---------------------------------------------------------------- Anmelden / Abmelden
const loginSchema = z.object({ email, password: z.string().min(1, "Bitte gib dein Passwort ein") });

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  let role = "customer";
  try {
    const res = await auth.api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password, callbackURL: "/konto" }, headers: await headers() });
    role = (res.user as { role?: string }).role ?? "customer";
  } catch (e) {
    return { error: authMessage(e) };
  }
  redirect(role === "admin" ? "/admin" : role === "provider" ? "/dashboard" : "/konto");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

// ---------------------------------------------------------------- Admin: Freigabe
const decisionSchema = z.object({
  providerId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "suspend"]),
  reason: z.string().trim().max(500).optional(),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "betrieb";
}

export async function decideProvider(form: FormData) {
  const admin = await currentUser();
  if (!admin || admin.role !== "admin") throw new Error("Nicht berechtigt");
  const d = decisionSchema.parse(Object.fromEntries(form));
  const status = d.decision === "approve" ? "approved" : d.decision === "reject" ? "rejected" : "suspended";
  const result = await withDb({ userId: admin.id, role: "admin" }, async (db) => {
    const before = (await db.query("select p.*, u.email from provider_profiles p join \"user\" u on u.id = p.user_id where p.id = $1 for update", [d.providerId])).rows[0];
    if (!before) throw new Error("Betrieb nicht gefunden");
    let slug = before.slug;
    if (status === "approved" && !slug) {
      const base = slugify(before.company_name);
      const taken = await db.query("select slug from provider_profiles where slug like $1", [`${base}%`]);
      const set = new Set(taken.rows.map((r) => r.slug));
      slug = base; for (let i = 2; set.has(slug); i++) slug = `${base}-${i}`;
    }
    await db.query(
      `update provider_profiles set status = $2, status_reason = $3, slug = $4,
         approved_at = case when $2 = 'approved' then coalesce(approved_at, now()) else approved_at end,
         approved_by = case when $2 = 'approved' then $5 else approved_by end
       where id = $1`,
      [d.providerId, status, d.reason || null, slug, admin.id],
    );
    if (status === "approved") await db.query("update provider_documents set review_status = 'accepted' where provider_id = $1 and review_status = 'pending'", [d.providerId]);
    await audit(db, { actorId: admin.id, actorRole: "admin", action: `provider.${d.decision}`, entity: "provider_profiles", entityId: d.providerId,
      before: { status: before.status }, after: { status, reason: d.reason || null } });
    return { email: before.email as string, company: before.company_name as string, contact: before.contact_name as string };
  });
  const texts = {
    approved: { subject: "Dein Betrieb ist freigeschaltet", p: ["Gute Nachrichten: Wir haben deine Angaben geprüft und deinen Betrieb freigeschaltet. Ab heute läuft deine Einführungsphase ohne Grundgebühr.", "Im Dashboard kannst du jetzt dein Profil vervollständigen."] },
    rejected: { subject: "Deine Registrierung bei handwerker2go", p: ["Leider können wir deinen Betrieb derzeit nicht freischalten.", d.reason ? `Grund: ${d.reason}` : "Bei Fragen antworte einfach auf diese E-Mail."] },
    suspended: { subject: "Dein Betrieb wurde vorübergehend gesperrt", p: ["Dein Profil ist vorübergehend nicht öffentlich sichtbar.", d.reason ? `Grund: ${d.reason}` : "Bei Fragen antworte einfach auf diese E-Mail."] },
  }[status];
  await sendMail({
    to: result.email, template: `provider-${status}`, subject: texts.subject, heading: `Hallo ${result.contact},`, paragraphs: texts.p,
    button: status === "approved" ? { label: "Zum Dashboard", url: `${process.env.BETTER_AUTH_URL}/dashboard` } : undefined,
  }).catch(console.error);
  redirect("/admin");
}
