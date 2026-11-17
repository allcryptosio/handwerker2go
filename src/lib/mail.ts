import "server-only";
import { asSystem } from "@/lib/db";
import { site } from "@/lib/site";

/**
 * E-Mail-Versand. Jede Mail landet zuerst in email_outbox (nachvollziehbar, wiederholbar).
 * MAIL_DRIVER=resend versendet sofort über Resend, MAIL_DRIVER=outbox speichert nur.
 */
interface Mail {
  to: string;
  template: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function render(m: Mail) {
  const btn = m.button
    ? `<p style="margin:28px 0"><a href="${esc(m.button.url)}" style="background:#12704f;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;display:inline-block">${esc(m.button.label)}</a></p>
       <p style="font-size:13px;color:#565958">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>${esc(m.button.url)}</p>`
    : "";
  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#eaf5ee;font-family:Inter,Arial,sans-serif;color:#1a1e1d">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-size:24px;font-weight:800;color:#12704f;letter-spacing:-0.5px">handwerker<span style="background:#12704f;color:#fff;border-radius:6px;padding:0 6px;margin-left:2px">2go</span></div>
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

export async function sendMail(m: Mail) {
  const { html, text } = render(m);
  const id: string = await asSystem(async (db) => {
    const r = await db.query(
      "insert into email_outbox (to_email, template, subject, html, text_body) values ($1,$2,$3,$4,$5) returning id",
      [m.to, m.template, m.subject, html, text],
    );
    return r.rows[0].id;
  });
  if (process.env.MAIL_DRIVER !== "resend") return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [m.to], subject: m.subject, html, text }),
    });
    const body = await res.json().catch(() => ({}));
    await asSystem((db) =>
      db.query("update email_outbox set status=$2, provider_message_id=$3, error=$4, attempts=attempts+1, sent_at=case when $2='sent' then now() end where id=$1", [
        id, res.ok ? "sent" : "failed", body.id ?? null, res.ok ? null : JSON.stringify(body).slice(0, 500),
      ]),
    );
  } catch (e) {
    await asSystem((db) => db.query("update email_outbox set status='failed', error=$2, attempts=attempts+1 where id=$1", [id, String(e).slice(0, 500)]));
  }
}
