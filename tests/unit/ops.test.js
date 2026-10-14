import { describe, expect, it } from 'vitest';
import { Layout } from '../../js/layout.js';
import { Model } from '../../js/model.js';
import { Ops } from '../../js/ops.js';
import { matrixOf } from './fixtures.js';

describe('Ops', () => {
  it('legt Einträge an und löscht sie', () => {
    const m = matrixOf('value-effort');
    const a = Ops.addItem(m, { title: 'A' });
    const b = Ops.addItem(m, { title: 'B', note: 'n', x: 3.3, y: 7 });
    expect([a.no, b.no]).toEqual([1, 2]);
    expect(a.x).toBeNull();
    expect([b.x, b.y, b.note]).toEqual([3.5, 7, 'n']);
    Ops.removeItem(m, a.id);
    expect(Ops.addItem(m).no).toBe(3);
    expect(Ops.item(m, 'x')).toBeNull();
  });

  it('verschiebt, auch in Schritten und zurück in den Eingang', () => {
    const m = matrixOf('value-effort');
    const a = Ops.addItem(m, { x: 5, y: 5 });
    Ops.nudge(m, a.id, 1, -1);
    expect([a.x, a.y]).toEqual([5.5, 4.5]);
    Ops.move(m, a.id, null);
    expect(a.x).toBeNull();
    Ops.nudge(m, a.id, 1, 0);
    expect(a.x).toBeNull();
    Ops.move(m, 'gibt-es-nicht', { x: 1, y: 1 });
    const e = matrixOf('eisenhower');
    const t = Ops.addItem(e, { x: 1, y: 1 });
    Ops.nudge(e, t.id, -1, 1);
    expect([t.x, t.y]).toEqual([2, 2]);
    const s = matrixOf('stacey');
    const z = Ops.addItem(s, { x: 5, y: 5 });
    Ops.nudge(s, z.id, 1, 0);
    expect(z.x).toBe(5.5);
  });

  it('legt in Bereiche und lässt Einträge im richtigen Bereich liegen', () => {
    const m = matrixOf('value-effort');
    const a = Ops.addItem(m, {});
    Ops.placeIn(m, a.id, 'quick');
    expect(Layout.regionOf(m, a)?.id).toBe('quick');
    Ops.move(m, a.id, { x: 1, y: 9 });
    Ops.placeIn(m, a.id, 'quick');
    expect([a.x, a.y]).toEqual([1, 9]);
    Ops.placeIn(m, a.id, 'nope');
    expect([a.x, a.y]).toEqual([1, 9]);
  });

  it('setzt Feldwerte (leer entfernt, Punkte auf die Skala)', () => {
    const m = matrixOf('risk');
    const a = Ops.addItem(m, {});
    Ops.setValue(m, a.id, 'residual', { x: 2.4, y: 9 });
    expect(a.values.residual).toEqual({ x: 2, y: 5 });
    Ops.setValue(m, a.id, 'measure', 'x');
    Ops.setValue(m, a.id, 'measure', '');
    expect('measure' in a.values).toBe(false);
    Ops.setValue(m, 'nope', 'measure', 'x');
  });

  it('setzt Antworten und berechnet die Position', () => {
    const m = matrixOf('stacey');
    const a = Ops.addItem(m, {});
    Ops.setAnswer(m, a.id, 'goals', 5);
    expect([a.x, a.y]).toEqual([5, 10]);
    Ops.setAnswer(m, a.id, 'tech', 1);
    expect([a.x, a.y]).toEqual([0, 10]);
    Ops.setAnswer(m, a.id, 'tech', 9);
    expect(a.answers.tech).toBe(5);
    Ops.setAnswer(m, a.id, 'goals', null);
    Ops.setAnswer(m, a.id, 'tech', null);
    expect(a.answers).toEqual({});
    expect([a.x, a.y]).toEqual([10, 10]);
    Ops.setAnswer(m, 'nope', 'goals', 1);
  });

  it('übernimmt Einstellungen und rechnet Positionen um', () => {
    const m = matrixOf('value-effort');
    const a = Ops.addItem(m, { title: 'A', x: 10, y: 5 });
    Ops.addItem(m, { title: 'offen' });
    m.config.fields.push({ key: 'p', label: 'P', type: 'point' }, { key: 'd', label: 'D', type: 'check' });
    a.values = { p: { x: 0, y: 10 }, d: 'kaputt' };
    const next = JSON.parse(JSON.stringify(m.config));
    next.x = { ...next.x, min: 1, max: 5, step: 1 };
    Ops.applyConfig(m, next);
    expect([m.items[0].x, m.items[0].y]).toEqual([5, 5]);
    expect(m.items[0].values).toEqual({ p: { x: 1, y: 10 }, d: false });
    expect(m.items[1].x).toBeNull();
  });

  it('dupliziert mit neuen IDs und übernimmt Einträge', () => {
    const m = matrixOf('risk');
    Ops.addItem(m, { title: 'A', note: 'n', x: 2, y: 2 });
    const copy = Ops.duplicate(m, '(Kopie)');
    expect(copy.id).not.toBe(m.id);
    expect(copy.name).toBe('Test (Kopie)');
    expect(copy.items[0].id).not.toBe(m.items[0].id);
    const target = Model.create();
    expect(Ops.copyItems(target, m.items)).toBe(1);
    expect(target.items[0]).toMatchObject({ title: 'A', note: 'n', x: null });
  });

  it('setzt den Zeitstempel', () => {
    const m = Model.create();
    m.updatedAt = '';
    Ops.touch(m);
    expect(m.updatedAt).not.toBe('');
  });
});
