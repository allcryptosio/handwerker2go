import Link from "next/link";
import { PhotoSlot } from "@/components/ui/photo-slot";
import type { Article } from "@/content/ratgeber";
import { photoSrc } from "@/lib/photos";

export function ArticleCard({ a, basePath = "/ratgeber" }: { a: Article; basePath?: string }) {
  return (
    <Link href={`${basePath}/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white transition-shadow hover:shadow-[0_14px_40px_rgba(11,46,31,0.12)]">
      <PhotoSlot tone="neutral" hint={a.imageAlt} src={photoSrc(a.image)} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-brand">{a.kicker}</span>
        <h2 className="text-[19px] font-bold leading-snug text-ink group-hover:text-brand-dark">{a.title}</h2>
        <p className="line-clamp-3 text-[15px] text-ink-soft">{a.description}</p>
        <span className="mt-auto pt-2 text-[14px] font-semibold text-muted">{a.readingMinutes} Min. Lesezeit</span>
      </div>
    </Link>
  );
}
