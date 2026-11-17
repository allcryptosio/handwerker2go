import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dateispeicher hinter einer Schnittstelle. Heute lokal auf dem Server (privat, nicht im Web-Ordner),
 * später austauschbar gegen S3-kompatiblen Speicher wie Supabase Storage (STORAGE_DRIVER=s3).
 */
export interface FileStorage {
  put(prefix: string, data: Buffer, ext: string): Promise<string>;
  get(key: string): Promise<Buffer>;
}

class LocalStorage implements FileStorage {
  constructor(private root: string) {}
  private resolve(key: string) {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root) + path.sep)) throw new Error("Ungültiger Speicherpfad");
    return full;
  }
  async put(prefix: string, data: Buffer, ext: string) {
    const key = `${prefix}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true, mode: 0o750 });
    await writeFile(full, data, { mode: 0o640 });
    return key;
  }
  get(key: string) {
    return readFile(this.resolve(key));
  }
}

export const storage: FileStorage = new LocalStorage(process.env.STORAGE_DIR ?? "/var/lib/handwerker2go/uploads");

/** Erlaubte Nachweis-Dateien, geprüft am Dateiinhalt (nicht nur an der Endung) */
export function detectDocumentType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  return null;
}
