/*
 * Dialog „Achsen & Bereiche“: Name und Beschreibung, beide Achsen (Beschriftung, Pole, Skala,
 * Richtung), Aufteilung und Darstellung, Bereiche (Name, Hinweis, Farbe, Grenzen), Felder je
 * Eintrag und Rangfolge. Änderungen gelten erst mit „Übernehmen“; Positionen werden dabei auf
 * geänderte Skalen umgerechnet. Die Einstellung lässt sich als eigene Vorlage speichern.
 */
import { useState } from 'preact/hooks';
import { Model } from '../model.js';
import { Ops } from '../ops.js';
import { Store } from '../storage.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { Dialog } from './components.jsx';
import { closeDialog, matrix, mutate, openDialog, toast } from './core.js';

/** @typedef {{ name: string, context: string, config: MatrixConfig }} Draft */

/** Dialog öffnen. */
export function openSettings() {
  if (!matrix) return;
  const m = matrix;
  openDialog(() => <Settings m={m} />);
}

/** @template T @param {T} x @returns {T} */
const clone = x => JSON.parse(JSON.stringify(x));

/** Zahl aus einem Eingabefeld (Komma erlaubt). @param {Event} e */
const numOf = e => Number(/** @type {HTMLInputElement} */ (e.currentTarget).value.replace(',', '.'));
/** Text aus einem Eingabefeld. @param {Event} e */
const textOf = e => /** @type {HTMLInputElement} */ (e.currentTarget).value;

/**
 * Bereiche für eine andere Aufteilung: Namen, Hinweise und Farben werden der Reihe nach
 * übernommen, die Grenzen neu gesetzt.
 * @param {Region[]} prev @param {LayoutKind} layout @param {MatrixConfig} c @returns {Region[]}
 */
export function regionsFor(prev, layout, c) {
  const base = Model.defaultConfig().regions;
  const maxScore = c.x.max * c.y.max;
  const n = layout === 'quadrants' ? 4 : Math.max(prev.length, 2);
  return Array.from({ length: n }, (_, i) => {
    const p = prev[i] || base[i % 4];
    /** @type {Region} */
    const r = { id: p.id, label: p.label, hint: p.hint, color: p.color };
    if (layout === 'quadrants') { r.id = base[i].id; r.qx = base[i].qx; r.qy = base[i].qy; }
    if (layout === 'grid') r.min = i === 0 ? Math.min(0, c.x.min * c.y.min) : Math.round((maxScore * i) / n * 10) / 10;
    if (layout === 'zones') r.r = i === n - 1 ? 1.5 : Math.round(((i + 1) / n) * 1.2 * 100) / 100;
    return r;
  });
}

/** @param {{ m: Matrix }} props */
function Settings({ m }) {
  const [d, setD] = useState(() => /** @type {Draft} */ ({ name: m.name, context: m.context, config: clone(m.config) }));
  /** @param {(x: Draft) => void} fn */
  const upd = fn => setD(prev => { const n = clone(prev); fn(n); return n; });
  const S = Texts.settings;
  const c = d.config;
  const apply = () => {
    mutate(x => {
      x.name = d.name;
      x.context = d.context;
      Ops.applyConfig(x, d.config);
    });
    closeDialog();
  };
  const saveTemplate = () => {
    const list = Store.templates();
    list.push({ id: Util.uid('t'), name: d.name.trim() || S.templateUnnamed, method: m.method, config: Model.normConfig(clone(d.config)) });
    if (Store.saveTemplates(list)) toast(S.templateSaved);
  };
  const cells = c.layout === 'grid' && c.x.step > 0 && c.y.step > 0;
  /** @type {[ViewKind, string, boolean][]} */
  const views = [['board', S.views.board, c.layout === 'quadrants'], ['plot', S.views.plot, true], ['heatmap', S.views.heatmap, cells]];
  return (
    <Dialog title={S.title} wide id="settingsDialog">
      <div class="dialog-body settings">
        <section>
          <h3>{S.general}</h3>
          <div class="form-grid">
            <label for="setName">{S.name}</label>
            <input class="input" id="setName" value={d.name} onInput={e => upd(x => { x.name = textOf(e); })} />
            <label for="setContext">{S.context}</label>
            <input class="input" id="setContext" value={d.context} placeholder={S.contextPlaceholder} onInput={e => upd(x => { x.context = textOf(e); })} />
            <label for="setItemOne">{S.itemName}</label>
            <div class="pair">
              <input class="input" id="setItemOne" value={c.itemName.one} placeholder={Texts.items.one} aria-label={S.itemOne} onInput={e => upd(x => { x.config.itemName.one = textOf(e); })} />
              <input class="input" id="setItemMany" value={c.itemName.many} placeholder={Texts.items.many} aria-label={S.itemMany} onInput={e => upd(x => { x.config.itemName.many = textOf(e); })} />
            </div>
            <label for="setNote">{S.noteLabel}</label>
            <input class="input" id="setNote" value={c.noteLabel} placeholder={Texts.list.note} onInput={e => upd(x => { x.config.noteLabel = textOf(e); })} />
          </div>
        </section>

        <section class="axes-grid">
          {/** @type {const} */ (['x', 'y']).map(k => {
            const a = c[k];
            const custom = a.step > 0 && ![0.5, 1].includes(a.step);
            return (
              <div key={k} class="axis-box" data-axis={k}>
                <h3>{k === 'x' ? S.axisX : S.axisY}</h3>
                <div class="form-grid tight">
                  <label for={`ax-${k}-label`}>{S.axisLabel}</label>
                  <input class="input" id={`ax-${k}-label`} value={a.label} onInput={e => upd(x => { x.config[k].label = textOf(e); })} />
                  <label for={`ax-${k}-low`}>{S.poles}</label>
                  <div class="pair">
                    <input class="input" id={`ax-${k}-low`} value={a.low} placeholder={S.low} aria-label={S.low} onInput={e => upd(x => { x.config[k].low = textOf(e); })} />
                    <input class="input" id={`ax-${k}-high`} value={a.high} placeholder={S.high} aria-label={S.high} onInput={e => upd(x => { x.config[k].high = textOf(e); })} />
                  </div>
                  <label for={`ax-${k}-min`}>{S.range}</label>
                  <div class="pair">
                    <input class="input" type="number" id={`ax-${k}-min`} value={a.min} aria-label={S.min} onChange={e => upd(x => { const v = numOf(e); if (Number.isFinite(v) && v < x.config[k].max) x.config[k].min = v; })} />
                    <input class="input" type="number" id={`ax-${k}-max`} value={a.max} aria-label={S.max} onChange={e => upd(x => { const v = numOf(e); if (Number.isFinite(v) && v > x.config[k].min) x.config[k].max = v; })} />
                  </div>
                  <label for={`ax-${k}-step`}>{S.step}</label>
                  <div class="pair">
                    <select class="input select" id={`ax-${k}-step`} value={custom ? 'custom' : String(a.step)}
                      onChange={e => { const v = textOf(e); upd(x => { x.config[k].step = v === 'custom' ? 2 : Number(v); }); }}>
                      <option value="0">{S.stepless}</option>
                      <option value="0.5">0,5</option>
                      <option value="1">1</option>
                      <option value="custom">{S.stepCustom}</option>
                    </select>
                    {custom && <input class="input" type="number" id={`ax-${k}-stepv`} value={a.step} aria-label={S.step} onChange={e => upd(x => { const v = numOf(e); if (v > 0) x.config[k].step = v; })} />}
                  </div>
                  <span />
                  <label class="check-inline"><input type="checkbox" id={`ax-${k}-rev`} checked={a.reverse} onChange={e => upd(x => { x.config[k].reverse = /** @type {HTMLInputElement} */ (e.currentTarget).checked; })} />{k === 'x' ? S.reverseX : S.reverseY}</label>
                </div>
              </div>
            );
          })}
        </section>

        <section>
          <h3>{S.layout}</h3>
          <div class="form-grid">
            <label for="setLayout">{S.layoutKind}</label>
            <select class="input select" id="setLayout" value={c.layout}
              onChange={e => { const v = /** @type {LayoutKind} */ (textOf(e)); upd(x => {
                x.config.regions = regionsFor(x.config.regions, v, x.config);
                x.config.layout = v;
                const hasCells = v === 'grid' && x.config.x.step > 0 && x.config.y.step > 0;
                if (x.config.view === 'board' && v !== 'quadrants') x.config.view = 'plot';
                if (x.config.view === 'heatmap' && !hasCells) x.config.view = 'plot';
                if (hasCells) x.config.view = 'heatmap';
              }); }}>
              {Model.LAYOUTS.map(l => <option key={l} value={l}>{S.layouts[l]}</option>)}
            </select>
            <label for="setView">{S.view}</label>
            <select class="input select" id="setView" value={c.view} onChange={e => { const v = /** @type {ViewKind} */ (textOf(e)); upd(x => { x.config.view = v; }); }}>
              {views.filter(v => v[2]).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
            {c.layout === 'quadrants' && <>
              <label for="splitX">{S.split}</label>
              <div class="pair">
                <input class="input" type="number" id="splitX" value={c.split.x} aria-label={`${S.split} X`} step="any" onChange={e => upd(x => { const v = numOf(e); if (Number.isFinite(v)) x.config.split.x = Util.clamp(v, x.config.x.min, x.config.x.max); })} />
                <input class="input" type="number" id="splitY" value={c.split.y} aria-label={`${S.split} Y`} step="any" onChange={e => upd(x => { const v = numOf(e); if (Number.isFinite(v)) x.config.split.y = Util.clamp(v, x.config.y.min, x.config.y.max); })} />
              </div>
            </>}
            <label for="setRank">{S.rank}</label>
            <select class="input select" id="setRank" value={c.rank} onChange={e => { const v = /** @type {RankKind} */ (textOf(e)); upd(x => { x.config.rank = v; }); }}>
              {Model.RANKS.map(r => <option key={r} value={r}>{S.ranks[r]}</option>)}
            </select>
          </div>
          <p class="sub small">{S.layoutHelp[c.layout]}</p>
          <div class="regions-edit" id="regionsEdit">
            {c.regions.map((r, i) => (
              <div class={`region-edit c-${r.color}`} key={i} data-region={r.id}>
                <div class="swatches" role="radiogroup" aria-label={S.color}>
                  {Model.COLORS.map(col => (
                    <button type="button" key={col} role="radio" aria-checked={r.color === col} aria-label={S.colors[col]} title={S.colors[col]} class={`swatch c-${col}${r.color === col ? ' on' : ''}`}
                      onClick={() => upd(x => { x.config.regions[i].color = col; })} />
                  ))}
                </div>
                <input class="input sm" value={r.label} placeholder={S.regionLabel} aria-label={S.regionLabel} data-role="label" onInput={e => upd(x => { x.config.regions[i].label = textOf(e); })} />
                <input class="input sm" value={r.hint} placeholder={S.regionHint} aria-label={S.regionHint} onInput={e => upd(x => { x.config.regions[i].hint = textOf(e); })} />
                {c.layout === 'quadrants' && <span class="sub small">{S.position[/** @type {keyof typeof S.position} */ (`${r.qy}-${r.qx}`)] || ''}</span>}
                {c.layout === 'grid' && <label class="check-inline small">{S.fromScore}<input class="input sm tiny" type="number" step="any" value={r.min} onChange={e => upd(x => { const v = numOf(e); if (Number.isFinite(v)) x.config.regions[i].min = v; })} /></label>}
                {c.layout === 'zones' && <label class="check-inline small">{S.upTo}<input class="input sm tiny" type="number" step="0.05" value={r.r} onChange={e => upd(x => { const v = numOf(e); if (v > 0) x.config.regions[i].r = v; })} /></label>}
                {c.layout !== 'quadrants' && c.regions.length > 2 && <button type="button" class="icon-btn sm" aria-label={S.removeRegion} title={S.removeRegion} onClick={() => upd(x => { x.config.regions.splice(i, 1); })}>✕</button>}
              </div>
            ))}
            {c.layout !== 'quadrants' && (
              <button type="button" class="btn sm dashed" id="addRegion" onClick={() => upd(x => {
                const last = x.config.regions[x.config.regions.length - 1];
                /** @type {Region} */
                const r = { id: Util.uid('r'), label: '', hint: '', color: 'gray' };
                if (x.config.layout === 'grid') r.min = (last && last.min != null ? last.min : 0) + 1;
                else r.r = Math.min(1.5, (last && last.r != null ? last.r : 0) + 0.2);
                x.config.regions.push(r);
              })}>{S.addRegion}</button>
            )}
          </div>
        </section>

        <section>
          <h3>{S.fields}</h3>
          <p class="sub small">{S.fieldsHelp}</p>
          <div class="fields-edit" id="fieldsEdit">
            {c.fields.map((f, i) => (
              <div class="field-edit" key={f.key} data-field={f.key}>
                <span class="chip sm">{S.fieldTypes[f.type]}</span>
                <input class="input sm" value={f.label} aria-label={S.fieldLabel} onInput={e => upd(x => { x.config.fields[i].label = textOf(e); })} />
                {f.options && <span class="sub small">{f.options.map(o => o.label).join(' · ')}</span>}
                <button type="button" class="icon-btn sm" aria-label={S.removeField} title={S.removeField} onClick={() => upd(x => { x.config.fields.splice(i, 1); })}>✕</button>
              </div>
            ))}
          </div>
          <div class="actions">
            {FIELD_LIBRARY.filter(f => !f.key || !c.fields.some(x => x.key === f.key)).map(f => (
              <button type="button" class="btn sm dashed" key={f.type + (f.key || '')} data-add-field={f.key || f.type}
                onClick={() => upd(x => { x.config.fields.push({ key: f.key || Util.uid('f'), type: f.type, label: f.key ? S.fieldNames[/** @type {keyof typeof S.fieldNames} */ (f.key)] : S.fieldTypes[f.type] }); })}>
                + {f.key ? S.fieldNames[/** @type {keyof typeof S.fieldNames} */ (f.key)] : S.fieldTypes[f.type]}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div class="dialog-foot">
        <button type="button" class="btn" id="saveTemplate" onClick={saveTemplate}>{S.saveTemplate}</button>
        <span class="spacer" />
        <button type="button" class="btn" onClick={closeDialog}>{Texts.ui.cancel}</button>
        <button type="button" class="btn primary" id="applySettings" onClick={apply}>{S.apply}</button>
      </div>
    </Dialog>
  );
}

/**
 * Felder, die sich ergänzen lassen: feste (je Matrix einmal, mit bekannter Bedeutung) und freie.
 * @type {{ key?: 'owner' | 'due' | 'done', type: FieldType }[]}
 */
const FIELD_LIBRARY = [
  { key: 'owner', type: 'person' },
  { key: 'due', type: 'date' },
  { key: 'done', type: 'check' },
  { type: 'text' },
  { type: 'textarea' },
  { type: 'point' },
];
