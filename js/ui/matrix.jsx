/*
 * Ansicht „Matrix“: Werkzeugleiste, Eingang (noch nicht eingeordnete Einträge), Arbeitsfläche
 * und Seitenleiste (gewählter Eintrag bzw. Verteilung, Hinweise, Rangfolge, Leitfragen).
 * Tastatur: Pfeiltasten verschieben, 1–9 legt in einen Bereich, 0 zurück in den Eingang,
 * Entf löscht, Esc hebt die Auswahl auf.
 */
import { useEffect, useRef } from 'preact/hooks';
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Model } from '../model.js';
import { Ops } from '../ops.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { fill, HintsCard, MethodChip } from './components.jsx';
import { dialog, fieldProps, highlighted, mutate, select, selected, useMatrix, viewPrefs } from './core.js';
import { addAndEdit, removeItem } from './items.js';
import { drag, startDrag } from './drag.js';
import { ItemEditor } from './editor.jsx';
import { openSettings } from './settings.jsx';
import { Surface } from './surfaces.jsx';


export function MatrixView() {
  const m = useMatrix();
  useKeys(m);
  const sel = m.items.find(it => it.id === selected.value) || null;
  return (
    <div class="page matrix-page">
      <Toolbar m={m} />
      <div class="work">
        <Inbox m={m} />
        <Surface m={m} />
        <aside class="side" id="side">
          {sel ? <ItemEditor m={m} it={sel} key={sel.id} /> : <Overview m={m} />}
        </aside>
      </div>
    </div>
  );
}

/** Tastatur auf der Arbeitsfläche. @param {Matrix} m */
function useKeys(m) {
  const ref = useRef(m);
  ref.current = m;
  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const onKey = e => {
      const t = /** @type {HTMLElement} */ (e.target);
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || dialog.value || e.ctrlKey || e.metaKey || e.altKey) return;
      const id = selected.value;
      if (e.key === 'Escape') { select(null); return; }
      if (!id) return;
      const it = ref.current.items.find(x => x.id === id);
      if (!it) return;
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
      if (e.key in arrows && it.x != null) {
        e.preventDefault();
        const [dx, dy] = arrows[/** @type {keyof typeof arrows} */ (e.key)];
        mutate(x => Ops.nudge(x, id, dx * (e.shiftKey ? 2 : 1), dy * (e.shiftKey ? 2 : 1)));
      } else if (/^[1-9]$/.test(e.key)) {
        const r = ref.current.config.regions[Number(e.key) - 1];
        if (r) { e.preventDefault(); mutate(x => Ops.placeIn(x, id, r.id)); }
      } else if (e.key === '0') {
        e.preventDefault();
        mutate(x => Ops.move(x, id, null));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeItem(id);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}

/** @param {{ m: Matrix }} props */
function Toolbar({ m }) {
  const names = Methods.itemName(m);
  const points = m.config.fields.filter(f => f.type === 'point');
  const vp = viewPrefs.value;
  return (
    <div class="toolbar matrix-toolbar">
      <MethodChip id={m.method} />
      <input class="input bare title-input" id="matrixName" aria-label={Texts.matrix.name} placeholder={Texts.ui.untitledMatrix} {...fieldProps(() => m.name, v => { m.name = v; })} />
      <span class="sub hide-narrow" id="itemCount">{Util.count(m.items.length, names.one, names.many)}</span>
      <span class="spacer" />
      {m.config.view !== 'board' && (
        <div class="seg" role="group" aria-label={Texts.matrix.labels}>
          <button type="button" class={vp.names ? 'on' : ''} id="showNames" aria-pressed={vp.names} onClick={() => { viewPrefs.value = { ...vp, names: true }; }}>{Texts.matrix.names}</button>
          <button type="button" class={vp.names ? '' : 'on'} id="showNumbers" aria-pressed={!vp.names} onClick={() => { viewPrefs.value = { ...vp, names: false }; }}>{Texts.matrix.numbers}</button>
        </div>
      )}
      {points.length > 0 && (
        <label class="check-inline" title={points.map(f => f.label).join(', ')}>
          <input type="checkbox" id="showPoints" checked={vp.points} onChange={e => { viewPrefs.value = { ...vp, points: /** @type {HTMLInputElement} */ (e.currentTarget).checked }; }} />
          {points.map(f => f.label).join(', ')}
        </label>
      )}
      <button type="button" class="btn sm" id="settingsBtn" onClick={() => openSettings()}>⚙ <span class="hide-narrow">{Texts.matrix.settings}</span></button>
      <button type="button" class="btn sm primary" id="addItem" onClick={() => addAndEdit()}>+ {names.one}</button>
    </div>
  );
}

/** Eingang: neue Einträge schnell erfassen, noch nicht eingeordnete Einträge. @param {{ m: Matrix }} props */
function Inbox({ m }) {
  const open = Model.unplaced(m);
  const names = Methods.itemName(m);
  const d = drag.value;
  const isOver = d && d.over === 'inbox' && !d.key;
  /** @param {KeyboardEvent} e */
  const onKey = e => {
    if (e.key !== 'Enter') return;
    const input = /** @type {HTMLInputElement} */ (e.currentTarget);
    const title = input.value.trim();
    if (!title) return;
    e.preventDefault();
    mutate(x => Ops.addItem(x, { title }));
    input.value = '';
  };
  return (
    <section class={`card pad inbox${isOver ? ' over' : ''}`} id="inbox" data-drop="inbox" aria-label={Texts.matrix.inbox}>
      <h3>{Texts.matrix.inbox} {open.length > 0 && <span class="chip warn sm" id="inboxCount">{open.length}</span>}</h3>
      <input class="input" id="quickAdd" placeholder={fill(Texts.matrix.quickAdd, { item: names.one })} onKeyDown={onKey} aria-label={fill(Texts.matrix.quickAdd, { item: names.one })} />
      <div class="inbox-list">
        {open.map(it => (
          <div key={it.id} class={`inbox-item${selected.value === it.id ? ' sel' : ''}${highlighted.value.includes(it.id) ? ' hl' : ''}`} data-item={it.id} role="button" tabIndex={0}
            onPointerDown={e => startDrag(e, it.id, IO.label(it))}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it.id); } }}>
            <span class="grip" aria-hidden="true">⋮⋮</span>
            <span class="no">#{it.no}</span>
            <span class="t">{IO.title(it)}</span>
          </div>
        ))}
      </div>
      <p class="sub small inbox-help">{open.length ? Texts.matrix.inboxHelp : fill(Texts.matrix.inboxEmpty, { items: names.many })}</p>
      <details class="keys">
        <summary>{Texts.matrix.keysTitle}</summary>
        <ul>{Texts.matrix.keys.map((k, i) => <li key={i}>{k}</li>)}</ul>
      </details>
    </section>
  );
}

/** Seitenleiste ohne Auswahl. @param {{ m: Matrix }} props */
function Overview({ m }) {
  const groups = Layout.byRegion(m);
  const total = Model.placed(m).length;
  const ranking = m.config.rank !== 'none' ? Layout.ranking(m).slice(0, 5) : [];
  // Ohne Platz für Hinweise in der Fläche (Zonen, Raster) stehen sie hier
  const withHints = m.config.layout !== 'quadrants';
  // Lange Namen passen nicht in zwei Spalten
  const oneColumn = withHints || m.config.regions.some(r => (r.label || r.id).length > 14);
  return (
    <>
      <section class="card pad" id="distribution">
        <h3>{Texts.matrix.distribution}</h3>
        <div class="dist" aria-hidden="true">
          {[...groups].map(([r, items]) => items.length > 0 && <span key={r.id} class={`c-${r.color}`} style={{ width: `${(items.length / Math.max(total, 1)) * 100}%` }} />)}
        </div>
        <div class={`dist-leg${oneColumn ? ' with-hints' : ''}`}>
          {[...groups].map(([r, items]) => (
            <button type="button" key={r.id} class="dist-row" data-region={r.id}
              onClick={() => { highlighted.value = items.map(i => i.id); }}>
              <i class={`c-${r.color}`} /><span>{r.label || r.id}{withHints && r.hint && <small>{r.hint}</small>}</span><b>{items.length}</b>
            </button>
          ))}
        </div>
      </section>
      <HintsCard m={m} />
      {ranking.length > 0 && (
        <section class="card pad" id="ranking">
          <h3>{IO.scoreLabel(m)}</h3>
          <ol class="rank-list">
            {ranking.map(r => (
              <li key={r.item.id}>
                <button type="button" class="link-row" onClick={() => select(r.item.id)}>{IO.label(r.item)}</button>
                <b>{IO.score(r.score)}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section class="card pad" id="leadQuestions">
        <h3>{Texts.matrix.leadQuestions}</h3>
        <ul class="lead-q">{Methods.leadQuestions(m).map((q, i) => <li key={i}>{q}</li>)}</ul>
      </section>
    </>
  );
}
