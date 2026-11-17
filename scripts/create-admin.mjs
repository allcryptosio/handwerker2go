// Legt ein Admin-Konto an oder macht ein bestehendes Konto zum Admin.
// Nutzung: pnpm admin:create <email> "<Name>"
// Das Passwort wird zufällig erzeugt, in /root/.handwerker2go/admin-password gespeichert und einmal angezeigt.
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import pg from "pg";

const [email, name = "Admin"] = process.argv.slice(2);
if (!email || !email.includes("@")) { console.error('Nutzung: pnpm admin:create <email> "<Name>"'); process.exit(1); }
const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
const exists = (await db.query(`select id from "user" where lower(email) = lower($1)`, [email])).rows[0];
let password = null;
if (!exists) {
  password = randomBytes(18).toString("base64url");
  const res = await fetch("http://127.0.0.1:3012/api/auth/sign-up/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3012" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) { console.error("Registrierung fehlgeschlagen:", res.status, await res.text()); process.exit(1); }
}
await db.query(`update "user" set role = 'admin', "emailVerified" = true where lower(email) = lower($1)`, [email]);
await db.query(`delete from email_outbox where lower(to_email) = lower($1) and template = 'verify-email'`, [email]);
await db.query(`insert into audit_logs (actor_role, action, entity, after) values ('system', 'admin.create', 'user', $1)`, [JSON.stringify({ email })]);
await db.end();
if (password) {
  mkdirSync("/root/.handwerker2go", { recursive: true, mode: 0o700 });
  writeFileSync("/root/.handwerker2go/admin-password", password + "\n", { mode: 0o600 });
  console.log(`Admin angelegt. Passwort (auch in /root/.handwerker2go/admin-password): ${password}`);
} else console.log("Bestehendes Konto ist jetzt Admin.");
