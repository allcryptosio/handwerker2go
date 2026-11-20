/**
 * Ratgeber-Artikel (SEO). Ton: locker, direkt, per du. Keine erfundenen Preise oder Statistiken:
 * Kosten erklären wir über Kostentreiber, Fakten nur mit belastbarer Grundlage.
 */
export interface ArticleSection {
  h2: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  tip?: string;
}

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  kicker: string;
  categorySlug: string;
  /** Leistung für den Buchungs-Button (Kurzname aus dem Katalog) */
  service: { slug: string; label: string };
  image: string;
  imageAlt: string;
  readingMinutes: number;
  published: string;
  updated: string;
  intro: string[];
  takeaways: string[];
  sections: ArticleSection[];
  faq: { q: string; a: string }[];
}

export const articles: Article[] = [
  {
    slug: "entruempelung-hamburg",
    title: "Entrümpelung in Hamburg: So wirst du den ganzen Kram stressfrei los",
    metaTitle: "Entrümpelung Hamburg: Kosten, Ablauf und Tipps",
    description:
      "Keller voll, Wohnung auflösen, Sperrmüll im Weg? So läuft eine Entrümpelung in Hamburg ab, wovon die Kosten abhängen und woran du seriöse Betriebe erkennst.",
    kicker: "Entrümpelung",
    categorySlug: "entruempelung",
    service: { slug: "keller-entruempeln", label: "Entrümpelung buchen" },
    image: "projekt-keller-entruempeln.webp",
    imageAlt: "Handwerker trägt Kartons aus einem Kellerraum",
    readingMinutes: 6,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Der Keller ist bis unter die Decke voll, die WG-Auflösung steht an oder Omas Wohnung muss leer werden: Irgendwann ist der Punkt erreicht, an dem „mach ich am Wochenende“ einfach nicht mehr funktioniert.",
      "Hier bekommst du den kompletten Überblick: wann sich ein Profi lohnt, wovon der Preis wirklich abhängt, was du selbst zur Stadtreinigung bringen kannst und wie du schwarze Schafe erkennst.",
    ],
    takeaways: [
      "Der Preis hängt vor allem von Menge, Etage, Laufweg und Art des Abfalls ab.",
      "Seriöse Betriebe nennen dir vorher einen festen Preis oder schauen sich alles an.",
      "Kleine Mengen kannst du selbst zu den Recyclinghöfen der Stadtreinigung Hamburg bringen.",
    ],
    sections: [
      {
        h2: "Wann lohnt sich ein Entrümpelungs-Profi?",
        paragraphs: [
          "Ein paar Kartons fährst du easy selbst weg. Sobald aber Möbel zerlegt, schwere Sachen durchs Treppenhaus getragen oder verschiedene Abfallarten getrennt werden müssen, wird es schnell ein Projekt für mehrere Tage, mit geliehenem Transporter, mehreren Fahrten und kaputtem Rücken.",
          "Ein Betrieb bringt Leute, Werkzeug und Fahrzeug mit und kennt die Entsorgungswege. Meistens ist ein normaler Keller in wenigen Stunden leer.",
        ],
        list: [
          "Wohnungsauflösung nach Umzug, Trennung oder Todesfall",
          "Keller, Dachboden oder Garage, die seit Jahren voll sind",
          "Sperrige Möbel, die nicht ins Auto passen",
          "Termindruck, zum Beispiel weil die Wohnungsübergabe ansteht",
        ],
      },
      {
        h2: "Was kostet eine Entrümpelung in Hamburg?",
        paragraphs: [
          "Eine seriöse Pauschale aus dem Internet gibt es nicht, weil jede Entrümpelung anders ist. Den Preis bestimmen vor allem diese Punkte:",
        ],
        list: [
          "Menge: wie viele Kubikmeter rausmüssen",
          "Zugang: Etage, Aufzug ja oder nein, wie weit der Weg bis zum Fahrzeug ist",
          "Abfallart: Holz, Metall und Elektrogeräte werden unterschiedlich entsorgt; Farben, Lacke oder Chemikalien sind Sondermüll",
          "Aufwand: Muss etwas abgebaut, zerlegt oder besenrein übergeben werden?",
          "Verwertbares: Gut erhaltene Möbel oder Geräte können manchmal mit dem Preis verrechnet werden",
        ],
        tip: "Mach vorher Fotos von jedem Raum und lade sie bei der Buchung hoch. Dann weiß der Betrieb genau, was ihn erwartet, und es gibt keine Überraschungen am Tag selbst.",
      },
      {
        h2: "Selbst entsorgen: Sperrmüll und Recyclinghöfe",
        paragraphs: [
          "Für kleinere Mengen ist die Stadtreinigung Hamburg deine erste Adresse: Auf den Recyclinghöfen kannst du Sperrmüll, Elektrogeräte und viele andere Abfälle aus dem Haushalt abgeben, und die Stadtreinigung holt Sperrmüll auf Bestellung auch bei dir ab. Welche Mengen und Abfälle angenommen werden und was es kostet, steht aktuell auf der Website der Stadtreinigung Hamburg.",
          "Wichtig: Sperrmüll einfach an die Straße stellen ist in Hamburg keine gute Idee. Das kann als illegale Müllablagerung teuer werden.",
        ],
      },
      {
        h2: "So bereitest du die Entrümpelung vor",
        ordered: true,
        list: [
          "Durchgehen und markieren: Was bleibt, was wird verkauft oder verschenkt, was kommt weg?",
          "Wertsachen, Dokumente und Fotos vorher rausholen.",
          "Fotos machen und die ungefähre Menge schätzen.",
          "Zugang klären: Schlüssel, Hausverwaltung informieren, Parkmöglichkeit fürs Fahrzeug.",
          "Termin buchen und am Tag kurz erreichbar sein.",
        ],
      },
      {
        h2: "Woran du seriöse Betriebe erkennst",
        list: [
          "Fester Preis vor dem Start oder eine Besichtigung, bevor ein Preis genannt wird",
          "Schriftliche Bestätigung mit Leistungsumfang",
          "Ordentliche Entsorgung über zugelassene Wege statt „das regeln wir schon“",
          "Keine Barzahlung ohne Rechnung",
          "Ein angemeldetes Gewerbe; auf handwerker2go prüfen wir das bei jedem Betrieb vor der Freischaltung",
        ],
      },
    ],
    faq: [
      {
        q: "Wie lange dauert eine Entrümpelung?",
        a: "Ein normaler Kellerraum ist meist in wenigen Stunden leer. Eine komplette Wohnung kann je nach Größe und Menge einen ganzen Tag oder länger dauern.",
      },
      {
        q: "Muss ich bei der Entrümpelung dabei sein?",
        a: "Am Anfang ist es gut, wenn du kurz vor Ort bist und zeigst, was wegkommt und was bleibt. Danach reicht es meistens, wenn du telefonisch erreichbar bist.",
      },
      {
        q: "Was passiert mit Möbeln, die noch gut sind?",
        a: "Viele Betriebe geben brauchbare Sachen weiter oder rechnen sie mit dem Preis gegen. Sprich das am besten vorher an.",
      },
      {
        q: "Kann ich kostenlos stornieren?",
        a: "Wenn du über handwerker2go buchst, kannst du bis 24 Stunden vor dem Termin kostenlos stornieren.",
      },
    ],
  },
  {
    slug: "lampe-anschliessen-elektriker",
    title: "Lampe anschließen: Selbst machen oder Elektriker holen?",
    metaTitle: "Lampe anschließen lassen: Elektriker oder selbst?",
    description:
      "Neue Deckenlampe, aber keine Lust auf Stromschlag? Was du bei Lampen selbst machen darfst, wann ein Elektriker ran muss und wie schnell du einen in Hamburg findest.",
    kicker: "Elektro",
    categorySlug: "elektriker",
    service: { slug: "lampe-anschliessen", label: "Elektriker buchen" },
    image: "projekt-lampe-anschliessen.webp",
    imageAlt: "Elektriker schließt eine Deckenleuchte an",
    readingMinutes: 5,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Die neue Lampe ist da, sieht mega aus, und an der Decke hängen drei Kabel. Viele denken jetzt: „Kriege ich hin, gibt doch Videos.“ Kann klappen, muss aber nicht.",
      "Strom verzeiht keine Fehler. Hier liest du, was rechtlich gilt, welche Sicherheitsregeln Profis immer einhalten und wann du lieber jemanden holst, der das jeden Tag macht.",
    ],
    takeaways: [
      "Arbeiten an der Elektroanlage sind Sache von Elektrofachbetrieben.",
      "Profis arbeiten nach den fünf Sicherheitsregeln, bevor sie ein Kabel anfassen.",
      "Eine Lampe anzuschließen dauert für einen Elektriker meist unter einer Stunde.",
    ],
    sections: [
      {
        h2: "Was sagt das Gesetz?",
        paragraphs: [
          "Die Niederspannungsanschlussverordnung (NAV) regelt in § 13, dass Arbeiten an der elektrischen Anlage hinter dem Hausanschluss nur ein Installationsunternehmen machen darf, das im Installateurverzeichnis eines Netzbetreibers eingetragen ist. Gemeint ist zum Beispiel, eine Anlage neu zu errichten, zu erweitern oder zu ändern, etwa eine neue Steckdose oder einen neuen Lichtauslass.",
          "Eine Lampe an einem vorhandenen Anschluss zu tauschen, machen viele selbst. Trotzdem gilt: Wenn dabei etwas schiefgeht, haftest du, und auch mit der Versicherung kann es Ärger geben. Wer unsicher ist, holt einen Profi.",
        ],
      },
      {
        h2: "Die 5 Sicherheitsregeln der Elektriker",
        paragraphs: ["Elektrofachkräfte arbeiten nach den fünf Sicherheitsregeln aus der Norm DIN VDE 0105-100, und zwar in dieser Reihenfolge:"],
        ordered: true,
        list: [
          "Freischalten: Sicherung raus bzw. Sicherungsautomat aus",
          "Gegen Wiedereinschalten sichern: Sicherungskasten markieren oder abschließen",
          "Spannungsfreiheit feststellen: mit einem zweipoligen Spannungsprüfer, nicht mit dem Phasenprüfer-Schraubendreher",
          "Erden und kurzschließen: vor allem bei Arbeiten an größeren Anlagen wichtig",
          "Benachbarte, unter Spannung stehende Teile abdecken oder abschranken",
        ],
        tip: "Der Lichtschalter allein reicht nicht. Je nach Verkabelung liegt trotzdem Spannung an der Lampe an.",
      },
      {
        h2: "Wann du auf jeden Fall einen Elektriker brauchst",
        list: [
          "Es kommt kein passendes Kabel aus der Decke oder die Farben passen nicht zum Schema",
          "Ein Kabel ist angeschmort, brüchig oder zu kurz",
          "Die Lampe soll an eine neue Stelle oder einen zusätzlichen Schalter bekommen",
          "Es fliegt immer wieder die Sicherung raus",
          "Altbau mit alter Verkabelung ohne Schutzleiter",
          "Schwere Leuchten wie Kronleuchter, die eine stabile Befestigung brauchen",
        ],
      },
      {
        h2: "Was kostet es, eine Lampe anschließen zu lassen?",
        paragraphs: [
          "Für den Elektriker ist das ein kurzer Job, meist deutlich unter einer Stunde. Den Preis bestimmen vor allem Anfahrt, Arbeitszeit, Montagehöhe und ob zusätzliches Material wie Klemmen, ein Haken oder ein Baldachin nötig ist.",
          "Auf handwerker2go siehst du bei „Lampe anschließen“ den Festpreis des Betriebs schon vor der Buchung. Der Preis steht fest, auch wenn es zehn Minuten länger dauert.",
        ],
        tip: "Mehrere Lampen? Lass sie in einem Termin anschließen. Die Anfahrt zahlst du dann nur einmal.",
      },
      {
        h2: "So läuft der Termin ab",
        ordered: true,
        list: [
          "Leistung „Lampe anschließen“, deine Adresse und Wunschtermin auswählen.",
          "Freie Elektriker in deiner Nähe vergleichen und buchen.",
          "Lampe auspacken und bereitlegen, Leiter freiräumen.",
          "Der Elektriker schließt an, testet und nimmt die Verpackung auf Wunsch mit.",
        ],
      },
    ],
    faq: [
      {
        q: "Darf ich eine Lampe selbst anschließen?",
        a: "Arbeiten an der Elektroanlage sind laut NAV Sache von eingetragenen Fachbetrieben. Eine Lampe an einem vorhandenen Anschluss tauschen viele selbst; das Risiko und die Haftung liegen dann aber bei dir.",
      },
      {
        q: "Wie lange dauert das Anschließen einer Lampe?",
        a: "Meist deutlich unter einer Stunde, je nach Leuchte, Deckenhöhe und Befestigung.",
      },
      {
        q: "Bringt der Elektriker Material mit?",
        a: "Klemmen und Kleinmaterial haben Elektriker meistens dabei. Die Lampe selbst stellst du. Schreib Besonderheiten am besten bei der Buchung in die Hinweise.",
      },
      {
        q: "Wie schnell bekomme ich einen Termin?",
        a: "Auf handwerker2go siehst du nur Elektriker, die zu deinem Wunschtermin tatsächlich frei sind. Die Verfügbarkeit wird in Echtzeit aus den Kalendern der Betriebe berechnet.",
      },
    ],
  },
  {
    slug: "wohnung-streichen-lassen",
    title: "Wohnung streichen lassen: Kosten, Dauer und die perfekte Vorbereitung",
    metaTitle: "Wohnung streichen lassen: Kosten und Tipps",
    description:
      "Frische Wände ohne Farbflecken auf dem Sofa: Wovon die Kosten beim Maler abhängen, wie lange das Streichen dauert und was beim Auszug aus der Mietwohnung wirklich gilt.",
    kicker: "Maler",
    categorySlug: "maler",
    service: { slug: "zimmer-streichen", label: "Maler buchen" },
    image: "projekt-zimmer-streichen.webp",
    imageAlt: "Maler streicht eine Wand mit der Rolle",
    readingMinutes: 6,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Neue Wohnung, alte Wandfarbe? Oder der Auszug steht an und die Wände haben fünf Jahre Leben gesehen? Selbst streichen klingt erst mal nach entspanntem Samstag, endet aber oft mit Streifen, Kanten und Farbe auf dem Boden.",
      "Hier erfährst du, wovon die Kosten beim Maler abhängen, wie du die Fläche schnell selbst schätzt und was beim Auszug aus einer Mietwohnung gilt.",
    ],
    takeaways: [
      "Die Kosten hängen von Fläche, Untergrund, Farbe und Vorarbeiten ab.",
      "Faustregel: Die Wandfläche eines Raums ist ungefähr dreimal so groß wie die Bodenfläche.",
      "Viele Renovierungsklauseln in Mietverträgen sind laut Bundesgerichtshof unwirksam.",
    ],
    sections: [
      {
        h2: "Wovon hängen die Kosten ab?",
        list: [
          "Fläche: Wände, Decke oder beides",
          "Untergrund: glatter Putz geht schnell, Raufaser oder Altbauwände mit Rissen brauchen mehr Arbeit",
          "Vorarbeiten: Löcher spachteln, alte Tapete runter, Flecken absperren",
          "Farbe: Weiß ist am einfachsten, kräftige Farben brauchen oft zwei oder mehr Anstriche",
          "Abdecken und Abkleben: Möbel, Boden, Fenster und Steckdosen",
        ],
        tip: "Fläche schnell schätzen: Bodenfläche mal drei ergibt ungefähr die Wandfläche bei normaler Raumhöhe. 15 m² Boden sind also rund 45 m² Wand.",
      },
      {
        h2: "Wie lange dauert das Streichen?",
        paragraphs: [
          "Ein normales Zimmer schafft ein Maler meist an einem Tag, inklusive Abkleben und Aufräumen. Bei einer ganzen Wohnung, dunklen Farben oder viel Spachtelarbeit dauert es entsprechend länger, weil jede Schicht trocknen muss.",
          "Auf handwerker2go siehst du bei „Zimmer streichen“ die geplante Dauer schon vor der Buchung. Der Termin wird im Kalender des Betriebs genau so lange blockiert.",
        ],
      },
      {
        h2: "Mietwohnung: Musst du beim Auszug streichen?",
        paragraphs: [
          "Das hängt von deinem Mietvertrag ab, aber längst nicht jede Klausel gilt. Der Bundesgerichtshof hat zum Beispiel entschieden, dass Klauseln mit starren Renovierungsfristen unwirksam sind (BGH, Urteil vom 23. Juni 2004, VIII ZR 361/03). Auch wer eine unrenovierte Wohnung ohne Ausgleich übernommen hat, muss nach einem Urteil von 2015 in der Regel nicht renovieren (BGH, VIII ZR 185/14).",
          "Was in deinem Fall gilt, klärt ein Mieterverein oder eine Anwältin. Und falls du streichen musst: Neutrale, helle Farben sind bei der Übergabe immer die sichere Wahl.",
        ],
      },
      {
        h2: "So bereitest du die Wohnung vor",
        ordered: true,
        list: [
          "Kleinkram, Deko und Bilder aus dem Raum räumen.",
          "Große Möbel in die Raummitte schieben.",
          "Nägel und Dübel aus der Wand ziehen (oder dem Maler sagen, was bleiben soll).",
          "Farbton festlegen, am besten mit Farbnummer.",
          "Parkplatz und Zugang klären, damit der Maler direkt loslegen kann.",
        ],
      },
      {
        h2: "Selbst streichen oder Maler?",
        paragraphs: [
          "Ein Zimmer in Weiß bekommst du mit etwas Geduld auch selbst hin. Ein Profi lohnt sich, wenn es schnell gehen muss, wenn Decken, Kanten und Farbwechsel sauber werden sollen oder wenn die Wände vorher ausgebessert werden müssen.",
          "Rechne beim Selbermachen ehrlich: Material, Werkzeug, Abdeckfolie und dein freies Wochenende. Beim Maler ist der Preis klar und die Wand am Abend fertig.",
        ],
      },
    ],
    faq: [
      {
        q: "Wie viele Anstriche braucht eine Wand?",
        a: "Bei hellen Farben auf hellem Untergrund reicht oft ein Anstrich mit guter Deckkraft. Bei Farbwechseln, dunklen Tönen oder fleckigen Wänden sind zwei Anstriche üblich.",
      },
      {
        q: "Muss ich die Möbel selbst wegräumen?",
        a: "Kleinkram und Wertsachen solltest du selbst wegräumen. Große Möbel schieben Maler oft in die Raummitte und decken sie ab. Schreib es am besten bei der Buchung in die Hinweise.",
      },
      {
        q: "Kann ich am selben Tag wieder im Zimmer schlafen?",
        a: "Moderne Wandfarben trocknen schnell und riechen kaum. Lüfte nach dem Streichen gut durch; meistens kannst du den Raum am Abend wieder nutzen.",
      },
      {
        q: "Was, wenn die Wände mehr Arbeit brauchen als gedacht?",
        a: "Weicht der Aufwand wegen falscher Angaben stark ab, kann der Betrieb einen angepassten Preis anbieten. Fotos bei der Buchung helfen, das zu vermeiden.",
      },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
