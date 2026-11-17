import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Widerrufsbelehrung", alternates: { canonical: "/widerruf" }, robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <p>[Widerrufsbelehrung für Verbraucher. Klären lassen: Wer ist bei Handwerkerleistungen Vertragspartner und damit Adressat des Widerrufs, wie wird der vorzeitige Beginn der Leistung behandelt, und wie wird die elektronische Widerrufsfunktion umgesetzt.]</p>
      <h2>Muster-Widerrufsformular</h2>
      <p>[Muster-Widerrufsformular nach Anlage 2 zu Art. 246a § 1 EGBGB]</p>
    </LegalPage>
  );
}
