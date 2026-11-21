import type { Metadata } from "next";
import { LEGAL } from "@/config/legal";
import { pageMeta } from "@/lib/seo";
import { Email } from "@/components/legal/email";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = pageMeta({
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von handwerker2go, dem Online-Marktplatz für Handwerkerleistungen in Hamburg.",
  path: "/impressum",
  robots: { index: false },
});

export default function Page() {
  return (
    <LegalPage title="Impressum" draft={false}>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {LEGAL.operatorName}, handelnd unter „{LEGAL.tradingName}“
        <br />
        {LEGAL.addressLines[0]}
        <br />
        {LEGAL.addressLines[1]}
        <br />
        {LEGAL.addressLines[2]}
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <Email />
        <br />
        Telefon: <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="underline">{LEGAL.phone}</a>
      </p>
      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>{LEGAL.vatId}</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>{LEGAL.operatorName}, Anschrift wie oben</p>
      <h2>Kontaktstelle nach Art. 11 und 12 DSA</h2>
      <p>
        Kontaktstelle nach Art. 11 und 12 der Verordnung (EU) 2022/2065 (Digital Services Act): {LEGAL.dsaContactEmail} (Deutsch, Englisch).
        Für Behörden der Mitgliedstaaten, die EU-Kommission und Nutzerinnen und Nutzer. Rechtswidrige Inhalte melden Sie am schnellsten über
        den Link „Inhalt melden“ am jeweiligen Inhalt.
      </p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Datenquellen</h2>
      <p>
        Postleitzahlen und Ortskoordinaten: <a className="underline" href="https://www.geonames.org">GeoNames</a>, lizenziert unter{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>.
      </p>
    </LegalPage>
  );
}
