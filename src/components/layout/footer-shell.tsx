import { SmartLink as Link } from "@/components/ui/smart-link";
import { WithdrawButton } from "@/components/legal/withdraw-button";
import { LEGAL } from "@/config/legal";

type FooterLink = { href: string; label: string };

/**
 * Gemeinsamer Footer für Kunden- und Partnerseite.
 * Oben: Marke | zwei Linkspalten | Service (mit Widerrufs-Button, § 356a BGB: als Button, Kontrastfarbe, abgesetzt).
 * Unten: eine Zeile mit Copyright und den Rechtstexten.
 */
export function FooterShell({ brand, tagline, note, columns, service, legal }: {
  brand: React.ReactNode;
  tagline: string;
  note: string;
  columns: { title: string; links: FooterLink[] }[];
  service: FooterLink[];
  legal: FooterLink[];
}) {
  const head = "mb-3.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink";
  const link = "text-[14px] text-muted transition-colors hover:text-brand";
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-9 px-5 py-11 sm:px-7 md:grid-cols-[1.5fr_1fr_1fr_1.1fr] md:gap-10 md:py-14">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          {brand}
          <p className="max-w-[300px] text-[14px] leading-relaxed text-muted">{tagline}</p>
          <p className="max-w-[300px] text-[12.5px] leading-relaxed text-muted/80">{note}</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <div className={head}>{c.title}</div>
            <ul className="flex flex-col gap-2.5">
              {c.links.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 md:col-span-1">
          <div className={head}>Service</div>
          <ul className="flex flex-col gap-2.5">
            {service.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
            <li><a href={`mailto:${LEGAL.email}`} className={link}>{LEGAL.email}</a></li>
          </ul>
          <WithdrawButton variant="outline" className="mt-5" />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-5 sm:px-7 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-muted">© handwerker2go</p>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-5 gap-y-1.5">
            {legal.map((l) => <Link key={l.href} href={l.href} className="text-[13px] text-muted transition-colors hover:text-brand">{l.label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
