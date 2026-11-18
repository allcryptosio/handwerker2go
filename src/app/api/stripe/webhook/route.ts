import { asSystem } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { syncConnectAccount } from "@/lib/stripe/connect";

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
        await syncConnectAccount((event.data.object as { id: string }).id);
        break;
      default:
        // payment_intent.*, charge.refunded, charge.dispute.*, payout.* folgen mit den Buchungen (Phase 3)
        break;
    }
    await asSystem((db) => db.query("update stripe_events set processed_at = now() where id = $1", [event.id]));
  } catch (e) {
    await asSystem((db) => db.query("update stripe_events set error = $2 where id = $1", [event.id, String(e).slice(0, 500)]));
    return new Response("Verarbeitung fehlgeschlagen", { status: 500 });
  }
  return Response.json({ received: true });
}
