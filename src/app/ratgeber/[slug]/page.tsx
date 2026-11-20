import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ratgeber/article-view";
import { articles, getArticle } from "@/content/ratgeber";
import { getCategory } from "@/lib/catalog";

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

export default async function ArticlePage({ params }: PageProps<"/ratgeber/[slug]">) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const category = getCategory(a.categorySlug);
  return (
    <ArticleView
      a={a}
      others={articles.filter((x) => x.slug !== a.slug)}
      basePath="/ratgeber"
      crumbs={[{ name: "Startseite", href: "/" }, { name: "Ratgeber", href: "/ratgeber" }]}
      cta={{
        title: a.service.slug ? "Kein Bock auf Selbermachen?" : "Bereit für weniger Stress?",
        text: `Wähl Ort und Wunschtermin, und wir zeigen dir in Echtzeit, welche geprüften ${category?.trade ?? "Handwerksbetriebe"} dann wirklich Zeit haben.`,
        href: a.service.slug ? `/termin?leistung=${a.service.slug}` : "/termin",
        label: a.service.label,
      }}
    />
  );
}
