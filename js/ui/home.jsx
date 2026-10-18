/*
 * Startseite: alle Matrizen als Karten (Vorschaubild, Methode, Kennzahlen, wichtigster
 * Hinweis), Filter nach Methode, die Methoden im Überblick; Dialoge „Neue Matrix“ (Methode
 * bzw. eigene Vorlage wählen) und „Beispiel öffnen“; Import.
 */
import { useEffect, useState } from 'preact/hooks';
import { Examples } from '../examples.js';
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Model } from '../model.js';
import { Store } from '../storage.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { Dialog, fill, MethodChip, pickFile } from './components.jsx';
import { closeDialog, openDialog, openMatrix, render, toast, useRevision } from './core.js';
import { openHelp } from './help.jsx';
import { deleteMatrix, duplicateMatrix } from './manage.js';
import { MatrixSvg } from './svg.jsx';

/** JSON-Datei importieren (Matrix, Sicherung oder Liste). */
export async function importFiles() {
  const text = await pickFile('.json,application/json');
  if (text == null) return;
  let list;
  try { list = IO.parse(text); } catch (e) {
    toast(fill(Texts.io.failed, { msg: e instanceof Error ? e.message : String(e) }));
    return;
  }
  let added = 0;
  let skipped = 0;
  /** @type {Matrix | null} */
  let last = null;
  for (const m of list) {
    const r = IO.resolveImport(m, Store.load(m.id));
    if (r.action === 'same') { skipped++; continue; }
    Store.save(r.matrix);
    last = r.matrix;
    added++;
  }
  toast([added ? fill(Texts.io.imported, { n: added }) : '', skipped ? fill(Texts.io.skipped, { n: skipped }) : ''].filter(Boolean).join(' '));
  if (added === 1 && last) openMatrix(last.id);
  else render();
}

/** Dialog „Neue Matrix“. @param {string} [method] vorausgewählte Methode */
export function openNewMatrix(method) {
  openDialog(() => <NewMatrixDialog initial={method || Methods.list()[0].id} />);
}

/** Dialog „Beispiel öffnen“. */
export function openExamples() {
  openDialog(() => <ExamplesDialog />);
}

/** Leere Matrix mit Einstellungen (für Vorschaubilder). @param {MatrixConfig} config */
const preview = config => Model.create({ config });

/** @param {{ initial: string }} props */
function NewMatrixDialog({ initial }) {
  const [pick, setPick] = useState(initial);
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [templates, setTemplates] = useState(() => Store.templates());
  const N = Texts.newDialog;
  const defs = Methods.list();
  const template = templates.find(t => t.id === pick);
  const def = template ? Methods.get(template.method) : Methods.get(pick);
  const config = template ? template.config : Methods.config(def);
  const t = Methods.texts(def);
  const create = () => {
    const m = Model.create({ name: name.trim() || (template ? template.name : t.name), context, method: def.id, config });
    Store.save(m);
    closeDialog();
    openMatrix(m.id);
  };
  /** @param {string} id */
  const removeTemplate = id => {
    const list = templates.filter(x => x.id !== id);
    Store.saveTemplates(list);
    setTemplates(list);
    if (pick === id) setPick(defs[0].id);
  };
  return (
    <Dialog title={N.title} wide id="newDialog">
      <div class="pick">
        <div class="pick-grid" role="radiogroup" aria-label={N.method}>
          {defs.map(d => (
            <button type="button" role="radio" aria-checked={pick === d.id} key={d.id} class={`mcard${pick === d.id ? ' on' : ''}`} data-pick={d.id} onClick={() => setPick(d.id)}>
              <MatrixSvg m={preview(Methods.config(d))} width={200} height={84} id={`pv-${d.id}`} />
              <b><span aria-hidden="true">{d.icon}</span> {Methods.texts(d).name}</b>
              <span class="small sub">{Methods.texts(d).description}</span>
            </button>
          ))}
          {templates.map(tp => (
            <div key={tp.id} class={`mcard tpl${pick === tp.id ? ' on' : ''}`} data-template={tp.id}>
              <button type="button" role="radio" aria-checked={pick === tp.id} class="mcard-btn" onClick={() => setPick(tp.id)}>
                <MatrixSvg m={preview(tp.config)} width={200} height={84} id={`pv-${tp.id}`} />
                <b>★ {tp.name}</b>
                <span class="small sub">{fill(N.templateOf, { method: Methods.texts(Methods.get(tp.method)).short })}</span>
              </button>
              <button type="button" class="icon-btn sm tpl-del" aria-label={N.removeTemplate} title={N.removeTemplate} onClick={() => removeTemplate(tp.id)}>✕</button>
            </div>
          ))}
        </div>
        <div class="pick-side">
          <MethodChip id={def.id} long />
          <h2>{template ? template.name : t.name}</h2>
          <p class="sub small">{t.aka}</p>
          <dl class="def">
            <dt>X</dt><dd><b>{config.x.label}</b> · {config.x.low} → {config.x.high}</dd>
            <dt>Y</dt><dd><b>{config.y.label}</b> · {config.y.low} → {config.y.high}</dd>
            <dt>{N.scale}</dt><dd>{config.x.step > 0 ? fill(N.steps, { min: config.x.min, max: config.x.max }) : fill(N.stepless, { min: config.x.min, max: config.x.max })}</dd>
          </dl>
          <div class="qlist">
            {config.regions.map(r => <div key={r.id} class={`c-${r.color}`}><b>{r.label}</b>{r.hint}</div>)}
          </div>
          <form class="new-form" onSubmit={e => { e.preventDefault(); create(); }}>
            <label class="field-lbl" for="nmName">{N.name}</label>
            <input class="input" id="nmName" value={name} placeholder={template ? template.name : t.name} onInput={e => setName(/** @type {HTMLInputElement} */ (e.currentTarget).value)} />
            <label class="field-lbl" for="nmContext">{N.context}</label>
            <input class="input" id="nmContext" value={context} placeholder={N.contextPlaceholder} onInput={e => setContext(/** @type {HTMLInputElement} */ (e.currentTarget).value)} />
            <button type="submit" hidden />
          </form>
        </div>
      </div>
      <div class="dialog-foot">
        <span class="sub small">{N.hint}</span>
        <span class="spacer" />
        <button type="button" class="btn" onClick={closeDialog}>{Texts.ui.cancel}</button>
        <button type="button" class="btn primary" id="nmCreate" onClick={create}>{N.create}</button>
      </div>
    </Dialog>
  );
}

function ExamplesDialog() {
  // Die Beispiele werden erst hier geladen (eigene Teildateien im Build)
  const [list, setList] = useState(/** @type {{ key: string, matrix: Matrix }[] | null} */ (null));
  const [failed, setFailed] = useState(false);
  useEffect(() => { Examples.list().then(setList, () => setFailed(true)); }, []);
  /** @param {string} key */
  const open = async key => {
    const m = await Examples.load(key);
    if (!m) return;
    Store.save(m);
    closeDialog();
    openMatrix(m.id);
  };
  return (
    <Dialog title={Texts.examples.title} wide id="examplesDialog">
      <div class="dialog-body examples">
        <p class="sub">{failed ? Texts.examples.failed : list ? Texts.examples.intro : Texts.examples.loading}</p>
        <div class="example-list">
          {(list || []).map(({ key, matrix }) => (
            <button type="button" key={key} class="example card" data-example={key} onClick={() => open(key)}>
              <MatrixSvg m={matrix} width={120} height={96} id={`ex-${key}`} />
              <span class="example-text">
                <MethodChip id={matrix.method} />
                <b>{matrix.name}</b>
                <span class="sub small">{matrix.context}</span>
                <span class="sub small">{Util.count(matrix.items.length, Methods.itemName(matrix).one, Methods.itemName(matrix).many)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

/** Karte einer Matrix. @param {{ m: Matrix }} props */
function MatrixCard({ m }) {
  const names = Methods.itemName(m);
  const open = Model.unplaced(m).length;
  const groups = [...Layout.byRegion(m)].filter(([, items]) => items.length);
  const hint = Methods.hints(m).find(h => h.state === 'warn');
  const day = m.updatedAt.slice(0, 10);
  return (
    <article class="card mcard-home" data-matrix={m.id}>
      <a class="thumb-link" href={`#/m/${m.id}/matrix`} aria-hidden="true" tabIndex={-1}>
        <MatrixSvg m={m} width={132} height={108} id={`th-${m.id}`} />
      </a>
      <div class="mcard-body">
        <MethodChip id={m.method} />
        <h2><a class="card-link" href={`#/m/${m.id}/matrix`}>{m.name || Texts.ui.untitledMatrix}</a></h2>
        {m.context && <div class="sub small ctx">{m.context}</div>}
        <div class="stats">
          <span class="chip">{Util.count(m.items.length, names.one, names.many)}</span>
          {groups.slice(0, 3).map(([r, items]) => <span key={r.id} class={`chip region-chip c-${r.color}`}>{items.length} {r.label}</span>)}
          {open > 0 && <span class="chip warn">{fill(Texts.home.unplaced, { n: open })}</span>}
        </div>
      </div>
      <div class="mcard-foot">
        {hint ? <span class="warn small">⚠ {hint.title}</span> : <span />}
        <span class="spacer" />
        <span class="sub small">{Util.formatDay(day, Texts.locale)}</span>
        <button type="button" class="icon-btn sm" title={Texts.manage.duplicate} aria-label={Texts.manage.duplicate} data-action="duplicate" onClick={() => duplicateMatrix(m)}>⧉</button>
        <button type="button" class="icon-btn sm" title={Texts.ui.delete} aria-label={Texts.ui.delete} data-action="delete" onClick={() => deleteMatrix(m)}>✕</button>
      </div>
    </article>
  );
}

export function Home() {
  useRevision();
  const [filter, setFilter] = useState('');
  const all = Store.all();
  const used = [...new Set(all.map(m => m.method))];
  const list = filter ? all.filter(m => m.method === filter) : all;
  const H = Texts.home;
  const total = all.reduce((n, m) => n + m.items.length, 0);
  return (
    <div class="page home">
      <div class="page-head">
        <div>
          <h1>{H.title}</h1>
          <div class="sub">{all.length ? fill(H.summary, { n: all.length, items: total }) : H.intro}</div>
        </div>
        <span class="spacer" />
        <div class="actions">
          <button type="button" class="btn" id="exampleBtn" onClick={openExamples}>{H.example}</button>
          <button type="button" class="btn" id="importBtn" onClick={importFiles}>{H.import}</button>
          <button type="button" class="btn primary" id="newBtn" onClick={() => openNewMatrix()}>+ {H.new}</button>
        </div>
      </div>
      {used.length > 1 && (
        <div class="seg wrap filter" role="group" aria-label={H.filter} id="methodFilter">
          <button type="button" class={filter ? '' : 'on'} onClick={() => setFilter('')}>{H.all}</button>
          {Methods.list().filter(d => used.includes(d.id)).map(d => (
            <button type="button" key={d.id} class={filter === d.id ? 'on' : ''} data-filter={d.id} onClick={() => setFilter(d.id)}>{Methods.texts(d).short}</button>
          ))}
        </div>
      )}
      <div class="boards" id="boards">
        {list.map(m => <MatrixCard key={m.id} m={m} />)}
        <button type="button" class="card board-new" id="newCard" onClick={() => openNewMatrix()}>
          <span class="plus" aria-hidden="true">+</span>{H.new}<small>{H.newHelp}</small>
        </button>
      </div>
      <section class="card methods-strip" aria-label={H.methods}>
        {Methods.list().filter(d => d.id !== Methods.CUSTOM).map(d => {
          const t = Methods.texts(d);
          return (
            <div key={d.id} class="method-tile" data-method={d.id}>
              <b><span class={`mi c-${d.color}`} aria-hidden="true">{d.icon}</span>{t.name}</b>
              <p>{t.description}</p>
              <div class="axes"><span><i>X</i>{t.x.label}</span><span><i>Y</i>{t.y.label}</span></div>
              <div class="tile-actions">
                <button type="button" class="link sm" onClick={() => openNewMatrix(d.id)}>{H.use}</button>
                <button type="button" class="link sm" onClick={() => openHelp(d.id)}>{H.learn}</button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
