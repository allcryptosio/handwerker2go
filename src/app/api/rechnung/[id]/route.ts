import { currentUser } from "@/lib/auth";
import { asSystem } from "@/lib/db";
import { storage } from "@/lib/storage";

/** Rechnungs-PDF für den Betrieb (eigene Rechnungen) und den Admin */
export async function GET(_: Request, ctx: RouteContext<"/api/rechnung/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Nicht gefunden", { status: 404 });
  const u = await currentUser();
  if (!u) return new Response("Bitte anmelden", { status: 401 });
  const inv = await asSystem(async (db) => (await db.query(
    "select i.number, i.pdf_key, p.user_id from invoices i join provider_profiles p on p.id = i.provider_id where i.id = $1", [id],
  )).rows[0]);
  if (!inv?.pdf_key || (u.role !== "admin" && inv.user_id !== u.id)) return new Response("Nicht gefunden", { status: 404 });
  const buf = await storage.get(inv.pdf_key);
  return new Response(new Uint8Array(buf), {
    headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${inv.number}.pdf"`, "cache-control": "private, no-store" },
  });
}
