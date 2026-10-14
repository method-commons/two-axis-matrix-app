/*
 * Ops – Änderungen an einer Matrix: Einträge anlegen, verschieben, einordnen, Felder und
 * Antworten setzen, Einstellungen übernehmen (mit Umrechnen der Positionen), duplizieren,
 * Einträge übernehmen. Ändert das übergebene Objekt direkt. Exportiert den Namensraum `Ops`.
 */
import { Layout } from './layout.js';
import { Model } from './model.js';
import { Util } from './util.js';

export const Ops = (() => {
  /** Zeitstempel der letzten Änderung setzen. @param {Matrix} m */
  function touch(m) {
    m.updatedAt = Util.now();
  }

  /** @param {Matrix} m @param {string} id */
  function item(m, id) {
    return m.items.find(it => it.id === id) || null;
  }

  /**
   * Eintrag anlegen (ohne Position: im Eingang).
   * @param {Matrix} m @param {{ title?: string, note?: string, x?: number | null, y?: number | null }} [data]
   * @returns {Item}
   */
  function addItem(m, data = {}) {
    /** @type {Item} */
    const it = { id: Util.uid('i'), no: Model.nextNo(m), title: data.title || '', note: data.note || '', x: null, y: null, values: {}, answers: {} };
    m.items.push(it);
    if (data.x != null && data.y != null) move(m, it.id, { x: data.x, y: data.y });
    return it;
  }

  /** @param {Matrix} m @param {string} id */
  function removeItem(m, id) {
    m.items = m.items.filter(it => it.id !== id);
  }

  /**
   * Eintrag an eine Stelle setzen (auf die Skala gebracht) oder zurück in den Eingang (`null`).
   * @param {Matrix} m @param {string} id @param {Point | null} p
   */
  function move(m, id, p) {
    const it = item(m, id);
    if (!it) return;
    const c = m.config;
    it.x = p ? Util.snap(p.x, c.x.min, c.x.max, c.x.step) : null;
    it.y = p ? Util.snap(p.y, c.y.min, c.y.max, c.y.step) : null;
  }

  /**
   * Eintrag um Schritte verschieben (Pfeiltasten). Stufenlose Achsen: 1/20 der Achse.
   * Die Richtung folgt der Darstellung (umgekehrte Achsen).
   * @param {Matrix} m @param {string} id @param {number} dx @param {number} dy
   */
  function nudge(m, id, dx, dy) {
    const it = item(m, id);
    if (!it || it.x == null || it.y == null) return;
    const c = m.config;
    const sx = (c.x.step || (c.x.max - c.x.min) / 20) * (c.x.reverse ? -1 : 1);
    const sy = (c.y.step || (c.y.max - c.y.min) / 20) * (c.y.reverse ? -1 : 1);
    move(m, id, { x: it.x + dx * sx, y: it.y + dy * sy });
  }

  /** Eintrag in einen Bereich legen (an dessen Mitte). @param {Matrix} m @param {string} id @param {string} regionId */
  function placeIn(m, id, regionId) {
    const r = m.config.regions.find(x => x.id === regionId);
    if (!r) return;
    const it = item(m, id);
    // Liegt der Eintrag schon im Bereich, bleibt er, wo er ist
    if (it && Layout.regionOf(m, it) === r) return;
    move(m, id, Layout.centerOf(m.config, r));
  }

  /** Feldwert setzen. @param {Matrix} m @param {string} id @param {string} key @param {FieldValue} v */
  function setValue(m, id, key, v) {
    const it = item(m, id);
    if (!it) return;
    const f = Model.field(m, key);
    if (f && f.type === 'point' && v && typeof v === 'object') {
      const c = m.config;
      v = { x: Util.snap(v.x, c.x.min, c.x.max, c.x.step), y: Util.snap(v.y, c.y.min, c.y.max, c.y.step) };
    }
    if (v == null || v === '' || v === false) delete it.values[key];
    else it.values[key] = v;
  }

  /**
   * Antwort auf eine Frage setzen (1 … 5, `null` = keine) und die Position daraus berechnen.
   * Ein noch nicht eingeordneter Eintrag bekommt für eine Achse ohne Antworten die Mitte.
   * @param {Matrix} m @param {string} id @param {string} qid @param {number | null} v
   */
  function setAnswer(m, id, qid, v) {
    const it = item(m, id);
    if (!it) return;
    if (v == null) delete it.answers[qid];
    else it.answers[qid] = Util.clamp(Math.round(v), 1, Model.ANSWER_MAX);
    const p = Layout.fromAnswers(m.config, it.answers);
    if (p.x == null && p.y == null) return;
    const c = m.config;
    move(m, id, {
      x: p.x ?? it.x ?? Layout.denorm(c.x, 0.5),
      y: p.y ?? it.y ?? Layout.denorm(c.y, 0.5),
    });
  }

  /**
   * Neue Einstellungen übernehmen: Positionen (und Punkt-Felder) auf geänderte Skalen
   * umrechnen, Werte passend zu den Feldern bereinigen.
   * @param {Matrix} m @param {MatrixConfig} next
   */
  function applyConfig(m, next) {
    const prev = m.config;
    const c = Model.normConfig(JSON.parse(JSON.stringify(next)));
    const pointKeys = c.fields.filter(f => f.type === 'point').map(f => f.key);
    for (const it of m.items) {
      if (it.x != null && it.y != null) {
        it.x = Layout.rescale(prev.x, c.x, it.x);
        it.y = Layout.rescale(prev.y, c.y, it.y);
      }
      for (const k of pointKeys) {
        const p = /** @type {Point | null} */ (it.values[k] && typeof it.values[k] === 'object' ? it.values[k] : null);
        if (p) it.values[k] = { x: Layout.rescale(prev.x, c.x, p.x), y: Layout.rescale(prev.y, c.y, p.y) };
      }
    }
    m.config = c;
    // Feldwerte zur Art passend machen (über das Normalisieren der ganzen Matrix)
    const n = Model.normalize(JSON.parse(JSON.stringify(m)));
    m.items = n.items;
  }

  /**
   * Matrix kopieren (neue IDs, Name mit Zusatz).
   * @param {Matrix} m @param {string} suffix @returns {Matrix}
   */
  function duplicate(m, suffix) {
    const copy = Model.normalize(JSON.parse(JSON.stringify(m)));
    const stamp = Util.now();
    copy.id = Util.uid('m');
    copy.name = `${m.name} ${suffix}`.trim();
    copy.createdAt = stamp;
    copy.updatedAt = stamp;
    for (const it of copy.items) it.id = Util.uid('i');
    return copy;
  }

  /**
   * Einträge einer anderen Matrix übernehmen: Titel und Notiz, ohne Position (Eingang).
   * Liefert die Zahl der übernommenen Einträge.
   * @param {Matrix} m @param {Item[]} items
   */
  function copyItems(m, items) {
    for (const src of items) addItem(m, { title: src.title, note: src.note });
    return items.length;
  }

  return { touch, item, addItem, removeItem, move, nudge, placeIn, setValue, setAnswer, applyConfig, duplicate, copyItems };
})();
