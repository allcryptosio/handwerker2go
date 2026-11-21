import "server-only";
import { LEGAL } from "@/config/legal";
import { asSystem, audit } from "@/lib/db";
import { WITHDRAWAL_DECLARATION_TEXT } from "@/lib/legal/withdrawal-notice";
import { sendMail } from "@/lib/mail";
import { refundBookingPayment } from "@/lib/stripe/payments";

/**
 * Elektronische Widerrufsfunktion (§ 356a BGB), Aufgabe 2.
 * - Jeder Widerruf wird gespeichert und sofort per E-Mail bestätigt (Eingang, nicht Wirksamkeit).
 * - Automatische volle Erstattung nur, wenn die Buchung sicher zugeordnet ist (eingeloggter Kunde oder E-Mail passt zur Buchung)
 *   und die Leistung noch nicht begonnen hat. Sonst entscheidet ein Mensch (Admin bzw. Betrieb beim Wertersatz).
 * - Nie automatische Ablehnung.
 */

const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const berlin = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("de-DE", { ...o, timeZone: "Europe/Berlin" }).format(d);
export const fmtDate = (d: Date) => berlin(d, { day: "2-digit", month: "2-digit", year: "numeric" });
export const fmtTime = (d: Date) => berlin(d, { hour: "2-digit", minute: "2-digit" });
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);

export const WITHDRAWAL_DAYS = 14;
const DAY = 86_400_000;

/** Vertragsschluss: Bestätigung des Termins (sofort oder durch den Betrieb), sonst Buchungszeitpunkt */
export function contractConcludedAt(b: { confirmed_at: Date | string | null; created_at: Date | string }) {
  return new Date(b.confirmed_at ?? b.created_at);
}

/** Läuft die gesetzliche Widerrufsfrist zum Zeitpunkt `at` noch? */
export function withinWithdrawalPeriod(b: { confirmed_at: Date | string | null; created_at: Date | string }, at = new Date()) {
  return at.getTime() <= contractConcludedAt(b).getTime() + WITHDRAWAL_DAYS * DAY;
}

export type WithdrawalInput = {
  name: string;
  bookingNumber?: string;
  bookingDate?: string; // JJJJ-MM-TT
  providerName?: string;
  serviceName?: string;
  email: string;
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  source?: "online_form" | "cancel_flow";
};

type BookingRow = {
  id: string; number: string; customer_id: string; contact_email: string; contact_name: string; status: string;
  starts_at: Date; ends_at: Date; created_at: Date; confirmed_at: Date | null; price_type: string; price_cents: number | null;
  refunded_cents: number; stripe_payment_intent_id: string | null; early_start_consent_at: Date | null; service_name: string;
  company_name: string; p_email: string; stripe_account_id: string | null; provider_id: string;
};

const bookingSelect = `select b.id, b.number, b.customer_id, b.contact_email, b.contact_name, b.status, b.starts_at, b.ends_at, b.created_at,
  b.confirmed_at, b.price_type, b.price_cents, b.refunded_cents, b.stripe_payment_intent_id, b.early_start_consent_at, b.service_name,
  p.company_name, pu.email p_email, p.stripe_account_id, p.id provider_id
  from bookings b join provider_profiles p on p.id = b.provider_id join "user" pu on pu.id = p.user_id`;

/** Buchung zu den Angaben finden: Buchungsnummer, sonst Datum der Buchung + Betrieb + Leistung (nur bei genau einem Treffer) */
export async function matchBooking(i: Pick<WithdrawalInput, "bookingNumber" | "bookingDate" | "providerName" | "serviceName">): Promise<BookingRow | null> {
  return asSystem(async (db) => {
    if (i.bookingNumber?.trim()) {
      return ((await db.query(`${bookingSelect} where upper(b.number) = upper($1)`, [i.bookingNumber.trim()])).rows[0] as BookingRow) ?? null;
    }
    if (i.bookingDate && i.providerName?.trim() && i.serviceName?.trim()) {
      const r = (await db.query(
        `${bookingSelect} where (b.created_at at time zone 'Europe/Berlin')::date = $1::date
           and p.company_name ilike '%' || $2 || '%' and b.service_name ilike '%' || $3 || '%' limit 2`,
        [i.bookingDate, i.providerName.trim(), i.serviceName.trim()],
      )).rows as BookingRow[];
      return r.length === 1 ? r[0] : null;
    }
    return null;
  });
}

export function isVerified(b: BookingRow, email: string, userId?: string | null) {
  return (!!userId && userId === b.customer_id) || b.contact_email.trim().toLowerCase() === email.trim().toLowerCase();
}

export function contractReference(i: WithdrawalInput, b: BookingRow | null) {
  if (b) return `Buchung ${b.number}: ${b.service_name} bei ${b.company_name}, Termin ${fmtDate(new Date(b.starts_at))} ${fmtTime(new Date(b.starts_at))} Uhr`;
  if (i.bookingNumber) return `Buchungsnummer ${i.bookingNumber}`;
  return `Buchung vom ${i.bookingDate ?? "?"}, Betrieb ${i.providerName ?? "?"}, Leistung ${i.serviceName ?? "?"}`;
}

/** Spam-Schutz: höchstens 10 Widerrufe pro IP und Stunde */
export async function rateLimited(ip: string | null | undefined) {
  if (!ip) return false;
  const n = await asSystem(async (db) => (await db.query("select count(*)::int n from withdrawals where ip = $1 and received_at > now() - interval '1 hour'", [ip])).rows[0].n as number);
  return n >= 10;
}

/** Widerruf entgegennehmen: speichern, Eingang bestätigen, Betrieb informieren, dann bearbeiten */
export async function submitWithdrawal(i: WithdrawalInput) {
  const b = await matchBooking(i);
  const verified = b ? isVerified(b, i.email, i.userId) : false;
  const ref = contractReference(i, b);
  const row = await asSystem(async (db) => {
    const r = await db.query(
      `insert into withdrawals (booking_id, name, contract_reference_text, confirmation_email, ip, user_agent, declaration_text, status, source, verified, case_kind)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id, received_at`,
      [b?.id ?? null, i.name, ref, i.email, i.ip ?? null, i.userAgent?.slice(0, 300) ?? null, WITHDRAWAL_DECLARATION_TEXT,
        b ? "received" : "unmatched", i.source ?? "online_form", verified, b ? null : "unmatched"],
    );
    await audit(db, { actorId: i.userId ?? null, actorRole: i.userId ? "customer" : "anon", action: "withdrawal.received", entity: "withdrawals", entityId: r.rows[0].id, after: { booking: b?.number ?? null, verified, source: i.source ?? "online_form" } });
    return r.rows[0] as { id: string; received_at: Date };
  });
  const receivedAt = new Date(row.received_at);

  // B.1 Eingangsbestätigung (sofort, dauerhafter Datenträger)
  const sent = await sendMail({
    to: i.email,
    template: "withdrawal_receipt_customer",
    subject: `Eingangsbestätigung Ihres Widerrufs – Buchung ${b?.number ?? i.bookingNumber ?? "ohne Nummer"}`,
    heading: `Guten Tag ${i.name},`,
    paragraphs: [
      "wir bestätigen den Eingang Ihrer Widerrufserklärung über die Online-Widerrufsfunktion von handwerker2go.",
      `Eingegangen am: ${fmtDate(receivedAt)} um ${fmtTime(receivedAt)} Uhr (Ortszeit Deutschland)`,
      `Name: ${i.name}`,
      `Vertrag: ${b ? `${b.number} – ${b.service_name} bei ${b.company_name}, Termin ${fmtDate(new Date(b.starts_at))} ${fmtTime(new Date(b.starts_at))} Uhr` : ref}`,
      `E-Mail für diese Bestätigung: ${i.email}`,
      `Ihre Erklärung: „${WITHDRAWAL_DECLARATION_TEXT}“`,
      "Diese E-Mail bestätigt den Eingang Ihrer Erklärung. Wir haben den Betrieb informiert. Über die Rückzahlung erhalten Sie eine gesonderte Nachricht.",
      `handwerker2go – im Auftrag von ${b?.company_name ?? "dem gebuchten Betrieb"}`,
      `${LEGAL.operatorName}, handelnd unter „${LEGAL.tradingName}“, ${LEGAL.address}, ${LEGAL.email}`,
    ],
  });
  await asSystem((db) => db.query("update withdrawals set confirmation_email_message_id = $2, confirmation_sent_at = now() where id = $1", [row.id, sent.messageId ?? `outbox:${sent.outboxId}`]));

  // Kopie an den Betrieb
  if (b) {
    await sendMail({
      to: b.p_email,
      template: "withdrawal_copy_provider",
      subject: `Widerruf eingegangen: ${b.service_name}, Buchung ${b.number}`,
      heading: "Ein Kunde hat widerrufen",
      paragraphs: [
        `Am ${fmtDate(receivedAt)} um ${fmtTime(receivedAt)} Uhr ist über handwerker2go ein Widerruf zu Buchung ${b.number} eingegangen (${b.service_name}, Termin ${fmtDate(new Date(b.starts_at))} ${fmtTime(new Date(b.starts_at))} Uhr).`,
        `Name: ${i.name}. Erklärung: „${WITHDRAWAL_DECLARATION_TEXT}“`,
        "Hat der Termin noch nicht stattgefunden, erstatten wir dem Kunden den vollen Betrag automatisch über dein Stripe-Konto, die Provision wird ebenfalls erstattet. Hast du auf ausdrücklichen Wunsch des Kunden schon begonnen, teile uns den Wertersatz innerhalb von 10 Tagen im Dashboard mit; sonst erstatten wir am 14. Tag den vollen Betrag (AGB für Betriebe § 2a Abs. 4).",
      ],
      button: { label: "Im Dashboard ansehen", url: `${base()}/dashboard/termine` },
    }).catch(console.error);
  }

  await processWithdrawal(row.id);
  return { id: row.id, receivedAt, booking: b, verified };
}

async function loadWithdrawal(id: string) {
  return asSystem(async (db) => (await db.query("select * from withdrawals where id = $1", [id])).rows[0] as {
    id: string; booking_id: string | null; status: string; verified: boolean; received_at: Date; name: string; confirmation_email: string; case_kind: string | null;
  } | undefined);
}

async function loadBooking(id: string) {
  return asSystem(async (db) => (await db.query(`${bookingSelect} where b.id = $1`, [id])).rows[0] as BookingRow | undefined);
}

async function adminAlert(subject: string, lines: string[]) {
  if (!process.env.ADMIN_EMAIL) return;
  await sendMail({ to: process.env.ADMIN_EMAIL, template: "withdrawal_admin", subject, heading: subject, paragraphs: lines, button: { label: "Zu den Widerrufen", url: `${base()}/admin/widerrufe` } }).catch(console.error);
}

/** Entscheidung nach Eingang: automatische Erstattung, Wertersatz-Fall oder Prüfung durch einen Menschen */
export async function processWithdrawal(id: string) {
  const w = await loadWithdrawal(id);
  if (!w || w.status !== "received" || !w.booking_id) {
    if (w?.status === "unmatched") await adminAlert("Widerruf ohne Zuordnung", [`Eingang ${fmtDate(new Date(w.received_at))} ${fmtTime(new Date(w.received_at))} Uhr, ${w.name}, ${w.confirmation_email}. Bitte Buchung zuordnen.`]);
    return;
  }
  const b = await loadBooking(w.booking_id);
  if (!b) return;
  const setCase = (kind: string, note: string) =>
    asSystem((db) => db.query("update withdrawals set case_kind = $2, notes = coalesce(notes || E'\\n', '') || $3 where id = $1", [id, kind, note]));

  if (!w.verified) {
    await setCase("pruefung", "Zuordnung nicht bestätigt: E-Mail passt nicht zur Buchung und kein eingeloggter Kunde.");
    await adminAlert(`Widerruf prüfen: Buchung ${b.number}`, [`Die angegebene E-Mail passt nicht zur Buchung. Bitte prüfen und dann erstatten oder antworten.`]);
    return;
  }
  const received = new Date(w.received_at);
  if (!withinWithdrawalPeriod(b, received)) {
    await setCase("pruefung", `Widerrufsfrist laut System am ${fmtDate(new Date(contractConcludedAt(b).getTime() + WITHDRAWAL_DAYS * DAY))} abgelaufen. Keine automatische Ablehnung: bitte prüfen, Antwort mit Textbaustein B.2.`);
    await adminAlert(`Widerruf prüfen (Frist): Buchung ${b.number}`, ["Die Widerrufsfrist scheint abgelaufen. Bitte prüfen und manuell antworten (Textbaustein B.2)."]);
    return;
  }
  if (["cancelled", "declined", "expired"].includes(b.status)) {
    const fullyRefunded = b.price_type !== "fixed" || (b.refunded_cents ?? 0) >= (b.price_cents ?? 0);
    await asSystem((db) => db.query("update withdrawals set status = $2, case_kind = 'auto', handled_at = now(), notes = 'Buchung war bereits storniert.' where id = $1", [id, fullyRefunded ? "refunded" : "received"]));
    if (!fullyRefunded) await adminAlert(`Widerruf zu stornierter Buchung ${b.number}`, ["Buchung storniert, aber nicht voll erstattet. Bitte prüfen."]);
    return;
  }
  const started = new Date(b.starts_at) <= new Date();
  if (!started) {
    await refundAndClose(id, b, 0, "system");
    return;
  }
  // Leistung begonnen oder vorbei: Betrieb entscheidet über Wertersatz (nur mit Erklärung zum vorzeitigen Beginn), Tag 14 automatisch voll
  await setCase("wertersatz", b.early_start_consent_at
    ? "Leistung begonnen. Betrieb teilt Wertersatz bis Tag 10 mit, sonst am Tag 14 volle Erstattung."
    : "Leistung begonnen, aber keine Erklärung zum vorzeitigen Beginn gespeichert: kein Wertersatz möglich, volle Erstattung.");
  if (!b.early_start_consent_at) {
    await refundAndClose(id, b, 0, "system");
    return;
  }
  await adminAlert(`Widerruf mit Wertersatz-Prüfung: Buchung ${b.number}`, ["Der Termin hat bereits begonnen oder stattgefunden. Der Betrieb entscheidet bis Tag 10 über den Wertersatz; am Tag 14 wird automatisch voll erstattet."]);
}

/**
 * Erstattung über das Stripe-Konto des Betriebs (Direct Charge, Provision anteilig zurück) und Abschluss.
 * wertersatzCents > 0 nur bei gespeicherter Erklärung zum vorzeitigen Beginn.
 */
export async function refundAndClose(id: string, b: BookingRow, wertersatzCents: number, actor: string) {
  const paid = b.price_type === "fixed" && !!b.stripe_payment_intent_id && !!b.stripe_account_id && (b.price_cents ?? 0) > 0;
  const price = b.price_cents ?? 0;
  const keep = b.early_start_consent_at ? Math.max(0, Math.min(wertersatzCents, price)) : 0;
  const already = b.refunded_cents ?? 0;
  const amount = paid ? Math.max(0, price - keep - already) : 0;
  let refundId: string | null = null;
  if (amount > 0) {
    const r = await refundBookingPayment({ providerAccountId: b.stripe_account_id!, paymentIntentId: b.stripe_payment_intent_id!, amountCents: amount === price ? undefined : amount, reason: "withdrawal" });
    refundId = r.id;
  }
  const status = keep > 0 ? "partially_refunded" : "refunded";
  await asSystem(async (db) => {
    await db.query(
      `update withdrawals set status = $2, refund_id = $3, wertersatz_amount_cents = $4, handled_by = $5, handled_at = now(), case_kind = coalesce(case_kind, 'auto') where id = $1`,
      [id, status, refundId, keep || null, actor],
    );
    await db.query(
      `update bookings set status = 'cancelled', refunded_cents = coalesce(refunded_cents, 0) + $2, cancelled_at = coalesce(cancelled_at, now()),
         cancel_reason = 'Widerruf' where id = $1 and status in ('confirmed', 'requested', 'completed', 'pending_payment')`,
      [b.id, amount],
    );
    await audit(db, { actorId: actor === "system" ? null : actor, actorRole: actor === "system" ? "system" : "user", action: "withdrawal.refund", entity: "withdrawals", entityId: id, after: { amount, keep, refundId } });
  });
  const w = await loadWithdrawal(id);
  if (w) {
    await sendMail({
      to: w.confirmation_email,
      template: "withdrawal_refund_customer",
      subject: `Ihr Widerruf zu Buchung ${b.number}: Rückzahlung`,
      heading: `Guten Tag ${w.name},`,
      paragraphs: [
        amount > 0
          ? `wir haben die Rückzahlung von ${eur(amount)} für Ihre Buchung ${b.number} (${b.service_name} bei ${b.company_name}) veranlasst. Sie erfolgt über dasselbe Zahlungsmittel, das Sie bei der Buchung verwendet haben; die Gutschrift kann je nach Bank einige Tage dauern.`
          : `Ihr Widerruf zu Buchung ${b.number} (${b.service_name} bei ${b.company_name}) ist bearbeitet. Für diese Buchung war keine Zahlung zu erstatten.`,
        ...(keep > 0 ? [`Für die bereits erbrachte Leistung hat der Betrieb einen Wertersatz von ${eur(keep)} einbehalten, wie in der Widerrufsbelehrung beschrieben.`] : []),
        `handwerker2go – im Auftrag von ${b.company_name}`,
      ],
    }).catch(console.error);
  }
}

/** Entscheidung über Wertersatz (Betrieb oder Admin): Betrag in Cent, 0 = volle Erstattung */
export async function decideWertersatz(withdrawalId: string, wertersatzCents: number, actor: string) {
  const w = await loadWithdrawal(withdrawalId);
  if (!w || w.status !== "received" || !w.booking_id) return false;
  const b = await loadBooking(w.booking_id);
  if (!b) return false;
  await refundAndClose(withdrawalId, b, wertersatzCents, actor);
  return true;
}

/** Fristen (Job alle 15 Minuten): Tag 10 Erinnerung an Admin und Betrieb, Tag 14 automatische volle Erstattung */
export async function runWithdrawalDeadlines(now = new Date()) {
  const open = await asSystem(async (db) => (await db.query(
    `select w.id, w.received_at, w.reminder_sent_at, w.booking_id from withdrawals w
      where w.status = 'received' and w.case_kind = 'wertersatz' and w.verified and not w.legal_hold`,
  )).rows as { id: string; received_at: Date; reminder_sent_at: Date | null; booking_id: string }[]);
  let reminded = 0, refunded = 0;
  for (const w of open) {
    const age = (now.getTime() - new Date(w.received_at).getTime()) / DAY;
    const b = await loadBooking(w.booking_id);
    if (!b) continue;
    if (age >= 14) {
      await refundAndClose(w.id, b, 0, "system");
      refunded++;
    } else if (age >= 10 && !w.reminder_sent_at) {
      const deadline = new Date(new Date(w.received_at).getTime() + 14 * DAY);
      const lines = [`Zu Buchung ${b.number} fehlt noch die Entscheidung über den Wertersatz. Ohne Entscheidung erstatten wir am ${fmtDate(deadline)} automatisch den vollen Betrag.`];
      await sendMail({ to: b.p_email, template: "withdrawal_reminder_provider", subject: `Erinnerung: Widerruf zu Buchung ${b.number}`, heading: "Bitte Wertersatz mitteilen", paragraphs: lines, button: { label: "Zum Dashboard", url: `${base()}/dashboard/termine` } }).catch(console.error);
      await adminAlert(`Erinnerung: Widerruf ${b.number} offen`, lines);
      await asSystem((db) => db.query("update withdrawals set reminder_sent_at = now() where id = $1", [w.id]));
      reminded++;
    }
  }
  return { reminded, refunded };
}
