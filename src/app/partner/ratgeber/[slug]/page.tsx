import type { Metadata } from "next";
import { ogFromPhoto, pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ratgeber/article-view";
import { getPartnerArticle, partnerArticles } from "@/content/partner-ratgeber";
import { providerPricing as p } from "@/lib/pricing";

/** Unbekannte Artikel liefern eine echte 404 */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return partnerArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/partner/ratgeber/[slug]">): Promise<Metadata> {
  const a = getPartnerArticle((await params).slug);
  if (!a) return {};
  const url = `/partner/ratgeber/${a.slug}`;
  return pageMeta({
    title: a.metaTitle,
    socialTitle: a.title,
    description: a.description,
    path: url,
    type: "article",
    publishedTime: a.published,
    modifiedTime: a.updated,
    image: ogFromPhoto(a.image),
  });
}

export default async function PartnerArticlePage({ params }: PageProps<"/partner/ratgeber/[slug]">) {
  const a = getPartnerArticle((await params).slug);
  if (!a) notFound();
  return (
    <ArticleView
      a={a}
      others={partnerArticles.filter((x) => x.slug !== a.slug)}
      basePath="/partner/ratgeber"
      crumbs={[{ name: "Für Betriebe", href: "/partner" }, { name: "Ratgeber", href: "/partner/ratgeber" }]}
      cta={{
        title: "Aufträge aus deiner Nachbarschaft",
        text: `Kunden buchen dich direkt in deine freien Termine und zahlen vorab online. Die ersten ${p.introMonths} Monate ohne Grundgebühr.`,
        href: "/partner/registrieren",
        label: "Jetzt Partner werden",
      }}
    />
  );
}
