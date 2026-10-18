/*
 * Examples – mitgelieferte Beispiel-Matrizen. Jede Datei unter examples/ heißt
 * `<name>.<sprache>.json` (z. B. `wochenplanung.de.json`) und enthält eine Matrix im
 * Exportformat; sie wird automatisch gefunden, aber erst beim Öffnen der Beispiele geladen
 * (eigene Teildatei im Build, nur in der benötigten Sprache). Fehlt ein Beispiel in der
 * Sprache der App, erscheint die deutsche Fassung. Exportiert den Namensraum `Examples`.
 */
import { Languages } from './texts.js';
import { Model } from './model.js';
import { Util } from './util.js';

/** Lader je Datei. @type {Record<string, () => Promise<unknown>>} */
const files = import.meta.glob('../examples/*.json', { import: 'default' });

export const Examples = (() => {
  /** Lader je Name und Sprache. @type {Record<string, Record<string, () => Promise<unknown>>>} */
  const loaders = {};
  for (const [path, loader] of Object.entries(files)) {
    const m = path.match(/([^/]+)\.([a-z]{2})\.json$/);
    if (!m) continue;
    (loaders[m[1]] ||= {})[m[2]] = loader;
  }

  /** Namen aller Beispiele (sortiert). */
  const keys = () => Object.keys(loaders).sort((a, b) => a.localeCompare(b));

  /** Vorhandene Sprachen eines Beispiels. @param {string} key */
  const languages = key => Object.keys(loaders[key] || {}).sort();

  /**
   * Rohdaten eines Beispiels in der Sprache (sonst Deutsch bzw. die erste vorhandene).
   * @param {string} key @param {string} lang @returns {Promise<any>}
   */
  function raw(key, lang) {
    const byLang = loaders[key];
    return (byLang[lang] || byLang.de || Object.values(byLang)[0])();
  }

  /**
   * Beispiele in der Sprache der App (normalisiert, sortiert nach Name).
   * @param {string} [lang] @returns {Promise<{ key: string, matrix: Matrix }[]>}
   */
  function list(lang = Languages.detect()) {
    return Promise.all(keys().map(async key => ({ key, matrix: Model.normalize(await raw(key, lang)) })));
  }

  /**
   * Beispiel als neue Matrix (neue ID, aktuelle Zeitstempel).
   * @param {string} key @param {string} [lang] @returns {Promise<Matrix | null>}
   */
  async function load(key, lang = Languages.detect()) {
    if (!loaders[key]) return null;
    const m = Model.normalize(await raw(key, lang));
    const stamp = Util.now();
    m.id = Util.uid('m');
    m.createdAt = stamp;
    m.updatedAt = stamp;
    return m;
  }

  return { keys, languages, raw, list, load };
})();
