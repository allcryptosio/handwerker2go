import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** Fußzeile des Partner-Bereichs */
export function PartnerFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 pb-8 pt-12 sm:px-7">
        <div className="grid grid-cols-1 gap-7 text-sm sm:grid-cols-3">
          <div>
            <Logo href="/partner" suffix="für Betriebe" />
            <p className="mt-2.5 leading-relaxed text-muted">Aufträge aus deiner Nachbarschaft, fair vermittelt. Gestartet in Hamburg.</p>
          </div>
          <nav aria-label="Für Betriebe" className="flex flex-col gap-2.5">
            <strong>Für Betriebe</strong>
            <Link href="/partner/registrieren" className="hover:text-brand">Betrieb registrieren</Link>
            <Link href="/anmelden?weiter=/dashboard" className="hover:text-brand">Zum Dashboard</Link>
            <Link href="/partner/ratgeber" className="hover:text-brand">Ratgeber für Betriebe</Link>
            <Link href="/ranking" className="hover:text-brand">So sortieren wir</Link>
            <Link href="/" className="hover:text-brand">Zur Kundenseite</Link>
          </nav>
          <nav aria-label="Rechtliches" className="flex flex-col gap-2.5">
            <strong>Rechtliches</strong>
            <Link href="/agb-betriebe" className="hover:text-brand">AGB für Betriebe</Link>
            <Link href="/datenschutz" className="hover:text-brand">Datenschutz</Link>
            <Link href="/impressum" className="hover:text-brand">Impressum</Link>
          </nav>
        </div>
        <p className="border-t border-line pt-5 text-[13px] text-muted">
          handwerker2go vermittelt Aufträge an selbstständige Handwerksbetriebe. Vertragspartner der Kunden ist der jeweilige Betrieb.
        </p>
      </div>
    </footer>
  );
}
