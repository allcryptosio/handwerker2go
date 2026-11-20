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

/** Grüne Unterstreichung der aktiven Seite an der Unterkante der Leiste */
const underline = "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-brand";

/** Liest die aktuelle URL (muss in <Suspense> liegen) */
export function Header() {
  return <HeaderView pathname={usePathname() ?? "/"} />;
}

/** Reine Ansicht, auch als Suspense-Platzhalter nutzbar */
export function HeaderView({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const isOn = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-5 sm:px-7">
        <Logo />

        <nav aria-label="Hauptnavigation" className="ml-7 hidden h-full items-center gap-7 whitespace-nowrap text-[15px] font-semibold lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isOn(l.href) ? "page" : undefined}
              className={`relative flex h-full items-center transition-colors hover:text-brand ${isOn(l.href) ? `text-brand ${underline}` : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2.5 whitespace-nowrap lg:flex">
          <Link href="/partner" className="hidden items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[13px] font-bold text-brand transition-colors hover:bg-mint-soft xl:inline-flex">
            Für Betriebe
          </Link>
          <Link href="/anmelden" className="rounded-full border-[1.5px] border-line px-[18px] py-2.5 text-[15px] font-semibold transition-colors hover:border-brand hover:text-brand">
            Anmelden
          </Link>
          <Link href="/#suche" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-[11px] text-[15px] font-bold text-white transition-colors hover:bg-brand-dark">
            <Icon name="suche" size={16} strokeWidth={2.4} />
            Termin finden
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link href="/#suche" className="hidden rounded-full bg-brand px-4 py-2.5 text-[14px] font-bold text-white min-[400px]:inline-block">
            Termin finden
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "schliessen" : "menue"} size={20} strokeWidth={2.2} />
          </button>
        </div>
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
          <Link href="/partner" onClick={() => setOpen(false)} className="mt-4 block py-2 text-[15px] font-semibold text-muted">
            Für Handwerksbetriebe
          </Link>
        </nav>
      )}
    </header>
  );
}
