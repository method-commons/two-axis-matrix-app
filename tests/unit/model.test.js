import { describe, expect, it } from 'vitest';
import { Model } from '../../js/model.js';

describe('Model.normalize', () => {
  it('ergänzt eine leere Matrix mit Standardwerten', () => {
    const m = Model.normalize({});
    expect(m.version).toBe(Model.SCHEMA_VERSION);
    expect(m.id).toMatch(/^m/);
    expect(m.method).toBe('custom');
    expect(m.items).toEqual([]);
    expect(m.config.layout).toBe('quadrants');
    expect(m.config.view).toBe('plot');
    expect(m.config.regions).toHaveLength(4);
    expect(m.config.split).toEqual({ x: 5, y: 5 });
    expect(m.updatedAt).toBe(m.createdAt);
  });

  it('lehnt Nicht-Objekte und neuere Versionen ab', () => {
    expect(() => Model.normalize(null)).toThrow();
    expect(() => Model.normalize([])).toThrow();
    expect(() => Model.normalize({ version: Model.SCHEMA_VERSION + 1 })).toThrow();
  });

  it('wendet Umwandlungen älterer Versionen an', () => {
    Model.MIGRATIONS[0] = raw => ({ ...raw, name: `${raw.title} (alt)` });
    try {
      expect(Model.normalize({ version: 0, title: 'X' }).name).toBe('X (alt)');
    } finally {
      delete Model.MIGRATIONS[0];
    }
  });

  it('bereinigt Achsen', () => {
    const c = Model.normConfig({ x: { min: 5, max: 1, step: -2, label: 7, reverse: 'ja' }, y: { min: 0, max: 4, step: 10 } });
    expect(c.x).toMatchObject({ min: 0, max: 10, step: 0, label: 'X', reverse: false });
    expect(c.y.step).toBe(0);
    const d = Model.normAxis({ min: 3, max: 3 }, { min: 3, max: 3 });
    expect(d.max).toBe(4);
  });

  it('wählt passende Darstellungen', () => {
    expect(Model.normConfig({ layout: 'grid', x: { min: 1, max: 5, step: 1 }, y: { min: 1, max: 5, step: 1 } }).view).toBe('heatmap');
    expect(Model.normConfig({ layout: 'grid', view: 'plot', x: { step: 1 }, y: { step: 1 } }).view).toBe('plot');
    expect(Model.normConfig({ layout: 'grid', view: 'heatmap' }).view).toBe('plot');
    expect(Model.normConfig({ layout: 'zones', view: 'board' }).view).toBe('plot');
    expect(Model.normConfig({ layout: 'quadrants', view: 'board' }).view).toBe('board');
    expect(Model.normConfig({ layout: 'quer' }).layout).toBe('quadrants');
  });

  it('bereinigt Bereiche, Felder und Fragen', () => {
    const c = Model.normConfig({
      split: { x: 99, y: -3 },
      regions: [{ id: 'a', color: 'pink', qx: 'high', qy: 'mid', min: 3, r: 0.5 }, { id: 'a' }, {}],
      fields: [{ key: 'who', type: 'person', label: 'Wer' }, { key: 'who', type: 'text' }, { key: ' ' }, null,
        { key: 'mood', type: 'choice', options: [{ id: 'up', label: 'gut', color: 'green' }, { id: '' }, { id: 'x', color: 'nope' }] }, { key: 'z', type: 'weird' }],
      questions: [{ id: 'q', axis: 'x', text: 'Frage' }, { id: 'p', axis: 'z' }],
      rank: 'random',
      itemName: { one: 'Idee' },
    });
    expect(c.split).toEqual({ x: 10, y: 0 });
    expect(c.regions.map(r => r.id)).toEqual(['a', 'a_', 'r3']);
    expect(c.regions[0]).toMatchObject({ color: 'gray', qx: 'high', min: 3, r: 0.5 });
    expect(c.regions[0].qy).toBeUndefined();
    expect(c.fields.map(f => f.key)).toEqual(['who', 'mood', 'z']);
    expect(c.fields[1].options).toEqual([{ id: 'up', label: 'gut', color: 'green' }, { id: 'x', label: '', color: 'gray' }]);
    expect(c.fields[2].type).toBe('text');
    expect(c.questions).toEqual([{ id: 'q', axis: 'x', text: 'Frage' }]);
    expect(c.rank).toBe('none');
    expect(c.itemName).toEqual({ one: 'Idee', many: '' });
  });

  it('bereinigt Einträge: Positionen auf die Skala, Werte passend zum Feld', () => {
    const m = Model.normalize({
      config: {
        x: { min: 0, max: 10, step: 0.5 },
        fields: [{ key: 'done', type: 'check' }, { key: 'due', type: 'date' }, { key: 'at', type: 'point' }, { key: 's', type: 'choice', options: [{ id: 'a' }] }, { key: 't', type: 'text' }],
      },
      items: [
        { id: 'i1', title: 'A', x: 3.3, y: 12, values: { done: 'yes', due: '2026-13-01', at: { x: 1, y: 2 }, s: 'b', t: 5, old: 'bleibt', p: { x: 1, y: 1 }, q: 7 }, answers: { a: 3, b: 9, c: 2.5 } },
        { id: 'i1', no: 1, x: 'nope' },
        { no: 1 },
      ],
    });
    const [a, b, c] = m.items;
    expect(a).toMatchObject({ x: 3.5, y: 10, no: 1 });
    expect(a.values).toEqual({ done: false, due: '', at: { x: 1, y: 2 }, s: '', t: '', old: 'bleibt', p: { x: 1, y: 1 }, q: null });
    expect(a.answers).toEqual({ a: 3 });
    expect(b.id).not.toBe('i1');
    expect(b.x).toBeNull();
    expect(new Set(m.items.map(i => i.no)).size).toBe(3);
    expect(c.id).toMatch(/^i/);
  });
});

describe('Model – Anlegen und Abfragen', () => {
  it('legt Matrizen mit eigener Kopie der Einstellungen an', () => {
    const config = Model.defaultConfig();
    const m = Model.create({ name: 'N', context: 'K', method: 'risk', config });
    config.x.label = 'geändert';
    expect(m).toMatchObject({ name: 'N', context: 'K', method: 'risk' });
    expect(m.config.x.label).toBe('X');
    expect(Model.create().method).toBe('custom');
  });

  it('liefert Nummer, Eingang, Felder, Werte und Bezeichnung', () => {
    const m = Model.normalize({ config: { fields: [{ key: 'owner', type: 'person' }] }, items: [{ no: 4, x: 1, y: 1, title: 'A', values: { owner: 'Ben', gone: 'x' } }, { no: 2, title: ' ' }] });
    expect(Model.nextNo(m)).toBe(5);
    expect(Model.placed(m)).toHaveLength(1);
    expect(Model.unplaced(m)).toHaveLength(1);
    expect(Model.field(m, 'owner')?.type).toBe('person');
    expect(Model.value(m, m.items[0], 'owner')).toBe('Ben');
    expect(Model.value(m, m.items[0], 'gone')).toBeNull();
    expect(Model.value(m, m.items[1], 'owner')).toBeNull();
    expect(Model.label(m.items[0], '–')).toBe('#4 A');
    expect(Model.label(m.items[1], '–')).toBe('#2 –');
  });
});
