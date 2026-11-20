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
    slug: "ueber-handwerker2go",
    title: "Über handwerker2go: Wir machen Handwerker-Buchen so einfach wie Essen bestellen",
    metaTitle: "Über uns: Handwerker einfach online buchen",
    description:
      "Warum es handwerker2go gibt: Wir machen das Leben einfacher. Geprüfte Handwerker in Hamburg finden, freie Termine in Echtzeit sehen, online buchen.",
    kicker: "Über uns",
    categorySlug: "",
    service: { slug: "", label: "Freien Handwerker finden" },
    image: "vertrauen-uebergabe.webp",
    imageAlt: "Handwerker übergibt einer Kundin den erledigten Auftrag",
    readingMinutes: 5,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Essen bestellen dauert zwei Minuten. Ein Taxi kommt per App. Aber wenn zu Hause die Lampe angeschlossen, der Schrank aufgebaut oder der Keller entrümpelt werden muss, fängt die Suche plötzlich wieder an wie vor zwanzig Jahren: Telefonnummern raussuchen, Mailbox, Rückrufbitte, warten, nochmal anrufen.",
      "Genau das wollen wir ändern. handwerker2go ist eine Plattform, auf der du geprüfte Handwerksbetriebe in deiner Nähe findest, ihre freien Termine in Echtzeit siehst und direkt online buchst. Unser Ziel ist simpel: Wir wollen das Leben der Menschen einfacher machen. Für die, die einen Handwerker brauchen, und für die, die einer sind.",
    ],
    takeaways: [
      "handwerker2go verbindet Kundinnen und Kunden mit geprüften Handwerksbetrieben in ihrer Nähe.",
      "Du siehst nur Betriebe, die zu deinem Wunschtermin wirklich Zeit haben, berechnet in Echtzeit.",
      "Wir starten in Hamburg und wollen Schritt für Schritt in ganz Deutschland verfügbar sein.",
    ],
    sections: [
      {
        h2: "Das Problem: Handwerker finden kostet Nerven",
        paragraphs: [
          "Kennst du das? Du brauchst nur jemanden, der eine Stunde vorbeikommt. Trotzdem telefonierst du einen halben Tag hinterher. Der erste Betrieb ist ausgebucht, der zweite meldet sich nie, der dritte kann „irgendwann nächsten Monat“. Und was es am Ende kostet, erfährst du oft erst, wenn die Rechnung kommt.",
          "Auf der anderen Seite sitzen Handwerksbetriebe, die eigentlich arbeiten wollen, statt Telefonate zu führen, Angebote für Kleinaufträge zu schreiben und Termine in drei Kalendern zu jonglieren. Gute Betriebe haben oft Lücken im Kalender, die niemand sieht, weil es keinen einfachen Weg gibt, sie zu zeigen.",
          "Beide Seiten verlieren Zeit. Das ist der Punkt, an dem wir ansetzen.",
        ],
      },
      {
        h2: "Unsere Idee: Handwerker online buchen, in Echtzeit",
        paragraphs: [
          "Bei handwerker2go wählst du vier Dinge: die Leistung, deinen Ort, den Tag und die Uhrzeit oder ein Zeitfenster. Danach rechnen wir live aus den Kalendern der Betriebe aus, wer dann wirklich kann. Dabei berücksichtigen wir Arbeitszeiten, Urlaub, bereits gebuchte Aufträge, die Dauer der Leistung, die Anfahrt zu dir und eine Pufferzeit zwischen zwei Terminen.",
          "Du siehst also keine lange Liste mit Telefonnummern, sondern nur Betriebe, die zu deinem Wunschtermin tatsächlich Zeit haben. Ein Klick auf „Jetzt buchen“, Adresse und Hinweise eintragen, bei Festpreis-Leistungen sicher online bezahlen, fertig. Die Bestätigung kommt per E-Mail, und der Termin steht sofort im Kalender des Betriebs. Doppelte Buchungen schließt unser System technisch aus.",
        ],
        tip: "Du bist flexibel? Wähl statt einer festen Uhrzeit ein Zeitfenster, zum Beispiel 10 bis 12 Uhr. Dann findest du oft mehr freie Betriebe.",
      },
      {
        h2: "Was uns wichtig ist",
        list: [
          "Klarheit beim Preis: Viele Leistungen haben einen Festpreis, den du vor der Buchung siehst. Bei größeren Projekten buchst du einen kostenlosen Besichtigungstermin und bekommst danach ein Angebot.",
          "Geprüfte Betriebe: Jeder Betrieb reicht einen gewerblichen Nachweis ein, bevor wir ihn freischalten.",
          "Echte Bewertungen: Bewerten kann nur, wer über handwerker2go gebucht hat und dessen Auftrag abgeschlossen ist.",
          "Faire Reihenfolge: Wie wir Betriebe sortieren, erklären wir offen. Bezahlte Platzierungen gibt es nicht.",
          "Sichere Zahlung: Du zahlst über unseren Zahlungsdienstleister Stripe, das Geld geht direkt an den Betrieb. Bis 24 Stunden vor dem Termin kannst du kostenlos stornieren.",
        ],
      },
      {
        h2: "Einfacher auch für Handwerksbetriebe",
        paragraphs: [
          "Ein Marktplatz funktioniert nur, wenn er für beide Seiten fair ist. Betriebe legen bei uns ihre Leistungen, Preise, Arbeitszeiten und freien Tage selbst fest. Neue Buchungen landen automatisch im Kalender, inklusive Adresse, Hinweisen und Fotos vom Auftrag. Statt Telefon-Pingpong gibt es planbare Aufträge in der Nähe.",
          "In den ersten Monaten zahlen Betriebe keine Grundgebühr, sondern nur eine Provision auf erfolgreich abgeschlossene Buchungen. Die Auszahlung läuft über Stripe direkt auf das Konto des Betriebs. So bleibt mehr Zeit für das, was Handwerkerinnen und Handwerker am besten können: ihr Handwerk.",
        ],
      },
      {
        h2: "Gestartet in Hamburg, gedacht für ganz Deutschland",
        paragraphs: [
          "Wir beginnen in Hamburg, von Altona bis Wandsbek, von Eimsbüttel bis Harburg. Hier bauen wir ein Netz aus Betrieben für die Leistungen auf, die im Alltag am häufigsten gebraucht werden: Entrümpelung, Möbelmontage, Wandmontage, Elektriker, Sanitär, Maler, Umzugshilfe und Gartenpflege.",
          "Unser Ziel ist es, Schritt für Schritt in weiteren Städten verfügbar zu sein. Die Technik dafür steht: Die Suche funktioniert mit jeder deutschen Postleitzahl, und jeder Betrieb legt sein eigenes Einsatzgebiet fest.",
        ],
      },
      {
        h2: "Unser Versprechen",
        paragraphs: [
          "Wir werden nicht jeden Handwerkermangel lösen. Aber wir können dafür sorgen, dass du keinen halben Tag mehr am Telefon verbringst, dass du vorher weißt, worauf du dich einlässt, und dass gute Betriebe von dir gefunden werden. Weniger Stress, mehr erledigt. Dafür gibt es handwerker2go.",
          "Du hast Ideen, Lob oder Kritik? Schreib uns an info@handwerker2go.com. Wir lesen jede Nachricht.",
        ],
      },
    ],
    faq: [
      {
        q: "Was ist handwerker2go?",
        a: "Eine Online-Plattform, auf der du geprüfte Handwerksbetriebe in deiner Nähe findest, freie Termine in Echtzeit siehst und direkt buchst. Der Vertrag über die Leistung kommt mit dem Betrieb zustande.",
      },
      {
        q: "Kostet die Nutzung für Kundinnen und Kunden etwas?",
        a: "Nein. Suchen und Buchen ist kostenlos. Du zahlst nur den Preis des Betriebs für die gebuchte Leistung.",
      },
      {
        q: "In welchen Städten gibt es handwerker2go?",
        a: "Wir starten in Hamburg. Weitere Städte sollen nach und nach folgen.",
      },
      {
        q: "Wie werde ich als Handwerksbetrieb Teil von handwerker2go?",
        a: "Über „Als Handwerker anmelden“ registrierst du deinen Betrieb und lädst einen gewerblichen Nachweis hoch. Nach unserer Prüfung schaltest du deine Leistungen und Termine frei.",
      },
    ],
  },
  {
    slug: "lampe-anschliessen-elektriker",
    title: "Lampe anschließen: Selbst machen oder Elektriker holen?",
    metaTitle: "Lampe anschließen: Selbst oder Elektriker?",
    description:
      "Neue Deckenlampe? Was du bei Lampen selbst machen darfst, wann ein Elektriker ran muss und wie du in Hamburg schnell einen Termin bekommst.",
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
      "Wovon die Kosten beim Maler abhängen, wie lange das Streichen dauert und was beim Auszug aus der Mietwohnung wirklich gilt. Mit Tipps zur Vorbereitung.",
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
