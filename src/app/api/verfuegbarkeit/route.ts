import { resolvePlace, searchAvailability } from "@/lib/booking/search";
import { exclusionLabel } from "@/lib/booking/engine";
import { searchSchema, windowById } from "./schema";

/** Verfügbare Betriebe für Leistung, Ort, Tag und Uhrzeit bzw. Zeitfenster */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) return Response.json({ error: "Bitte Leistung, Ort, Tag und Uhrzeit angeben." }, { status: 400 });
  const d = parsed.data;
  const place = await resolvePlace(d.ort);
  if (!place) return Response.json({ error: "Diesen Ort kennen wir nicht. Bitte eine Postleitzahl eingeben." }, { status: 422 });
  const result = await searchAvailability({
    templateId: d.leistung,
    place,
    date: d.datum,
    time: d.zeit,
    window: d.fenster ? windowById(d.fenster) : undefined,
  });
  const reasons = Object.entries(result.funnel.excluded).map(([k, n]) => ({ reason: exclusionLabel[k as keyof typeof exclusionLabel], count: n }));
  return Response.json(
    { place, hits: result.hits, funnel: { total: result.funnel.total, available: result.funnel.available, reasons } },
    { headers: { "cache-control": "no-store" } },
  );
}
