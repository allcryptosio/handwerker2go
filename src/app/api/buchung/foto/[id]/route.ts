import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { storage } from "@/lib/storage";

/** Auftragsfoto: nur für Kunde und Betrieb der Buchung (RLS) sowie Admins */
export async function GET(_req: Request, ctx: RouteContext<"/api/buchung/foto/[id]">) {
  const { id } = await ctx.params;
  const u = await currentUser();
  if (!u || !/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const row = await withDb({ userId: u.id, role: u.role }, async (db) =>
    (await db.query("select storage_key, mime_type from booking_photos where id = $1", [id])).rows[0] as { storage_key: string; mime_type: string } | undefined,
  );
  if (!row) return new Response(null, { status: 404 });
  const buf = await storage.get(row.storage_key);
  return new Response(new Uint8Array(buf), { headers: { "content-type": row.mime_type, "cache-control": "private, max-age=600", "x-content-type-options": "nosniff" } });
}
