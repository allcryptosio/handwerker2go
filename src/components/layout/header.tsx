"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";

const links = [
  { href: "/#leistungen", label: "Leistungen" },
  { href: "/#so-funktionierts", label: "So funktioniert’s" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/anmelden", label: "Anmelden" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-5 py-4 sm:px-7">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-6 text-[15px] font-semibold md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
          <Link
            href="/fuer-handwerker"
            className="rounded-full border-[1.5px] border-brand px-[18px] py-2.5 text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Als Handwerker anmelden
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "schliessen" : "menue"} size={20} strokeWidth={2.2} />
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Hauptnavigation" className="border-t border-line px-5 pb-5 md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 text-base font-semibold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/fuer-handwerker"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-brand px-5 py-3.5 text-center font-bold text-white"
          >
            Als Handwerker anmelden
          </Link>
        </nav>
      )}
    </header>
  );
}
