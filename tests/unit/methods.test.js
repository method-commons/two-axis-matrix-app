import { describe, expect, it } from 'vitest';
import { Layout } from '../../js/layout.js';
import { Methods } from '../../js/methods.js';
import { Model } from '../../js/model.js';
import { Ops } from '../../js/ops.js';
import { matrixOf } from './fixtures.js';

const keys = m => Methods.hints(m).map(h => `${h.key}:${h.state}`);

describe('Methods – Verzeichnis', () => {
  it('liest alle Methoden ein, sortiert, mit „Eigene Matrix“ am Ende', () => {
    expect(Methods.list().map(d => d.id)).toEqual(['eisenhower', 'value-effort', 'stakeholder', 'risk', 'stacey', 'bcg', 'ge-mckinsey', 'kraljic', 'ansoff', 'swot', 'urgency-impact', 'importance-performance', 'situational', 'porter', 'custom']);
    expect(Methods.get('gibt-es-nicht').id).toBe('custom');
    expect(Methods.known('risk')).toBe(true);
    expect(Methods.known('kano')).toBe(false);
  });

  it('jede Definition ist vollständig und ergibt gültige Einstellungen', () => {
    for (const def of Methods.list()) {
      for (const lang of ['de', 'en']) {
        const t = Methods.texts(def, lang);
        for (const r of def.regions) expect(t.regions[r.id]?.label, `${def.id}/${lang}/${r.id}`).toBeTruthy();
        for (const f of def.fields) expect((t.fields || {})[f.key], `${def.id}/${lang}/${f.key}`).toBeTruthy();
        for (const q of def.questions || []) expect((t.questions || {})[q.id], `${def.id}/${lang}/${q.id}`).toBeTruthy();
        const c = Methods.config(def, lang);
        expect(Model.normConfig(JSON.parse(JSON.stringify(c)))).toEqual(c);
        expect(c.layout).toBe(def.layout);
        expect(c.view).toBe(def.view);
        expect(c.regions).toHaveLength(def.regions.length);
        expect(c.itemName.one).toBeTruthy();
      }
    }
  });

  it('übernimmt Auswahltexte (auch geteilte) und fällt auf Deutsch zurück', () => {
    const c = Methods.config(Methods.get('stakeholder'), 'en');
    expect(c.fields.find(f => f.key === 'stanceTarget')?.options?.map(o => o.label)).toEqual(['supportive', 'neutral', 'critical']);
    expect(Methods.texts(Methods.get('risk'), 'fr').name).toBe('Risikomatrix');
  });

  it('Bezeichnung der Einträge: eigene oder allgemeine', () => {
    const m = matrixOf('risk');
    expect(Methods.itemName(m)).toEqual({ one: 'Risiko', many: 'Risiken' });
    m.config.itemName = { one: ' ', many: '' };
    expect(Methods.itemName(m)).toEqual({ one: 'Eintrag', many: 'Einträge' });
    expect(Methods.leadQuestions(m).length).toBeGreaterThan(0);
  });
});

describe('Methods – Hinweise', () => {
  it('allgemein: leer, Eingang, ohne Titel', () => {
    const m = matrixOf('custom');
    expect(keys(m)).toEqual(['empty:open']);
    Ops.addItem(m, {});
    expect(keys(m)).toEqual(['inbox:open', 'untitled:warn']);
  });

  it('Eisenhower', () => {
    const m = matrixOf('eisenhower');
    const a = Ops.addItem(m, { title: 'A', x: 2, y: 2 });
    Ops.addItem(m, { title: 'B', x: 2, y: 2 });
    Ops.addItem(m, { title: 'C', x: 1, y: 2 });
    Ops.addItem(m, { title: 'D', x: 2, y: 1 });
    Ops.addItem(m, { title: 'E', x: 1, y: 1 });
    expect(keys(m)).toEqual(['balance:warn', 'delegate:warn', 'plan:warn', 'drop:open']);
    Ops.setValue(m, a.id, 'done', true);
    m.items.forEach(it => Ops.setValue(m, it.id, 'owner', 'Ben'));
    m.items.forEach(it => Ops.setValue(m, it.id, 'due', '2026-10-20'));
    expect(keys(m)).toEqual(['balance:ok', 'drop:open']);
    // Ohne Feld „Erledigt“ zählt auch die erledigte Aufgabe
    m.config.fields = [];
    expect(keys(m)).toEqual(['balance:warn', 'drop:open']);
  });

  it('Wert/Aufwand', () => {
    const m = matrixOf('value-effort');
    expect(keys(m)).toEqual(['empty:open']);
    Ops.addItem(m, { title: 'Teuer', x: 9, y: 1 });
    expect(keys(m)).toEqual(['quick:warn', 'sink:open']);
    Ops.addItem(m, { title: '', x: 1, y: 9 });
    Ops.addItem(m, { title: 'Knapp', x: 4.8, y: 9 });
    const h = Methods.hints(m);
    expect(h.find(x => x.key === 'quick')?.detail).toContain('#2');
    expect(h.find(x => x.key === 'near')?.items).toHaveLength(1);
  });

  it('Macht/Interesse', () => {
    const m = matrixOf('stakeholder');
    const a = Ops.addItem(m, { title: 'Rat', x: 5, y: 5 });
    expect(keys(m)).toEqual(['stance:open', 'strategy:warn']);
    Ops.setValue(m, a.id, 'stance', 'contra');
    Ops.setValue(m, a.id, 'strategy', 'Treffen');
    Ops.setValue(m, a.id, 'target', { x: 1, y: 1 });
    expect(keys(m)).toEqual(['critical:warn', 'target:ok']);
    m.config.fields = [];
    expect(keys(m)).toEqual([]);
  });

  it('Risikomatrix', () => {
    const m = matrixOf('risk');
    const a = Ops.addItem(m, { title: 'Brand', x: 5, y: 4 });
    expect(keys(m)).toEqual(['measure:warn']);
    Ops.setValue(m, a.id, 'measure', 'Löscher');
    Ops.setValue(m, a.id, 'response', 'accept');
    expect(keys(m)).toEqual(['measure:ok', 'residual:open', 'accept:warn']);
    Ops.setValue(m, a.id, 'residual', { x: 5, y: 4 });
    expect(keys(m)).toEqual(['measure:ok', 'notLower:warn', 'accept:warn']);
    Ops.setValue(m, a.id, 'residual', { x: 2, y: 1 });
    Ops.setValue(m, a.id, 'response', 'reduce');
    expect(keys(m)).toEqual(['measure:ok']);
    m.config.fields = m.config.fields.filter(f => f.key !== 'residual');
    expect(keys(m)).toEqual(['measure:ok']);
  });

  it('Stacey', () => {
    const m = matrixOf('stacey');
    const a = Ops.addItem(m, { title: 'E-Truck', x: 9, y: 9 });
    Ops.addItem(m, { title: 'App', x: 6, y: 6 });
    expect(keys(m)).toEqual(['chaotic:warn', 'complex:ok', 'unanswered:open']);
    Ops.setAnswer(m, a.id, 'goals', 5);
    expect(Methods.hints(m).find(h => h.key === 'unanswered')?.items).toHaveLength(1);
    m.config.questions = [];
    expect(keys(m)).not.toContain('unanswered:open');
  });

  it('BCG', () => {
    const m = matrixOf('bcg');
    expect(keys(m)).toEqual(['empty:open']);
    const q = Ops.addItem(m, { title: 'Bowls', x: 0.4, y: 16 });
    Ops.addItem(m, { title: 'Wurst', x: 0.5, y: 2 });
    expect(keys(m)).toEqual(['cow:warn', 'question:warn', 'dog:open']);
    Ops.addItem(m, { title: 'Pommes', x: 1.6, y: 3 });
    Ops.setValue(m, q.id, 'strategy', 'build');
    expect(keys(m)).toEqual(['balance:ok', 'dog:open']);
    expect(Methods.hints(m)[0].detail).toContain('1 Cash Cow');
    m.config.fields = [];
    Ops.setValue(m, q.id, 'strategy', null);
    expect(keys(m)).toEqual(['balance:ok', 'dog:open']);
  });

  it('GE-McKinsey', () => {
    const m = matrixOf('ge-mckinsey');
    expect(keys(m)).toEqual(['empty:open']);
    const a = Ops.addItem(m, { title: 'Markt', x: 3, y: 3 });
    Ops.addItem(m, { title: 'Lieferdienst', x: 1, y: 1 });
    Ops.addItem(m, { title: 'Catering', x: 2, y: 2 });
    expect(keys(m)).toEqual(['measure:warn', 'harvest:open']);
    Ops.setValue(m, a.id, 'measure', 'Stellplatz');
    expect(keys(m)).toEqual(['invest:ok', 'harvest:open']);
    m.config.fields = [];
    Ops.setValue(m, a.id, 'measure', null);
    expect(keys(m)).toEqual(['invest:ok', 'harvest:open']);
  });

  it('Kraljic', () => {
    const m = matrixOf('kraljic');
    const a = Ops.addItem(m, { title: 'Öl', x: 4, y: 4.5 });
    const b = Ops.addItem(m, { title: 'Gas', x: 4, y: 2 });
    Ops.addItem(m, { title: 'Servietten', x: 1, y: 1 });
    expect(keys(m)).toEqual(['strategy:warn', 'bottleneck:open']);
    Ops.setValue(m, a.id, 'strategy', 'Rahmenvertrag');
    Ops.setValue(m, b.id, 'strategy', 'Reserve');
    expect(keys(m)).toEqual(['strategy:ok', 'bottleneck:open']);
    m.config.fields = [];
    expect(keys(m)).toEqual(['bottleneck:open']);
  });

  it('Ansoff', () => {
    const m = matrixOf('ansoff');
    expect(keys(m)).toEqual(['empty:open']);
    Ops.addItem(m, { title: 'Kochkurse', x: 2, y: 2 });
    expect(keys(m)).toEqual(['penetration:open', 'risk:warn']);
    Ops.addItem(m, { title: 'Kombi', x: 1, y: 1 });
    Ops.addItem(m, { title: 'Bowls', x: 2, y: 1 });
    expect(keys(m)).toEqual(['spread:ok']);
  });

  it('SWOT', () => {
    const m = matrixOf('swot');
    expect(keys(m)).toEqual(['empty:open']);
    const a = Ops.addItem(m, { title: 'Stammkunden', x: 1, y: 2 });
    expect(keys(m)).toEqual(['empty:open', 'strategy:open']);
    expect(Methods.hints(m)[0].detail).toBe('Noch nichts unter: Schwächen, Chancen, Risiken.');
    for (const [x, y] of [[2, 2], [1, 1], [2, 1]]) Ops.setValue(m, Ops.addItem(m, { title: 'F', x, y }).id, 'strategy', 'S');
    Ops.setValue(m, a.id, 'strategy', 'Unterschriften');
    expect(keys(m)).toEqual(['complete:ok']);
    m.config.fields = [];
    Ops.setValue(m, a.id, 'strategy', null);
    expect(keys(m)).toEqual(['complete:ok']);
  });

  it('Dringlichkeit/Auswirkung', () => {
    const m = matrixOf('urgency-impact');
    expect(keys(m)).toEqual(['empty:open']);
    const a = Ops.addItem(m, { title: 'Fritteuse', x: 3, y: 3 });
    Ops.addItem(m, { title: 'Bon', x: 1, y: 1 });
    expect(keys(m)).toEqual(['open:warn', 'owner:warn']);
    expect(Layout.regionOf(m, a)?.id).toBe('p1');
    Ops.setValue(m, a.id, 'done', true);
    expect(keys(m)).toEqual(['clear:ok']);
    Ops.setValue(m, a.id, 'done', false);
    Ops.setValue(m, a.id, 'owner', 'Ben');
    expect(keys(m)).toEqual(['open:warn']);
    m.config.fields = [];
    expect(keys(m)).toEqual(['open:warn']);
    expect([[1, 1], [2, 1], [3, 1], [2, 2], [3, 2], [3, 3]].map(([x, y]) => Layout.regionAt(m.config, x, y)?.id)).toEqual(['p5', 'p4', 'p3', 'p3', 'p2', 'p1']);
  });

  it('Wichtigkeit/Zufriedenheit', () => {
    const m = matrixOf('importance-performance');
    expect(keys(m)).toEqual(['empty:open']);
    Ops.addItem(m, { title: 'Preis', x: 4, y: 4 });
    expect(keys(m)).toEqual(['fine:ok']);
    const a = Ops.addItem(m, { title: 'Wartezeit', x: 2.4, y: 4.5 });
    Ops.addItem(m, { title: 'Musik', x: 4, y: 1.5 });
    expect(keys(m)).toEqual(['focus:warn', 'measure:open', 'overkill:open']);
    Ops.setValue(m, a.id, 'measure', 'Fritteuse');
    expect(keys(m)).toEqual(['focus:warn', 'overkill:open']);
    m.config.fields = [];
    Ops.setValue(m, a.id, 'measure', null);
    expect(keys(m)).toEqual(['focus:warn', 'overkill:open']);
    expect(Layout.ranking(m)[0].item.title).toBe('Wartezeit');
  });

  it('Situatives Führen', () => {
    const m = matrixOf('situational');
    const a = Ops.addItem(m, { title: 'Tom' });
    for (const [q, v] of [['guidance', 1], ['unsure', 2], ['hesitant', 4], ['distant', 5]]) Ops.setAnswer(m, a.id, q, v);
    expect([a.x, a.y]).toEqual([1.5, 4.5]);
    expect(Layout.regionOf(m, a)?.id).toBe('directing');
    Ops.addItem(m, { title: 'Mia', x: 4.5, y: 4.5 });
    expect(keys(m)).toEqual(['next:warn', 'delegate:ok', 'unanswered:open']);
    Ops.setValue(m, a.id, 'next', 'Schichten');
    m.config.questions = [];
    expect(keys(m)).toEqual(['delegate:ok']);
    m.config.fields = [];
    expect(keys(m)).toEqual(['delegate:ok']);
  });

  it('Porter', () => {
    const m = matrixOf('porter');
    expect(keys(m)).toEqual(['empty:open']);
    Ops.addItem(m, { title: 'Premium', x: 2, y: 2 });
    expect(keys(m)).toEqual(['clear:ok']);
    expect(Methods.hints(m)[0].detail).toBe('Alle Optionen gehören zu Differenzierung.');
    Ops.addItem(m, { title: 'Günstig', x: 1, y: 1 });
    expect(keys(m)).toEqual(['middle:warn', 'scope:open']);
  });

  it('keine Hinweise einer Methode für eine andere Methode mit gleichen Einstellungen', () => {
    const m = matrixOf('risk');
    m.method = 'kano';
    Ops.addItem(m, { title: 'A', x: 5, y: 5 });
    expect(keys(m)).toEqual([]);
  });
});
