import Image from "next/image";
import type { Tone } from "@/lib/catalog";

/** Feste Klassen, damit Tailwind sie findet */
export const toneBg: Record<Tone, string> = {
  montage: "bg-tone-montage",
  wand: "bg-tone-wand",
  elektro: "bg-tone-elektro",
  sanitaer: "bg-tone-sanitaer",
  maler: "bg-tone-maler",
  umzug: "bg-tone-umzug",
  garten: "bg-tone-garten",
  entruempelung: "bg-tone-entruempelung",
  neutral: "bg-tone-neutral",
};

/**
 * Fotofläche. Mit `src` wird das echte Foto gezeigt, sonst ein beschrifteter Platzhalter
 * in gleicher Größe und Rundung.
 */
export function PhotoSlot({
  tone = "neutral",
  hint,
  src,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  className = "",
}: {
  tone?: Tone;
  hint: string;
  src?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const alt = hint.replace(/^Foto:\s*/, "");
  if (src) {
    return (
      <div className={`relative overflow-hidden ${toneBg[tone]} ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label={alt} className={`relative flex items-end overflow-hidden p-3.5 ${toneBg[tone]} ${className}`}>
      <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink">{hint}</span>
    </div>
  );
}
