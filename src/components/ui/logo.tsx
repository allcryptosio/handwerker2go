import Link from "next/link";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="handwerker2go, zur Startseite"
      className={`inline-flex items-baseline text-[26px] font-extrabold tracking-[-0.04em] ${inverted ? "text-white" : "text-brand"}`}
    >
      handwerker
      <span
        className={`ml-[3px] rounded-lg px-[7px] text-[22px] ${inverted ? "bg-white text-brand-dark" : "bg-brand text-white"}`}
      >
        2go
      </span>
    </Link>
  );
}
