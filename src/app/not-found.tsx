import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex max-w-[560px] flex-col gap-5 py-24">
      <h1 className="text-[40px] font-extrabold tracking-[-0.03em] text-brand-dark">Seite nicht gefunden</h1>
      <p className="text-[17px] text-ink-soft">Diese Seite gibt es nicht oder nicht mehr.</p>
      <Link href="/" className="self-start rounded-full bg-brand px-6 py-3.5 font-bold text-white hover:bg-brand-dark">Zur Startseite</Link>
    </Container>
  );
}
