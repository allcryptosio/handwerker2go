import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { asSystem, audit } from "@/lib/db";
import { verifyReviewOptOut } from "@/lib/review-optout";

export const metadata: Metadata = { title: "Bewertungsanfragen abbestellen", robots: { index: false, follow: false } };

/** Ein Klick auf den Link in der E-Mail genügt: Die Adresse kommt sofort auf die Sperrliste. */
async function OptOut({ searchParams }: PageProps<"/bewertungsmails-abbestellen">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const email = (sp.e ?? "").trim().toLowerCase();
  if (!email || !sp.t || !verifyReviewOptOut(email, sp.t)) {
    return <p role="alert" className="rounded-card border-[1.5px] border-[#b42318] bg-[#fef3f2] p-4">Der Link ist ungültig. Schreiben Sie uns einfach an info@handwerker2go.com, dann tragen wir Sie aus.</p>;
  }
  await asSystem(async (db) => {
    const r = await db.query("insert into review_mail_blocklist (email, source) values ($1, 'link') on conflict (email) do nothing returning email", [email]);
    if (r.rowCount) await audit(db, { actorRole: "anon", action: "review_mails.opt_out", entity: "review_mail_blocklist", after: { via: "link" } });
  });
  return (
    <p role="status" className="rounded-card border-[1.5px] border-brand bg-mint p-4 text-[16px]">
      Erledigt. Sie erhalten keine Bitten um Bewertung mehr. Buchungsbestätigungen und Terminerinnerungen schicken wir Ihnen weiterhin.
    </p>
  );
}

export default function Page(props: PageProps<"/bewertungsmails-abbestellen">) {
  return (
    <Container className="flex max-w-[560px] flex-col gap-6 py-16">
      <h1 className="text-[clamp(30px,4vw,40px)] font-extrabold tracking-[-0.03em] text-brand-dark">Bewertungsanfragen abbestellen</h1>
      <Suspense fallback={null}>
        <OptOut {...props} />
      </Suspense>
    </Container>
  );
}
