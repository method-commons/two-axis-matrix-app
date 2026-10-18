/*
 * Bearbeiten eines Eintrags in der Seitenleiste: Titel, Bereich und Position, Fragen zum
 * Einordnen, Notiz und die Felder der Matrix (je nach Art Text, Person, Datum, Haken, Auswahl
 * oder zweite Position).
 */
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Ops } from '../ops.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { RegionChip } from './components.jsx';
import { fieldProps, mutate, select } from './core.js';
import { removeItem } from './items.js';


/**
 * Zahlenfeld für einen Wert auf einer Achse (übernimmt beim Verlassen bzw. Enter).
 * @param {{ axis: Axis, value: number | null, label: string, id: string, onSet: (v: number) => void }} props
 */
function AxisInput({ axis, value, label, id, onSet }) {
  /** @param {Event} e */
  const commit = e => {
    const raw = /** @type {HTMLInputElement} */ (e.currentTarget).value.replace(',', '.').trim();
    if (raw === '') return;
    const v = Number(raw);
    if (Number.isFinite(v) && v !== value) onSet(v);
  };
  return (
    <label class="axis-input">
      <span>{label}</span>
      <input class="input sm" id={id} type="number" inputMode="decimal" min={axis.min} max={axis.max} step={axis.step || 'any'}
        value={value == null ? '' : value} placeholder="–"
        onChange={commit} onKeyDown={e => { if (e.key === 'Enter') commit(e); }} />
    </label>
  );
}

/** @param {{ m: Matrix, it: Item }} props */
export function ItemEditor({ m, it }) {
  const c = m.config;
  const region = Layout.regionOf(m, it);
  const people = [...new Set(m.items.flatMap(x => c.fields.filter(f => f.type === 'person').map(f => String(x.values[f.key] || '').trim())).filter(Boolean))];
  return (
    <section class="card pad editor" id="itemEditor" data-item={it.id} aria-label={Texts.editor.title}>
      <div class="editor-head">
        <span class={`num c-${Layout.colorOf(m, it)}`}>{it.no}</span>
        <input class="input title-field" id="itemTitle" placeholder={Texts.editor.titlePlaceholder} aria-label={Texts.editor.titleLabel} {...fieldProps(() => it.title, v => { it.title = v; })} />
        <button type="button" class="icon-btn" id="closeEditor" aria-label={Texts.ui.close} title={Texts.ui.close} onClick={() => select(null)}>✕</button>
      </div>

      <div class="field-lbl">{Texts.editor.region}</div>
      <div class="region-pick" role="group" aria-label={Texts.editor.region}>
        {c.regions.map((r, i) => (
          <button type="button" key={r.id} class={`chip region-btn c-${r.color}${region === r ? ' on' : ''}`} data-place={r.id} aria-pressed={region === r}
            title={`${i + 1}: ${r.label}`} onClick={() => mutate(x => Ops.placeIn(x, it.id, r.id))}>{r.label || r.id}</button>
        ))}
        {it.x != null && <button type="button" class="link sm" id="toInbox" onClick={() => mutate(x => Ops.move(x, it.id, null))}>{Texts.editor.toInbox}</button>}
      </div>
      {c.view !== 'board' && (
        <div class="axis-inputs">
          <AxisInput axis={c.x} value={it.x} id="itemX" label={c.x.label || 'X'} onSet={v => mutate(x => Ops.move(x, it.id, { x: v, y: it.y ?? Layout.denorm(c.y, 0.5) }))} />
          <AxisInput axis={c.y} value={it.y} id="itemY" label={c.y.label || 'Y'} onSet={v => mutate(x => Ops.move(x, it.id, { x: it.x ?? Layout.denorm(c.x, 0.5), y: v }))} />
        </div>
      )}

      {c.questions.length > 0 && (
        <div class="questions" id="questions">
          <div class="field-lbl">{Texts.editor.questions}</div>
          {c.questions.map(q => (
            <div class="question" key={q.id} data-question={q.id}>
              <span>{q.text}</span>
              <div class="scale5" role="group" aria-label={q.text}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button type="button" key={v} class={it.answers[q.id] === v ? 'on' : ''} aria-pressed={it.answers[q.id] === v}
                    onClick={() => mutate(x => Ops.setAnswer(x, it.id, q.id, it.answers[q.id] === v ? null : v))}>{v}</button>
                ))}
              </div>
            </div>
          ))}
          <p class="sub small">{Texts.editor.questionsHelp}</p>
        </div>
      )}

      <label class="field-lbl" for="itemNote">{c.noteLabel || Texts.list.note}</label>
      <textarea class="input" id="itemNote" rows={2} {...fieldProps(() => it.note, v => { it.note = v; })} />

      {c.fields.map(f => <FieldInput key={f.key} m={m} it={it} f={f} people={people} />)}

      <div class="editor-foot">
        <button type="button" class="btn sm danger-text" id="removeItem" onClick={() => removeItem(it.id)}>{Texts.editor.remove}</button>
        <span class="spacer" />
        {region && <RegionChip region={region} />}
      </div>
    </section>
  );
}

/**
 * Eingabe eines Felds je nach Art.
 * @param {{ m: Matrix, it: Item, f: FieldDef, people: string[] }} props
 */
function FieldInput({ m, it, f, people }) {
  const id = `field-${f.key}`;
  const v = it.values[f.key] ?? null;
  /** @param {FieldValue} x */
  const set = x => mutate(mm => Ops.setValue(mm, it.id, f.key, x));
  if (f.type === 'check') {
    return (
      <label class="check-inline field-check" data-field={f.key}>
        <input type="checkbox" id={id} checked={v === true} onChange={e => set(/** @type {HTMLInputElement} */ (e.currentTarget).checked)} />
        {f.label}
      </label>
    );
  }
  if (f.type === 'choice') {
    return (
      <div data-field={f.key}>
        <div class="field-lbl">{f.label}</div>
        <div class="choice" role="group" aria-label={f.label}>
          {(f.options || []).map(o => (
            <button type="button" key={o.id} class={`${o.color ? `c-${o.color}` : ''}${v === o.id ? ' on' : ''}`} data-option={o.id} aria-pressed={v === o.id}
              onClick={() => set(v === o.id ? null : o.id)}>{o.label || o.id}</button>
          ))}
        </div>
      </div>
    );
  }
  if (f.type === 'point') {
    const p = /** @type {Point | null} */ (v && typeof v === 'object' ? v : null);
    const c = m.config;
    const r = p ? Layout.regionAt(c, p.x, p.y) : null;
    return (
      <div data-field={f.key} class="point-field">
        <div class="field-lbl">{f.label}</div>
        {p ? (
          <div class="axis-inputs">
            <AxisInput axis={c.x} value={p.x} id={`${id}-x`} label={c.x.label || 'X'} onSet={x => set({ x, y: p.y })} />
            <AxisInput axis={c.y} value={p.y} id={`${id}-y`} label={c.y.label || 'Y'} onSet={y => set({ x: p.x, y })} />
            <span class="point-meta">{r && <RegionChip region={r} sm />}<button type="button" class="link sm" onClick={() => set(null)}>{Texts.editor.clearPoint}</button></span>
          </div>
        ) : (
          <button type="button" class="btn sm dashed" id={`${id}-set`} disabled={it.x == null}
            onClick={() => set({ x: /** @type {number} */ (it.x), y: /** @type {number} */ (it.y) })}>{Texts.editor.setPoint}</button>
        )}
        {p && it.x != null && <p class="sub small">{Util.fill(Texts.editor.pointHelp, { from: `${IO.num(it.x)} / ${IO.num(/** @type {number} */ (it.y))}`, to: `${IO.num(p.x)} / ${IO.num(p.y)}` })}</p>}
      </div>
    );
  }
  const text = String(v ?? '');
  if (f.type === 'date') {
    return (
      <label data-field={f.key} class="field-row">
        <span class="field-lbl">{f.label}</span>
        <input type="date" class="input sm" id={id} value={text} onChange={e => { const x = /** @type {HTMLInputElement} */ (e.currentTarget).value; set(Util.isDay(x) ? x : null); }} />
      </label>
    );
  }
  const props = fieldProps(() => text, x => { if (x) it.values[f.key] = x; else delete it.values[f.key]; });
  return (
    <label data-field={f.key} class="field-block">
      <span class="field-lbl">{f.label}</span>
      {f.type === 'textarea'
        ? <textarea class="input" id={id} rows={2} {...props} />
        : <input class="input sm" id={id} list={f.type === 'person' ? 'peopleList' : undefined} {...props} />}
      {f.type === 'person' && <datalist id="peopleList">{people.map(p => <option key={p} value={p} />)}</datalist>}
    </label>
  );
}

