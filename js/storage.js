/*
 * Store – Speicherung im Browser (localStorage). Jede Matrix liegt unter einem eigenen
 * Schlüssel; dazu kommen eigene Vorlagen (gespeicherte Einstellungen).
 * Exportiert den Namensraum `Store`.
 */
import { Model } from './model.js';

/** @typedef {{ id: string, name: string, method: string, config: MatrixConfig }} Template */

export const Store = (() => {
  const PREFIX = 'two-axis:matrix:';
  const TEMPLATES_KEY = 'two-axis:templates';

  // Web Storage kann fehlen oder gesperrt sein (z. B. privates Fenster) – dann leere Werte.
  /** @param {string} key @returns {string | null} */
  function get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  /** @param {string} key @param {string} value */
  function set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  /** @param {string} key */
  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignorieren */ }
  }
  /** @returns {string[]} */
  function keys() {
    try { return Object.keys(localStorage); } catch (e) { return []; }
  }

  /** Matrix laden (normalisiert), `null` wenn nicht vorhanden oder beschädigt. @param {string} id @returns {Matrix | null} */
  function load(id) {
    const raw = get(PREFIX + id);
    if (!raw) return null;
    try { return Model.normalize(JSON.parse(raw)); } catch (e) { return null; }
  }

  /** Matrix speichern. @param {Matrix} m @returns {boolean} */
  function save(m) {
    return set(PREFIX + m.id, JSON.stringify(m));
  }

  /** @param {string} id */
  function removeMatrix(id) {
    remove(PREFIX + id);
  }

  /** Alle gespeicherten Matrizen, zuletzt bearbeitete zuerst. @returns {Matrix[]} */
  function all() {
    return keys().filter(k => k.startsWith(PREFIX))
      .map(k => load(k.slice(PREFIX.length)))
      .filter(/** @returns {m is Matrix} */ m => m != null)
      .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  }

  /** Ist der Speicherschlüssel der einer Matrix? Liefert die ID. @param {string | null} key */
  function matrixIdOfKey(key) {
    return key && key.startsWith(PREFIX) ? key.slice(PREFIX.length) : null;
  }

  /** Eigene Vorlagen. @returns {Template[]} */
  function templates() {
    try {
      const raw = JSON.parse(get(TEMPLATES_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(t => t && typeof t.id === 'string' && typeof t.name === 'string')
        .map(t => ({ id: t.id, name: t.name, method: typeof t.method === 'string' ? t.method : 'custom', config: Model.normConfig(t.config) }));
    } catch (e) { return []; }
  }

  /** Eigene Vorlagen speichern. @param {Template[]} list */
  function saveTemplates(list) {
    return set(TEMPLATES_KEY, JSON.stringify(list));
  }

  return { PREFIX, TEMPLATES_KEY, load, save, removeMatrix, all, matrixIdOfKey, templates, saveTemplates };
})();
