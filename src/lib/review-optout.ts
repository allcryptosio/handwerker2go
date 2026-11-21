import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signierter Abmelde-Link für Bewertungsanfragen (Aufgabe 13): ein Klick, ohne Login, nicht erratbar.
 * Die Abmeldung gilt für die E-Mail-Adresse (Sperrliste review_mail_blocklist) und damit für alle künftigen Buchungen.
 */
const norm = (email: string) => email.trim().toLowerCase();
const sign = (email: string) =>
  createHmac("sha256", `${process.env.BETTER_AUTH_SECRET ?? ""}:review-optout`).update(norm(email)).digest("base64url").slice(0, 32);

export function reviewOptOutUrl(email: string) {
  const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
  return `${base}/bewertungsmails-abbestellen?${new URLSearchParams({ e: norm(email), t: sign(email) })}`;
}

export function verifyReviewOptOut(email: string, token: string) {
  const a = Buffer.from(sign(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
