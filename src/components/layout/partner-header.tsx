"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

const links = [
  { href: "/partner#ablauf", label: "So funktioniert’s" },
  { href: "/partner#schutz", label: "Fair für alle" },
  { href: "/partner#konditionen", label: "Konditionen" },
  { href: "/partner/ratgeber", label: "Ratgeber" },
];

/** Kopfzeile des Partner-Bereichs für Handwerksbetriebe */
export function PartnerHeader() {
  const [open, setOpen] = useState(false);
  const inDashboard = (usePathname() ?? "").startsWith("/dashboard");
  return (
    <header className="border-b border-white/10 bg-brand-dark text-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-5 py-4 sm:px-7">
        <Logo inverted href="/partner" suffix="für Betriebe" />
        <nav aria-label="Partner-Navigation" className="hidden items-center gap-6 text-[15px] font-semibold md:flex">
          {!inDashboard && links.map((l) => <Link key={l.href} href={l.href} className="text-white/85 hover:text-white">{l.label}</Link>)}
          {inDashboard ? (
            <Link href="/dashboard" className="text-white/85 hover:text-white">Dashboard</Link>
          ) : (
            <Link href="/anmelden?weiter=/dashboard" className="text-white/85 hover:text-white">Anmelden</Link>
          )}
          {!inDashboard && (
            <Link href="/partner/registrieren" className="rounded-full bg-white px-[18px] py-2.5 font-bold text-brand-dark transition-colors hover:bg-mint">
              Jetzt Partner werden
            </Link>
          )}
        </nav>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 md:hidden"
          aria-expanded={open} aria-controls="partner-nav" aria-label={open ? "Menü schließen" : "Menü öffnen"} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? "schliessen" : "menue"} size={20} strokeWidth={2.2} />
        </button>
      </div>
      {open && (
        <nav id="partner-nav" aria-label="Partner-Navigation" className="border-t border-white/10 px-5 pb-5 md:hidden">
          <ul className="flex flex-col">
            {(inDashboard ? [{ href: "/dashboard", label: "Dashboard" }] : [...links, { href: "/anmelden?weiter=/dashboard", label: "Anmelden" }]).map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-white/10 py-4 text-base font-semibold">{l.label}</Link>
              </li>
            ))}
          </ul>
          {!inDashboard && (
            <Link href="/partner/registrieren" onClick={() => setOpen(false)} className="mt-4 block rounded-full bg-white px-5 py-3.5 text-center font-bold text-brand-dark">
              Jetzt Partner werden
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
