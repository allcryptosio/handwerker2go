import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" }, robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Joe Becker
        <br />
        Einzelunternehmer (Sole Trader)
        <br />
        Republic Street 266
        <br />
        VLT 1112 Valletta
        <br />
        Malta
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: [folgt in Kürze]
        <br />
        Telefon: <a href="tel:+35677818522" className="underline">+356 7781 8522</a>
      </p>
      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>MT33258727</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>Joe Becker, Anschrift wie oben</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>[Angabe zur Teilnahme an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle, prüfen lassen]</p>
    </LegalPage>
  );
}
