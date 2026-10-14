import { describe, expect, it } from 'vitest';
import { Examples } from '../../js/examples.js';
import { Methods } from '../../js/methods.js';
import { Model } from '../../js/model.js';

describe('Beispiele', () => {
  const keys = Object.keys(Examples.raw);

  it('gibt es für jede Methode, in Deutsch und Englisch', () => {
    const methods = new Set(keys.map(k => Examples.raw[k].de.method));
    for (const def of Methods.list()) if (def.id !== Methods.CUSTOM) expect(methods.has(def.id), def.id).toBe(true);
    for (const k of keys) expect(Object.keys(Examples.raw[k]).sort(), k).toEqual(['de', 'en']);
  });

  it('entsprechen genau dem normalisierten Format', () => {
    for (const k of keys) {
      for (const lang of ['de', 'en']) {
        const raw = Examples.raw[k][lang];
        expect(Model.normalize(JSON.parse(JSON.stringify(raw))), `${k}.${lang}`).toEqual(raw);
        expect(Methods.known(raw.method)).toBe(true);
      }
    }
  });

  it('haben in beiden Sprachen dieselben Einträge an denselben Stellen', () => {
    for (const k of keys) {
      const { de, en } = Examples.raw[k];
      expect(en.items.map(i => [i.no, i.x, i.y, Object.keys(i.values).sort().join()]), k).toEqual(de.items.map(i => [i.no, i.x, i.y, Object.keys(i.values).sort().join()]));
      expect(en.config.regions.map(r => r.id)).toEqual(de.config.regions.map(r => r.id));
    }
  });

  it('listen und laden als neue Matrix', () => {
    const list = Examples.list('en');
    expect(list.map(x => x.key)).toEqual(keys.slice().sort());
    expect(list[0].matrix.name).toBe(Examples.raw[list[0].key].en.name);
    const m = Examples.load('wochenplanung', 'fr');
    expect(m?.name).toBe('Wochenplanung KW 42');
    expect(m?.id).not.toBe('example-wochenplanung');
    expect(Examples.load('gibt-es-nicht')).toBeNull();
    expect(Methods.hints(/** @type {Matrix} */ (m)).length).toBeGreaterThan(0);
  });
});
