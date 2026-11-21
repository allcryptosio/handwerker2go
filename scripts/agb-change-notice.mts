// Änderungsmitteilung der AGB für Betriebe an Bestandsbetriebe (Anhang E.2, Verfahren nach § 12, mindestens 6 Wochen vorher).
// NUR VORBEREITET: Ohne --send wird nichts verschickt, das Skript zeigt Empfänger und Text (Probelauf).
// Nutzung: node --conditions=react-server --import tsx --env-file=.env.local scripts/agb-change-notice.mts --inkrafttreten=2027-01-15 [--send]
import pg from "pg";
import { sendMail } from "@/lib/mail";

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const send = process.argv.includes("--send");
const date = arg("inkrafttreten");
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error("Bitte --inkrafttreten=JJJJ-MM-TT angeben (mindestens 6 Wochen nach Versand)"); process.exit(1); }
const effective = new Date(`${date}T00:00:00Z`);
if (effective.getTime() - Date.now() < 42 * 86_400_000) { console.error("Inkrafttreten muss mindestens 6 Wochen nach dem Versand liegen."); process.exit(1); }
const label = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(effective);
const link = `${process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com"}/agb-betriebe`;

const db = new pg.Client({ connectionString: process.env.DATABASE_URL_MIGRATIONS });
await db.connect();
const rows = (await db.query(`select p.contact_name, u.email from provider_profiles p join "user" u on u.id = p.user_id where p.status in ('approved', 'pending', 'suspended') order by p.created_at`)).rows;
await db.end();

const paragraphs = [
  "wir passen unsere AGB für Betriebe an. Die wichtigsten Punkte:",
  "1. Vollmacht für die sofortige Bestätigung und Empfang von Widerrufen in deinem Namen (§ 2a);",
  "2. die gesetzlich vorgeschriebene Online-Widerrufsfunktion;",
  "3. Angebote nur noch online;",
  "4. Pflichtangabe Anfahrtskosten und Steuerstatus;",
  "5. Unternehmer-Nachweis und Hinweis zur Umsatzsteuer nach § 13b UStG, auch für Kleinunternehmer (§ 6);",
  "6. Gerichtsstand Hamburg statt Malta.",
  `Die neue Fassung findest du unter ${link}. Du kannst bis zum Inkrafttreten widersprechen oder kündigen. Nutzt du die Plattform danach ohne Widerspruch weiter, gelten die Änderungen als angenommen.`,
  "Viele Grüße, dein handwerker2go-Team",
];
console.log(`${send ? "VERSAND" : "Probelauf (nichts verschickt)"}: ${rows.length} Empfänger, Inkrafttreten ${label}`);
console.log(`Betreff: Änderung der AGB für Betriebe zum ${label}\n\n${paragraphs.join("\n")}`);
for (const r of rows) {
  console.log(`- ${r.email}`);
  if (send) {
    await sendMail({ to: r.email, template: "agb_change_provider", subject: `Änderung der AGB für Betriebe zum ${label}`, heading: `Hallo ${r.contact_name},`, paragraphs });
  }
}
process.exit(0);
