/*
 * Model – Datenmodell einer Matrix: Farben, Normalisieren (Import, Speicher, ältere Stände),
 * Anlegen, Einträge. Die Methoden (Eisenhower, Wert/Aufwand …) liefern nur Voreinstellungen
 * und Texte; eine Matrix trägt ihre Einstellungen (`config`) vollständig selbst.
 * Exportiert den Namensraum `Model`.
 */
import { Util } from './util.js';

export const Model = (() => {
  const SCHEMA_VERSION = 1;

  /**
   * Farben der Bereiche: Linie/Schrift und Fläche (hell). Die Oberfläche nutzt dafür
   * CSS-Klassen `c-<Farbe>` mit Varianten für den dunklen Modus; Bild-Export und Bericht diese Werte.
   * @type {Record<ColorKey, { fg: string, bg: string }>}
   */
  const PALETTE = {
    red: { fg: '#c92a2a', bg: '#fff0f0' },
    orange: { fg: '#a35200', bg: '#fff4e0' },
    yellow: { fg: '#7a5a00', bg: '#fdf0b8' },
    green: { fg: '#2b8a3e', bg: '#ebf8ee' },
    teal: { fg: '#0e7490', bg: '#e3f6f9' },
    blue: { fg: '#1864ab', bg: '#e7f1fc' },
    violet: { fg: '#7c3aed', bg: '#f3ecff' },
    gray: { fg: '#667085', bg: '#f2f4f7' },
  };
  const COLORS = /** @type {ColorKey[]} */ (Object.keys(PALETTE));

  /** @type {readonly LayoutKind[]} */
  const LAYOUTS = ['quadrants', 'grid', 'zones'];
  /** @type {readonly ViewKind[]} */
  const VIEWS = ['board', 'plot', 'heatmap'];
  /** @type {readonly RankKind[]} */
  const RANKS = ['ratio', 'product', 'none'];
  /** @type {readonly FieldType[]} */
  const FIELD_TYPES = ['text', 'textarea', 'person', 'date', 'check', 'choice', 'point'];

  /** Höchstwert der Fragen (1 = trifft zu … 5 = trifft nicht zu). */
  const ANSWER_MAX = 5;

  /**
   * Ältere Speicherstände in den aktuellen umwandeln: `MIGRATIONS[n]` macht aus Version n
   * Version n + 1 (Rohdaten → Rohdaten). Noch keine – Version 1 ist die erste.
   * @type {Record<number, (raw: any) => any>}
   */
  const MIGRATIONS = {};

  const str = (/** @type {unknown} */ v, d = '') => (typeof v === 'string' ? v : d);
  const num = (/** @type {unknown} */ v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  /** @template T @param {unknown} v @param {readonly T[]} list @param {T} d @returns {T} */
  const oneOf = (v, list, d) => (list.includes(/** @type {T} */ (v)) ? /** @type {T} */ (v) : d);
  const color = (/** @type {unknown} */ v, d = /** @type {ColorKey} */ ('gray')) => oneOf(v, COLORS, d);

  /** @param {any} raw @param {Partial<Axis>} [d] @returns {Axis} */
  function normAxis(raw, d = {}) {
    const r = raw && typeof raw === 'object' ? raw : {};
    let min = num(r.min, d.min ?? 0);
    let max = num(r.max, d.max ?? 10);
    if (max <= min) { min = d.min ?? 0; max = d.max ?? 10; }
    if (max <= min) max = min + 1;
    const step = Math.max(0, num(r.step, d.step ?? 0));
    return {
      label: str(r.label, d.label ?? ''),
      low: str(r.low, d.low ?? ''),
      high: str(r.high, d.high ?? ''),
      min,
      max,
      step: step > max - min ? 0 : step,
      reverse: typeof r.reverse === 'boolean' ? r.reverse : !!d.reverse,
    };
  }

  /** @param {any} r @param {number} i @returns {Region} */
  function normRegion(r, i) {
    /** @type {Region} */
    const out = { id: str(r && r.id) || `r${i + 1}`, label: str(r && r.label), hint: str(r && r.hint), color: color(r && r.color) };
    if (r && (r.qx === 'high' || r.qx === 'low')) out.qx = r.qx;
    if (r && (r.qy === 'high' || r.qy === 'low')) out.qy = r.qy;
    if (r && typeof r.min === 'number' && Number.isFinite(r.min)) out.min = r.min;
    if (r && typeof r.r === 'number' && Number.isFinite(r.r)) out.r = r.r;
    return out;
  }

  /** @param {any} f @returns {FieldDef | null} */
  function normField(f) {
    if (!f || typeof f !== 'object' || !str(f.key).trim()) return null;
    /** @type {FieldDef} */
    const out = { key: str(f.key).trim(), label: str(f.label), type: oneOf(f.type, FIELD_TYPES, 'text') };
    if (out.type === 'choice') {
      out.options = (Array.isArray(f.options) ? f.options : [])
        .filter((/** @type {any} */ o) => o && str(o.id))
        .map((/** @type {any} */ o) => {
          /** @type {ChoiceOption} */
          const opt = { id: str(o.id), label: str(o.label) };
          if (o.color) opt.color = color(o.color);
          return opt;
        });
    }
    return out;
  }

  /** Standard-Einstellungen (eigene Matrix ohne Methode). @returns {MatrixConfig} */
  function defaultConfig() {
    return {
      x: normAxis({}, { label: 'X', low: '', high: '', min: 0, max: 10, step: 0 }),
      y: normAxis({}, { label: 'Y', low: '', high: '', min: 0, max: 10, step: 0 }),
      layout: 'quadrants',
      view: 'plot',
      split: { x: 5, y: 5 },
      regions: [
        { id: 'tl', label: '', hint: '', color: 'green', qx: 'low', qy: 'high' },
        { id: 'tr', label: '', hint: '', color: 'blue', qx: 'high', qy: 'high' },
        { id: 'bl', label: '', hint: '', color: 'gray', qx: 'low', qy: 'low' },
        { id: 'br', label: '', hint: '', color: 'red', qx: 'high', qy: 'low' },
      ],
      fields: [],
      questions: [],
      rank: 'none',
      itemName: { one: '', many: '' },
      noteLabel: '',
    };
  }

  /** @param {any} raw @returns {MatrixConfig} */
  function normConfig(raw) {
    const d = defaultConfig();
    const r = raw && typeof raw === 'object' ? raw : {};
    const x = normAxis(r.x, d.x);
    const y = normAxis(r.y, d.y);
    const layout = oneOf(r.layout, LAYOUTS, d.layout);
    // Zellen nur bei einem Raster mit Stufen, Karten nur bei vier Feldern
    const cells = layout === 'grid' && x.step > 0 && y.step > 0;
    let view = oneOf(r.view, VIEWS, cells ? 'heatmap' : 'plot');
    if (view === 'heatmap' && !cells) view = 'plot';
    if (view === 'board' && layout !== 'quadrants') view = 'plot';
    const sx = r.split && typeof r.split === 'object' ? r.split : {};
    const split = {
      x: Util.clamp(num(sx.x, (x.min + x.max) / 2), x.min, x.max),
      y: Util.clamp(num(sx.y, (y.min + y.max) / 2), y.min, y.max),
    };
    const regions = Array.isArray(r.regions) && r.regions.length ? r.regions.map(normRegion) : d.regions;
    const seen = new Set();
    for (const reg of regions) {
      while (seen.has(reg.id)) reg.id += '_';
      seen.add(reg.id);
    }
    /** @type {FieldDef[]} */
    const fields = (Array.isArray(r.fields) ? r.fields : []).map(normField).filter((/** @type {FieldDef | null} */ f) => f != null);
    const keys = new Set();
    const uniqueFields = fields.filter(f => (keys.has(f.key) ? false : (keys.add(f.key), true)));
    const questions = (Array.isArray(r.questions) ? r.questions : [])
      .filter((/** @type {any} */ q) => q && str(q.id) && (q.axis === 'x' || q.axis === 'y'))
      .map((/** @type {any} */ q) => ({ id: str(q.id), axis: /** @type {'x' | 'y'} */ (q.axis), text: str(q.text) }));
    const n = r.itemName && typeof r.itemName === 'object' ? r.itemName : {};
    return {
      x, y, layout, view, split, regions,
      fields: uniqueFields,
      questions,
      rank: oneOf(r.rank, RANKS, 'none'),
      itemName: { one: str(n.one), many: str(n.many) },
      noteLabel: str(r.noteLabel),
    };
  }

  /** @param {any} p @returns {Point | null} */
  function normPoint(p) {
    return p && typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: p.x, y: p.y } : null;
  }

  /**
   * Wert eines Felds passend zu seiner Art (unbekannte Felder bleiben erhalten, damit beim
   * Ausblenden nichts verloren geht).
   * @param {unknown} v @param {FieldDef | undefined} f @returns {FieldValue}
   */
  function normValue(v, f) {
    const type = f ? f.type : null;
    if (type === 'check') return v === true;
    if (type === 'point') return normPoint(v);
    if (type === 'date') return Util.isDay(v) ? /** @type {string} */ (v) : '';
    if (type === 'choice') return typeof v === 'string' && (f && f.options || []).some(o => o.id === v) ? v : '';
    if (type) return str(v);
    if (typeof v === 'string' || typeof v === 'boolean') return v;
    return normPoint(v);
  }

  /** @param {any} raw @param {MatrixConfig} c @param {number} i @returns {Item} */
  function normItem(raw, c, i) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const placed = typeof r.x === 'number' && typeof r.y === 'number' && Number.isFinite(r.x) && Number.isFinite(r.y);
    /** @type {Record<string, FieldValue>} */
    const values = {};
    const rv = r.values && typeof r.values === 'object' ? r.values : {};
    for (const k of Object.keys(rv)) values[k] = normValue(rv[k], c.fields.find(f => f.key === k));
    /** @type {Record<string, number>} */
    const answers = {};
    const ra = r.answers && typeof r.answers === 'object' ? r.answers : {};
    for (const k of Object.keys(ra)) if (Number.isInteger(ra[k]) && ra[k] >= 1 && ra[k] <= ANSWER_MAX) answers[k] = ra[k];
    return {
      id: str(r.id) || Util.uid('i'),
      no: Number.isInteger(r.no) && r.no > 0 ? r.no : i + 1,
      title: str(r.title),
      note: str(r.note),
      x: placed ? Util.snap(r.x, c.x.min, c.x.max, c.x.step) : null,
      y: placed ? Util.snap(r.y, c.y.min, c.y.max, c.y.step) : null,
      values,
      answers,
    };
  }

  /**
   * Rohdaten (Import, Speicher) in eine gültige Matrix umwandeln: fehlende Felder ergänzen,
   * ungültige Werte ersetzen, Positionen auf die Skala bringen, ältere Versionen umwandeln.
   * @param {any} raw @returns {Matrix}
   */
  function normalize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('not a matrix');
    let r = raw;
    let v = Number.isInteger(r.version) ? r.version : SCHEMA_VERSION;
    if (v > SCHEMA_VERSION) throw new Error('newer version');
    while (v < SCHEMA_VERSION) r = MIGRATIONS[v++](r);
    const config = normConfig(r.config);
    const items = (Array.isArray(r.items) ? r.items : []).map((/** @type {any} */ x, /** @type {number} */ i) => normItem(x, config, i));
    const ids = new Set();
    const nos = new Set();
    for (const it of items) {
      while (ids.has(it.id)) it.id = Util.uid('i');
      ids.add(it.id);
      while (nos.has(it.no)) it.no = Math.max(...nos) + 1;
      nos.add(it.no);
    }
    const stamp = Util.now();
    return {
      version: SCHEMA_VERSION,
      id: str(r.id) || Util.uid('m'),
      name: str(r.name),
      context: str(r.context),
      method: str(r.method) || 'custom',
      config,
      items,
      createdAt: str(r.createdAt) || stamp,
      updatedAt: str(r.updatedAt) || str(r.createdAt) || stamp,
    };
  }

  /**
   * Neue, leere Matrix.
   * @param {{ name?: string, context?: string, method?: string, config?: MatrixConfig }} [opts]
   * @returns {Matrix}
   */
  function create(opts = {}) {
    return normalize({
      id: Util.uid('m'),
      name: opts.name || '',
      context: opts.context || '',
      method: opts.method || 'custom',
      config: opts.config ? JSON.parse(JSON.stringify(opts.config)) : defaultConfig(),
      items: [],
    });
  }

  /** Nächste freie laufende Nummer. @param {Matrix} m */
  function nextNo(m) {
    return m.items.reduce((n, it) => Math.max(n, it.no), 0) + 1;
  }

  /** Eingeordnete Einträge. @param {Matrix} m */
  function placed(m) {
    return m.items.filter(it => it.x != null && it.y != null);
  }

  /** Noch nicht eingeordnete Einträge (Eingang). @param {Matrix} m */
  function unplaced(m) {
    return m.items.filter(it => it.x == null || it.y == null);
  }

  /** Feld-Definition. @param {Matrix} m @param {string} key */
  function field(m, key) {
    return m.config.fields.find(f => f.key === key);
  }

  /** Wert eines Felds (leer, wenn das Feld ausgeblendet ist). @param {Matrix} m @param {Item} it @param {string} key @returns {FieldValue} */
  function value(m, it, key) {
    return field(m, key) ? (it.values[key] ?? null) : null;
  }


  return {
    SCHEMA_VERSION, PALETTE, COLORS, LAYOUTS, VIEWS, RANKS, FIELD_TYPES, ANSWER_MAX, MIGRATIONS,
    normAxis, normConfig, normalize, defaultConfig, create, nextNo, placed, unplaced, field, value,
  };
})();
