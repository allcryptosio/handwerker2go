"use client";

import { usePathname } from "next/navigation";

/** Kunden- oder Partner-Variante von Kopf und Fuß, je nach Bereich (wie getrennte Händler-Seite bei Lieferplattformen) */
export const isPartnerPath = (p: string) => p === "/partner" || p.startsWith("/partner/") || p === "/dashboard" || p.startsWith("/dashboard/");

export function ChromeSwitch({ customer, partner }: { customer: React.ReactNode; partner: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  return <>{isPartnerPath(pathname) ? partner : customer}</>;
}
