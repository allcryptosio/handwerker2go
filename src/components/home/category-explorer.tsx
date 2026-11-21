"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, Service } from "@/lib/catalog";

export type ExplorerCategory = Pick<Category, "slug" | "label" | "trade" | "icon" | "tone" | "summary" | "photoHint"> & {
  services: Pick<Service, "slug" | "name" | "mode">[];
  photoSrc?: string;
};
import { Icon } from "@/components/ui/icon";

export function CategoryExplorer({ categories, citySlug }: { categories: ExplorerCategory[]; citySlug: string }) {
  const [active, setActive] = useState(0);
  const current = categories[active];

  return (
    <div id="leistungen" className="mx-auto max-w-[1240px] scroll-mt-6 px-4 pb-6 sm:px-7 sm:pb-10">
      <div role="tablist" aria-label="Leistungen" className="grid grid-cols-4 gap-y-1 border-b border-line-strong sm:flex sm:flex-wrap sm:justify-center sm:gap-1.5">
        {categories.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              id={`tab-${c.slug}`}
              aria-selected={selected}
              aria-controls="leistung-panel"
              onClick={() => setActive(i)}
              className={`flex min-w-0 flex-col items-center gap-1.5 border-b-[3px] px-1 pb-2 pt-2 text-[11.5px] font-semibold leading-tight transition-colors sm:min-w-[104px] sm:shrink-0 sm:gap-2 sm:px-4 sm:pb-3 sm:pt-3.5 sm:text-sm ${
                selected ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${
                  selected ? "bg-brand text-white" : "bg-white text-ink"
                }`}
              >
                <Icon name={c.icon} size={19} />
              </span>
              {c.label}
            </button>
          );
        })}
      </div>

      <div id="leistung-panel" role="tabpanel" aria-labelledby={`tab-${current.slug}`}>
        <ul className="-mx-4 flex scroll-px-4 gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-2.5 sm:overflow-visible sm:px-0 sm:py-6">
          {current.services.map((s) => (
            <li key={s.slug} className="shrink-0">
              <Link
                href={`/${citySlug}/${current.slug}#${s.slug}`}
                className="inline-block whitespace-nowrap rounded-full border-[1.5px] border-line-strong bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-brand hover:text-brand sm:px-[18px] sm:py-[11px] sm:text-[15px]"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
