import { legal } from "@/config/legal";

/**
 * E-Mail-Adresse als Link, von der Cloudflare-Verschleierung ausgenommen (<!--email_off-->),
 * damit in Rechtstexten nie „[email protected]“ erscheint.
 */
export function Email({ address = legal.email }: { address?: string }) {
  const safe = address.replace(/[^a-zA-Z0-9@._+-]/g, "");
  return (
    <span
      dangerouslySetInnerHTML={{ __html: `<!--email_off--><a href="mailto:${safe}" class="underline">${safe}</a><!--/email_off-->` }}
    />
  );
}
