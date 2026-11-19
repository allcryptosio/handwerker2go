import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/dashboard/termine", label: "Termine" },
  { href: "/dashboard/kalender", label: "Kalender & Leistungen" },
];

export function DashboardNav({ active }: { active: string }) {
  return (
    <nav aria-label="Bereich für Betriebe" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active === i.href ? "page" : undefined}
          className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold ${active === i.href ? "bg-brand-dark text-white" : "text-ink-soft hover:bg-soft"}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
