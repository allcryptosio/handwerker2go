import Link from "next/link";
import type { Category } from "@/lib/catalog";
import { Icon } from "@/components/ui/icon";

export type ExplorerCategory = Pick<Category, "slug" | "label" | "icon">;

/** Kategorien als direkte Links zur Leistungsseite (Handy 4x2-Raster, Desktop eine Reihe) */
export function CategoryExplorer({ categories, citySlug }: { categories: ExplorerCategory[]; citySlug: string }) {
  return (
    <nav id="leistungen" aria-label="Leistungen" className="mx-auto max-w-[1240px] scroll-mt-6 px-4 sm:px-7">
      <ul className="grid grid-cols-4 gap-y-1 border-b border-line-strong pb-1 sm:flex sm:flex-wrap sm:justify-center sm:gap-1.5">
        {categories.map((c) => (
          <li key={c.slug} className="min-w-0">
            <Link
              href={`/${citySlug}/${c.slug}`}
              className="group flex min-w-0 flex-col items-center gap-1.5 px-1 pb-2 pt-2 text-[11.5px] font-semibold leading-tight text-ink-soft transition-colors hover:text-ink sm:min-w-[104px] sm:gap-2 sm:px-4 sm:pb-3 sm:pt-3.5 sm:text-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-colors group-hover:bg-brand group-hover:text-white sm:h-11 sm:w-11">
                <Icon name={c.icon} size={19} />
              </span>
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
