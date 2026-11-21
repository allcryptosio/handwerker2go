import "server-only";
import { asSystem } from "@/lib/db";
import { earlyStartConfirmationParagraph } from "@/lib/legal/early-start";
import { withdrawalNoticeForMail } from "@/lib/legal/withdrawal-notice";
import { cancellationNotice } from "@/lib/booking/cancellation";
import { priceLine } from "@/lib/booking/price-label";
import { sendMail } from "@/lib/mail";
import { reviewOptOutUrl } from "@/lib/review-optout";

const base = () => process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
const eur = (c: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(c / 100);
const when = (d: Date) =>
  new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(d) + " Uhr";

export type BookingEvent = "confirmed" | "requested" | "provider_confirmed" | "declined" | "cancelled_by_customer" | "cancelled_by_provider" | "reminder" | "review_request";

/** Lädt die Buchung und schickt passende Mails an Kunde und Betrieb */
export async function notifyBooking(bookingId: string, event: BookingEvent) {
  const b = await asSystem(async (db) =>
    (await db.query(
      `select b.*, p.company_name, p.street p_street, p.postal_code p_postal, p.city p_city, p.phone p_phone, pu.email p_email
         from bookings b join provider_profiles p on p.id = b.provider_id join "user" pu on pu.id = p.user_id where b.id = $1`,
      [bookingId],
    )).rows[0],
  );
  if (!b) return;
  const start = new Date(b.starts_at);
  const link = `${base()}/buchung/${b.id}`;
  const price = b.price_type === "fixed" ? `${priceLine(b.price_cents, b.provider_tax_status)} (bezahlt)` : "Besichtigung kostenlos und unverbindlich, Preis nach Angebot";
  const facts = [
    `Leistung: ${b.service_name}`,
    `Termin: ${when(start)}`,
    `Adresse: ${b.street}, ${b.postal_code} ${b.city}`,
    `Preis: ${price}`,
    `Buchungsnummer: ${b.number}`,
  ];
  const storno = cancellationNotice(b.price_type, b.price_cents, b.anfahrtskosten_cents);
  const provider = `Dein Vertragspartner ist ${b.company_name}, ${b.p_street}, ${b.p_postal} ${b.p_city}, Telefon ${b.p_phone}.`;
  const consent = b.early_start_consent_at ? [earlyStartConfirmationParagraph(new Date(b.early_start_consent_at))] : [];
  // Widerrufsbelehrung auf dauerhaftem Datenträger (Textform, § 312f BGB): amtliches Muster vollständig im Mailtext (Anhang A)
  const withdrawal = [
    ...withdrawalNoticeForMail({ name: b.company_name, address: `${b.p_street}, ${b.p_postal} ${b.p_city}`, phone: b.p_phone, email: b.p_email }),
    `Vertrag widerrufen: ${base()}/vertrag-widerrufen?b=${encodeURIComponent(b.number)}`,
    `Es gelten die AGB für Kunden (${base()}/agb), Stand ${b.terms_version.split("-").reverse().join(".")}.`,
  ];
  const sends: Promise<unknown>[] = [];

  const toCustomer = (subject: string, heading: string, lead: string[], extra: string[] = []) =>
    sends.push(sendMail({ to: b.contact_email, template: `booking_${event}_customer`, subject, heading, paragraphs: [...lead, ...facts, ...extra], button: { label: "Buchung ansehen", url: link } }));
  const toProvider = (subject: string, heading: string, lead: string[]) =>
    sends.push(sendMail({
      to: b.p_email, template: `booking_${event}_provider`, subject, heading,
      paragraphs: [...lead, ...facts, `Kunde: ${b.contact_name}, Telefon ${b.contact_phone}`, ...(b.notes ? [`Hinweise: ${b.notes}`] : [])],
      button: { label: "Im Dashboard öffnen", url: `${base()}/dashboard/termine` },
    }));

  switch (event) {
    case "confirmed":
      toCustomer(`Gebucht: ${b.service_name} am ${start.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}`, "Dein Termin steht", [`${b.company_name} kommt zu dir. Hier sind alle Angaben.`], [provider, storno, ...consent, ...withdrawal]);
      toProvider(`Neuer Auftrag: ${b.service_name}`, "Neuer Auftrag gebucht", ["Ein Kunde hat dich über handwerker2go gebucht. Der Termin steht in deinem Kalender."]);
      break;
    case "requested":
      toCustomer(`Angefragt: ${b.service_name}`, "Deine Anfrage ist beim Betrieb", [`${b.company_name} bestätigt deinen Termin in der Regel innerhalb weniger Stunden. Wir schicken dir dann eine E-Mail.`], [provider, storno, ...consent, ...withdrawal]);
      toProvider(`Bitte bestätigen: ${b.service_name}`, "Neue Buchungsanfrage", ["Bitte bestätige oder lehne die Anfrage im Dashboard ab. Bis dahin ist der Termin in deinem Kalender reserviert."]);
      break;
    case "provider_confirmed":
      toCustomer(`Bestätigt: ${b.service_name}`, "Der Betrieb hat bestätigt", [`${b.company_name} hat deinen Termin bestätigt.`], [provider]);
      break;
    case "declined":
      toCustomer(`Abgelehnt: ${b.service_name}`, "Der Betrieb kann leider nicht", [
        `${b.company_name} kann den Termin nicht übernehmen.${b.price_type === "fixed" ? " Du bekommst den vollen Betrag über Stripe zurück." : ""} Auf handwerker2go findest du andere freie Betriebe.`,
      ]);
      break;
    case "cancelled_by_customer":
      toCustomer(`Storniert: ${b.service_name}`, "Deine Buchung ist storniert", [b.refunded_cents > 0 ? `Wir erstatten ${eur(b.refunded_cents)} über Stripe auf dein Zahlungsmittel.` : "Die Buchung ist storniert."]);
      toProvider(`Storniert: ${b.service_name}`, "Ein Kunde hat storniert", ["Der Termin ist wieder frei."]);
      break;
    case "reminder": {
      const day = start.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" });
      const time = start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
      const ymd = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const rel = ymd(start) === ymd(new Date()) ? "heute" : ymd(start) === ymd(tomorrow) ? "morgen" : `am ${day}`;
      const Rel = rel.charAt(0).toUpperCase() + rel.slice(1);
      toCustomer(`Erinnerung: ${b.service_name} ${rel} um ${time} Uhr`, `${Rel} ist dein Termin`, [
        `${b.company_name} kommt am ${day} um ${time} Uhr zu dir. Bitte sorg dafür, dass jemand da ist und der Arbeitsbereich zugänglich ist.`,
      ], [provider, "Du kannst doch nicht? Dann sag den Termin bitte so früh wie möglich über die Buchungsseite ab, damit der Betrieb planen kann."]);
      toProvider(`Erinnerung: ${b.service_name} ${rel} um ${time} Uhr`, `${Rel} steht ein Auftrag an`, [`Kurze Erinnerung an deinen Termin am ${day} um ${time} Uhr.`]);
      break;
    }
    case "review_request":
      sends.push(sendMail({
        to: b.contact_email,
        template: "review_request_customer",
        subject: `Wie war's mit ${b.company_name}?`,
        heading: "Wie zufrieden warst du?",
        paragraphs: [
          `${b.company_name} war für „${b.service_name}“ bei dir. Wie lief es? Deine Bewertung dauert eine Minute und hilft anderen Kunden bei der Wahl.`,
          "Bewerten können nur Kunden, die über handwerker2go gebucht haben. Öffentlich sichtbar sind nur Sterne, Text und Datum, nicht dein Name.",
          `Du möchtest keine Bitten um Bewertung mehr bekommen? Hier abbestellen: ${reviewOptOutUrl(b.customer_id)}`,
        ],
        button: { label: "Jetzt bewerten", url: `${link}#bewerten` },
      }));
      break;
    case "cancelled_by_provider":
      toCustomer(`Abgesagt: ${b.service_name}`, "Der Betrieb hat abgesagt", [`${b.company_name} musste den Termin absagen.${b.price_type === "fixed" ? " Du bekommst den vollen Betrag über Stripe zurück." : ""}`]);
      break;
  }
  await Promise.allSettled(sends);
}
