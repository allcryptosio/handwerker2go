import "server-only";
import type Stripe from "stripe";
import { absoluteUrl } from "@/lib/site";

/**
 * Aussehen der Stripe-Bezahlseiten (Checkout) in handwerker2go-Farben.
 * Das Branding des Plattform-Kontos lässt sich per API nicht setzen, deshalb geben wir es pro Bezahlseite mit.
 * Bei Buchungen (Direct Charge) ist der Betrieb der Händler: Sein Name bleibt sichtbar, wir setzen nur Symbol, Farbe und Schrift.
 */
const base: Stripe.Checkout.SessionCreateParams.BrandingSettings = {
  button_color: "#12704f",
  border_style: "pill",
  font_family: "inter",
  background_color: "#ffffff",
};

/** Buchung eines Kunden beim Betrieb: Name des Betriebs bleibt, Symbol von handwerker2go */
export const bookingCheckoutBranding = (): Stripe.Checkout.SessionCreateParams.BrandingSettings => ({
  ...base,
  icon: { type: "url", url: absoluteUrl("/stripe/icon.png") },
});

/** Mitgliedschaft des Betriebs bei handwerker2go: volles Logo */
export const platformCheckoutBranding = (): Stripe.Checkout.SessionCreateParams.BrandingSettings => ({
  ...base,
  display_name: "handwerker2go",
  icon: { type: "url", url: absoluteUrl("/stripe/icon.png") },
  logo: { type: "url", url: absoluteUrl("/stripe/logo.png") },
});
