import Link from "next/link";
import { WithdrawButton } from "@/components/legal/withdraw-button";

type FooterLink = { href: string; label: string };

/**
 * Gemeinsamer, schlanker Footer für Kunden- und Partnerseite:
 * oben Marke und wenige Linkspalten, unten eine Leiste mit Rechtstexten, Hinweis und dem Widerrufs-Button
 * (Button bleibt deutlich größer und optisch abgesetzt von den Links zu den Rechtstexten, § 356a BGB).
 */
export function FooterShell({ brand, tagline, columns, legal, note }: {
  brand: React.ReactNode;
  tagline: string;
  columns: { title: string; links: FooterLink[] }[];
  legal: FooterLink[];
  note: string;
}) {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-7 md:grid-cols-[1.3fr_repeat(2,1fr)] md:gap-10 md:py-12">
        <div className="flex flex-col gap-3">
          {brand}
          <p className="max-w-[320px] text-[14px] leading-relaxed text-muted">{tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:col-span-2 md:gap-10">
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href} className="text-[14px] text-ink-soft transition-colors hover:text-brand">{l.label}</Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-line bg-soft">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-6 sm:px-7 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex flex-col gap-2.5">
            <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-5 gap-y-1.5">
              {legal.map((l) => (
                <Link key={l.href} href={l.href} className="text-[13px] text-ink-soft underline-offset-2 hover:text-brand hover:underline">{l.label}</Link>
              ))}
            </nav>
            <p className="text-[12.5px] leading-relaxed text-muted">© handwerker2go. {note}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
            <WithdrawButton />
            <span className="text-[12px] text-muted">Über handwerker2go geschlossenen Vertrag widerrufen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
