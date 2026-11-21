import Link from "next/link";
import { PhotoSlot } from "@/components/ui/photo-slot";
import type { Article } from "@/content/ratgeber";
import { photoSrc } from "@/lib/photos";

export function ArticleCard({ a, basePath = "/ratgeber" }: { a: Article; basePath?: string }) {
  return (
    <Link href={`${basePath}/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-shadow hover:shadow-[0_14px_40px_rgba(11,46,31,0.12)]">
      <PhotoSlot tone="neutral" hint={a.imageAlt} src={photoSrc(a.image)} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-brand sm:text-[13px]">{a.kicker}</span>
        <h2 className="text-[16px] font-bold leading-snug text-ink group-hover:text-brand-dark sm:text-[19px]">{a.title}</h2>
        <p className="line-clamp-2 text-[14px] text-ink-soft sm:line-clamp-3 sm:text-[15px]">{a.description}</p>
        <span className="mt-auto pt-1 text-[13px] font-semibold text-muted sm:pt-2 sm:text-[14px]">{a.readingMinutes} Min. Lesezeit</span>
      </div>
    </Link>
  );
}
