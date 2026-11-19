import { z } from "zod";
import { availableDays, resolvePlace } from "@/lib/booking/search";
import { addDays, berlinDate, isValidDate } from "@/lib/booking/time";

const schema = z.object({ leistung: z.string().uuid(), ort: z.string().trim().min(2).max(80), von: z.string().refine(isValidDate) });

/** Tage mit mindestens einem freien Betrieb (für die Markierung im Kalender), 42 Tage ab „von“ */
export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ days: [] });
  const place = await resolvePlace(parsed.data.ort);
  if (!place) return Response.json({ days: [] });
  const today = berlinDate(new Date());
  const from = parsed.data.von < today ? today : parsed.data.von;
  if (from > addDays(today, 180)) return Response.json({ days: [] });
  const days = await availableDays({ templateId: parsed.data.leistung, place, fromDate: from, days: 42 });
  return Response.json({ days }, { headers: { "cache-control": "no-store" } });
}
