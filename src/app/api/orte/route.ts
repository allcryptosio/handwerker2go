import { suggestPlaces } from "@/lib/booking/search";

/** Ortsvorschläge (PLZ oder Ortsname) für das Ortsfeld */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 60) ?? "";
  const places = await suggestPlaces(q);
  return Response.json({ places }, { headers: { "cache-control": "public, max-age=3600" } });
}
