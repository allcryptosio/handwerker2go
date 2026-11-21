import "server-only";
import nodemailer from "nodemailer";
import { asSystem } from "@/lib/db";
import { site } from "@/lib/site";

/**
 * E-Mail-Versand. Jede Mail landet zuerst in email_outbox (nachvollziehbar, wiederholbar).
 * MAIL_DRIVER=smtp versendet über SMTP (z. B. Google Workspace), resend über Resend, outbox speichert nur.
 */
interface Mail {
  to: string;
  template: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  /** Anhänge, z. B. Rechnungs-PDF (werden per SMTP bzw. Resend mitgeschickt, im Ausgang nur vermerkt) */
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

/** Ergebnis: ID im Ausgang (email_outbox) und Message-ID des Versanddienstes, falls verschickt */
export type SentMail = { outboxId: string; messageId: string | null; status: "queued" | "sent" | "failed" };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function render(m: Mail) {
  const btn = m.button
    ? `<p style="margin:28px 0"><a href="${esc(m.button.url)}" style="background:#12704f;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;display:inline-block">${esc(m.button.label)}</a></p>
       <p style="font-size:13px;color:#565958">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>${esc(m.button.url)}</p>`
    : "";
  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#eaf5ee;font-family:Inter,Arial,sans-serif;color:#1a1e1d">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-size:24px;font-weight:800;color:#12704f;letter-spacing:-0.5px"><img src="${site.url}/logo-mail.png" width="36" height="36" alt="" style="vertical-align:middle;border-radius:8px;margin-right:8px">handwerker<span style="background:#12704f;color:#fff;border-radius:6px;padding:0 6px;margin-left:2px">2go</span></div>
<div style="background:#ffffff;border-radius:16px;padding:32px;margin-top:20px">
<h1 style="font-size:22px;margin:0 0 16px;color:#0b2e1f">${esc(m.heading)}</h1>
${m.paragraphs.map((p) => `<p style="font-size:16px;line-height:1.6;margin:0 0 14px">${esc(p)}</p>`).join("")}
${btn}
</div>
<p style="font-size:12px;color:#565958;margin-top:20px">${esc(site.name)} vermittelt Leistungen selbstständiger Handwerksbetriebe.</p>
</div></body></html>`;
  const text = [m.heading, "", ...m.paragraphs, ...(m.button ? ["", `${m.button.label}: ${m.button.url}`] : [])].join("\n");
  return { html, text };
}

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;
function smtp() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15_000,
  });
  return transport;
}

export async function sendMail(m: Mail): Promise<SentMail> {
  const { html, text } = render(m);
  const id: string = await asSystem(async (db) => {
    const r = await db.query(
      "insert into email_outbox (to_email, template, subject, html, text_body) values ($1,$2,$3,$4,$5) returning id",
      [m.to, m.template, m.subject, html, text],
    );
    return r.rows[0].id;
  });
  if (process.env.MAIL_DRIVER === "smtp") {
    try {
      const info = await smtp().sendMail({ from: process.env.EMAIL_FROM, to: m.to, subject: m.subject, html, text, attachments: m.attachments });
      await asSystem((db) =>
        db.query("update email_outbox set status='sent', provider_message_id=$2, attempts=attempts+1, sent_at=now() where id=$1", [id, info.messageId ?? null]),
      );
      return { outboxId: id, messageId: info.messageId ?? null, status: "sent" };
    } catch (e) {
      console.error("SMTP-Versand fehlgeschlagen", e);
      await asSystem((db) => db.query("update email_outbox set status='failed', error=$2, attempts=attempts+1 where id=$1", [id, String(e).slice(0, 500)]));
      return { outboxId: id, messageId: null, status: "failed" };
    }
  }
  if (process.env.MAIL_DRIVER !== "resend") return { outboxId: id, messageId: null, status: "queued" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM, to: [m.to], subject: m.subject, html, text,
        ...(m.attachments?.length ? { attachments: m.attachments.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })) } : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));
    await asSystem((db) =>
      db.query("update email_outbox set status=$2, provider_message_id=$3, error=$4, attempts=attempts+1, sent_at=case when $2='sent' then now() end where id=$1", [
        id, res.ok ? "sent" : "failed", body.id ?? null, res.ok ? null : JSON.stringify(body).slice(0, 500),
      ]),
    );
    return { outboxId: id, messageId: body.id ?? null, status: res.ok ? "sent" : "failed" };
  } catch (e) {
    await asSystem((db) => db.query("update email_outbox set status='failed', error=$2, attempts=attempts+1 where id=$1", [id, String(e).slice(0, 500)]));
    return { outboxId: id, messageId: null, status: "failed" };
  }
}

/** True, sobald E-Mails wirklich verschickt werden (sonst ist eine Registrierung nicht abschließbar). */
export const mailReady = () =>
  (process.env.MAIL_DRIVER === "resend" && Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)) ||
  (process.env.MAIL_DRIVER === "smtp" && Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM));
