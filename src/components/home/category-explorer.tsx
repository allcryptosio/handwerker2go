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
    <div id="leistungen" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 pb-16 sm:px-7">
      <div role="tablist" aria-label="Leistungen" className="flex gap-1.5 overflow-x-auto border-b border-line-strong sm:flex-wrap sm:justify-center">
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
              className={`flex min-w-[104px] shrink-0 flex-col items-center gap-2 border-b-[3px] px-4 pb-3 pt-3.5 text-sm font-semibold transition-colors ${
                selected ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  selected ? "bg-brand text-white" : "bg-white text-ink"
                }`}
              >
                <Icon name={c.icon} size={22} />
              </span>
              {c.label}
            </button>
          );
        })}
      </div>

      <div id="leistung-panel" role="tabpanel" aria-labelledby={`tab-${current.slug}`}>
        <ul className="flex flex-wrap justify-center gap-2.5 py-6">
          {current.services.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${citySlug}/${current.slug}#${s.slug}`}
                className="inline-block rounded-full border-[1.5px] border-line-strong bg-white px-[18px] py-[11px] text-[15px] font-semibold transition-colors hover:border-brand hover:text-brand"
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
            className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[380px]"
          />
          <div className="flex min-w-0 flex-col justify-center gap-5 p-7 sm:p-10">
            <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-brand-dark">{current.label}</h2>
            <p className="text-[17px] leading-relaxed text-ink-soft">{current.summary}</p>
            <ul className="divide-y divide-line border-y border-line">
              {current.services.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${citySlug}/${current.slug}#${s.slug}`}
                    className="group flex items-center justify-between gap-3 py-3 text-[15px] font-semibold"
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
              className="self-start rounded-full bg-brand px-6 py-3.5 font-bold text-white transition-colors hover:bg-brand-dark"
            >
              Alle Leistungen ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
