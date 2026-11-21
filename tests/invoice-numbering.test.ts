import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

/**
 * Concurrency-Test: lückenlose Rechnungsnummern bei parallelen Erzeugungen (gleiche SQL wie allocateNumber).
 * Läuft nur mit Testdatenbank (DATABASE_URL_MIGRATIONS, z. B. node --env-file=.env.local …), nutzt das Testjahr 2099.
 */
const url = process.env.DATABASE_URL_MIGRATIONS;
const sql = `insert into invoice_counters (year, last_number) values ($1, 1)
  on conflict (year) do update set last_number = invoice_counters.last_number + 1 returning last_number`;

test("Rechnungsnummern lückenlos bei parallelen Erzeugungen", { skip: !url || !/branchtest|test/.test(url) ? "keine Testdatenbank" : false }, async () => {
  const year = 2099;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query("delete from invoice_counters where year = $1", [year]);
  const N = 40;
  const clients = await Promise.all(Array.from({ length: N }, async () => { const c = new pg.Client({ connectionString: url }); await c.connect(); return c; }));
  const got: number[] = [];
  // Jede zweite Transaktion wird zurückgerollt: auch dann darf keine Lücke entstehen
  await Promise.all(clients.map(async (c, i) => {
    await c.query("begin");
    const r = await c.query(sql, [year]);
    await new Promise((res) => setTimeout(res, Math.random() * 20));
    if (i % 2 === 0) { await c.query("rollback"); } else { got.push(r.rows[0].last_number); await c.query("commit"); }
  }));
  await Promise.all(clients.map((c) => c.end()));
  const last = (await admin.query("select last_number from invoice_counters where year = $1", [year])).rows[0].last_number;
  await admin.query("delete from invoice_counters where year = $1", [year]);
  await admin.end();
  got.sort((a, b) => a - b);
  assert.deepEqual(got, Array.from({ length: N / 2 }, (_, i) => i + 1), "Nummern 1..n ohne Lücke");
  assert.equal(last, N / 2);
});
