import "server-only";
import pg from "pg";

/**
 * Datenbankzugriff. Jede Abfrage läuft in einer Transaktion mit gesetztem Kontext
 * (app.user_id, app.role), den die RLS-Policies auswerten. Funktioniert identisch auf
 * eigenem PostgreSQL und auf Supabase (dort mit einer eigenen, nicht-besitzenden Rolle).
 */
const globalForPool = globalThis as unknown as { h2gPool?: pg.Pool };

export const pool =
  globalForPool.h2gPool ??
  new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });
if (process.env.NODE_ENV !== "production") globalForPool.h2gPool = pool;

export type DbRole = "anon" | "customer" | "provider" | "admin" | "system";
export interface DbContext {
  userId?: string | null;
  role: DbRole;
}

export async function withDb<T>(ctx: DbContext, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.user_id', $1, true), set_config('app.role', $2, true)", [
      ctx.userId ?? "",
      ctx.role,
    ]);
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Für Server-Prozesse ohne angemeldeten Nutzer (z. B. nach der Registrierung). Sparsam verwenden. */
export const asSystem = <T>(fn: (client: pg.PoolClient) => Promise<T>) => withDb({ role: "system" }, fn);

export async function audit(
  client: pg.PoolClient,
  entry: { actorId?: string | null; actorRole: string; action: string; entity: string; entityId?: string; before?: unknown; after?: unknown },
) {
  await client.query(
    "insert into audit_logs (actor_id, actor_role, action, entity, entity_id, before, after) values ($1,$2,$3,$4,$5,$6,$7)",
    [entry.actorId ?? null, entry.actorRole, entry.action, entry.entity, entry.entityId ?? null,
     entry.before === undefined ? null : JSON.stringify(entry.before), entry.after === undefined ? null : JSON.stringify(entry.after)],
  );
}
