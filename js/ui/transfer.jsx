/*
 * Einträge aus einer anderen Matrix übernehmen (z. B. Maßnahmen aus der Risikomatrix nach
 * Wert/Aufwand bewerten): Titel und Notiz landen im Eingang der geöffneten Matrix.
 */
import { IO } from '../io.js';
import { useState } from 'preact/hooks';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Ops } from '../ops.js';
import { Store } from '../storage.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { Dialog, fill, MethodChip } from './components.jsx';
import { closeDialog, matrix, mutate, openDialog, toast } from './core.js';

/** Dialog öffnen. */
export function openCopyItems() {
  if (!matrix) return;
  const target = matrix;
  openDialog(() => <CopyItems target={target} />);
}

/** @param {{ target: Matrix }} props */
function CopyItems({ target }) {
  const sources = Store.all().filter(m => m.id !== target.id && m.items.length);
  const [src, setSrc] = useState(sources.length ? sources[0].id : '');
  const [chosen, setChosen] = useState(/** @type {Set<string>} */ (new Set()));
  const source = sources.find(m => m.id === src) || null;
  const C = Texts.copyItems;
  /** @param {string} id */
  const toggle = id => setChosen(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const run = () => {
    if (!source) return;
    const items = source.items.filter(it => chosen.has(it.id));
    const n = mutate(m => Ops.copyItems(m, items)) || 0;
    closeDialog();
    toast(fill(C.done, { n }));
  };
  return (
    <Dialog title={C.title} id="copyDialog">
      <div class="dialog-body">
        {!sources.length ? <p class="sub">{C.none}</p> : <>
          <p class="sub small">{C.intro}</p>
          <label class="field-lbl" for="copySource">{C.source}</label>
          <select class="input select" id="copySource" value={src} onChange={e => { setSrc(/** @type {HTMLSelectElement} */ (e.currentTarget).value); setChosen(new Set()); }}>
            {sources.map(m => <option key={m.id} value={m.id}>{m.name || Texts.ui.untitledMatrix} ({Methods.texts(Methods.get(m.method)).short})</option>)}
          </select>
          {source && <>
            <div class="row copy-head"><MethodChip id={source.method} /><span class="spacer" />
              <button type="button" class="link sm" id="copyAll" onClick={() => setChosen(new Set(source.items.map(i => i.id)))}>{C.all}</button>
              <button type="button" class="link sm" onClick={() => setChosen(new Set())}>{C.none2}</button>
            </div>
            <div class="copy-list">
              {source.items.map(it => {
                const r = Layout.regionOf(source, it);
                return (
                  <label key={it.id} class="check-row" data-item={it.id}>
                    <input type="checkbox" checked={chosen.has(it.id)} onChange={() => toggle(it.id)} />
                    <span>{IO.label(it)}</span>
                    <span class="spacer" />
                    {r && <span class={`chip sm region-chip c-${r.color}`}>{r.label}</span>}
                  </label>
                );
              })}
            </div>
          </>}
        </>}
      </div>
      <div class="dialog-foot">
        <button type="button" class="btn" onClick={closeDialog}>{Texts.ui.cancel}</button>
        <button type="button" class="btn primary" id="copyRun" disabled={!chosen.size} onClick={run}>{fill(C.run, { n: chosen.size, items: Util.count(chosen.size, Methods.itemName(target).one, Methods.itemName(target).many) })}</button>
      </div>
    </Dialog>
  );
}
