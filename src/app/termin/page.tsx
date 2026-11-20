import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { SearchResults } from "@/components/booking/search-results";
import { Container } from "@/components/ui/container";
import { serviceChoices } from "@/lib/booking/service-choices";

export const metadata: Metadata = pageMeta({
  title: "Freie Handwerker finden",
  description: "Leistung, Ort, Tag und Uhrzeit wählen und sofort sehen, welche geprüften Handwerksbetriebe dann Zeit haben.",
  path: "/termin",
  robots: { index: false, follow: true },
});

export default function TerminPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Suspense fallback={<div className="mx-auto h-[72px] max-w-[1040px] animate-pulse rounded-full bg-soft" />}>
        <SearchResults services={serviceChoices()} />
      </Suspense>
    </Container>
  );
}
