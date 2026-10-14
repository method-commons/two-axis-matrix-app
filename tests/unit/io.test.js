import { describe, expect, it } from 'vitest';
import { IO } from '../../js/io.js';
import { Model } from '../../js/model.js';
import { Ops } from '../../js/ops.js';
import { matrixOf } from './fixtures.js';

function sample() {
  const m = matrixOf('risk');
  m.name = 'Stadtfest';
  m.context = 'Food-Truck';
  const a = Ops.addItem(m, { title: 'Ware geht aus', note: 'Zeile 1\nZeile 2', x: 4, y: 4 });
  Ops.setValue(m, a.id, 'response', 'reduce');
  Ops.setValue(m, a.id, 'measure', 'Zweite Lieferung; früh');
  Ops.setValue(m, a.id, 'residual', { x: 4, y: 2 });
  Ops.addItem(m, { title: 'Klein', x: 1, y: 1 });
  Ops.addItem(m, { title: '' });
  return m;
}

describe('IO – JSON', () => {
  it('exportiert und liest Matrix, Liste und Sicherung', () => {
    const m = sample();
    expect(IO.parse(IO.matrixJson(m))).toEqual([m]);
    expect(IO.parse(JSON.stringify([m, m]))).toHaveLength(2);
    const backup = IO.backupJson([m], new Date(Date.UTC(2026, 0, 1)));
    expect(JSON.parse(backup)).toMatchObject({ type: IO.BACKUP_TYPE, exportedAt: '2026-01-01T00:00:00.000Z' });
    expect(IO.parse(backup)).toEqual([m]);
  });

  it('meldet ungültige Dateien', () => {
    expect(() => IO.parse('{kaputt')).toThrow('keine gültige Matrix');
    expect(() => IO.parse('[]')).toThrow('keine Matrix');
    expect(() => IO.parse('[1]')).toThrow('keine gültige Matrix');
  });

  it('übernimmt Neues, überspringt Gleiches, legt bei Abweichung eine Kopie an', () => {
    const m = sample();
    expect(IO.resolveImport(m, null).action).toBe('new');
    expect(IO.resolveImport({ ...m, updatedAt: 'x' }, m).action).toBe('same');
    const r = IO.resolveImport({ ...m, name: 'Anders' }, m);
    expect(r.action).toBe('copy');
    expect(r.matrix.id).not.toBe(m.id);
    expect(r.matrix.name).toBe('Anders (Import)');
  });
});

describe('IO – Texte', () => {
  it('formatiert Feldwerte', () => {
    const m = Model.normalize({
      config: { fields: [{ key: 'd', type: 'date' }, { key: 'c', type: 'check' }, { key: 's', type: 'choice', options: [{ id: 'a', label: 'Eins' }] }, { key: 'p', type: 'point' }, { key: 't', type: 'text' }], regions: [] },
    });
    const [d, c, s, p, t] = m.config.fields;
    expect(IO.formatValue(m, d, '2026-10-04')).toBe('4.10.2026');
    expect(IO.formatValue(m, c, true)).toBe('ja');
    expect(IO.formatValue(m, c, false)).toBe('');
    expect(IO.formatValue(m, s, 'a')).toBe('Eins');
    expect(IO.formatValue(m, s, 'z')).toBe('');
    expect(IO.formatValue(m, p, { x: 2.5, y: 3 })).toBe('2,5 / 3');
    expect(IO.formatValue(m, t, 'x')).toBe('x');
    expect(IO.formatValue(m, t, null)).toBe('');
  });

  it('beschreibt Achsen', () => {
    expect(IO.axisText(Model.normAxis({ label: 'Aufwand', low: 'gering', high: 'hoch', min: 0, max: 10 }))).toBe('Aufwand: gering → hoch (0–10)');
    expect(IO.axisText(Model.normAxis({ min: 1, max: 5 }))).toBe('– (1–5)');
  });

  it('erstellt den Bericht als Markdown', () => {
    const md = IO.markdown(sample(), { today: '2026-10-14' });
    expect(md).toContain('# Stadtfest');
    expect(md).toContain('Risikomatrix · Food-Truck · Stand 14.10.2026');
    expect(md).toContain('- **X:** Auswirkung: unbedeutend → existenziell (1–5)');
    expect(md).toContain('## Sehr hoch (1)');
    expect(md).toContain('- **#1 Ware geht aus** (4 / 4) – Zeile 1 Zeile 2');
    expect(md).toContain('Strategie: vermindern · Maßnahme: Zweite Lieferung; früh');
    expect(md).toContain('Nach Maßnahme: 4 / 2 (Mittel)');
    expect(md).toContain('## Rangfolge');
    expect(md).toContain('| 1 | #1 Ware geht aus | 4 | 4 | 16 |');
    expect(md).toContain('## Nicht eingeordnet (1)');
    expect(md).toContain('- #3 (ohne Titel)');
    const plain = Model.create();
    expect(IO.markdown(plain)).toContain('# Unbenannte Matrix');
    expect(IO.markdown(plain)).not.toContain('Rangfolge');
  });

  it('zeigt Rangfolgen mit unendlichem Wert als Strich', () => {
    const m = matrixOf('value-effort');
    Ops.addItem(m, { title: 'Gratis', x: 0, y: 5 });
    expect(IO.markdown(m)).toContain('| 1 | #1 Gratis | 5 | 0 | – |');
  });

  it('exportiert Einträge als CSV (Semikolon, Maskierung)', () => {
    const csv = IO.csv(sample());
    const lines = csv.trim().split('\r\n');
    expect(lines[0]).toBe('Nr.;Titel;Auswirkung;Wahrscheinlichkeit;Bereich;Ursache / Folge;Strategie;Maßnahme;Verantwortlich;Nach Maßnahme');
    expect(csv).toContain('1;Ware geht aus;4;4;Sehr hoch;"Zeile 1\nZeile 2";vermindern;"Zweite Lieferung; früh";;4 / 2 (Mittel)');
    expect(lines[lines.length - 1]).toBe('3;;;;;;;;;');
  });
});
