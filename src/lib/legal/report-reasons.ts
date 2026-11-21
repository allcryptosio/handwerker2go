/** Gründe für „Inhalt melden“ (Art. 16 DSA) */
export const REPORT_REASONS = { rechtswidrig: "rechtswidrig", beleidigung: "Beleidigung", falsche_tatsachen: "falsche Tatsachen", urheberrecht: "Urheberrecht", sonstiges: "Sonstiges" } as const;
export type ReportReason = keyof typeof REPORT_REASONS;

/** Kontaktstelle nach Art. 11 und 12 DSA (Anhang H.1) */
export const DSA_CONTACT_TITLE = "Kontaktstelle nach Art. 11 und 12 der Verordnung (EU) 2022/2065 (Digital Services Act)";
