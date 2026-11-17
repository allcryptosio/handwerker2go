import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.href) })),
  };
  return (
    <nav aria-label="Brotkrumen" className="text-sm text-muted">
      <ol className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-2">
            {i < items.length - 1 ? (
              <>
                <Link href={it.href} className="hover:text-brand hover:underline">{it.name}</Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
