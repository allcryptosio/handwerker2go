import Link from "next/link";

/**
 * Einstieg zur elektronischen Widerrufsfunktion (§ 356a BGB): als Button gestaltet, in Kontrastfarbe,
 * deutlich größer als die Links zu den Rechtstexten. Wird immer angezeigt, unabhängig vom Fristlauf.
 */
export function WithdrawButton({ bookingNumber, className = "" }: { bookingNumber?: string; className?: string }) {
  const href = bookingNumber ? `/vertrag-widerrufen?b=${encodeURIComponent(bookingNumber)}` : "/vertrag-widerrufen";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-[#b42318] bg-[#b42318] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#8a1c12] ${className}`}
    >
      Vertrag widerrufen
    </Link>
  );
}
