/*
 * Arbeitsflächen der Matrix: Karten in vier Feldern (board), Streudiagramm (plot) und Raster
 * mit Zellen (heatmap). Alle nutzen dasselbe Ziehen (drag.js) und dieselbe Auswahl.
 * Neue Darstellung ergänzen: Komponente hier schreiben und in `Surface` eintragen.
 */
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Model } from '../model.js';
import { Ops } from '../ops.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { Avatar, fill } from './components.jsx';
import { highlighted, mutate, select, selected, viewPrefs } from './core.js';
import { drag, startDrag } from './drag.js';


/** Klassen für Auswahl und Markierung eines Eintrags. @param {string} id */
function stateClass(id) {
  const hl = highlighted.value;
  return `${selected.value === id ? ' sel' : ''}${hl.length ? (hl.includes(id) ? ' hl' : ' dim') : ''}`;
}

/** Kurzer Name eines Eintrags. @param {Item} it */

/** Darstellung je nach Einstellung. @param {{ m: Matrix }} props */
export function Surface({ m }) {
  const v = m.config.view;
  return (
    <div class={`surface surface-${v}`} id="surface" data-view={v}>
      {v === 'board' ? <Board m={m} /> : v === 'heatmap' ? <Heatmap m={m} /> : <Plot m={m} />}
      <Ghost />
    </div>
  );
}

/** Element, das beim Ziehen dem Zeiger folgt. */
function Ghost() {
  const d = drag.value;
  if (!d) return null;
  return <div class="drag-ghost" style={{ left: `${d.cx + 12}px`, top: `${d.cy + 12}px` }} aria-hidden="true">{d.label}</div>;
}

/** Ablageziel hervorheben. @param {string} key */
const over = key => (drag.value && drag.value.over === key ? ' over' : '');

// ===== Karten in vier Feldern =====

/** @param {{ m: Matrix }} props */
function Board({ m }) {
  const c = m.config;
  const groups = Layout.byRegion(m);
  const regions = c.regions.filter(r => r.qx && r.qy);
  /** Spalte (1 = links) und Zeile (1 = oben) eines Felds. @param {Region} r */
  const pos = r => ({ col: (r.qx === 'high') !== c.x.reverse ? 3 : 2, row: (r.qy === 'high') !== c.y.reverse ? 2 : 3 });
  const leftPole = c.x.reverse ? c.x.high : c.x.low;
  const rightPole = c.x.reverse ? c.x.low : c.x.high;
  const topPole = c.y.reverse ? c.y.low : c.y.high;
  const bottomPole = c.y.reverse ? c.y.high : c.y.low;
  const done = Model.field(m, 'done');
  return (
    <div class="board" aria-label={`${c.x.label} × ${c.y.label}`}>
      <span />
      <div class="axis-x" style={{ gridColumn: 2 }}>{leftPole || c.x.label}</div>
      <div class="axis-x muted" style={{ gridColumn: 3 }}>{rightPole}</div>
      <div class="axis-y" style={{ gridRow: 2 }}>{topPole || c.y.label}</div>
      <div class="axis-y muted" style={{ gridRow: 3 }}>{bottomPole}</div>
      {regions.map(r => {
        const { col, row } = pos(r);
        const items = (groups.get(r) || []).slice().sort((a, b) => Number(a.values.done === true) - Number(b.values.done === true) || a.no - b.no);
        const open = done ? items.filter(it => it.values.done !== true).length : items.length;
        const index = c.regions.indexOf(r) + 1;
        return (
          <section key={r.id} class={`quad c-${r.color}${over(`region:${r.id}`)}`} style={{ gridColumn: col, gridRow: row }} data-drop="region" data-region={r.id} aria-label={r.label}>
            <div class="quad-head">
              <span class="quad-no" aria-hidden="true">{index}</span>
              <b>{r.label}</b>
              <small>{done ? fill(Texts.matrix.openCount, { n: open }) : items.length}</small>
            </div>
            {r.hint && <div class="quad-hint">{r.hint}</div>}
            <div class="cards">
              {items.map(it => <Card key={it.id} m={m} it={it} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Karte eines Eintrags im Feld. @param {{ m: Matrix, it: Item }} props */
function Card({ m, it }) {
  const done = Model.field(m, 'done');
  const owner = Model.field(m, 'owner');
  const due = Model.field(m, 'due');
  const isDone = it.values.done === true;
  const today = Util.today();
  const d = /** @type {string} */ (it.values.due || '');
  return (
    <div class={`card-item${isDone ? ' done' : ''}${stateClass(it.id)}`} data-item={it.id} role="button" tabIndex={0}
      onPointerDown={e => { if (!(/** @type {HTMLElement} */ (e.target)).closest('input')) startDrag(e, it.id, IO.label(it)); }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it.id); } }}>
      {done && (
        <input type="checkbox" checked={isDone} aria-label={done.label} title={done.label}
          onChange={e => { const v = /** @type {HTMLInputElement} */ (e.currentTarget).checked; mutate(x => Ops.setValue(x, it.id, 'done', v)); }} />
      )}
      <span class="t">{IO.title(it)}</span>
      <span class="meta">
        {due && d && <span class={`chip sm${!isDone && d < today ? ' bad' : !isDone && d === today ? ' warn' : ''}`}>{Util.formatDay(d, Texts.locale)}</span>}
        {owner && String(it.values.owner || '').trim() && <span class="who" title={String(it.values.owner)}><Avatar name={String(it.values.owner)} /></span>}
      </span>
    </div>
  );
}

// ===== Streudiagramm =====

/** @param {{ m: Matrix }} props */
function Plot({ m }) {
  const c = m.config;
  const shapes = Layout.shapes(c, 100, 100);
  const placed = Model.placed(m);
  const points = viewPrefs.value.points ? c.fields.filter(f => f.type === 'point') : [];
  const split = c.layout === 'quadrants' ? Layout.toScreen(c, c.split.x, c.split.y) : null;
  const names = viewPrefs.value.names;
  const leftPole = c.x.reverse ? c.x.high || IO.num(c.x.max) : c.x.low || IO.num(c.x.min);
  const rightPole = c.x.reverse ? c.x.low || IO.num(c.x.min) : c.x.high || IO.num(c.x.max);
  const bottomPole = c.y.reverse ? c.y.high || IO.num(c.y.max) : c.y.low || IO.num(c.y.min);
  const topPole = c.y.reverse ? c.y.low || IO.num(c.y.min) : c.y.high || IO.num(c.y.max);
  return (
    <div class="plot-frame">
      <div class="plot-y">
        <span class="pole">{topPole}</span>
        <span class="ax-title">{c.y.label} {c.y.reverse ? '↓' : '↑'}</span>
        <span class="pole">{bottomPole}</span>
      </div>
      <div class="plot-col">
        <div class={`plot${over('plot')}`} id="plot" data-drop="plot" aria-label={`${c.x.label} × ${c.y.label}`}>
          <svg class="plot-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {shapes.map((s, i) => s.kind === 'rect'
              ? <rect key={i} class={`fill c-${s.region.color}`} x={s.x} y={s.y} width={s.w} height={s.h} />
              : <ellipse key={i} class={`fill c-${s.region.color} zone-line`} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />)}
          </svg>
          {split && <div class="split-x" style={{ left: `${split.left}%` }} />}
          {split && <div class="split-y" style={{ bottom: `${split.bottom}%` }} />}
          {Layout.labelAnchors(c).map(a => (
            <div key={a.region.id} class={`region-label c-${a.region.color} ax-${a.alignX} ay-${a.alignY}`}
              style={{ [a.alignX === 'end' ? 'right' : 'left']: `${(a.alignX === 'end' ? 1 - a.left : a.left) * 100}%`, [a.alignY === 'top' ? 'top' : 'bottom']: `${(a.alignY === 'top' ? a.top : 1 - a.top) * 100}%` }}>
              <b>{a.region.label}</b>{a.region.hint && c.layout === 'quadrants' && <small>{a.region.hint}</small>}
            </div>
          ))}
          {points.length > 0 && (
            <svg class="arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {placed.flatMap(it => points.map(f => {
                const p = /** @type {Point | null} */ (it.values[f.key] || null);
                if (!p) return null;
                const a = Layout.toScreen(c, /** @type {number} */ (it.x), /** @type {number} */ (it.y));
                const b = Layout.toScreen(c, p.x, p.y);
                return <line key={`${it.id}-${f.key}`} x1={a.left} y1={100 - a.bottom} x2={b.left} y2={100 - b.bottom} class={`arrow${stateClass(it.id)}`} vector-effect="non-scaling-stroke" />;
              }))}
            </svg>
          )}
          {placed.flatMap(it => points.map(f => {
            const p = /** @type {Point | null} */ (it.values[f.key] || null);
            if (!p) return null;
            const s = Layout.toScreen(c, p.x, p.y);
            return (
              <button type="button" key={`${it.id}-${f.key}`} class={`tok ghost${stateClass(it.id)}`} style={{ left: `${s.left}%`, bottom: `${s.bottom}%` }}
                data-item={it.id} data-point={f.key} title={`${f.label}: ${IO.label(it)}`} aria-label={`${f.label}: ${IO.label(it)}`}
                onPointerDown={e => startDrag(e, it.id, `${f.label}: #${it.no}`, f.key)}>
                <i>{it.no}</i>
              </button>
            );
          }))}
          {placed.map(it => {
            const s = Layout.toScreen(c, /** @type {number} */ (it.x), /** @type {number} */ (it.y));
            const color = Layout.colorOf(m, it);
            const left = s.left > 72;
            return (
              <button type="button" key={it.id} class={`tok${left ? ' lbl-l' : ''}${stateClass(it.id)}${it.values.done === true ? ' done' : ''}`}
                style={{ left: `${s.left}%`, bottom: `${s.bottom}%` }} data-item={it.id}
                aria-label={IO.label(it)} title={`${IO.label(it)} (${IO.num(/** @type {number} */ (it.x))} / ${IO.num(/** @type {number} */ (it.y))})`}
                onPointerDown={e => startDrag(e, it.id, IO.label(it))}>
                <i class={`c-${color}`}>{it.no}</i>
                {names && <span>{IO.title(it)}</span>}
              </button>
            );
          })}
          {!placed.length && <div class="plot-empty">{fill(Texts.matrix.dragHere, { items: Methods.itemName(m).many })}</div>}
        </div>
        <div class="plot-x">
          <span class="pole">{leftPole}</span>
          <span class="ax-title">{c.x.label} {c.x.reverse ? '←' : '→'}</span>
          <span class="pole">{rightPole}</span>
        </div>
      </div>
    </div>
  );
}

// ===== Raster mit Zellen =====

/** @param {{ m: Matrix }} props */
function Heatmap({ m }) {
  const c = m.config;
  const xs = Layout.steps(c.x);
  const ys = Layout.steps(c.y);
  const cols = c.x.reverse ? xs.slice().reverse() : xs;
  const rows = c.y.reverse ? ys : ys.slice().reverse();
  const placed = Model.placed(m);
  const points = viewPrefs.value.points ? c.fields.filter(f => f.type === 'point') : [];
  const names = viewPrefs.value.names;
  /** Pol-Beschriftung an den Enden einer Achse. @param {Axis} a @param {number} v */
  const pole = (a, v) => (v === a.min ? a.low : v === a.max ? a.high : '');
  const sel = selected.value;
  return (
    <div class="heat-frame">
      <div class="heat-y-title">{c.y.label} {c.y.reverse ? '↓' : '↑'}</div>
      <div class="heat" style={{ gridTemplateColumns: `minmax(64px, auto) repeat(${cols.length}, minmax(0, 1fr))` }} id="heat">
        {rows.map(y => [
          <div class="heat-yl" key={`yl${y}`}><b>{IO.num(y)}</b>{pole(c.y, y) && <small>{pole(c.y, y)}</small>}</div>,
          ...cols.map(x => {
            const r = Layout.regionAt(c, x, y);
            const here = placed.filter(it => it.x === x && it.y === y);
            const ghosts = placed.flatMap(it => points.filter(f => { const p = /** @type {Point | null} */ (it.values[f.key] || null); return p && p.x === x && p.y === y; }).map(f => ({ it, f })));
            return (
              <div key={`${x}:${y}`} class={`cell c-${r ? r.color : 'gray'}${over(`cell:${x}:${y}`)}`} data-drop="cell" data-x={x} data-y={y}
                title={`${c.x.label} ${IO.num(x)} × ${c.y.label} ${IO.num(y)} = ${IO.num(Layout.score(x, y))}${r ? ` (${r.label})` : ''}`}
                onClick={e => { if (sel && e.target === e.currentTarget) mutate(mm => Ops.move(mm, sel, { x, y })); }}>
                {here.map(it => (
                  <button type="button" key={it.id} class={`pill${stateClass(it.id)}`} data-item={it.id} title={IO.label(it)}
                    onPointerDown={e => startDrag(e, it.id, IO.label(it))}>
                    {names ? <><b>#{it.no}</b> {IO.title(it)}</> : <b>#{it.no}</b>}
                  </button>
                ))}
                {ghosts.map(({ it, f }) => (
                  <button type="button" key={`${it.id}-${f.key}`} class={`pill ghost${stateClass(it.id)}`} data-item={it.id} data-point={f.key} title={`${f.label}: ${IO.label(it)}`}
                    onPointerDown={e => startDrag(e, it.id, `${f.label}: #${it.no}`, f.key)}>
                    #{it.no}
                  </button>
                ))}
                <span class="score" aria-hidden="true">{IO.num(Layout.score(x, y))}</span>
              </div>
            );
          }),
        ])}
        <span />
        {cols.map(x => <div class="heat-xl" key={`xl${x}`}><b>{IO.num(x)}</b>{pole(c.x, x) && <small>{pole(c.x, x)}</small>}</div>)}
      </div>
      <div class="heat-x-title">{c.x.label} {c.x.reverse ? '←' : '→'}</div>
      <div class="legend">
        {c.regions.slice().sort((a, b) => (a.min ?? 0) - (b.min ?? 0)).map(r => <span key={r.id}><span class={`sw c-${r.color}`} />{r.label}{r.min != null ? ` ≥ ${IO.num(r.min)}` : ''}</span>)}
        {points.map(f => <span key={f.key}><span class="pill ghost mini">#</span> {f.label}</span>)}
      </div>
    </div>
  );
}
