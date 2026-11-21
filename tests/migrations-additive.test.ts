import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

/** Statischer Check: Die Migrationen des Rechts-Pakets (ab 21.11.2026) sind rein additiv */
const dir = new URL("../supabase/migrations/", import.meta.url);
const files = readdirSync(dir).filter((f) => f >= "20261121" && f.endsWith(".sql"));

const forbidden: [string, RegExp][] = [
  ["DROP", /\bdrop\s+(table|column|index|policy|constraint|function|trigger|schema|type|view|sequence|extension)\b/i],
  ["RENAME", /\brename\b/i],
  ["ALTER … TYPE", /\balter\s+(table|column)\b[^;]*\btype\b/i],
  ["DELETE", /\bdelete\s+from\b/i],
  ["TRUNCATE", /\btruncate\b/i],
];

test("Migrationen enthalten kein DROP/RENAME/ALTER … TYPE/DELETE", () => {
  assert.ok(files.length >= 8, `erwartet mindestens 8 neue Migrationen, gefunden ${files.length}`);
  for (const f of files) {
    const sql = readFileSync(new URL(f, dir), "utf8").replace(/--.*$/gm, "");
    for (const [name, re] of forbidden) assert.ok(!re.test(sql), `${f} enthält ${name}`);
  }
});
