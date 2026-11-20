import type { Metadata } from "next";
import { ogFromPhoto, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeCities, categories, getCategory, getCity } from "@/lib/catalog";
import { photoSrc } from "@/lib/photos";
import { absoluteUrl, site } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PhotoSlot } from "@/components/ui/photo-slot";

/** Unbekannte Städte oder Kategorien sollen eine echte 404 liefern, nicht 200 mit Fallback. */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return activeCities().flatMap((city) => categories.map((c) => ({ stadt: city.slug, kategorie: c.slug })));
}

async function load(params: PageProps<"/[stadt]/[kategorie]">["params"]) {
  const { stadt, kategorie } = await params;
  const city = getCity(stadt);
  const category = getCategory(kategorie);
  return city && category ? { city, category } : null;
}

export async function generateMetadata({ params }: PageProps<"/[stadt]/[kategorie]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { city, category } = data;
  const title = `${category.trade} ${city.name}: Festpreis & Termin`;
  const description = `${category.trade} in ${city.name} finden: ${category.services
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ")} und mehr. Geprüfte Betriebe, freie Termine, sichere Zahlung.`;
  return pageMeta({
    title,
    socialTitle: `${category.trade} in ${city.name}: Festpreis und Termin online`,
    description,
    path: `/${city.slug}/${category.slug}`,
    image: ogFromPhoto(category.photoFile),
  });
}

export default async function CategoryCityPage({ params }: PageProps<"/[stadt]/[kategorie]">) {
  const data = await load(params);
  if (!data) notFound();
  const { city, category } = data;
  const others = categories.filter((c) => c.slug !== category.slug);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: category.trade,
    areaServed: { "@type": "City", name: city.name },
    provider: { "@type": "Organization", name: site.name, url: site.url },
    url: absoluteUrl(`/${city.slug}/${category.slug}`),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${category.trade} in ${city.name}`,
      itemListElement: category.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name } })),
    },
  };

  return (
    <>
      <section className="bg-mint">
        <Container className="flex flex-wrap items-center gap-10 py-14">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-4">
            <Breadcrumbs
              items={[
                { name: "Start", href: "/" },
                { name: city.name, href: `/${city.slug}` },
                { name: category.trade, href: `/${city.slug}/${category.slug}` },
              ]}
            />
            <h1 className="text-[clamp(34px,4.4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-brand-dark">
              {category.trade} in {city.name}
            </h1>
            <p className="max-w-[620px] text-lg leading-relaxed text-ink-soft">{category.cityIntro.replaceAll("{stadt}", city.name)}</p>
          </div>
          <PhotoSlot tone={category.tone} hint={category.photoHint} src={photoSrc(category.photoFile)} priority className="aspect-[4/3] min-w-0 flex-[1_1_380px] rounded-panel" />
        </Container>
      </section>

      <Container className="py-16">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em] text-brand-dark">Leistungen</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {category.services.map((s) => (
            <li key={s.slug} id={s.slug} className="flex scroll-mt-6 flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="mt-1 text-sm text-muted">
                  {s.mode === "festpreis"
                    ? `Festpreis, Dauer etwa ${Math.round((s.durationMin ?? 60) / 30) / 2} Std.`
                    : "Individuelles Angebot nach Beschreibung und Fotos"}
                </div>
              </div>
              <span className="rounded-full bg-soft px-4 py-2 text-sm font-semibold">
                {s.mode === "festpreis" ? "Preis legt der Betrieb fest" : "Angebot anfragen"}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-14 rounded-panel bg-soft p-7 sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Betriebe in {city.name}</h2>
          <p className="mt-3 max-w-[680px] text-[15px] leading-relaxed text-ink-soft">
            Wir schalten gerade die ersten geprüften Betriebe in {city.name} frei. Sobald Betriebe verfügbar sind, siehst du
            hier ihre Preise, freien Termine und Bewertungen aus echten Buchungen.
          </p>
          <p className="mt-2 text-[14px] text-muted">
            <Link href="/ranking" className="underline hover:text-brand">So sortieren wir die Suchergebnisse</Link>
          </p>
          <Link href="/partner" className="mt-5 inline-block rounded-full bg-brand px-6 py-3.5 font-bold text-white hover:bg-brand-dark">
            Du bist Handwerker in {city.name}? Jetzt anmelden
          </Link>
        </div>

        {category.faq.length > 0 && (
          <section aria-labelledby="faq-titel" className="mt-16">
            <h2 id="faq-titel" className="text-[28px] font-extrabold tracking-[-0.02em] text-brand-dark">Häufige Fragen</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {category.faq.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="cursor-pointer list-none text-lg font-semibold marker:hidden">{f.q}</summary>
                  <p className="mt-3 max-w-[760px] text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <nav aria-label={`Weitere Leistungen in ${city.name}`} className="mt-16">
          <h2 className="text-xl font-bold">Weitere Leistungen in {city.name}</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/${city.slug}/${c.slug}`} className="inline-block rounded-full border-[1.5px] border-line-strong px-4 py-2.5 text-[15px] font-semibold hover:border-brand hover:text-brand">
                  {c.trade} {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    </>
  );
}
