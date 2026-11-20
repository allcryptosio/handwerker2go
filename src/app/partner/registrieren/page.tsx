import type { Metadata } from "next";
import { ProviderRegisterForm } from "@/components/forms/provider-register-form";
import { Container } from "@/components/ui/container";
import { RegistrationClosed } from "@/components/forms/registration-closed";
import { mailReady } from "@/lib/mail";
import { categories } from "@/lib/catalog";
import { providerPricing as p } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Betrieb registrieren",
  description: `Registriere deinen Handwerksbetrieb bei handwerker2go. Die ersten ${p.introMonths} Monate ohne Grundgebühr.`,
  alternates: { canonical: "/partner/registrieren" },
  openGraph: { title: "Betrieb registrieren | handwerker2go für Betriebe", url: "/partner/registrieren", type: "website" },
};

export default function Page() {
  return (
    <div className="bg-soft">
      <Container className="flex max-w-[860px] flex-col gap-6 py-16">
        <h1 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-0.03em] text-brand-dark">Betrieb registrieren</h1>
        <p className="max-w-[640px] text-[17px] leading-relaxed text-ink-soft">
          Etwa zehn Minuten. Halte Gewerbeanmeldung, Versicherungsbestätigung und für Elektro, Sanitär und Maler die Handwerkskarte als PDF oder Foto bereit. Die ersten {p.introMonths} Monate zahlst du keine
          Grundgebühr.
        </p>
        {mailReady() ? (
          <ProviderRegisterForm categories={categories.map((c) => ({ slug: c.slug, label: c.label }))} />
        ) : (
          <RegistrationClosed who="betrieb" />
        )}
      </Container>
    </div>
  );
}
