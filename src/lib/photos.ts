import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Liefert den Pfad zu einem Foto in public/bilder, falls die Datei existiert.
 * Dateinamen siehe docs/BILDER-PROMPTS.md. Fehlt die Datei, zeigt die Seite den Platzhalter.
 */
export function photoSrc(file: string): string | undefined {
  return existsSync(path.join(process.cwd(), "public", "bilder", file)) ? `/bilder/${file}` : undefined;
}
