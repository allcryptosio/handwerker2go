# Ranking der Suchergebnisse: Kriterien und Abgleich mit dem Code

Öffentliche Beschreibung: `/ranking` (src/app/ranking/page.tsx), Kriterien zentral in `src/config/ranking.ts`.
Rechtsgrundlage: Art. 5 P2B-Verordnung (EU) 2019/1150, § 5b Abs. 2 UWG.

## Festgelegte Kriterien (absteigend gewichtet)

1. Entfernung zwischen Betrieb und Auftragsadresse
2. Verfügbarkeit eines freien Termins im gewünschten Zeitraum
3. Durchschnittliche Bewertung und Anzahl der Bewertungen
4. Antwortzeit und Stornoquote des Betriebs
5. Vollständigkeit des Profils

Abo-Modell und Provision fließen nicht ein. Bezahlte Platzierungen gibt es nicht.

## Abgleich mit dem Code (Stand 18.11.2026)

Es gibt **noch keine Sortierlogik**: Suche und Ergebnislisten mit Betrieben entstehen erst in Phase 3. Die Kategorieseiten
zeigen derzeit keine Betriebe. Abweichungen, die beim Bau der Suche zu lösen sind:

| Kriterium | Stand im Code | Vorschlag |
| --- | --- | --- |
| 1 Entfernung | `service_areas.center` ist vorhanden, wird aber noch nicht befüllt (kein Geocoding) | Mapbox-Geocoding bei Registrierung und Suche; `ST_Distance` zur Auftragsadresse |
| 2 Freier Termin | keine Verfügbarkeiten/Kalender im Schema | Tabelle `availability` plus Buchungen; Kennzeichen „Termin im Zeitraum frei“ |
| 3 Bewertungen | keine Tabelle `reviews` | Tabelle `reviews` (an Buchung gebunden); Bayes-Mittel, damit wenige Bewertungen nicht überwiegen |
| 4 Antwortzeit, Stornoquote | keine Messwerte | Antwortzeit aus Anfragen/Angeboten, Stornoquote aus Buchungsstatus (letzte 90 Tage) |
| 5 Profil-Vollständigkeit | keine Kennzahl | Punktwert aus Beschreibung, Leistungen mit Preis, Logo, Bildern, Qualifikationen |

Vorschlag zur Umsetzung der Gewichtung: lexikografische Sortierung nach Entfernungsband (z. B. 0–3, 3–7, 7–15 km), dann
Terminverfügbarkeit, dann Bewertungswert, dann Zuverlässigkeit, dann Profilwert. So bleibt die öffentlich beschriebene
Reihenfolge exakt nachvollziehbar. Abo- und Provisionsfelder dürfen in der Abfrage nicht vorkommen (Code-Review-Regel).
