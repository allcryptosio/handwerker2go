import { asSystem } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";
import { sendMail } from "@/lib/mail";
import { syncSubscription } from "@/lib/stripe/billing";
import { syncConnectAccount } from "@/lib/stripe/connect";

/** Fehlgeschlagene Abbuchung der Mitgliedschaft: Betrieb per E-Mail informieren (Stripe versucht es erneut) */
async function notifyPaymentFailed(invoice: Stripe.Invoice) {
  const accountId = invoice.customer_account;
  if (!accountId) return;
  const p = await asSystem(async (db) =>
    (await db.query(`select p.company_name, u.email from provider_profiles p join "user" u on u.id = p.user_id where p.stripe_account_id = $1`, [accountId])).rows[0],
  );
  if (!p) return;
  const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
  await sendMail({
    to: p.email,
    template: "membership_payment_failed",
    subject: "Zahlung deiner Mitgliedschaft fehlgeschlagen",
    heading: "Die Abbuchung hat nicht geklappt",
    paragraphs: [
      `Hallo ${p.company_name}, die Zahlung für deine handwerker2go-Mitgliedschaft konnte nicht eingezogen werden. Stripe versucht es in den nächsten Tagen automatisch erneut.`,
      "Bitte prüfe deine Zahlungsmethode. Ist die Gebühr 14 Tage nach Fälligkeit nicht bezahlt, dürfen wir dein Profil bis zum Zahlungseingang aus der Suche nehmen (AGB für Betriebe, § 4).",
    ],
    button: { label: "Zahlungsmethode prüfen", url: `${base}/dashboard` },
  });
}

/**
 * Stripe-Webhook. Signatur wird mit STRIPE_WEBHOOK_SECRET geprüft, jedes Ereignis genau einmal verarbeitet.
 * Buchungsbezogene Ereignisse werden ab Phase 3 an die Buchungen gebunden; bis dahin nur protokolliert.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe nicht konfiguriert", { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signatur fehlt", { status: 400 });
  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Ungültige Signatur", { status: 400 });
  }

  const isNew = await asSystem(async (db) =>
    (await db.query(
      "insert into stripe_events (id, type, livemode) values ($1, $2, $3) on conflict (id) do nothing returning id",
      [event.id, event.type, event.livemode],
    )).rowCount === 1,
  );
  if (!isNew) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "account.updated":
        // Status eines Betriebskontos hat sich geändert (Connect-Ereignis, event.account = Konto des Betriebs)
        await syncConnectAccount(event.account ?? (event.data.object as { id: string }).id);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!event.account && session.mode === "subscription" && typeof session.subscription === "string") {
          await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
        }
        break;
      }
      case "invoice.payment_failed":
        if (!event.account) await notifyPaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // checkout.session.completed (Connect), charge.refunded, charge.dispute.* folgen mit den Buchungen (Phase 3)
        break;
    }
    await asSystem((db) => db.query("update stripe_events set processed_at = now() where id = $1", [event.id]));
  } catch (e) {
    await asSystem((db) => db.query("update stripe_events set error = $2 where id = $1", [event.id, String(e).slice(0, 500)]));
    return new Response("Verarbeitung fehlgeschlagen", { status: 500 });
  }
  return Response.json({ received: true });
}
