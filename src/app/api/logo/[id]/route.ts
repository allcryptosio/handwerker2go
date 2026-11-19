import { asSystem } from "@/lib/db";
import { detectImageType } from "@/lib/storage";
import { storage } from "@/lib/storage";

/** Logo eines freigeschalteten Betriebs (öffentlich) */
export async function GET(_req: Request, ctx: RouteContext<"/api/logo/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const key = await asSystem(async (db) =>
    (await db.query("select logo_key from provider_profiles where id = $1 and status = 'approved'", [id])).rows[0]?.logo_key as string | undefined,
  );
  if (!key) return new Response(null, { status: 404 });
  const buf = await storage.get(key);
  const type = detectImageType(buf);
  if (!type) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "content-type": type.mime, "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" } });
}
