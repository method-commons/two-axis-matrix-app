import { describe, expect, it } from 'vitest';
import { Layout } from '../../js/layout.js';
import { Methods } from '../../js/methods.js';
import { Model } from '../../js/model.js';
import { Ops } from '../../js/ops.js';
import { matrixOf } from './fixtures.js';

const ids = m => m.config.regions.map(r => r.id);
const at = (m, x, y) => Layout.regionAt(m.config, x, y)?.id;

describe('Layout – Umrechnen', () => {
  it('rechnet Werte in Anteile und zurück, auch mit umgekehrter Achse', () => {
    const m = matrixOf('eisenhower');
    const c = m.config;
    expect(Layout.norm(c.y, 2)).toBe(1);
    expect(Layout.norm(c.y, 9)).toBe(1);
    expect(Layout.denorm(c.y, 0.2)).toBe(1);
    expect(Layout.toScreen(c, 2, 1)).toEqual({ left: 0, bottom: 0 });
    expect(Layout.toScreen(c, 1, 2)).toEqual({ left: 100, bottom: 100 });
    expect(Layout.fromScreen(c, 0.1, 0.9)).toEqual({ x: 2, y: 2 });
    c.y.reverse = true;
    expect(Layout.toScreen(c, 1, 2).bottom).toBe(0);
    expect(Layout.fromScreen(c, 0.9, 0.9)).toEqual({ x: 1, y: 1 });
  });

  it('kennt die Stufen einer Achse', () => {
    expect(Layout.steps(matrixOf('risk').config.x)).toEqual([1, 2, 3, 4, 5]);
    expect(Layout.steps(matrixOf('stacey').config.x)).toEqual([]);
    expect(Layout.steps(Model.normAxis({ min: 0, max: 1, step: 0.25 }))).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('rechnet auf geänderte Skalen um', () => {
    const from = Model.normAxis({ min: 0, max: 10, step: 0 });
    const to = Model.normAxis({ min: 1, max: 5, step: 1 });
    expect(Layout.rescale(from, to, 5)).toBe(3);
    expect(Layout.rescale(from, to, 10)).toBe(5);
  });
});

describe('Layout – Bereiche', () => {
  it('vier Felder: nach Trennlinien (auf der Linie zählt „hoch“)', () => {
    const m = matrixOf('value-effort');
    expect(at(m, 2, 8)).toBe('quick');
    expect(at(m, 5, 5)).toBe('major');
    expect(at(m, 2, 2)).toBe('fill');
    expect(at(m, 8, 2)).toBe('sink');
    const e = matrixOf('eisenhower');
    expect(at(e, 2, 2)).toBe('do');
    expect(at(e, 1, 2)).toBe('plan');
    expect(at(e, 2, 1)).toBe('delegate');
    expect(at(e, 1, 1)).toBe('drop');
    e.config.regions = e.config.regions.slice(1);
    expect(at(e, 2, 2)).toBeUndefined();
  });

  it('Raster: nach dem Produkt X × Y', () => {
    const m = matrixOf('risk');
    expect(at(m, 2, 2)).toBe('low');
    expect(at(m, 5, 1)).toBe('medium');
    expect(at(m, 3, 4)).toBe('high');
    expect(at(m, 4, 4)).toBe('critical');
    m.config.regions = m.config.regions.map(r => ({ ...r, min: r.min + 1 }));
    expect(at(m, 1, 1)).toBe('low');
    m.config.regions = [{ id: 'x', label: '', hint: '', color: 'red' }];
    expect(at(m, 1, 1)).toBeUndefined();
  });

  it('Zonen: nach dem Abstand vom Ursprung', () => {
    const m = matrixOf('stacey');
    expect(at(m, 1, 1)).toBe('simple');
    expect(at(m, 5, 2.5)).toBe('complicated');
    expect(at(m, 6.3, 6.3)).toBe('complex');
    expect(at(m, 9, 9)).toBe('chaotic');
    m.config.regions[3].r = 1;
    expect(at(m, 10, 10)).toBe('chaotic');
    m.config.regions = [];
    expect(at(m, 1, 1)).toBeUndefined();
  });

  it('nicht eingeordnete Einträge haben keinen Bereich', () => {
    const m = matrixOf('custom');
    const it = Ops.addItem(m, { title: 'A' });
    expect(Layout.regionOf(m, it)).toBeNull();
  });

  it('die Mitte jedes Bereichs liegt in diesem Bereich – für alle Methoden', () => {
    for (const def of Methods.list()) {
      const c = Methods.config(def, 'de');
      for (const r of c.regions) {
        const p = Layout.centerOf(c, r);
        expect(Layout.regionAt(c, p.x, p.y), `${def.id}/${r.id}`).toBe(r);
      }
    }
  });

  it('die Mitte findet auch bei groben Stufen und Rastern ohne Stufen ihren Bereich', () => {
    const c = Model.normConfig({ x: { min: 0, max: 2, step: 1 }, y: { min: 0, max: 2, step: 1 }, split: { x: 1, y: 1 } });
    for (const r of c.regions) {
      const p = Layout.centerOf(c, r);
      expect(Layout.regionAt(c, p.x, p.y)).toBe(r);
    }
    const g = Model.normConfig({ layout: 'grid', regions: [{ id: 'a', min: 0 }, { id: 'b', min: 30 }, { id: 'c', min: 99 }] });
    expect(Layout.regionAt(g, ...Object.values(Layout.centerOf(g, g.regions[1])))?.id).toBe('b');
    expect(Layout.centerOf(g, g.regions[2])).toEqual({ x: 1, y: 1 });
  });

  it('Position aus Antworten (1 = niedrig … 5 = hoch)', () => {
    const c = matrixOf('stacey').config;
    expect(Layout.fromAnswers(c, { goals: 1, agree: 2, done: 5, tech: 5 })).toEqual({ x: 10, y: 1.3 });
    expect(Layout.fromAnswers(c, { goals: 3 })).toEqual({ y: 5 });
    expect(Layout.fromAnswers(c, {})).toEqual({});
  });
});

describe('Layout – Auswertung und Zeichnung', () => {
  it('ordnet Einträge den Bereichen zu und bildet Rangfolgen', () => {
    const m = matrixOf('value-effort');
    Ops.addItem(m, { title: 'A', x: 2, y: 8 });
    Ops.addItem(m, { title: 'B', x: 0, y: 6 });
    Ops.addItem(m, { title: 'C', x: 8, y: 2 });
    Ops.addItem(m, { title: 'D', x: 0, y: 0 });
    Ops.addItem(m, { title: 'E' });
    const groups = [...Layout.byRegion(m)].map(([r, items]) => [r.id, items.map(i => i.title)]);
    expect(groups).toEqual([['quick', ['A', 'B']], ['major', []], ['fill', ['D']], ['sink', ['C']]]);
    expect(Layout.ranking(m).map(r => [r.item.title, r.score])).toEqual([['B', Infinity], ['A', 4], ['C', 0.25], ['D', 0]]);
    m.config.rank = 'product';
    expect(Layout.ranking(m).map(r => r.item.title)).toEqual(['A', 'C', 'B', 'D']);
    m.config.rank = 'none';
    expect(Layout.ranking(m).map(r => r.score)).toEqual([null, null, null, null]);
  });

  it('färbt Einträge nach Auswahlfeld oder Bereich', () => {
    const m = matrixOf('stakeholder');
    const a = Ops.addItem(m, { title: 'A', x: 5, y: 5 });
    expect(Layout.colorOf(m, a)).toBe('red');
    Ops.setValue(m, a.id, 'stance', 'pro');
    expect(Layout.colorOf(m, a)).toBe('green');
    expect(Layout.colorOf(m, Ops.addItem(m, {}))).toBe('gray');
    expect(Layout.colorField(matrixOf('risk').config)).toBeNull();
  });

  it('liefert Flächen je Aufteilung', () => {
    const q = Layout.shapes(matrixOf('value-effort').config, 100, 100);
    expect(q.map(s => s.region.id)).toEqual(['quick', 'major', 'fill', 'sink']);
    expect(q[0]).toMatchObject({ kind: 'rect', x: 0, y: 0, w: 50, h: 50 });
    const e = Layout.shapes(matrixOf('eisenhower').config, 100, 100);
    expect(e.find(s => s.region.id === 'do')).toMatchObject({ x: 0, y: 0 });
    const z = Layout.shapes(matrixOf('stacey').config, 200, 100);
    expect(z.map(s => s.kind)).toEqual(['rect', 'ellipse', 'ellipse', 'ellipse']);
    expect(z[3]).toMatchObject({ cx: 0, cy: 100, rx: 60, ry: 30 });
    expect(Layout.shapes(matrixOf('risk').config, 100, 100)).toHaveLength(25);
    const free = Model.normConfig({ layout: 'grid', x: { reverse: true }, y: { reverse: true }, regions: [{ id: 'a', min: 0 }] });
    expect(Layout.shapes(free, 100, 100)).toHaveLength(400);
    const none = Model.normConfig({ layout: 'grid', regions: [{ id: 'a' }] });
    expect(Layout.shapes(none, 100, 100)).toEqual([]);
    const bad = Model.normConfig({ regions: [{ id: 'a' }] });
    expect(Layout.shapes(bad, 100, 100)).toEqual([]);
  });

  it('liefert Stellen für die Namen der Bereiche', () => {
    const q = Layout.labelAnchors(matrixOf('eisenhower').config);
    expect(q.find(a => a.region.id === 'do')).toMatchObject({ left: 0, top: 0, alignX: 'start' });
    const z = Layout.labelAnchors(matrixOf('stacey').config);
    expect(z.map(a => a.alignY)).toEqual(['bottom', 'bottom', 'bottom', 'top']);
    const rz = Model.normConfig({ ...matrixOf('stacey').config, x: { reverse: true }, y: { reverse: true } });
    expect(Layout.labelAnchors(rz).map(a => a.alignX)).toEqual(['end', 'end', 'end', 'start']);
    expect(Layout.labelAnchors(matrixOf('risk').config)).toEqual([]);
    expect(ids(matrixOf('risk'))).toEqual(['low', 'medium', 'high', 'critical']);
  });
});
