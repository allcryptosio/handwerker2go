import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ratgeber/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { articles, getArticle } from "@/content/ratgeber";
import { getCategory } from "@/lib/catalog";
import { photoSrc } from "@/lib/photos";
import { absoluteUrl, site } from "@/lib/site";

/** Unbekannte Artikel liefern eine echte 404 */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ratgeber/[slug]">): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  const url = `/ratgeber/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: a.title, description: a.description, url, publishedTime: a.published, modifiedTime: a.updated, images: [{ url: `/bilder/${a.image}` }] },
  };
}

const anchor = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dateDe = (d: string) => new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));

export default async function ArticlePage({ params }: PageProps<"/ratgeber/[slug]">) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const category = getCategory(a.categorySlug);
  const url = absoluteUrl(`/ratgeber/${a.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.description,
      image: absoluteUrl(`/bilder/${a.image}`),
      datePublished: a.published,
      dateModified: a.updated,
      inLanguage: "de-DE",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Redaktion handwerker2go", url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url, logo: { "@type": "ImageObject", url: absoluteUrl("/apple-icon.png") } },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  const others = articles.filter((x) => x.slug !== a.slug);

  return (
    <article className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="flex max-w-[860px] flex-col gap-6 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Startseite", href: "/" }, { name: "Ratgeber", href: "/ratgeber" }, { name: a.kicker, href: `/ratgeber/${a.slug}` }]} />
        <span className="self-start rounded-full bg-mint px-3 py-1 text-[13px] font-bold text-brand-dark">{a.kicker}</span>
        <h1 className="text-[clamp(32px,4.6vw,54px)] font-extrabold leading-[1.06] tracking-[-0.035em] text-brand-dark">{a.title}</h1>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
          <div><dt className="text-muted">Von</dt><dd className="font-semibold">Redaktion handwerker2go</dd></div>
          <div><dt className="text-muted">Aktualisiert</dt><dd className="font-semibold">{dateDe(a.updated)}</dd></div>
          <div><dt className="text-muted">Lesezeit</dt><dd className="font-semibold">{a.readingMinutes} Minuten</dd></div>
        </dl>
      </Container>
      <Container className="max-w-[1040px] py-8">
        <PhotoSlot tone="neutral" hint={a.imageAlt} src={photoSrc(a.image)} priority sizes="(min-width: 1040px) 1040px, 100vw" className="aspect-[16/8] rounded-banner" />
      </Container>
      <Container className="flex max-w-[760px] flex-col gap-8 text-[17px] leading-[1.75] text-ink">
        {a.intro.map((p) => <p key={p} className="text-[19px] leading-relaxed text-ink-soft">{p}</p>)}

        <aside className="rounded-panel bg-mint p-6">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-brand-dark">Das Wichtigste in 20 Sekunden</div>
          <ul className="flex flex-col gap-2">
            {a.takeaways.map((t) => (
              <li key={t} className="flex gap-3"><span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" /><span>{t}</span></li>
            ))}
          </ul>
        </aside>

        <nav aria-label="Inhalt" className="rounded-panel border border-line p-6">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">Inhalt</div>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-[16px]">
            {a.sections.map((s) => <li key={s.h2}><a href={`#${anchor(s.h2)}`} className="text-brand hover:underline">{s.h2}</a></li>)}
            <li><a href="#fragen" className="text-brand hover:underline">Häufige Fragen</a></li>
          </ol>
        </nav>

        {a.sections.map((s) => (
          <section key={s.h2} id={anchor(s.h2)} className="flex scroll-mt-8 flex-col gap-4">
            <h2 className="text-[clamp(24px,2.6vw,32px)] font-extrabold leading-tight tracking-[-0.02em] text-brand-dark">{s.h2}</h2>
            {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {s.list && (s.ordered ? (
              <ol className="flex list-decimal flex-col gap-2 pl-6">{s.list.map((l) => <li key={l}>{l}</li>)}</ol>
            ) : (
              <ul className="flex flex-col gap-2">{s.list.map((l) => (
                <li key={l} className="flex gap-3"><span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" /><span>{l}</span></li>
              ))}</ul>
            ))}
            {s.tip && (
              <p className="rounded-card border-l-4 border-brand bg-soft px-5 py-4 text-[16px]"><b className="text-brand-dark">Profi-Tipp: </b>{s.tip}</p>
            )}
          </section>
        ))}

        <section className="flex flex-col items-start gap-4 rounded-banner bg-brand-dark p-8 text-white">
          <h2 className="text-[clamp(24px,2.8vw,34px)] font-extrabold leading-tight tracking-[-0.02em]">{a.service.slug ? "Kein Bock auf Selbermachen?" : "Bereit für weniger Stress?"}</h2>
          <p className="text-[17px] text-white/85">
            Wähl Ort und Wunschtermin, und wir zeigen dir in Echtzeit, welche geprüften {category?.trade ?? "Handwerksbetriebe"} dann wirklich Zeit haben.
          </p>
          <Link href={a.service.slug ? `/termin?leistung=${a.service.slug}` : "/termin"} className="rounded-full bg-white px-6 py-3 font-bold text-brand-dark transition-colors hover:bg-mint">
            {a.service.label}
          </Link>
        </section>

        <section id="fragen" className="flex scroll-mt-8 flex-col gap-3">
          <h2 className="text-[clamp(24px,2.6vw,32px)] font-extrabold leading-tight tracking-[-0.02em] text-brand-dark">Häufige Fragen</h2>
          {a.faq.map((f) => (
            <details key={f.q} className="group rounded-card border border-line px-5 py-4">
              <summary className="cursor-pointer list-none font-bold marker:hidden">
                <span className="flex items-center justify-between gap-4">{f.q}<span aria-hidden className="text-brand transition-transform group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-3 text-[16px] text-ink-soft">{f.a}</p>
            </details>
          ))}
        </section>

        <p className="text-[14px] text-muted">
          Dieser Ratgeber gibt einen allgemeinen Überblick und ersetzt keine Rechtsberatung. Stand: {dateDe(a.updated)}.
        </p>
      </Container>

      <Container className="mt-16 flex flex-col gap-6">
        <h2 className="text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.02em] text-brand-dark">Mehr aus dem Ratgeber</h2>
        <ul className="grid gap-6 md:grid-cols-2">{others.map((o) => <li key={o.slug}><ArticleCard a={o} /></li>)}</ul>
      </Container>
    </article>
  );
}
