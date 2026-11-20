"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";

const links = [
  { href: "/#leistungen", label: "Leistungen" },
  { href: "/#so-funktionierts", label: "So funktioniert’s" },
  { href: "/ratgeber", label: "Ratgeber" },
];

/** Hintergrund hinter der runden Leiste, passend zum ersten Abschnitt der Seite */
const backdrop = (p: string) => (p === "/" ? "bg-mint" : "bg-white");

/** Liest die aktuelle URL (muss in <Suspense> liegen) */
export function Header() {
  return <HeaderView pathname={usePathname() ?? "/"} />;
}

/** Reine Ansicht, auch als Suspense-Platzhalter nutzbar */
export function HeaderView({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const isOn = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className={`relative z-40 px-3 pt-3 sm:px-5 ${backdrop(pathname)}`}>
      <div className="mx-auto max-w-[1184px] rounded-[32px] bg-white shadow-[0_6px_24px_rgba(11,46,31,0.08),0_0_0_1px_rgba(11,46,31,0.06)]">
        <div className="flex h-16 items-center gap-4 pl-4 pr-2.5 sm:pl-5">
          <Logo />

          <nav aria-label="Hauptnavigation" className="hidden flex-1 items-center justify-center gap-1 whitespace-nowrap text-[15px] font-semibold lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isOn(l.href) ? "page" : undefined}
                className={`rounded-full px-4 py-2 transition-colors ${isOn(l.href) ? "bg-mint text-brand" : "hover:bg-soft"}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/partner" className="hidden rounded-full px-4 py-2 text-muted transition-colors hover:bg-soft hover:text-ink xl:block">
              Für Betriebe
            </Link>
          </nav>

          <div className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
            <Link href="/anmelden" className="rounded-full px-3.5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-soft">
              Anmelden
            </Link>
            <Link href="/#suche" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark">
              Termin finden
              <Icon name="pfeil" size={16} strokeWidth={2.4} />
            </Link>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-mint text-brand-dark lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "schliessen" : "menue"} size={20} strokeWidth={2.2} />
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Hauptnavigation" className="border-t border-line px-5 pb-5 lg:hidden">
            <ul className="flex flex-col">
              {[...links, { href: "/anmelden", label: "Anmelden" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 text-base font-semibold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#suche" onClick={() => setOpen(false)} className="mt-4 block rounded-full bg-brand px-5 py-3.5 text-center font-bold text-white">
              Termin finden
            </Link>
            <Link href="/partner" onClick={() => setOpen(false)} className="mt-3 block py-2 text-center text-[15px] font-semibold text-muted">
              Für Handwerksbetriebe
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
