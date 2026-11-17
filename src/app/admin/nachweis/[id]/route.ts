import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db";
import { storage } from "@/lib/storage";

/** Nachweis-Datei nur für Admins ausliefern */
export async function GET(_req: Request, ctx: RouteContext<"/admin/nachweis/[id]">) {
  const { id } = await ctx.params;
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return new Response("Nicht berechtigt", { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Nicht gefunden", { status: 404 });
  const doc = await withDb({ userId: session.user.id, role: "admin" }, async (db) =>
    (await db.query("select storage_key, mime_type, original_name from provider_documents where id = $1", [id])).rows[0]);
  if (!doc) return new Response("Nicht gefunden", { status: 404 });
  const data = await storage.get(doc.storage_key);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mime_type,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.original_name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
