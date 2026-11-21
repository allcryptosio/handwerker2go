import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/config/legal";
import { DSA_CONTACT_TITLE } from "@/lib/legal/report-reasons";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Kontaktstelle nach dem Digital Services Act",
  description: "Kontaktstelle von handwerker2go nach Art. 11 und 12 des Digital Services Act für Behörden, die EU-Kommission sowie Nutzerinnen und Nutzer.",
  path: "/kontakt-dsa",
});

export default function Page() {
  return (
    <LegalPage title="Kontaktstelle (DSA)">
      <h2>{DSA_CONTACT_TITLE}</h2>
      <p>
        Für Behörden der Mitgliedstaaten, die EU-Kommission und Nutzerinnen und Nutzer: {LEGAL.dsaContactEmail}. Sprachen: Deutsch, Englisch.
        Rechtswidrige Inhalte melden Sie am schnellsten über den Link „Inhalt melden“ am jeweiligen Inhalt.
      </p>
    </LegalPage>
  );
}
