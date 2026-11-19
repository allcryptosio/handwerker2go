/** Formatierungen, die Server und Browser gemeinsam nutzen */
export function formatDateLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const WINDOWS = [
  { id: "08-10", label: "08:00–10:00" },
  { id: "10-12", label: "10:00–12:00" },
  { id: "12-14", label: "12:00–14:00" },
  { id: "14-16", label: "14:00–16:00" },
  { id: "16-18", label: "16:00–18:00" },
  { id: "18-20", label: "18:00–20:00" },
];
export const windowLabel = (id?: string) => WINDOWS.find((w) => w.id === id)?.label;
