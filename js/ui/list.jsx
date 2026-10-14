/*
 * Ansicht „Liste“: alle Einträge als Tabelle – Titel, Werte auf beiden Achsen, Bereich, Notiz
 * und Felder; sortierbar nach Nummer, Bereich oder Rangfolge.
 */
import { useState } from 'preact/hooks';
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Ops } from '../ops.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { RegionChip } from './components.jsx';
import { fieldProps, mutate, openMatrix, select, useMatrix } from './core.js';
import { addAndEdit, removeItem } from './items.js';

/** @typedef {'no' | 'region' | 'rank'} Sort */

/**
 * Zahlenfeld in der Tabelle.
 * @param {{ axis: Axis, value: number | null, label: string, onSet: (v: number) => void }} props
 */
function Num({ axis, value, label, onSet }) {
  /** @param {Event} e */
  const commit = e => {
    const raw = /** @type {HTMLInputElement} */ (e.currentTarget).value.replace(',', '.').trim();
    const v = Number(raw);
    if (raw !== '' && Number.isFinite(v) && v !== value) onSet(v);
  };
  return (
    <input class="input sm num-input" type="number" inputMode="decimal" aria-label={label} min={axis.min} max={axis.max} step={axis.step || 'any'}
      value={value == null ? '' : value} placeholder="–" onChange={commit} onKeyDown={e => { if (e.key === 'Enter') commit(e); }} />
  );
}

export function ListView() {
  const m = useMatrix();
  const c = m.config;
  const [sort, setSort] = useState(/** @type {Sort} */ ('no'));
  const names = Methods.itemName(m);
  const ranking = Layout.ranking(m);
  const rankOf = new Map(ranking.map((r, i) => [r.item.id, i]));
  const regionIndex = (/** @type {Item} */ it) => { const r = Layout.regionOf(m, it); return r ? c.regions.indexOf(r) : c.regions.length; };
  const items = m.items.slice().sort((a, b) => {
    if (sort === 'region') return regionIndex(a) - regionIndex(b) || a.no - b.no;
    if (sort === 'rank') return (rankOf.get(a.id) ?? 1e9) - (rankOf.get(b.id) ?? 1e9) || a.no - b.no;
    return a.no - b.no;
  });
  const L = Texts.list;
  return (
    <div class="page list-page">
      <div class="toolbar">
        <h1 class="page-title">{m.name || Texts.ui.untitledMatrix}</h1>
        <span class="sub">{Util.count(m.items.length, names.one, names.many)}</span>
        <span class="spacer" />
        <label class="check-inline">{L.sort}
          <select class="input select sm" id="listSort" value={sort} onChange={e => setSort(/** @type {Sort} */ (/** @type {HTMLSelectElement} */ (e.currentTarget).value))}>
            <option value="no">{L.sortNo}</option>
            <option value="region">{L.sortRegion}</option>
            {c.rank !== 'none' && <option value="rank">{Texts.report.score[c.rank]}</option>}
          </select>
        </label>
        <button type="button" class="btn sm primary" id="listAdd" onClick={() => addAndEdit('listNew')}>+ {names.one}</button>
      </div>
      <div class="card table-wrap">
        <table class="tbl" id="itemTable">
          <thead>
            <tr>
              <th>{L.no}</th><th>{L.title}</th><th>{c.x.label || 'X'}</th><th>{c.y.label || 'Y'}</th><th>{L.region}</th><th>{c.noteLabel || L.note}</th>
              {c.fields.map(f => <th key={f.key}>{f.label}</th>)}
              <th><span class="sr-only">{L.actions}</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} data-item={it.id}>
                <td class="id">#{it.no}</td>
                <td><input class="input sm" id={i === items.length - 1 && it.title === '' ? 'listNew' : undefined} aria-label={L.title} {...fieldProps(() => it.title, v => { it.title = v; })} /></td>
                <td><Num axis={c.x} value={it.x} label={c.x.label || 'X'} onSet={v => mutate(x => Ops.move(x, it.id, { x: v, y: it.y ?? Layout.denorm(c.y, 0.5) }))} /></td>
                <td><Num axis={c.y} value={it.y} label={c.y.label || 'Y'} onSet={v => mutate(x => Ops.move(x, it.id, { x: it.x ?? Layout.denorm(c.x, 0.5), y: v }))} /></td>
                <td><RegionChip region={Layout.regionOf(m, it)} sm /></td>
                <td><textarea class="input sm" rows={1} aria-label={c.noteLabel || L.note} {...fieldProps(() => it.note, v => { it.note = v; })} /></td>
                {c.fields.map(f => <td key={f.key} class="small">{IO.formatValue(m, f, it.values[f.key] ?? null)}</td>)}
                <td class="row-actions">
                  <button type="button" class="icon-btn sm" title={L.show} aria-label={L.show} onClick={() => { select(it.id); openMatrix(m.id); }}>↗</button>
                  <button type="button" class="icon-btn sm" title={Texts.editor.remove} aria-label={Texts.editor.remove} onClick={() => removeItem(it.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p class="sub pad">{Util.fill(L.empty, { items: names.many })}</p>}
      </div>
    </div>
  );
}
