/** Bildmarke von handwerker2go (Haus mit Blatt). Quelle: docs/brand/logo-mark.svg */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <rect width="100" height="100" rx="20" fill="#12704f" />
      <g fill="none" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 54 L50 17.5 L84.5 54" />
        <path d="M26.5 53.5 V82.5 H73.5 V53.5" />
        <path d="M40.5 27.5 C33 35 32.5 45.5 39.5 52.5 L50 63.5 L60.5 52.5 C67.5 45.5 67 35 59.5 27.5" />
        <path d="M50 18 V82.5" />
      </g>
    </svg>
  );
}
