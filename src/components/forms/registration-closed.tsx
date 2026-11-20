import Link from "next/link";

export function RegistrationClosed({ who }: { who: "kunde" | "betrieb" }) {
  return (
    <div role="status" className="flex flex-col gap-4 rounded-panel border-[1.5px] border-brand bg-mint p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-brand-dark">Die Registrierung startet in Kürze</h2>
      <p className="text-[16px] leading-relaxed text-ink-soft">
        {who === "betrieb"
          ? "Wir bereiten gerade den Start in Hamburg vor. In wenigen Tagen kannst du deinen Betrieb hier registrieren."
          : "Wir bereiten gerade den Start in Hamburg vor. In wenigen Tagen kannst du hier dein Konto erstellen und Handwerker buchen."}
      </p>
      <Link href={who === "betrieb" ? "/partner" : "/hamburg"} className="self-start rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark">
        {who === "betrieb" ? "Konditionen ansehen" : "Leistungen ansehen"}
      </Link>
    </div>
  );
}
