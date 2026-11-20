import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { pool } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "", "http://127.0.0.1:3012", "http://localhost:3012"].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    // Nach dem Zurücksetzen alle anderen Sitzungen abmelden (falls jemand Fremdes eingeloggt war)
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        template: "password-reset",
        subject: "Passwort zurücksetzen",
        heading: `Hallo ${user.name},`,
        paragraphs: [
          "du hast ein neues Passwort für dein Konto bei handwerker2go angefordert. Über den Button legst du es fest.",
          "Der Link ist 1 Stunde gültig. Wenn du das nicht warst, ignoriere diese E-Mail einfach. Dein Passwort bleibt dann unverändert.",
        ],
        button: { label: "Neues Passwort festlegen", url },
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendMail({
        to: user.email,
        template: "password-changed",
        subject: "Dein Passwort wurde geändert",
        heading: `Hallo ${user.name},`,
        paragraphs: [
          "das Passwort für dein Konto bei handwerker2go wurde gerade geändert. Aus Sicherheitsgründen haben wir dich auf allen Geräten abgemeldet.",
          "Warst du das nicht? Dann antworte bitte sofort auf diese E-Mail.",
        ],
      }).catch(console.error);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        template: "verify-email",
        subject: "Bitte bestätige deine E-Mail-Adresse",
        heading: `Hallo ${user.name},`,
        paragraphs: [
          "willkommen bei handwerker2go. Bitte bestätige deine E-Mail-Adresse, damit wir dein Konto aktivieren können.",
          "Der Link ist 24 Stunden gültig.",
        ],
        button: { label: "E-Mail-Adresse bestätigen", url },
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60, max: 30 },
  advanced: { useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false },
  plugins: [nextCookies()],
});

export type SessionUser = { id: string; name: string; email: string; role: "customer" | "provider" | "admin" };

/** Aktuelle Sitzung serverseitig lesen. Nur in dynamischen Bereichen (innerhalb von Suspense) aufrufen. */
export async function currentUser(): Promise<SessionUser | null> {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) return null;
  const u = s.user as typeof s.user & { role?: string };
  return { id: u.id, name: u.name, email: u.email, role: (u.role as SessionUser["role"]) ?? "customer" };
}
