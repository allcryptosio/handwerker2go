import Link from "next/link";

/**
 * Einstieg zur elektronischen Widerrufsfunktion (§ 356a BGB): als Button gestaltet, in Kontrastfarbe,
 * deutlich größer als die Links zu den Rechtstexten. Wird immer angezeigt, unabhängig vom Fristlauf.
 * variant "outline": schlanke Footer-Variante (rot umrandet), "solid": gefüllt (Konto, Buchung).
 */
export function WithdrawButton({ bookingNumber, className = "", variant = "solid" }: { bookingNumber?: string; className?: string; variant?: "solid" | "outline" }) {
  const href = bookingNumber ? `/vertrag-widerrufen?b=${encodeURIComponent(bookingNumber)}` : "/vertrag-widerrufen";
  const style = variant === "outline"
    ? "min-h-[44px] border-[1.5px] border-[#b42318] bg-white px-5 text-[15px] text-[#b42318] hover:bg-[#b42318] hover:text-white"
    : "min-h-[52px] border-2 border-[#b42318] bg-[#b42318] px-6 text-[16px] text-white hover:bg-[#8a1c12]";
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors ${style} ${className}`}>
      {variant === "outline" && (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
        </svg>
      )}
      Vertrag widerrufen
    </Link>
  );
}
