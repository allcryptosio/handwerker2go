"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

/**
 * Links ohne „#“ in der Adresse (Wunsch des Betreibers): Ziele wie „/#leistungen“ werden als „/“ verlinkt;
 * der Sprung zum Abschnitt passiert per Skript. Auf derselben Seite wird direkt gescrollt, sonst merkt sich
 * SectionScroller das Ziel und scrollt nach dem Seitenwechsel. Links ohne „#“ bleiben normale Next-Links.
 * Für E-Mails: „?zu=<id>“ anhängen (sectionUrl), der Parameter wird nach dem Sprung aus der Adresse entfernt.
 */
const KEY = "h2g-zu";

export function scrollToSection(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto", block: "start" });
  if (el instanceof HTMLElement && (el.tagName === "MAIN" || el.tabIndex >= 0)) el.focus({ preventScroll: true });
  return true;
}

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function SmartLink({ href, onClick, children, ...rest }: Props) {
  const i = href.indexOf("#");
  if (i < 0) return <Link href={href} onClick={onClick} {...rest}>{children}</Link>;
  const path = href.slice(0, i);
  const id = href.slice(i + 1);

  // Nur Abschnitt auf derselben Seite: Schaltfläche, die wie ein Link aussieht
  if (!path) {
    return (
      <button type="button" className={rest.className} aria-current={rest["aria-current"]}
        onClick={(e) => { onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>); scrollToSection(id); }}>
        {children}
      </button>
    );
  }
  return (
    <Link href={path} {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (window.location.pathname === path) { e.preventDefault(); scrollToSection(id); return; }
        sessionStorage.setItem(KEY, id);
      }}>
      {children}
    </Link>
  );
}

/** Nach einem Seitenwechsel bzw. bei „?zu=<id>“ zum Abschnitt springen (muss in <Suspense> liegen) */
export function SectionScroller() {
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    const fromParam = params.get("zu");
    const id = fromParam || sessionStorage.getItem(KEY);
    if (!id) return;
    sessionStorage.removeItem(KEY);
    if (fromParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("zu");
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
    }
    // Inhalte können gestreamt nachkommen: bis zu 2 s auf das Ziel warten
    let tries = 0;
    const t = setInterval(() => { if (scrollToSection(id) || ++tries > 20) clearInterval(t); }, 100);
    return () => clearInterval(t);
  }, [pathname, params]);
  return null;
}

/** Für E-Mail-Links: Seite plus Abschnitt ohne „#“ */
export const sectionUrl = (url: string, id: string) => `${url}${url.includes("?") ? "&" : "?"}zu=${encodeURIComponent(id)}`;
