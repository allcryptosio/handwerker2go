import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Standard-Vorschaubild für Social Media (1200 × 630, JPG wegen LinkedIn/WhatsApp) */
export const defaultOgImage = "/og/standard.jpg";

/** Vorschaubild aus einem Foto in public/bilder (z. B. "kategorie-elektro.webp" → "/og/kategorie-elektro.jpg") */
export const ogFromPhoto = (file: string) => `/og/${file.replace(/\.webp$/, ".jpg")}`;

type PageMetaInput = {
  /** Meta Title ohne Markenzusatz (der kommt über das Template „%s | handwerker2go“), möglichst ≤ 44 Zeichen */
  title: string;
  /** Meta Description, möglichst 120 bis 155 Zeichen */
  description: string;
  /** Pfad der Seite, z. B. "/hamburg/elektriker" */
  path: string;
  /** Überschrift für Social Media, falls abweichend vom Meta Title */
  socialTitle?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  robots?: Metadata["robots"];
};

/** Einheitliche Metadaten: Titel, Beschreibung, Canonical, Open Graph und Twitter passen immer zusammen */
export function pageMeta(m: PageMetaInput): Metadata {
  const image = { url: m.image ?? defaultOgImage, width: 1200, height: 630 };
  const socialTitle = m.socialTitle ?? m.title;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.path },
    openGraph: {
      type: m.type ?? "website",
      locale: site.locale,
      siteName: site.name,
      url: m.path,
      title: socialTitle,
      description: m.description,
      images: [image],
      ...(m.type === "article" ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: socialTitle, description: m.description, images: [image.url] },
    ...(m.robots ? { robots: m.robots } : {}),
  };
}
