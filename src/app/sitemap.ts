import type { MetadataRoute } from "next";
import { activeCities, categories } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/fuer-handwerker"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/ranking"), changeFrequency: "yearly", priority: 0.2 },
  ];
  for (const city of activeCities()) {
    pages.push({ url: absoluteUrl(`/${city.slug}`), changeFrequency: "weekly", priority: 0.9 });
    for (const c of categories) {
      pages.push({ url: absoluteUrl(`/${city.slug}/${c.slug}`), changeFrequency: "weekly", priority: 0.8 });
    }
  }
  return pages;
}
