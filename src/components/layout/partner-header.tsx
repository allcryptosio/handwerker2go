"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

/** Bewusst nur drei Links, damit in der Leiste nichts umbricht („Fair für alle“ steht auf der Seite selbst) */
const links = [
  { href: "/partner#ablauf", label: "So funktioniert’s" },
  { href: "/partner#konditionen", label: "Konditionen" },
  { href: "/partner/ratgeber", label: "Ratgeber" },
];

/** Kopfzeile des Partner-Bereichs für Handwerksbetriebe: runde dunkle Leiste (scrollt normal mit) */
export function PartnerHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const inDashboard = pathname.startsWith("/dashboard");
  const isOn = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="relative z-40 bg-brand-dark px-3 pt-3 text-white sm:px-5">
      <div className="mx-auto max-w-[1184px] rounded-[32px] bg-brand-deep shadow-[0_6px_24px_rgba(11,46,31,0.18),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex h-16 items-center gap-4 pl-4 pr-2.5 sm:pl-5">
          <Logo inverted href="/partner" />
          <span className="hidden whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold text-brand-light sm:inline-block lg:hidden xl:inline-block">
            für Betriebe
          </span>

          <nav aria-label="Partner-Navigation" className="hidden flex-1 items-center justify-center gap-1 whitespace-nowrap text-[15px] font-semibold lg:flex">
            {inDashboard ? (
              <Link href="/dashboard" aria-current="page" className="rounded-full bg-brand-light/15 px-4 py-2 text-white">Dashboard</Link>
            ) : (
              links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isOn(l.href) ? "page" : undefined}
                  className={`rounded-full px-4 py-2 transition-colors ${isOn(l.href) ? "bg-brand-light/15 text-white" : "text-white/85 hover:bg-white/[0.07] hover:text-white"}`}
                >
                  {l.label}
                </Link>
              ))
            )}
          </nav>

          {!inDashboard && (
            <div className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
              <Link href="/anmelden?weiter=/dashboard" className="rounded-full px-3.5 py-2.5 text-[15px] font-semibold text-white/85 transition-colors hover:bg-white/[0.07] hover:text-white">
                Anmelden
              </Link>
              <Link href="/partner/registrieren" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-brand-dark transition-colors hover:bg-mint">
                Partner werden
                <Icon name="pfeil" size={16} strokeWidth={2.4} />
              </Link>
            </div>
          )}

          <button
            type="button"
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 lg:hidden"
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
      </div>
    </header>
  );
}
