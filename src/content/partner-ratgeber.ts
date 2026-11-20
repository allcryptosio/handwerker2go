import type { Article } from "@/content/ratgeber";
import { formatCents, formatPercent, providerPricing as p } from "@/lib/pricing";

/**
 * Ratgeber für Handwerksbetriebe (/partner/ratgeber). Getrennt vom Kunden-Ratgeber, weil hier Provision und Abo
 * vorkommen. Keine erfundenen Marktpreise oder Statistiken; Rechenbeispiele sind als Annahmen gekennzeichnet.
 */
const eur = (cents: number) => formatCents(cents);
const orders = 20;
const orderValue = 12000; // 120 € je Auftrag (Annahme)
const revenue = orders * orderValue;
const commissionIntro = Math.round((revenue * p.introCommissionBps) / 10000);
const commissionMonthly = Math.round((revenue * p.monthly.commissionBps) / 10000);
const leadPrice = 1500; // 15 € je Anfrage (Annahme)
const leads = orders * 3; // jede dritte Anfrage wird zum Auftrag (Annahme)

export const partnerArticles: Article[] = [
  {
    slug: "neue-kunden-gewinnen-handwerker",
    title: "Neue Kunden gewinnen als Handwerker: 7 Wege, die wirklich funktionieren",
    metaTitle: "Neue Kunden gewinnen als Handwerker: 7 Wege",
    description:
      "Mehr Aufträge für deinen Handwerksbetrieb: Google-Profil, Bewertungen, Empfehlungen, Online-Buchung und Plattformen. Was wirklich neue Kunden bringt.",
    kicker: "Kunden gewinnen",
    categorySlug: "",
    service: { slug: "", label: "Jetzt Partner werden" },
    image: "projekt-fernseher-aufhaengen.webp",
    imageAlt: "Handwerker montiert einen Fernseher bei einer Kundin",
    readingMinutes: 6,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Gute Handwerker sind gefragt, und trotzdem kennen viele Betriebe das: Die einen Wochen sind übervoll, in den anderen stehen Lücken im Kalender. Neue Kunden kommen oft zufällig, über Empfehlungen oder weil jemand gerade in der Nähe war.",
      "Hier sind sieben Wege, mit denen du planbar neue Kunden gewinnst. Keine Zaubertricks, sondern Dinge, die du nebenbei umsetzen kannst.",
    ],
    takeaways: [
      "Kunden suchen online, oft abends: Wer dort sichtbar und direkt buchbar ist, gewinnt.",
      "Echte Bewertungen sind dein stärkstes Verkaufsargument; gekaufte Bewertungen sind verboten.",
      "Plattformen lohnen sich, wenn du nur für tatsächliche Aufträge bezahlst.",
    ],
    sections: [
      {
        h2: "1. Ein gepflegtes Google-Unternehmensprofil",
        paragraphs: [
          "Wer „Elektriker Hamburg“ oder „Maler in der Nähe“ sucht, sieht zuerst die Karte mit den Unternehmensprofilen. Das Profil ist kostenlos. Wichtig sind richtige Öffnungszeiten, ein klares Leistungsverzeichnis, echte Fotos von deinen Arbeiten und Antworten auf Bewertungen.",
        ],
        tip: "Lade regelmäßig neue Fotos von abgeschlossenen Aufträgen hoch. Vorher und nachher wirkt am stärksten.",
      },
      {
        h2: "2. Bewertungen aktiv einholen",
        paragraphs: [
          "Zufriedene Kunden bewerten selten von allein. Frag direkt nach dem Auftrag, am besten mit einem Link per SMS oder E-Mail. Antworte auf jede Bewertung, auch auf kritische: Neue Kunden lesen genau, wie du mit Problemen umgehst.",
          "Finger weg von gekauften Bewertungen: Gefälschte Bewertungen zu beauftragen oder zu verbreiten ist nach dem Gesetz gegen den unlauteren Wettbewerb ausdrücklich verboten. Auf handwerker2go können ohnehin nur Kunden bewerten, die über die Plattform gebucht haben.",
        ],
      },
      {
        h2: "3. Empfehlungen und Stammkunden",
        paragraphs: [
          "Die günstigsten Aufträge kommen von Menschen, die schon zufrieden sind. Hinterlass nach dem Termin eine Visitenkarte, frag nach weiteren Arbeiten im Haushalt und erinnere Stammkunden an wiederkehrende Aufgaben wie Heckenschnitt oder Wartung.",
        ],
      },
      {
        h2: "4. Online buchbar sein",
        paragraphs: [
          "Viele Menschen kümmern sich abends oder am Wochenende um ihre To-dos. Wer dann nur über das Telefon erreichbar ist, verliert den Auftrag an jemanden, der direkt einen Termin anbietet. Mit Festpreisen für Standardleistungen und einem Kalender, in dem Kunden selbst buchen, sparst du außerdem Rückrufe und Angebote für Kleinaufträge.",
        ],
      },
      {
        h2: "5. Lokale Partnerschaften",
        paragraphs: [
          "Hausverwaltungen, Makler, Umzugsfirmen oder befreundete Gewerke brauchen regelmäßig zuverlässige Handwerker. Ein kurzer Besuch mit Leistungsliste und festen Ansprechpartnern bringt oft dauerhafte Aufträge.",
        ],
      },
      {
        h2: "6. Sichtbar vor Ort",
        paragraphs: [
          "Ein beschriftetes Fahrzeug, ein Schild am Bauzaun oder ein Aushang im Treppenhaus nach einem Auftrag: Nachbarn sehen, dass du im Viertel arbeitest. Gerade in Hamburg, wo viel in Mehrfamilienhäusern gearbeitet wird, kommen so Folgeaufträge im selben Haus.",
        ],
      },
      {
        h2: "7. Plattformen gezielt nutzen",
        paragraphs: [
          "Plattformen bringen dir Kunden, die du allein nicht erreichst. Entscheidend ist das Bezahlmodell: Zahlst du für Anfragen, auch wenn daraus nichts wird? Oder nur für Aufträge, die wirklich stattfinden? Mehr dazu im Artikel über Provision, Abo und Lead-Kauf.",
          "Bei handwerker2go buchen Kunden direkt in deine freien Termine und zahlen vorab online. Du zahlst eine Provision nur auf abgeschlossene Buchungen.",
        ],
      },
    ],
    faq: [
      {
        q: "Was bringt am schnellsten neue Kunden?",
        a: "Ein vollständiges Google-Unternehmensprofil mit echten Fotos und Bewertungen sowie die Möglichkeit, dich direkt online zu buchen. Beides wirkt sofort, wenn Menschen in deiner Nähe suchen.",
      },
      {
        q: "Darf ich Kunden für Bewertungen belohnen?",
        a: "Bewertungen gegen Gegenleistung sind heikel und müssen gekennzeichnet werden; gefälschte Bewertungen sind verboten. Am sichersten: höflich nach einer ehrlichen Bewertung fragen.",
      },
      {
        q: "Lohnt sich eine eigene Website?",
        a: "Eine einfache Seite mit Leistungen, Einsatzgebiet und Kontakt schafft Vertrauen. Für Neukunden aus der Suche sind Google-Profil und Plattformen meist schneller wirksam.",
      },
    ],
  },
  {
    slug: "handwerkerportale-provision-abo-leads",
    title: "Handwerkerportale im Vergleich: Provision, Abo oder Lead-Kauf?",
    metaTitle: "Handwerkerportale: Provision, Abo, Leads?",
    description:
      "Wie Handwerkerportale abrechnen und was sich für deinen Betrieb rechnet: Pay-per-Lead, Abo oder Provision im Vergleich, mit Rechenbeispiel und Checkliste.",
    kicker: "Kosten und Modelle",
    categorySlug: "",
    service: { slug: "", label: "Jetzt Partner werden" },
    image: "ablauf-2-vergleichen.webp",
    imageAlt: "Handwerker vergleicht Angebote am Laptop",
    readingMinutes: 6,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Portale versprechen Aufträge, aber die Bezahlmodelle sind sehr unterschiedlich. Manche kosten Geld, bevor du überhaupt mit einem Kunden gesprochen hast. Andere verdienen nur, wenn du auch verdienst.",
      "Hier vergleichen wir die drei üblichen Modelle, rechnen ein Beispiel durch und geben dir eine Checkliste für jedes Portal mit.",
    ],
    takeaways: [
      "Beim Lead-Kauf zahlst du für Anfragen, auch wenn kein Auftrag daraus wird.",
      "Beim reinen Abo zahlst du fest, egal wie viele Aufträge kommen.",
      "Bei der Provision zahlst du nur auf Aufträge, die wirklich stattfinden.",
    ],
    sections: [
      {
        h2: "Modell 1: Bezahlung pro Anfrage (Lead-Kauf)",
        paragraphs: [
          "Du kaufst Kontaktdaten oder Anfragen von Interessenten. Oft bekommen mehrere Betriebe dieselbe Anfrage, und der schnellste oder günstigste gewinnt. Das Risiko liegt bei dir: Wird aus der Anfrage nichts, ist das Geld trotzdem weg.",
        ],
      },
      {
        h2: "Modell 2: Festes Abo",
        paragraphs: [
          "Du zahlst eine monatliche oder jährliche Gebühr und wirst dafür gelistet. Planbar, aber in schwachen Monaten zahlst du genauso viel wie in starken.",
        ],
      },
      {
        h2: "Modell 3: Provision auf abgeschlossene Aufträge",
        paragraphs: [
          "Das Portal verdient einen Prozentsatz vom Auftragswert, und zwar nur, wenn der Auftrag tatsächlich gebucht und bezahlt wurde. Oft kombiniert mit einer kleinen Grundgebühr. Dein Risiko ist am geringsten, weil Kosten nur bei Umsatz entstehen.",
        ],
      },
      {
        h2: "Rechenbeispiel",
        paragraphs: [
          `Annahme: ${orders} Aufträge im Monat mit je ${eur(orderValue)} Auftragswert, zusammen ${eur(revenue)} Umsatz.`,
          `Bei handwerker2go zahlst du in der Einführungsphase keine Grundgebühr und ${formatPercent(p.introCommissionBps)} Provision, also ${eur(commissionIntro)}. Danach ${eur(p.monthly.feeCents)} im Monat plus ${formatPercent(p.monthly.commissionBps)} Provision, zusammen ${eur(commissionMonthly + p.monthly.feeCents)}. Alle Preise netto; die Gebühren von Stripe für die Zahlungsabwicklung kommen hinzu.`,
          `Zum Vergleich ein angenommenes Lead-Modell mit ${eur(leadPrice)} pro Anfrage, bei dem jede dritte Anfrage zum Auftrag wird: Für ${orders} Aufträge brauchst du ${leads} Anfragen, also ${eur(leads * leadPrice)}. Wie es bei einem konkreten Portal aussieht, hängt von dessen Preisen und deiner Abschlussquote ab.`,
        ],
        tip: "Rechne mit deiner echten Abschlussquote: Wie viele Anfragen brauchst du im Schnitt für einen Auftrag?",
      },
      {
        h2: "Checkliste: Diese Fragen stellst du jedem Portal",
        list: [
          "Wofür genau zahle ich: Anfrage, Listung oder abgeschlossenen Auftrag?",
          "Bekommen andere Betriebe dieselbe Anfrage?",
          "Ist der Preis vor dem Auftrag fest, oder verhandelt der Kunde noch?",
          "Wann und wie bekomme ich mein Geld, und wer trägt das Zahlungsausfallrisiko?",
          "Gibt es eine Mindestlaufzeit, und wie kündige ich?",
          "Hängt meine Sichtbarkeit davon ab, wie viel ich zahle?",
        ],
      },
      {
        h2: "So rechnet handwerker2go",
        paragraphs: [
          `Die ersten ${p.introMonths} Monate ohne Grundgebühr, ${formatPercent(p.introCommissionBps)} Provision nur auf abgeschlossene Buchungen. Danach entscheidest du dich aktiv für monatlich (${eur(p.monthly.feeCents)}) oder jährlich (${eur(p.yearly.feeCents)}), jeweils mit ${formatPercent(p.monthly.commissionBps)} Provision. Kunden zahlen vorab online, das Geld geht über Stripe direkt auf dein Konto. Abo und Provision haben keinen Einfluss auf deine Position in der Suche.`,
        ],
      },
    ],
    faq: [
      {
        q: "Welches Modell ist für kleine Betriebe am besten?",
        a: "Für kleine Betriebe mit schwankender Auslastung ist ein Modell mit Provision auf abgeschlossene Aufträge meist am sichersten, weil Kosten nur bei Umsatz entstehen.",
      },
      {
        q: "Sind die Preise netto oder brutto?",
        a: "Bei handwerker2go sind alle Preise für Betriebe Nettopreise. Wir rechnen im Reverse-Charge-Verfahren ab.",
      },
      {
        q: "Kann ich für eine bessere Platzierung zahlen?",
        a: "Bei handwerker2go nicht. Die Reihenfolge richtet sich nach Entfernung, freien Terminen, Bewertungen, Zuverlässigkeit und Vollständigkeit des Profils.",
      },
    ],
  },
  {
    slug: "termine-planen-handwerksbetrieb",
    title: "Kalender voll statt Leerlauf: So planst du Termine im Handwerksbetrieb",
    metaTitle: "Termine planen im Handwerksbetrieb: Tipps",
    description:
      "Weniger Leerlauf, weniger Fahrzeit, weniger Absagen: praktische Tipps zur Terminplanung für Handwerksbetriebe, von Pufferzeiten bis Online-Buchung.",
    kicker: "Planung",
    categorySlug: "",
    service: { slug: "", label: "Jetzt Partner werden" },
    image: "ablauf-1-auswaehlen.webp",
    imageAlt: "Handwerkerin plant Termine auf dem Smartphone",
    readingMinutes: 5,
    published: "2026-11-20",
    updated: "2026-11-20",
    intro: [
      "Ein Tag mit drei Aufträgen kreuz und quer durch die Stadt, dazwischen eine Stunde Leerlauf und am Ende eine Absage: Schlechte Terminplanung kostet Handwerksbetriebe jeden Tag Geld.",
      "Mit ein paar Regeln planst du realistischer, fährst weniger und füllst Lücken gezielt.",
    ],
    takeaways: [
      "Plane Anfahrt und Pufferzeit fest ein, statt Termine eng aneinanderzureihen.",
      "Begrenze dein Einsatzgebiet, damit du weniger im Stau stehst.",
      "Lass Kunden Lücken selbst buchen, statt sie per Telefon zu füllen.",
    ],
    sections: [
      {
        h2: "Realistische Dauer pro Leistung",
        paragraphs: [
          "Schätze die Dauer jeder Standardleistung ehrlich, inklusive Aufbau, Aufräumen und Gespräch mit dem Kunden. Lieber eine Viertelstunde mehr einplanen als den nächsten Termin zu verpassen.",
        ],
      },
      {
        h2: "Pufferzeiten und Anfahrt",
        paragraphs: [
          "Zwischen zwei Aufträgen gehört eine Pufferzeit für Unvorhergesehenes. Die Anfahrt sollte dabei nicht geschätzt, sondern aus der Entfernung berechnet werden. Auf handwerker2go planen wir die Anfahrt automatisch vor jedem Termin ein, die Pufferzeit legst du selbst fest.",
        ],
      },
      {
        h2: "Einsatzgebiet bewusst wählen",
        paragraphs: [
          "Ein kleineres Einsatzgebiet bedeutet weniger Fahrzeit und mehr Aufträge pro Tag. Gerade in einer Großstadt wie Hamburg lohnt es sich, Stadtteile zu bündeln, statt jeden Auftrag anzunehmen.",
        ],
      },
      {
        h2: "Feste Preise für Standardleistungen",
        paragraphs: [
          "Lampe anschließen, Schrank aufbauen, Wasserhahn tauschen: Für Standardleistungen sind Festpreise ideal. Der Kunde bucht ohne Rückfragen, du sparst dir das Angebot. Für größere Projekte bleibt der Besichtigungstermin.",
        ],
      },
      {
        h2: "Lücken online füllen lassen",
        paragraphs: [
          "Wenn Kunden deine freien Zeiten selbst sehen und buchen können, füllen sich Lücken ohne Telefonate. Wichtig: Kalender immer aktuell halten, Urlaub und private Termine früh eintragen.",
        ],
        tip: "Trag Urlaub und Fortbildungen sofort ein, sobald sie feststehen. So bucht niemand in diese Zeit.",
      },
      {
        h2: "Absagen und Ausfälle reduzieren",
        list: [
          "Klare Stornoregeln, zum Beispiel kostenlos bis 24 Stunden vorher, danach eine Pauschale",
          "Bezahlung vorab, damit Termine verbindlich sind",
          "Erinnerung an den Termin und genaue Adresse mit Etage und Zugang",
          "Selbst zuverlässig sein: Wer selten absagt, bekommt mehr Vertrauen und bessere Bewertungen",
        ],
      },
    ],
    faq: [
      {
        q: "Wie viel Pufferzeit sollte ich einplanen?",
        a: "Das hängt von deinen Aufträgen ab. Viele Betriebe planen 30 Minuten zwischen zwei Terminen ein; bei schwer planbaren Arbeiten mehr.",
      },
      {
        q: "Soll ich jede Buchung selbst bestätigen?",
        a: "Sofortige Bestätigung bringt mehr Buchungen, weil Kunden sofort Gewissheit haben. Wenn du deine Termine eng planst, kannst du auf handwerker2go auch jede Buchung selbst bestätigen.",
      },
      {
        q: "Was mache ich mit kurzfristigen Anfragen?",
        a: "Leg einen Mindestvorlauf fest, zum Beispiel 12 Stunden. So bekommst du keine Buchungen, die du nicht mehr schaffen kannst.",
      },
    ],
  },
];

export const getPartnerArticle = (slug: string) => partnerArticles.find((a) => a.slug === slug);
