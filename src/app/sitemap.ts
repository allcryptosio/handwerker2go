import type { MetadataRoute } from "next";
import { partnerArticles } from "@/content/partner-ratgeber";
import { articles } from "@/content/ratgeber";
import { activeCities, categories } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/partner"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/ranking"), changeFrequency: "yearly", priority: 0.2 },
    ...["/agb", "/agb-betriebe", "/datenschutz", "/widerruf"].map((p) => ({ url: absoluteUrl(p), changeFrequency: "yearly" as const, priority: 0.1 })),
    { url: absoluteUrl("/ratgeber"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/partner/registrieren"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/partner/ratgeber"), changeFrequency: "weekly", priority: 0.6 },
    ...partnerArticles.map((a) => ({ url: absoluteUrl(`/partner/ratgeber/${a.slug}`), lastModified: a.updated, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/ratgeber/${a.slug}`), lastModified: a.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  for (const city of activeCities()) {
    pages.push({ url: absoluteUrl(`/${city.slug}`), changeFrequency: "weekly", priority: 0.9 });
    for (const c of categories) {
      pages.push({ url: absoluteUrl(`/${city.slug}/${c.slug}`), changeFrequency: "weekly", priority: 0.8 });
    }
  }
  return pages;
}
