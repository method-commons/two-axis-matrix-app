/*
 * Methods – Verzeichnis der Methoden (Vorlagen). Jede Datei unter js/methods/ exportiert eine
 * Definition `method` (siehe docs/METHODEN.md); sie wird hier automatisch eingelesen – eine neue
 * Methode braucht keine weitere Registrierung. Daraus entstehen die Einstellungen einer neuen
 * Matrix (`config`) in der Sprache der App sowie Hinweise und Leitfragen.
 * Exportiert den Namensraum `Methods`.
 */
import { Layout } from './layout.js';
import { Model } from './model.js';
import { Languages, Texts } from './texts.js';
import { Util } from './util.js';

/** @type {Record<string, { method?: MethodDef }>} */
const modules = import.meta.glob('./methods/*.js', { eager: true });

export const Methods = (() => {
  /** Methode für eigene Achsen (immer vorhanden). */
  const CUSTOM = 'custom';

  /** Alle Methoden, sortiert. @type {MethodDef[]} */
  const ALL = Object.values(modules)
    .map(m => m.method)
    .filter(/** @returns {d is MethodDef} */ d => d != null)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  /** @returns {MethodDef[]} */
  function list() {
    return ALL;
  }

  /** Methode zu einer ID; unbekannte → eigene Matrix. @param {string} id @returns {MethodDef} */
  function get(id) {
    return ALL.find(d => d.id === id) || /** @type {MethodDef} */ (ALL.find(d => d.id === CUSTOM));
  }

  /** Ist die Methode bekannt? @param {string} id */
  function known(id) {
    return ALL.some(d => d.id === id);
  }

  /** Texte der Methode in der Sprache der App (sonst Deutsch). @param {MethodDef} def @param {string} [lang] @returns {MethodTexts} */
  function texts(def, lang = Languages.detect()) {
    return def.texts[lang] || def.texts.de;
  }

  /**
   * Einstellungen einer neuen Matrix aus der Methode (Achsen, Bereiche, Felder, Fragen mit
   * Texten der Sprache).
   * @param {MethodDef} def @param {string} [lang] @returns {MatrixConfig}
   */
  function config(def, lang) {
    const t = texts(def, lang);
    return Model.normConfig({
      x: { ...t.x, ...def.x },
      y: { ...t.y, ...def.y },
      layout: def.layout,
      view: def.view,
      split: def.split,
      regions: def.regions.map(r => ({ ...r, label: t.regions[r.id].label, hint: t.regions[r.id].hint })),
      fields: def.fields.map(f => ({
        key: f.key,
        type: f.type,
        label: (t.fields || {})[f.key] || f.key,
        options: (f.options || []).map(o => ({ ...o, label: ((t.options || {})[f.optionsText || f.key] || {})[o.id] || o.id })),
      })),
      questions: (def.questions || []).map(q => ({ ...q, text: (t.questions || {})[q.id] || q.id })),
      rank: def.rank || 'none',
      itemName: t.itemName,
      noteLabel: t.noteLabel,
    });
  }

  /** Bezeichnung der Einträge einer Matrix (eigene oder allgemeine). @param {Matrix} m */
  function itemName(m) {
    return {
      one: m.config.itemName.one.trim() || Texts.items.one,
      many: m.config.itemName.many.trim() || Texts.items.many,
    };
  }

  /**
   * Hinweise zu einer Matrix: allgemeine (Eingang, Einträge ohne Titel) und die der Methode.
   * @param {Matrix} m @returns {Hint[]}
   */
  function hints(m) {
    const H = Texts.hints;
    /** @type {Hint[]} */
    const out = [];
    const open = Model.unplaced(m);
    if (!m.items.length) out.push({ key: 'empty', state: 'open', title: H.emptyTitle, detail: Util.fill(H.emptyDetail, { items: itemName(m).many }) });
    else if (open.length) out.push({ key: 'inbox', state: 'open', title: H.inboxTitle, detail: Util.fill(H.inboxDetail, { n: open.length }), items: open.map(i => i.id) });
    const untitled = m.items.filter(i => !i.title.trim());
    if (untitled.length) out.push({ key: 'untitled', state: 'warn', title: H.untitledTitle, detail: Util.fill(H.untitledDetail, { n: untitled.length }), items: untitled.map(i => i.id) });
    const def = get(m.method);
    if (def.hints && def.id === m.method) {
      out.push(...def.hints(m, {
        regionOf: Layout.regionOf,
        placed: Model.placed,
        value: (it, key) => Model.value(m, it, key),
        fill: Util.fill,
        t: texts(def),
      }));
    }
    return out;
  }

  /** Leitfragen der Methode (eigene Matrix: allgemeine). @param {Matrix} m @returns {string[]} */
  function leadQuestions(m) {
    return texts(get(m.method)).leadQuestions;
  }

  return { CUSTOM, list, get, known, texts, config, itemName, hints, leadQuestions };
})();
