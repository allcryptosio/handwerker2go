import type { ServiceChoice } from "@/components/booking/booking-search";
import { categories } from "@/lib/catalog";

/** Leistungen für das Leistungsfeld (aus dem statischen Katalog, damit Seiten statisch bleiben) */
export const serviceChoices = (): ServiceChoice[] =>
  categories.flatMap((c) => c.services.map((s) => ({ slug: s.slug, name: s.name, categoryLabel: c.label, mode: s.mode })));
