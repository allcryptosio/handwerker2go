/**
 * Kategorien, Leistungen und Städte.
 *
 * Phase 1: statische Startdaten, damit Startseite und SEO-Seiten stehen.
 * Phase 2: Diese Daten wandern in die Tabellen service_categories, services
 * und cities und werden im Admin-Dashboard gepflegt. Keine Stadt ist im
 * Rendering fest verdrahtet, alle Seiten lesen über die Funktionen unten.
 */

export type IconName =
  | "montage"
  | "wand"
  | "elektro"
  | "sanitaer"
  | "maler"
  | "umzug"
  | "garten"
  | "entruempelung"
  | "werkzeug";

export type Tone =
  | "montage"
  | "wand"
  | "elektro"
  | "sanitaer"
  | "maler"
  | "umzug"
  | "garten"
  | "entruempelung"
  | "neutral";

export type ServiceMode = "festpreis" | "angebot";

export interface Service {
  slug: string;
  name: string;
  mode: ServiceMode;
  /** Typische Dauer in Minuten, nur bei Festpreis-Leistungen. */
  durationMin?: number;
}

export interface Category {
  slug: string;
  /** Name der Leistung, z. B. „Elektro“ */
  label: string;
  /** Wer die Leistung erbringt, z. B. „Elektriker“, für Überschriften wie „Elektriker in Hamburg“ */
  trade: string;
  icon: IconName;
  tone: Tone;
  summary: string;
  photoHint: string;
  /** Dateiname in public/bilder, siehe docs/BILDER-PROMPTS.md */
  photoFile: string;
  services: Service[];
  /** Eigener Einleitungstext für die Stadt-Kategorie-Seite. {stadt} wird ersetzt. */
  cityIntro: string;
  /** Typische Fragen für die Stadt-Kategorie-Seite. */
  faq: { q: string; a: string }[];
}

export interface City {
  slug: string;
  name: string;
  active: boolean;
  /** Mittelpunkt für die Umkreissuche (ab Phase 3) */
  lat: number;
  lng: number;
  districts: string[];
}

export const categories: Category[] = [
  {
    slug: "entruempelung",
    label: "Entrümpelung",
    trade: "Entrümpelung",
    icon: "entruempelung",
    tone: "entruempelung",
    summary:
      "Keller, Dachboden, Wohnung oder Garage: Der Betrieb räumt aus, trennt und entsorgt fachgerecht. Besenrein übergeben auf Wunsch.",
    photoHint: "Foto: Keller wird entrümpelt",
    photoFile: "kategorie-entruempelung.webp",
    services: [
      { slug: "keller-entruempeln", name: "Keller entrümpeln", mode: "angebot" },
      { slug: "wohnung-entruempeln", name: "Wohnung entrümpeln", mode: "angebot" },
      { slug: "dachboden-entruempeln", name: "Dachboden entrümpeln", mode: "angebot" },
      { slug: "sperrmuell-abholen", name: "Sperrmüll abholen", mode: "festpreis", durationMin: 60 },
      { slug: "haushaltsaufloesung", name: "Haushaltsauflösung", mode: "angebot" },
    ],
    cityIntro:
      "Ob Kellerabteil, Dachboden oder eine ganze Wohnung nach einem Umzug oder Todesfall: Entrümpelungsbetriebe in {stadt} räumen aus, trennen Wertstoffe und entsorgen den Rest fachgerecht. Weil jede Entrümpelung anders ist, beschreibst du den Umfang mit Fotos und bekommst Angebote zum Vergleichen. Einzelne Sperrmüll-Teile kannst du direkt zum Festpreis abholen lassen.",
    faq: [
      {
        q: "Wie wird der Preis für eine Entrümpelung berechnet?",
        a: "Meist nach Menge, Zugänglichkeit (Etage, Aufzug, Laufweg) und Art der Gegenstände. Mit Fotos können Betriebe ein verbindliches Angebot machen.",
      },
      {
        q: "Wird die Wohnung besenrein übergeben?",
        a: "Viele Betriebe bieten die besenreine Übergabe an. Ob sie enthalten ist, steht im jeweiligen Angebot.",
      },
    ],
  },
  {
    slug: "moebelmontage",
    label: "Möbelmontage",
    trade: "Möbelmontage",
    icon: "montage",
    tone: "montage",
    summary:
      "Auf- und Abbau von Möbeln, inklusive Auspacken, Montage und Aufräumen. Werkzeug bringt der Betrieb mit.",
    photoHint: "Foto: Schrank wird aufgebaut",
    photoFile: "kategorie-moebelmontage.webp",
    services: [
      { slug: "kleiderschrank-aufbauen", name: "Kleiderschrank aufbauen", mode: "festpreis", durationMin: 150 },
      { slug: "bett-aufbauen", name: "Bett aufbauen", mode: "festpreis", durationMin: 90 },
      { slug: "kueche-montieren", name: "Küche montieren", mode: "angebot" },
      { slug: "moebel-abbauen", name: "Möbel abbauen", mode: "festpreis", durationMin: 60 },
    ],
    cityIntro:
      "Neuer Schrank, Bett oder Regal und keine Zeit für den Aufbau? Betriebe für Möbelmontage in {stadt} bauen deine Möbel fachgerecht auf, nehmen auf Wunsch die Verpackung mit und bringen das Werkzeug selbst mit. Kleine Aufbauten buchst du zum Festpreis, eine komplette Küche fragst du als Angebot an.",
    faq: [
      {
        q: "Muss ich Werkzeug bereitstellen?",
        a: "Nein. Der Betrieb bringt das nötige Werkzeug mit. Ob die Entsorgung der Verpackung im Preis enthalten ist, steht in der jeweiligen Leistung.",
      },
      {
        q: "Was ist, wenn Teile fehlen?",
        a: "Dann meldet der Betrieb das über die Buchung. Ihr vereinbart gemeinsam einen neuen Termin.",
      },
    ],
  },
  {
    slug: "wandmontage",
    label: "Wandmontage",
    trade: "Wandmontage",
    icon: "wand",
    tone: "wand",
    summary:
      "Fernseher, Regale, Spiegel oder Lampen sicher und gerade an der Wand, mit passenden Dübeln für jede Wand.",
    photoHint: "Foto: Fernseher an der Wand",
    photoFile: "kategorie-wandmontage.webp",
    services: [
      { slug: "fernseher-aufhaengen", name: "Fernseher aufhängen", mode: "festpreis", durationMin: 60 },
      { slug: "regale-anbringen", name: "Regale anbringen", mode: "festpreis", durationMin: 60 },
      { slug: "bilder-aufhaengen", name: "Bilder aufhängen", mode: "festpreis", durationMin: 45 },
      { slug: "gardinenstange-montieren", name: "Gardinenstange montieren", mode: "festpreis", durationMin: 45 },
    ],
    cityIntro:
      "Ob Altbau mit Putzwänden oder Neubau mit Trockenbau: Für eine sichere Wandmontage in {stadt} kommt es auf den richtigen Dübel an. Die Betriebe auf handwerker2go hängen Fernseher, Regale, Spiegel und Gardinenstangen gerade und fest auf.",
    faq: [
      {
        q: "Kann jede Wand einen Fernseher tragen?",
        a: "Meistens ja, mit dem passenden Befestigungssystem. Bei Trockenbauwänden prüft der Betrieb vor Ort, ob eine Montage sicher möglich ist.",
      },
    ],
  },
  {
    slug: "elektriker",
    label: "Elektro",
    trade: "Elektriker",
    icon: "elektro",
    tone: "elektro",
    summary:
      "Arbeiten an Strom nur durch eingetragene Elektrofachbetriebe. Sicher, sauber und mit fester Preisangabe.",
    photoHint: "Foto: Lampe wird angeschlossen",
    photoFile: "kategorie-elektro.webp",
    services: [
      { slug: "lampe-anschliessen", name: "Lampe anschließen", mode: "festpreis", durationMin: 60 },
      { slug: "steckdose-setzen", name: "Steckdose setzen", mode: "festpreis", durationMin: 60 },
      { slug: "lichtschalter-tauschen", name: "Lichtschalter tauschen", mode: "festpreis", durationMin: 45 },
      { slug: "herd-anschliessen", name: "Herd anschließen", mode: "festpreis", durationMin: 60 },
      { slug: "elektroinstallation", name: "Elektroinstallation", mode: "angebot" },
    ],
    cityIntro:
      "Arbeiten an der Elektrik dürfen in Deutschland nur Elektrofachbetriebe ausführen. Auf handwerker2go findest du Elektriker in {stadt}, die Lampen anschließen, Steckdosen setzen oder den Herd anschließen, mit festem Preis und freien Terminen. Größere Installationen fragst du als Angebot an.",
    faq: [
      {
        q: "Darf ich eine Lampe selbst anschließen?",
        a: "Arbeiten am Stromnetz sind Fachbetrieben vorbehalten. Ein Elektriker schließt die Lampe sicher an und prüft dabei den Anschluss.",
      },
      {
        q: "Sind die Elektriker geprüft?",
        a: "Jeder Betrieb wird vor der Freischaltung geprüft, inklusive Gewerbenachweis. Welche Nachweise ein Betrieb hat, steht in seinem Profil.",
      },
    ],
  },
  {
    slug: "sanitaer",
    label: "Sanitär",
    trade: "Sanitär",
    icon: "sanitaer",
    tone: "sanitaer",
    summary:
      "Tropfender Hahn, verstopfter Abfluss oder neue Armatur: schnelle Hilfe von Sanitärbetrieben aus deiner Nähe.",
    photoHint: "Foto: Armatur wird getauscht",
    photoFile: "kategorie-sanitaer.webp",
    services: [
      { slug: "wasserhahn-tauschen", name: "Wasserhahn tauschen", mode: "festpreis", durationMin: 60 },
      { slug: "abfluss-reinigen", name: "Abfluss reinigen", mode: "festpreis", durationMin: 60 },
      { slug: "wc-reparieren", name: "WC reparieren", mode: "festpreis", durationMin: 60 },
      { slug: "duschkopf-montieren", name: "Duschkopf montieren", mode: "festpreis", durationMin: 30 },
      { slug: "bad-sanieren", name: "Bad sanieren", mode: "angebot" },
    ],
    cityIntro:
      "Ein tropfender Wasserhahn oder ein verstopfter Abfluss kann nicht lange warten. Sanitärbetriebe in {stadt} übernehmen kleine Reparaturen zum Festpreis. Für eine Badsanierung beschreibst du dein Projekt mit Fotos und vergleichst die Angebote.",
    faq: [
      {
        q: "Bringt der Betrieb die neue Armatur mit?",
        a: "Das steht in der jeweiligen Leistung. Viele Betriebe montieren eine Armatur, die du bereits gekauft hast.",
      },
    ],
  },
  {
    slug: "maler",
    label: "Maler",
    trade: "Maler",
    icon: "maler",
    tone: "maler",
    summary:
      "Vom einzelnen Zimmer bis zur ganzen Wohnung. Für größere Flächen holst du dir Angebote mit Fotos ein.",
    photoHint: "Foto: Wand wird gestrichen",
    photoFile: "kategorie-maler.webp",
    services: [
      { slug: "zimmer-streichen", name: "Zimmer streichen", mode: "festpreis", durationMin: 300 },
      { slug: "decke-streichen", name: "Decke streichen", mode: "festpreis", durationMin: 180 },
      { slug: "tapezieren", name: "Tapezieren", mode: "angebot" },
      { slug: "tueren-lackieren", name: "Türen lackieren", mode: "angebot" },
      { slug: "wohnung-streichen", name: "Wohnung streichen", mode: "angebot" },
    ],
    cityIntro:
      "Ob Auszug, Einzug oder einfach neue Farbe: Malerbetriebe in {stadt} streichen einzelne Zimmer zum Festpreis. Bei ganzen Wohnungen, Tapeten oder Lackarbeiten lädst du Fotos hoch und bekommst Angebote, die du in Ruhe vergleichen kannst.",
    faq: [
      {
        q: "Wird die Wohnung abgeklebt?",
        a: "Abdecken und Abkleben gehören bei den Malerbetrieben auf handwerker2go zur Leistung. Details stehen in der jeweiligen Leistungsbeschreibung.",
      },
    ],
  },
  {
    slug: "umzugshilfe",
    label: "Umzug",
    trade: "Umzugshilfe",
    icon: "umzug",
    tone: "umzug",
    summary:
      "Hilfe beim Tragen, Transport und Entsorgen. Stundenweise buchbar oder per Angebot für größere Umzüge.",
    photoHint: "Foto: Kartons werden getragen",
    photoFile: "kategorie-umzug.webp",
    services: [
      { slug: "umzugshilfe", name: "Umzugshilfe", mode: "festpreis", durationMin: 120 },
      { slug: "moebeltransport", name: "Möbeltransport", mode: "angebot" },
      { slug: "halteverbotszone", name: "Halteverbotszone beantragen", mode: "angebot" },
    ],
    cityIntro:
      "Ein Umzug in {stadt} heißt oft: enge Treppenhäuser, kaum Parkplätze, wenig Zeit. Umzugshelfer auf handwerker2go tragen, verladen und bauen ab. Kleine Einsätze buchst du stundenweise, für ganze Wohnungen holst du Angebote ein.",
    faq: [
      {
        q: "Kümmert sich der Betrieb um die Halteverbotszone?",
        a: "Manche Betriebe bieten das als Zusatzleistung an. Das steht dann im Angebot.",
      },
    ],
  },
  {
    slug: "gartenpflege",
    label: "Garten",
    trade: "Gartenpflege",
    icon: "garten",
    tone: "garten",
    summary:
      "Gartenpflege nach Stunden oder als Paket. Grünschnitt wird auf Wunsch mitgenommen.",
    photoHint: "Foto: Hecke wird geschnitten",
    photoFile: "kategorie-garten.webp",
    services: [
      { slug: "hecke-schneiden", name: "Hecke schneiden", mode: "festpreis", durationMin: 120 },
      { slug: "rasen-maehen", name: "Rasen mähen", mode: "festpreis", durationMin: 60 },
      { slug: "laub-entfernen", name: "Laub entfernen", mode: "festpreis", durationMin: 120 },
      { slug: "baum-zurueckschneiden", name: "Baum zurückschneiden", mode: "angebot" },
    ],
    cityIntro:
      "Hecke, Rasen, Laub: Gartenbetriebe in {stadt} übernehmen die Pflege einmalig oder regelmäßig. Beachte, dass starker Rückschnitt von Hecken nach Bundesnaturschutzgesetz nur von Oktober bis Februar erlaubt ist. Schonende Form- und Pflegeschnitte sind ganzjährig möglich.",
    faq: [
      {
        q: "Wird der Grünschnitt mitgenommen?",
        a: "Auf Wunsch ja. Ob die Entsorgung im Festpreis enthalten ist, steht in der Leistung.",
      },
    ],
  },
];

export const cities: City[] = [
  {
    slug: "hamburg",
    name: "Hamburg",
    active: true,
    lat: 53.5511,
    lng: 9.9937,
    districts: [
      "Altona",
      "Barmbek",
      "Bergedorf",
      "Eimsbüttel",
      "Eppendorf",
      "Harburg",
      "Ottensen",
      "St. Pauli",
      "Wandsbek",
      "Winterhude",
    ],
  },
];

/** Beliebte Projekte auf der Startseite, verweisen auf eine Kategorie */
export const popularProjects: { title: string; category: string; tone: Tone; photoHint: string; photoFile: string }[] = [
  { title: "Keller entrümpeln", category: "entruempelung", tone: "entruempelung", photoHint: "Foto: Keller wird geräumt", photoFile: "projekt-keller-entruempeln.webp" },
  { title: "Fernseher aufhängen", category: "wandmontage", tone: "wand", photoHint: "Foto: TV-Wand", photoFile: "projekt-fernseher-aufhaengen.webp" },
  { title: "Lampe anschließen", category: "elektriker", tone: "elektro", photoHint: "Foto: Deckenleuchte", photoFile: "projekt-lampe-anschliessen.webp" },
  { title: "Wasserhahn tauschen", category: "sanitaer", tone: "sanitaer", photoHint: "Foto: Küchenarmatur", photoFile: "projekt-wasserhahn-tauschen.webp" },
  { title: "Zimmer streichen", category: "maler", tone: "maler", photoHint: "Foto: Malerrolle", photoFile: "projekt-zimmer-streichen.webp" },
  { title: "Umzugshilfe", category: "umzugshilfe", tone: "umzug", photoHint: "Foto: Umzugskartons", photoFile: "projekt-umzugshilfe.webp" },
  { title: "Hecke schneiden", category: "gartenpflege", tone: "garten", photoHint: "Foto: Heckenschere", photoFile: "projekt-hecke-schneiden.webp" },
  { title: "Kleiderschrank aufbauen", category: "moebelmontage", tone: "montage", photoHint: "Foto: Kleiderschrank aufbauen", photoFile: "projekt-kleiderschrank-aufbauen.webp" },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getCity = (slug: string) => cities.find((c) => c.slug === slug && c.active);
export const activeCities = () => cities.filter((c) => c.active);

/** Sucht zu einem Freitext („lampe“, „Maler“) die passende Kategorie. */
export function matchCategory(query: string): Category | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return categories.find(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.trade.toLowerCase().includes(q) ||
      c.slug.includes(q) ||
      c.services.some((s) => s.name.toLowerCase().includes(q)),
  );
}
