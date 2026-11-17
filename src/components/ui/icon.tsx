import type { IconName } from "@/lib/catalog";

const paths: Record<IconName | "suche" | "schild" | "karte" | "stern" | "pfeil" | "menue" | "schliessen" | "standort", React.ReactNode> = {
  montage: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" />,
  wand: (<><rect x="3" y="5" width="18" height="11" rx="1.5" /><path d="M9 20h6M12 16v4" /></>),
  elektro: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  sanitaer: (<><path d="M4 9h9a3 3 0 0 1 3 3v1" /><path d="M4 6v6" /><path d="M16 16v1M14 19v1M18 19v1" /></>),
  maler: (<><rect x="3" y="3" width="15" height="6" rx="1.5" /><path d="M18 6h3v5h-9v3" /><rect x="10" y="14" width="4" height="7" rx="1" /></>),
  umzug: (<><rect x="2" y="7" width="12" height="10" /><path d="M14 10h4l3 3v4h-7" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  garten: (<><path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16z" /><path d="M5 21l8-8" /></>),
  entruempelung: (<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></>),
  werkzeug: (<><path d="M3 21l7-7" /><path d="M14 4l6 6-3 3-6-6z" /></>),
  suche: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  schild: (<><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  karte: (<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></>),
  stern: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  pfeil: <path d="M5 12h14M13 6l6 6-6 6" />,
  menue: <path d="M4 7h16M4 12h16M4 17h16" />,
  schliessen: <path d="M6 6l12 12M18 6L6 18" />,
  standort: (<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>),
};

export type AnyIcon = keyof typeof paths;

export function Icon({ name, size = 24, strokeWidth = 1.8, className }: { name: AnyIcon; size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
