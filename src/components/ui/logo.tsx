import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" aria-label="handwerker2go, zur Startseite" className="inline-flex items-center gap-2.5">
      <LogoMark size={38} className={inverted ? "rounded-[8px] ring-2 ring-white/80" : ""} />
      <span className={`inline-flex items-baseline text-[24px] font-extrabold tracking-[-0.04em] ${inverted ? "text-white" : "text-brand"}`}>
        handwerker
        <span className={`ml-[3px] rounded-lg px-[7px] text-[20px] ${inverted ? "bg-white text-brand-dark" : "bg-brand text-white"}`}>2go</span>
      </span>
    </Link>
  );
}
