import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeCities, categories, getCity } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { toneBg } from "@/components/ui/photo-slot";

/** Unbekannte Städte oder Kategorien sollen eine echte 404 liefern, nicht 200 mit Fallback. */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return activeCities().map((c) => ({ stadt: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[stadt]">): Promise<Metadata> {
  const city = getCity((await params).stadt);
  if (!city) return {};
  return {
    title: `Handwerker in ${city.name} online buchen`,
    description: `Geprüfte Handwerksbetriebe in ${city.name}: Elektriker, Sanitär, Maler, Montage und mehr. Festpreise, freie Termine, sichere Zahlung.`,
    alternates: { canonical: `/${city.slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/[stadt]">) {
  const city = getCity((await params).stadt);
  if (!city) notFound();
  return (
    <>
      <section className="bg-mint">
        <Container className="flex flex-col gap-4 py-14">
          <Breadcrumbs items={[{ name: "Start", href: "/" }, { name: city.name, href: `/${city.slug}` }]} />
          <h1 className="text-[clamp(34px,4.4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-brand-dark">
            Handwerker in {city.name}
          </h1>
          <p className="max-w-[640px] text-lg leading-relaxed text-ink-soft">
            Wähle eine Leistung. Du siehst Festpreise, freie Termine und Betriebe, die in deinem Stadtteil arbeiten.
          </p>
        </Container>
      </section>
      <Container className="py-16">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/${city.slug}/${c.slug}`} className="group flex h-full flex-col gap-4 rounded-card border border-line p-6 transition-shadow hover:shadow-[0_6px_20px_rgba(11,46,31,0.08)]">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${toneBg[c.tone]}`}>
                  <Icon name={c.icon} size={24} />
                </span>
                <span className="text-xl font-bold group-hover:text-brand">{c.trade} in {city.name}</span>
                <span className="text-[15px] leading-relaxed text-muted">{c.services.map((s) => s.name).slice(0, 4).join(", ")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-16 text-2xl font-extrabold tracking-[-0.02em]">Stadtteile in {city.name}</h2>
        <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-ink-soft">
          Betriebe legen ihr Einsatzgebiet selbst fest. Nach Eingabe deiner Adresse siehst du nur Betriebe, die zu dir kommen,
          zum Beispiel nach {city.districts.slice(0, -1).join(", ")} oder {city.districts.at(-1)}.
        </p>
      </Container>
    </>
  );
}
