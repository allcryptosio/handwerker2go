"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, Service } from "@/lib/catalog";

export type ExplorerCategory = Pick<Category, "slug" | "label" | "trade" | "icon" | "tone" | "summary" | "photoHint"> & {
  services: Pick<Service, "slug" | "name" | "mode">[];
  photoSrc?: string;
};
import { Icon } from "@/components/ui/icon";
import { PhotoSlot } from "@/components/ui/photo-slot";

export function CategoryExplorer({ categories, citySlug }: { categories: ExplorerCategory[]; citySlug: string }) {
  const [active, setActive] = useState(0);
  const current = categories[active];

  return (
    <div id="leistungen" className="mx-auto max-w-[1240px] scroll-mt-6 px-4 pb-10 sm:px-7 sm:pb-16">
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

        <div className="grid overflow-hidden rounded-panel bg-white shadow-[0_2px_10px_rgba(11,46,31,0.06)] md:grid-cols-2">
          <PhotoSlot
            tone={current.tone}
            hint={current.photoHint}
            src={current.photoSrc}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[16/9] w-full sm:aspect-[4/3] md:aspect-auto md:h-full md:min-h-[380px]"
          />
          <div className="flex min-w-0 flex-col justify-center gap-3 p-5 sm:gap-5 sm:p-10">
            <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-brand-dark sm:text-[32px]">{current.label}</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft sm:text-[17px]">{current.summary}</p>
            <ul className="divide-y divide-line border-y border-line">
              {current.services.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${citySlug}/${current.slug}#${s.slug}`}
                    className="group flex items-center justify-between gap-3 py-2.5 text-[14px] font-semibold sm:py-3 sm:text-[15px]"
                  >
                    <span className="group-hover:text-brand">{s.name}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          s.mode === "festpreis" ? "bg-mint text-brand-dark" : "bg-soft text-ink-soft"
                        }`}
                      >
                        {s.mode === "festpreis" ? "Festpreis" : "Angebot"}
                      </span>
                      <Icon name="pfeil" size={16} strokeWidth={2.2} className="text-muted group-hover:text-brand" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/${citySlug}/${current.slug}`}
              className="self-start rounded-full bg-brand px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark sm:px-6 sm:py-3.5 sm:text-base"
            >
              Alle Leistungen ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
