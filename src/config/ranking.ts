/**
 * Ranking-Kriterien für die Suchergebnisse, absteigend gewichtet.
 * Öffentlich erklärt auf /ranking (P2B-Verordnung Art. 5, § 5b Abs. 2 UWG).
 * Die Sortierlogik der Suche (Phase 3) muss genau diese Reihenfolge umsetzen, siehe docs/RANKING.md.
 * Abo-Modell und Provision dürfen NICHT in das Ranking einfließen.
 */
export const rankingCriteria = [
  { key: "distance", title: "Entfernung", text: "Wie weit der Betrieb von der Adresse entfernt ist, an der der Auftrag ausgeführt werden soll." },
  { key: "availability", title: "Freier Termin", text: "Ob der Betrieb im gewünschten Zeitraum einen freien Termin hat." },
  { key: "reviews", title: "Bewertungen", text: "Die durchschnittliche Bewertung und die Anzahl der Bewertungen aus abgeschlossenen Buchungen." },
  { key: "reliability", title: "Zuverlässigkeit", text: "Wie schnell der Betrieb auf Anfragen antwortet und wie oft er Buchungen storniert." },
  { key: "profile", title: "Vollständiges Profil", text: "Ob das Profil vollständig ist, zum Beispiel mit Beschreibung, Leistungen, Preisen und Bildern." },
] as const;
