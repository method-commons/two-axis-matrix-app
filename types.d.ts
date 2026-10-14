/**
 * Typen des Datenmodells – nur für die Typprüfung (tsc/Editor), wird vom Browser nicht geladen.
 * Die Struktur entspricht dem JSON-Export einer Matrix (siehe docs/DATENFORMAT.md) bzw. einer
 * Methoden-Definition (siehe docs/METHODEN.md).
 */

/** Farben der Bereiche (Quadranten, Stufen, Zonen) – siehe Model.PALETTE */
type ColorKey = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'violet' | 'gray';

/** Aufteilung der Fläche: vier Felder, Raster mit Stufen (Heatmap), Zonen um den Ursprung */
type LayoutKind = 'quadrants' | 'grid' | 'zones';

/** Darstellung: Karten in Feldern, Streudiagramm, Raster mit Zellen */
type ViewKind = 'board' | 'plot' | 'heatmap';

/** Rangfolge in Liste und Bericht: Wert ÷ Aufwand (y ÷ x), Produkt (x × y) oder keine */
type RankKind = 'ratio' | 'product' | 'none';

/** Art eines Felds je Eintrag */
type FieldType = 'text' | 'textarea' | 'person' | 'date' | 'check' | 'choice' | 'point';

/** Ergebnis eines Hinweises: erfüllt, prüfen, noch offen */
type HintState = 'ok' | 'warn' | 'open';

/** Achse: Beschriftung, Pole, Skala (min … max in Schritten), Richtung */
interface Axis {
  label: string;
  low: string;
  high: string;
  min: number;
  max: number;
  /** Schrittweite; 0 = stufenlos */
  step: number;
  /** Hohe Werte links bzw. unten (z. B. „dringend“ links bei Eisenhower) */
  reverse: boolean;
}

/**
 * Bereich der Fläche. Je nach Aufteilung zählt ein anderes Merkmal:
 * vier Felder → `qx`/`qy` (hoch/niedrig), Raster → `min` (ab diesem Wert x × y), Zonen → `r`
 * (bis zu diesem Abstand vom Ursprung, 0 … 1,42).
 */
interface Region {
  id: string;
  label: string;
  hint: string;
  color: ColorKey;
  qx?: 'high' | 'low';
  qy?: 'high' | 'low';
  min?: number;
  r?: number;
}

/** Auswahlmöglichkeit eines Auswahlfelds */
interface ChoiceOption {
  id: string;
  label: string;
  color?: ColorKey;
}

/** Feld je Eintrag (zusätzlich zu Titel, Notiz und Position) */
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: ChoiceOption[];
}

/** Frage zum Einordnen (1 = trifft zu … 5 = trifft nicht zu) – bestimmt die Position auf einer Achse */
interface Question {
  id: string;
  axis: 'x' | 'y';
  text: string;
}

/** Einstellungen einer Matrix (bei der Anlage aus der Methode kopiert, danach frei änderbar) */
interface MatrixConfig {
  x: Axis;
  y: Axis;
  layout: LayoutKind;
  view: ViewKind;
  /** Trennlinien bei vier Feldern */
  split: { x: number, y: number };
  regions: Region[];
  fields: FieldDef[];
  questions: Question[];
  rank: RankKind;
  /** Bezeichnung der Einträge (Einzahl/Mehrzahl), z. B. „Aufgabe“/„Aufgaben“ */
  itemName: { one: string, many: string };
  /** Beschriftung der Notiz je Eintrag */
  noteLabel: string;
}

/** Punkt auf der Fläche (z. B. Ziel-Position, Bewertung nach Maßnahmen) */
interface Point {
  x: number;
  y: number;
}

type FieldValue = string | boolean | Point | null;

/** Eintrag der Matrix */
interface Item {
  id: string;
  /** Laufende Nummer (bleibt beim Löschen anderer Einträge erhalten) */
  no: number;
  title: string;
  note: string;
  /** Position; `null` = noch nicht eingeordnet (Eingang) */
  x: number | null;
  y: number | null;
  values: Record<string, FieldValue>;
  /** Antworten auf die Fragen (Frage-ID → 1 … 5) */
  answers: Record<string, number>;
}

/** Eine Matrix (Speicher- und Exportformat) */
interface Matrix {
  version: number;
  id: string;
  name: string;
  context: string;
  /** ID der Methode (Vorlage), `custom` für eigene Achsen */
  method: string;
  config: MatrixConfig;
  items: Item[];
  createdAt: string;
  updatedAt: string;
}

/** Hinweis in der Seitenleiste */
interface Hint {
  key: string;
  state: HintState;
  title: string;
  detail: string;
  /** Betroffene Einträge (zum Markieren) */
  items?: string[];
}

/** Texte einer Methode in einer Sprache (siehe docs/METHODEN.md) */
interface MethodTexts {
  name: string;
  short: string;
  aka: string;
  description: string;
  itemName: { one: string, many: string };
  noteLabel: string;
  x: { label: string, low: string, high: string };
  y: { label: string, low: string, high: string };
  regions: Record<string, { label: string, hint: string }>;
  fields?: Record<string, string>;
  options?: Record<string, Record<string, string>>;
  questions?: Record<string, string>;
  leadQuestions: string[];
  help: { paras: string[], list: string[] };
  hints?: Record<string, string>;
}

/** Werkzeuge, die eine Methode für ihre Hinweise bekommt */
interface HintContext {
  regionOf: (m: Matrix, it: Item) => Region | null;
  placed: (m: Matrix) => Item[];
  value: (it: Item, key: string) => FieldValue;
  fill: (text: string, params?: Record<string, string | number>) => string;
  t: MethodTexts;
}

/** Definition einer Methode – eine Datei je Methode unter js/methods/ */
interface MethodDef {
  id: string;
  /** Reihenfolge in Auswahl und Übersicht */
  order: number;
  /** Kurzzeichen für Symbole */
  icon: string;
  color: ColorKey;
  layout: LayoutKind;
  view: ViewKind;
  x: { min: number, max: number, step: number, reverse?: boolean };
  y: { min: number, max: number, step: number, reverse?: boolean };
  split?: { x: number, y: number };
  regions: Array<{ id: string, color: ColorKey, qx?: 'high' | 'low', qy?: 'high' | 'low', min?: number, r?: number }>;
  /** Felder je Eintrag; Beschriftungen aus `texts.fields`, Auswahltexte aus `texts.options[optionsText ?? key]` */
  fields: Array<{ key: string, type: FieldType, options?: Array<{ id: string, color?: ColorKey }>, optionsText?: string }>;
  questions?: Array<{ id: string, axis: 'x' | 'y' }>;
  rank?: RankKind;
  texts: Record<string, MethodTexts>;
  hints?: (m: Matrix, ctx: HintContext) => Hint[];
}
