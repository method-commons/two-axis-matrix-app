import { describe, expect, it } from 'vitest';
import { Examples } from '../../js/examples.js';
import { Methods } from '../../js/methods.js';
import { Model } from '../../js/model.js';

describe('Beispiele', async () => {
  const keys = Examples.keys();
  /** Alle Beispiele in beiden Sprachen. @type {Record<string, { de: any, en: any }>} */
  const all = {};
  for (const k of keys) all[k] = { de: await Examples.raw(k, 'de'), en: await Examples.raw(k, 'en') };

  it('gibt es für jede Methode, in Deutsch und Englisch', () => {
    const methods = new Set(keys.map(k => all[k].de.method));
    for (const def of Methods.list()) if (def.id !== Methods.CUSTOM) expect(methods.has(def.id), def.id).toBe(true);
    for (const k of keys) expect(Examples.languages(k), k).toEqual(['de', 'en']);
  });

  it('entsprechen genau dem normalisierten Format', () => {
    for (const k of keys) {
      for (const lang of /** @type {const} */ (['de', 'en'])) {
        const raw = all[k][lang];
        expect(Model.normalize(JSON.parse(JSON.stringify(raw))), `${k}.${lang}`).toEqual(raw);
        expect(Methods.known(raw.method)).toBe(true);
      }
    }
  });

  it('haben in beiden Sprachen dieselben Einträge an denselben Stellen', () => {
    for (const k of keys) {
      const { de, en } = all[k];
      expect(en.items.map((/** @type {Item} */ i) => [i.no, i.x, i.y, Object.keys(i.values).sort().join()]), k).toEqual(de.items.map((/** @type {Item} */ i) => [i.no, i.x, i.y, Object.keys(i.values).sort().join()]));
      expect(en.config.regions.map((/** @type {Region} */ r) => r.id)).toEqual(de.config.regions.map((/** @type {Region} */ r) => r.id));
    }
  });

  it('liefern Hinweise mit Titel und Text', () => {
    for (const k of keys) {
      for (const lang of /** @type {const} */ (['de', 'en'])) {
        for (const h of Methods.hints(all[k][lang])) {
          expect(h.title, `${k}.${lang} ${h.key}`).toMatch(/\S/);
          expect(h.detail, `${k}.${lang} ${h.key}`).toMatch(/\S/);
        }
      }
    }
  });

  it('listen und laden als neue Matrix', async () => {
    const list = await Examples.list('en');
    expect(list.map(x => x.key)).toEqual(keys);
    expect(list[0].matrix.name).toBe(all[list[0].key].en.name);
    const m = await Examples.load('wochenplanung', 'fr');
    expect(m?.name).toBe('Wochenplanung KW 42');
    expect(m?.id).not.toBe('example-wochenplanung');
    expect(await Examples.load('gibt-es-nicht')).toBeNull();
    expect(Methods.hints(/** @type {Matrix} */ (m)).length).toBeGreaterThan(0);
  });
});
