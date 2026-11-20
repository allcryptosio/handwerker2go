import { CategoryExplorer } from "@/components/home/category-explorer";
import { Hero } from "@/components/home/hero";
import { HowItWorks, PopularProjects, ProviderCta, ReviewsIntro, TrustBanner } from "@/components/home/sections";
import { RatgeberTeaser, SeoText } from "@/components/home/seo-text";
import { categories, getCity } from "@/lib/catalog";
import { photoSrc } from "@/lib/photos";
import { site } from "@/lib/site";

export default function HomePage() {
  const city = getCity(site.defaultCity)!;
  return (
    <>
      <section className="bg-mint">
        <Hero cityName={city.name} />
        <CategoryExplorer
          categories={categories.map(({ slug, label, trade, icon, tone, summary, photoHint, photoFile, services }) => ({
            slug, label, trade, icon, tone, summary, photoHint,
            photoSrc: photoSrc(photoFile),
            services: services.map(({ slug, name, mode }) => ({ slug, name, mode })),
          }))}
          citySlug={city.slug}
        />
      </section>
      <PopularProjects citySlug={city.slug} cityName={city.name} />
      <ReviewsIntro />
      <TrustBanner />
      <HowItWorks />
      <SeoText citySlug={city.slug} />
      <RatgeberTeaser />
      <ProviderCta />
    </>
  );
}
