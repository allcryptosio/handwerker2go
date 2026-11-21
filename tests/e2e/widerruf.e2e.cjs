// E2E: Footer-Button → /vertrag-widerrufen ohne Login → Schritt 1 → „Widerruf bestätigen“ → Bestätigung, Mail (Ausgang), Erstattung (Stripe-Mock)
// Start: Server mit STRIPE_MOCK=1 und MAIL_DRIVER=outbox auf E2E_BASE (Standard http://127.0.0.1:3019), Testbuchung H2G-WTEST001 (Termin in der Zukunft, bezahlt).
// Nutzung: node tests/e2e/widerruf.e2e.cjs   (PLAYWRIGHT=Pfad zu playwright, DB=Testdatenbank)
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const { chromium } = require(process.env.PLAYWRIGHT ?? "playwright");
const B = process.env.E2E_BASE ?? "http://127.0.0.1:3019";
const DB = process.env.DB ?? "h2g_branchtest";
const sql = (q) => execSync(`sudo -u postgres psql -d ${DB} -Atc ${JSON.stringify(q)}`).toString().trim();

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const path of ["/", "/partner", "/ratgeber", "/impressum"]) {
    await p.goto(B + path, { waitUntil: "networkidle" });
    assert.equal(await p.locator('footer a:has-text("Vertrag widerrufen")').count(), 1, `Footer-Button fehlt auf ${path}`);
  }
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.click('footer a:has-text("Vertrag widerrufen")');
  await p.waitForURL("**/vertrag-widerrufen");
  // Kein Feld für einen Grund
  const names = await p.locator("form input, form textarea, form select").evaluateAll((els) => els.map((e) => `${e.getAttribute("name")} ${e.id}`.toLowerCase()));
  assert.ok(!names.some((n) => /grund|reason|begruend/.test(n)), "Formular darf kein Feld für einen Grund haben");
  assert.equal(await p.locator('label:has-text("Grund")').count(), 0, "Formular darf kein Feld für einen Grund haben");
  await p.fill("#w-name", "Erika Test");
  await p.fill("#w-bookingNumber", "H2G-WTEST001");
  await p.fill("#w-email", "e2e-kunde@example.com");
  await p.click('button:has-text("Weiter zur Bestätigung")');
  await p.waitForSelector('button:has-text("Widerruf bestätigen")');
  const summary = await p.locator("dl").innerText();
  assert.match(summary, /Lampe anschließen/);
  await p.click('button:has-text("Widerruf bestätigen")');
  await p.waitForSelector('[role=status]:has-text("Ihr Widerruf ist am")');
  const receipt = await p.locator('[role=status]').innerText();
  const berlinNow = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date());
  assert.ok(receipt.includes(berlinNow), "Datum Europe/Berlin auf der Bestätigungsseite");
  assert.match(receipt, /Eingangsbestätigung an e2e-kunde@example.com/);
  await b.close();

  const w = sql("select w.status || '|' || coalesce(refund_id,'') || '|' || (confirmation_sent_at is not null) from withdrawals w join bookings b on b.id = w.booking_id where b.number = 'H2G-WTEST001' order by w.received_at desc limit 1");
  const [status, refundId, sent] = w.split("|");
  assert.equal(status, "refunded", "Termin in der Zukunft: automatisch erstattet");
  assert.match(refundId, /^re_mock_pi_test_wtest001/, "Refund-Aufruf an den Stripe-Mock");
  assert.equal(sent, "true", "Eingangsbestätigung versendet");
  const mail = sql("select subject || '|' || text_body from email_outbox where template = 'withdrawal_receipt_customer' order by created_at desc limit 1");
  assert.match(mail, /Eingangsbestätigung Ihres Widerrufs – Buchung H2G-WTEST001/);
  assert.match(mail, /Uhr \(Ortszeit Deutschland\)/);
  assert.match(mail, /Hiermit widerrufe ich den oben bezeichneten Vertrag/);
  assert.equal(sql("select count(*) from email_outbox where template = 'withdrawal_copy_provider' and subject like '%H2G-WTEST001%'"), "1", "Kopie an den Betrieb");
  assert.equal(sql("select status from bookings where number = 'H2G-WTEST001'"), "cancelled");
  console.log("OK widerruf.e2e");
})().catch((e) => { console.error(e); process.exit(1); });
