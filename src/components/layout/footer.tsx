import { FooterShell } from "@/components/layout/footer-shell";
import { activeCities, categories } from "@/lib/catalog";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const city = activeCities()[0];
  return (
    <FooterShell
      brand={<Logo />}
      tagline={`Geprüfte Handwerker in deiner Nähe. Gestartet in ${city?.name ?? "Hamburg"}.`}
      columns={[
        { title: "Leistungen", links: city ? categories.slice(0, 6).map((c) => ({ href: `/${city.slug}/${c.slug}`, label: c.trade })) : [] },
        { title: "handwerker2go", links: [
          { href: "/ratgeber", label: "Ratgeber" },
          { href: "/ratgeber/ueber-handwerker2go", label: "Über uns" },
          { href: "/ranking", label: "So sortieren wir" },
          { href: "/partner", label: "Für Handwerksbetriebe" },
          { href: "/anmelden", label: "Anmelden" },
        ] },
      ]}
      legal={[
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
        { href: "/agb", label: "AGB für Kunden" },
        { href: "/agb-betriebe", label: "AGB für Betriebe" },
        { href: "/widerruf", label: "Widerrufsbelehrung" },
        { href: "/datenschutz#cookies", label: "Cookies" },
        { href: "/kontakt-dsa", label: "Kontaktstelle (DSA)" },
      ]}
      note="Wir vermitteln Leistungen selbstständiger Handwerksbetriebe. Vertragspartner für die Leistung ist der jeweilige Betrieb."
    />
  );
}
