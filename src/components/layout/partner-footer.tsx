import { FooterShell } from "@/components/layout/footer-shell";
import { Logo } from "@/components/ui/logo";

/** Fußzeile des Partner-Bereichs */
export function PartnerFooter() {
  return (
    <FooterShell
      brand={<Logo href="/partner" suffix="für Betriebe" />}
      tagline="Aufträge aus deiner Nachbarschaft, fair vermittelt. Gestartet in Hamburg."
      note="Wir vermitteln Aufträge an selbstständige Handwerksbetriebe. Vertragspartner der Kunden ist der jeweilige Betrieb."
      columns={[
        { title: "Für Betriebe", links: [
          { href: "/partner/registrieren", label: "Betrieb registrieren" },
          { href: "/partner#konditionen", label: "Konditionen" },
          { href: "/partner/ratgeber", label: "Ratgeber für Betriebe" },
        ] },
        { title: "Unternehmen", links: [
          { href: "/ratgeber/ueber-handwerker2go", label: "Über uns" },
          { href: "/ranking", label: "So sortieren wir" },
          { href: "/", label: "Zur Kundenseite" },
        ] },
      ]}
      service={[{ href: "/anmelden?weiter=/dashboard", label: "Zum Dashboard" }, { href: "/kontakt-dsa", label: "Inhalte melden (DSA)" }]}
      legal={[
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
        { href: "/agb-betriebe", label: "AGB Betriebe" },
      ]}
    />
  );
}
