import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signierter Abmelde-Link für Bewertungsanfragen (ohne Login nutzbar, nicht erratbar) */
const sign = (userId: string) =>
  createHmac("sha256", `${process.env.BETTER_AUTH_SECRET ?? ""}:review-optout`).update(userId).digest("base64url").slice(0, 32);

export function reviewOptOutUrl(userId: string) {
  const base = process.env.BETTER_AUTH_URL ?? "https://handwerker2go.com";
  return `${base}/bewertungsmails-abbestellen?${new URLSearchParams({ u: userId, t: sign(userId) })}`;
}

export function verifyReviewOptOut(userId: string, token: string) {
  const a = Buffer.from(sign(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
