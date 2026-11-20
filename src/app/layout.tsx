import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Header, HeaderView } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChromeSwitch } from "@/components/layout/chrome-switch";
import { PartnerFooter } from "@/components/layout/partner-footer";
import { PartnerHeader } from "@/components/layout/partner-header";
import { site } from "@/lib/site";
import { defaultOgImage } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Handwerker online buchen mit Festpreis | handwerker2go",
    template: "%s | handwerker2go",
  },
  description: "Handwerker in Hamburg online buchen: geprüfte Betriebe, freie Termine in Echtzeit, Festpreis vorab, sicher bezahlt. Elektriker, Maler, Montage und mehr.",
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: "handwerker2go: Handwerker in deiner Nähe online buchen",
    description: "Geprüfte Handwerksbetriebe in Hamburg: freie Termine in Echtzeit sehen, Festpreis vorab, online buchen und sicher bezahlen.",
    url: "/",
    images: [{ url: defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [defaultOgImage] },
  robots: process.env.NEXT_PUBLIC_NOINDEX === "1" ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#12704f",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      inLanguage: "de-DE",
      publisher: { "@id": `${site.url}/#org` },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Zum Inhalt springen
        </a>
        <Suspense fallback={<HeaderView pathname="" />}>
          <ChromeSwitch customer={<Header />} partner={<PartnerHeader />} />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Suspense fallback={<Footer />}>
          <ChromeSwitch customer={<Footer />} partner={<PartnerFooter />} />
        </Suspense>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
