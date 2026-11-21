import { FooterShell } from "@/components/layout/footer-shell";
import { activeCities, categories } from "@/lib/catalog";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const city = activeCities()[0];
  return (
    <FooterShell
      brand={<Logo />}
      tagline={`Geprüfte Handwerker in deiner Nähe, online buchbar. Gestartet in ${city?.name ?? "Hamburg"}.`}
      note="Wir vermitteln Leistungen selbstständiger Handwerksbetriebe. Vertragspartner für die Leistung ist der jeweilige Betrieb."
      columns={[
        { title: "Leistungen", links: city ? categories.slice(0, 6).map((c) => ({ href: `/${city.slug}/${c.slug}`, label: c.trade })) : [] },
        { title: "Unternehmen", links: [
          { href: "/ratgeber/ueber-handwerker2go", label: "Über uns" },
          { href: "/ratgeber", label: "Ratgeber" },
          { href: "/ranking", label: "So sortieren wir" },
          { href: "/partner", label: "Für Handwerksbetriebe" },
        ] },
      ]}
      service={[{ href: "/anmelden", label: "Anmelden" }, { href: "/kontakt-dsa", label: "Inhalte melden (DSA)" }]}
      legal={[
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
        { href: "/datenschutz#cookies", label: "Cookies" },
        { href: "/agb", label: "AGB Kunden" },
        { href: "/agb-betriebe", label: "AGB Betriebe" },
        { href: "/widerruf", label: "Widerrufsbelehrung" },
      ]}
    />
  );
}
