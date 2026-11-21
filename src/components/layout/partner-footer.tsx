import { FooterShell } from "@/components/layout/footer-shell";
import { Logo } from "@/components/ui/logo";

/** Fußzeile des Partner-Bereichs */
export function PartnerFooter() {
  return (
    <FooterShell
      brand={<Logo href="/partner" suffix="für Betriebe" />}
      tagline="Aufträge aus deiner Nachbarschaft, fair vermittelt. Gestartet in Hamburg."
      columns={[
        { title: "Für Betriebe", links: [
          { href: "/partner/registrieren", label: "Betrieb registrieren" },
          { href: "/anmelden?weiter=/dashboard", label: "Zum Dashboard" },
          { href: "/partner/ratgeber", label: "Ratgeber für Betriebe" },
        ] },
        { title: "handwerker2go", links: [
          { href: "/partner#konditionen", label: "Konditionen" },
          { href: "/ranking", label: "So sortieren wir" },
          { href: "/", label: "Zur Kundenseite" },
        ] },
      ]}
      legal={[
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
        { href: "/agb-betriebe", label: "AGB für Betriebe" },
        { href: "/kontakt-dsa", label: "Kontaktstelle (DSA)" },
      ]}
      note="Wir vermitteln Aufträge an selbstständige Handwerksbetriebe. Vertragspartner der Kunden ist der jeweilige Betrieb."
    />
  );
}
