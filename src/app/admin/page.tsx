import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Container } from "@/components/ui/container";
import { decideProvider } from "@/lib/actions/auth-actions";
import { MASTER_REQUIRED_CATEGORIES, findContactData } from "@/lib/partner/guard";
import { currentUser } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const label: Record<string, string> = { pending: "In Prüfung", approved: "Freigeschaltet", rejected: "Abgelehnt", suspended: "Gesperrt" };

type FlagInput = {
  description: string; company_name: string; needs_master: boolean; documents: { kind: string }[] | null;
  bk_total: number; bk_done: number; bk_declined: number; bk_provider_cancel: number; bk_customer_cancel: number; bk_disputes: number;
};

/** Hinweise für die Prüfung: fehlende Nachweise, Kontaktdaten im Profil, auffällige Absagen und Rückbuchungen */
function ProviderFlags({ p }: { p: FlagInput }) {
  const kinds = new Set((p.documents ?? []).map((d) => d.kind));
  const flags: string[] = [];
  if (!kinds.has("gewerbeanmeldung")) flags.push("Gewerbeanmeldung fehlt");
  if (!kinds.has("versicherung")) flags.push("Betriebshaftpflicht fehlt");
  if (p.needs_master && !kinds.has("handwerksrolle")) flags.push("Handwerksrolle fehlt (zulassungspflichtiges Gewerk)");
  const contact = findContactData(`${p.company_name} ${p.description}`);
  if (contact) flags.push(`${contact} im Profiltext`);
  const decided = p.bk_done + p.bk_declined + p.bk_provider_cancel;
  if (decided >= 3 && (p.bk_declined + p.bk_provider_cancel) / decided > 0.3) flags.push("Lehnt viele Buchungen ab oder sagt ab");
  if (p.bk_customer_cancel >= 3 && p.bk_customer_cancel / Math.max(1, p.bk_total) > 0.4) flags.push("Viele Kunden-Stornos (mögliche Abwicklung außerhalb der Plattform)");
  if (p.bk_disputes > 0) flags.push(`${p.bk_disputes} Rückbuchung(en)`);
  return (
    <div className="flex flex-col gap-1">
      <span>
        Buchungen {p.bk_total}, erledigt {p.bk_done}, abgelehnt {p.bk_declined}, vom Betrieb abgesagt {p.bk_provider_cancel}, von Kunden storniert {p.bk_customer_cancel}
      </span>
      {flags.length === 0 ? (
        <span className="font-semibold text-brand">Keine</span>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {flags.map((f) => <li key={f} className="rounded-full bg-[#fef3f2] px-2.5 py-0.5 text-[13px] font-semibold text-[#b42318]">{f}</li>)}
        </ul>
      )}
    </div>
  );
}

async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const u = await currentUser();
  if (!u) redirect("/anmelden");
  if (u.role !== "admin") redirect("/");
  const { providers, stats, outbox } = await withDb({ userId: u.id, role: "admin" }, async (db) => {
    const providers = (await db.query(`
      select p.*, us.email, us."emailVerified" as email_verified,
        (select string_agg(c.label, ', ' order by c.sort) from provider_categories pc join service_categories c on c.id = pc.category_id where pc.provider_id = p.id) as categories,
        (select label || ', ' || radius_km || ' km' from service_areas a where a.provider_id = p.id limit 1) as area,
        (select json_agg(json_build_object('id', d.id, 'kind', d.kind, 'name', d.original_name)) from provider_documents d where d.provider_id = p.id) as documents,
        (select count(*) from bookings b where b.provider_id = p.id)::int as bk_total,
        (select count(*) from bookings b where b.provider_id = p.id and b.status = 'completed')::int as bk_done,
        (select count(*) from bookings b where b.provider_id = p.id and b.status = 'declined')::int as bk_declined,
        (select count(*) from bookings b where b.provider_id = p.id and b.status = 'cancelled' and coalesce(b.cancel_reason, '') not in ('Storniert durch Kunden', 'Termin bereits vergeben'))::int as bk_provider_cancel,
        (select count(*) from bookings b where b.provider_id = p.id and b.status = 'cancelled' and b.cancel_reason = 'Storniert durch Kunden')::int as bk_customer_cancel,
        (select count(*) from bookings b where b.provider_id = p.id and b.legal_hold)::int as bk_disputes,
        exists (select 1 from provider_categories pc join service_categories c on c.id = pc.category_id where pc.provider_id = p.id and c.slug = any($1)) as needs_master
      from provider_profiles p join "user" us on us.id = p.user_id
      order by (p.status = 'pending') desc, p.created_at desc limit 200`, [[...MASTER_REQUIRED_CATEGORIES]])).rows;
    const stats = (await db.query(`select
      (select count(*) from "user" where role = 'customer')::int as customers,
      (select count(*) from provider_profiles)::int as providers,
      (select count(*) from provider_profiles where status = 'approved')::int as active,
      (select count(*) from provider_profiles where status = 'pending')::int as pending`)).rows[0];
    const outbox = (await db.query("select count(*)::int as n from email_outbox where status = 'queued'")).rows[0].n as number;
    return { providers, stats, outbox };
  });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-0.03em] text-brand-dark">Admin</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/buchungen" className="font-semibold text-brand underline">Buchungen</Link>
          <Link href="/admin/bewertungen" className="font-semibold text-brand underline">Bewertungen</Link>
          <SignOutButton />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Kunden", stats.customers], ["Betriebe", stats.providers], ["Aktive Betriebe", stats.active], ["Warten auf Prüfung", stats.pending]].map(([k, v]) => (
          <div key={k} className="rounded-card border border-line p-4"><dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{k}</dt><dd className="mt-1 text-2xl font-extrabold">{v}</dd></div>
        ))}
      </dl>
      {outbox > 0 && (
        <p className="rounded-card border-[1.5px] border-[#e0a800] bg-[#fff8e1] p-4 text-[15px]">
          {outbox} E-Mail(s) warten im Ausgang. Der Versand startet, sobald ein E-Mail-Anbieter eingerichtet ist (MAIL_DRIVER).
        </p>
      )}
      {sp.fehler === "begruendung" && (
        <p role="alert" className="rounded-card border-[1.5px] border-[#b42318] bg-[#fef3f2] p-4 text-[15px]">
          Bitte gib bei Ablehnung oder Sperre eine Begründung an (mindestens 5 Zeichen). Sie geht per E-Mail an den Betrieb (AGB für Betriebe § 10).
        </p>
      )}
      <h2 className="text-2xl font-extrabold">Betriebe</h2>
      {providers.length === 0 && <p className="text-muted">Noch keine Registrierungen.</p>}
      <ul className="flex flex-col gap-4">
        {providers.map((p) => (
          <li key={p.id} className="rounded-panel border border-line p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold">{p.company_name}</h3>
              <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold">{label[p.status]}</span>
            </div>
            <dl className="mt-4 grid gap-3 text-[14px] sm:grid-cols-2">
              <div><dt className="text-muted">Kontakt</dt><dd>{p.contact_name}, {p.email} {p.email_verified ? "(bestätigt)" : "(E-Mail noch nicht bestätigt)"}, {p.phone}</dd></div>
              <div><dt className="text-muted">Anschrift</dt><dd>{p.street}, {p.postal_code} {p.city}{p.legal_form ? `, ${p.legal_form}` : ""}{p.vat_id ? `, USt-IdNr. ${p.vat_id}` : ""}</dd></div>
              <div><dt className="text-muted">Leistungen</dt><dd>{p.categories}</dd></div>
              <div><dt className="text-muted">Einsatzgebiet</dt><dd>{p.area}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Beschreibung</dt><dd className="whitespace-pre-line">{p.description}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Auffälligkeiten</dt><dd><ProviderFlags p={p} /></dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Nachweise</dt><dd className="flex flex-wrap gap-3">
                {(p.documents ?? []).map((d: { id: string; kind: string; name: string }) => (
                  <a key={d.id} href={`/admin/nachweis/${d.id}`} className="font-semibold text-brand underline">{d.kind}: {d.name}</a>
                ))}
              </dd></div>
            </dl>
            <form action={decideProvider} className="mt-5 flex flex-wrap items-end gap-3">
              <input type="hidden" name="providerId" value={p.id} />
              <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm font-semibold">Begründung (Pflicht bei Ablehnung oder Sperre, geht per E-Mail an den Betrieb)
                <input name="reason" maxLength={500} className="min-h-11 rounded-xl border-[1.5px] border-line-strong px-3 font-normal" />
              </label>
              {p.status !== "approved" && <button name="decision" value="approve" className="min-h-11 rounded-full bg-brand px-5 font-bold text-white hover:bg-brand-dark">Freischalten</button>}
              {p.status === "pending" && <button name="decision" value="reject" className="min-h-11 rounded-full border-[1.5px] border-[#b42318] px-5 font-bold text-[#b42318]">Ablehnen</button>}
              {p.status === "approved" && <button name="decision" value="suspend" className="min-h-11 rounded-full border-[1.5px] border-[#b42318] px-5 font-bold text-[#b42318]">Sperren</button>}
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Page({ searchParams }: PageProps<"/admin">) {
  return (
    <Container className="flex max-w-[1100px] flex-col gap-6 py-16">
      <Suspense fallback={<p>Lädt …</p>}>
        <Admin searchParams={searchParams as Promise<Record<string, string | undefined>>} />
      </Suspense>
    </Container>
  );
}
