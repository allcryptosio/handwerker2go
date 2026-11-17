import Link from "next/link";
import { activeCities, categories } from "@/lib/catalog";
import { site } from "@/lib/site";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const city = activeCities()[0];
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-9 px-5 pb-8 pt-14 sm:px-7">
        <div className="grid grid-cols-1 gap-7 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-2.5 leading-relaxed text-muted">Geprüfte Handwerker in deiner Nähe. Gestartet in {city?.name}.</p>
          </div>
          {city && (
            <nav aria-label={`Leistungen in ${city.name}`} className="flex flex-col gap-2.5">
              <strong>{city.name}</strong>
              {categories.slice(0, 6).map((c) => (
                <Link key={c.slug} href={`/${city.slug}/${c.slug}`} className="hover:text-brand">
                  {c.trade} {city.name}
                </Link>
              ))}
            </nav>
          )}
          <nav aria-label="Für Handwerker" className="flex flex-col gap-2.5">
            <strong>Für Handwerker</strong>
            <Link href="/fuer-handwerker" className="hover:text-brand">Betrieb anmelden</Link>
            <Link href="/fuer-handwerker#konditionen" className="hover:text-brand">Konditionen</Link>
            <Link href="/anmelden" className="hover:text-brand">Zum Dashboard</Link>
          </nav>
          <nav aria-label="Rechtliches" className="flex flex-col gap-2.5">
            <strong>Rechtliches</strong>
            <Link href="/impressum" className="hover:text-brand">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-brand">Datenschutz</Link>
            <Link href="/agb" className="hover:text-brand">AGB</Link>
            <Link href="/widerruf" className="hover:text-brand">Widerrufsbelehrung</Link>
            <Link href="/datenschutz#cookies" className="hover:text-brand">Cookie-Einstellungen</Link>
          </nav>
        </div>
        <p className="border-t border-line pt-5 text-[13px] text-muted">
          {site.name} vermittelt Leistungen selbstständiger Handwerksbetriebe. Vertragspartner für die Leistung ist der
          jeweilige Betrieb.
        </p>
      </div>
    </footer>
  );
}
