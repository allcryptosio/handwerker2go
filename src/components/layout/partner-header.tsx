"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

/** Bewusst nur drei Links, damit in der Leiste nichts umbricht („Fair für alle“ steht im Handymenü und auf der Seite) */
const links = [
  { href: "/partner#ablauf", label: "So funktioniert’s" },
  { href: "/partner#konditionen", label: "Konditionen" },
  { href: "/partner/ratgeber", label: "Ratgeber" },
];

const underline = "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-brand-light";

/** Kopfzeile des Partner-Bereichs für Handwerksbetriebe */
export function PartnerHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const inDashboard = pathname.startsWith("/dashboard");
  const isOn = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="border-b border-white/10 bg-brand-dark text-white">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-5 sm:px-7">
        <Logo inverted href="/partner" />
        <span className="hidden whitespace-nowrap text-[14px] font-semibold text-[#b9d3c4] sm:inline lg:hidden xl:inline">für Betriebe</span>

        <nav aria-label="Partner-Navigation" className="ml-7 hidden h-full items-center gap-7 whitespace-nowrap text-[15px] font-semibold lg:flex">
          {(inDashboard ? [{ href: "/dashboard", label: "Dashboard" }] : links).map((l) => {
            const on = inDashboard || isOn(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-full items-center transition-colors ${on ? `text-white ${underline}` : "text-white/85 hover:text-white"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {!inDashboard && (
          <div className="ml-auto hidden items-center gap-2.5 whitespace-nowrap lg:flex">
            <Link href="/anmelden?weiter=/dashboard" className="rounded-full border-[1.5px] border-white/35 px-[18px] py-2.5 text-[15px] font-semibold text-white transition-colors hover:border-white">
              Anmelden
            </Link>
            <Link href="/partner/registrieren" className="rounded-full bg-white px-5 py-[11px] text-[15px] font-bold text-brand-dark transition-colors hover:bg-mint">
              Jetzt Partner werden
            </Link>
          </div>
        )}

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 lg:hidden"
          aria-expanded={open}
          aria-controls="partner-nav"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "schliessen" : "menue"} size={20} strokeWidth={2.2} />
        </button>
      </div>

      {open && (
        <nav id="partner-nav" aria-label="Partner-Navigation" className="border-t border-white/10 px-5 pb-5 lg:hidden">
          <ul className="flex flex-col">
            {(inDashboard
              ? [{ href: "/dashboard", label: "Dashboard" }]
              : [...links, { href: "/partner#schutz", label: "Fair für alle" }, { href: "/anmelden?weiter=/dashboard", label: "Anmelden" }]
            ).map((l) => (
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
