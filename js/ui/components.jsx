/*
 * Kleine, wiederverwendbare Bausteine der Oberfläche: Dialog, Bestätigungsdialog, Hinweise,
 * Methoden- und Bereichs-Chips, Personen-Kreis, Herunterladen und Datei öffnen.
 */
import { useEffect, useRef } from 'preact/hooks';
import { Methods } from '../methods.js';
import { Model } from '../model.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { closeDialog, highlighted, openDialog, selected } from './core.js';

/** Text mit Platzhaltern. @param {string} text @param {Record<string, string | number>} [params] */
export const fill = (text, params) => Util.fill(text, params);

/**
 * Dialog über der Seite. Escape und Klick auf den Hintergrund schließen; der Fokus landet
 * im ersten Eingabefeld bzw. Knopf.
 * @param {{ title: string, children: any, wide?: boolean, id?: string, onClose?: () => void }} props
 */
export function Dialog({ title, children, wide, id, onClose = closeDialog }) {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  useEffect(() => {
    const prev = /** @type {HTMLElement | null} */ (document.activeElement);
    const el = ref.current;
    const first = /** @type {HTMLElement | null} */ (el && el.querySelector('[autofocus], input:not([type=checkbox]):not([type=radio]), textarea, select, .dialog-body button, .dialog-foot button'));
    if (first) first.focus();
    else if (el) el.focus();
    return () => { if (prev && document.contains(prev)) prev.focus(); };
  }, []);
  // Escape schließt auch, wenn der Fokus (noch) nicht im Dialog liegt
  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const esc = e => { if (e.key === 'Escape' && !(ref.current && ref.current.contains(/** @type {Node} */ (e.target)))) onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  /** @param {KeyboardEvent} e */
  const onKey = e => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    if (e.key === 'Tab' && ref.current) {
      const items = [...ref.current.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')].filter(x => !(/** @type {HTMLButtonElement} */ (x).disabled));
      const first = /** @type {HTMLElement} */ (items[0]);
      const last = /** @type {HTMLElement} */ (items[items.length - 1]);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  return (
    <div class="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div class={`dialog${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} id={id} ref={ref} tabIndex={-1} onKeyDown={onKey}>
        <div class="dialog-head">
          <h2>{title}</h2>
          <button type="button" class="icon-btn" aria-label={Texts.ui.close} title={Texts.ui.close} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Rückfrage mit „Abbrechen“ und einer Aktion.
 * @param {{ title: string, text: string, ok: string, danger?: boolean, onOk: () => void }} opts
 */
export function confirmDialog({ title, text, ok, danger, onOk }) {
  openDialog(() => (
    <Dialog title={title} id="confirmDialog">
      <div class="dialog-body"><p>{text}</p></div>
      <div class="dialog-foot">
        <button type="button" class="btn" onClick={closeDialog}>{Texts.ui.cancel}</button>
        <button type="button" class={`btn ${danger ? 'danger' : 'primary'}`} id="confirmOk" onClick={() => { closeDialog(); onOk(); }}>{ok}</button>
      </div>
    </Dialog>
  ));
}

/** Chip mit Kurzname der Methode. @param {{ id: string, long?: boolean }} props */
export function MethodChip({ id, long }) {
  const def = Methods.get(id);
  const t = Methods.texts(def);
  return <span class={`method-chip c-${def.color}`} data-method={def.id}><span aria-hidden="true">{def.icon}</span>{long ? t.name : t.short}</span>;
}

/** Chip eines Bereichs (Farbe und Name). @param {{ region: Region | null, sm?: boolean }} props */
export function RegionChip({ region, sm }) {
  if (!region) return <span class={`chip muted${sm ? ' sm' : ''}`}>{Texts.matrix.unplaced}</span>;
  return <span class={`chip region-chip c-${region.color}${sm ? ' sm' : ''}`} data-region={region.id}>{region.label || region.id}</span>;
}

const ICON = { ok: '✓', warn: '!', open: '–' };

/**
 * Hinweise zur Matrix. Klick auf einen Hinweis mit Einträgen markiert diese (bzw. wählt den
 * einzigen aus).
 * @param {{ m: Matrix, id?: string }} props
 */
export function HintsCard({ m, id = 'hints' }) {
  const list = Methods.hints(m);
  if (!list.length) return null;
  return (
    <section class="card pad hints" id={id} aria-label={Texts.matrix.hints}>
      <h3>{Texts.matrix.hints}</h3>
      {list.map(h => {
        const items = h.items || [];
        const on = items.length > 0 && highlighted.value.join() === items.join();
        return (
          <div class={`chk${items.length ? ' clickable' : ''}${on ? ' on' : ''}`} key={h.key} data-hint={h.key} data-state={h.state}
            role={items.length ? 'button' : undefined} tabIndex={items.length ? 0 : undefined}
            onClick={() => { if (!items.length) return; if (items.length === 1) { selected.value = items[0]; highlighted.value = []; } else highlighted.value = on ? [] : items; }}
            onKeyDown={e => { if (items.length && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); /** @type {HTMLElement} */ (e.currentTarget).click(); } }}>
            <span class={`ic ic-${h.state}`} aria-hidden="true">{ICON[h.state]}</span>
            <div><b>{h.title}</b><p>{h.detail}</p></div>
          </div>
        );
      })}
    </section>
  );
}

/** Text als Datei herunterladen. @param {string | Blob} data @param {string} name @param {string} type */
export function download(data, name, type) {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Datei auswählen und als Text lesen. @param {string} accept @returns {Promise<string | null>} */
export function pickFile(accept) {
  // Ein verstecktes Feld für alle Aufrufe; der Wert wird zurückgesetzt, damit dieselbe Datei erneut geht
  let input = /** @type {HTMLInputElement | null} */ (document.getElementById('filePicker'));
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'filePicker';
    input.hidden = true;
    document.body.appendChild(input);
  }
  const el = input;
  el.accept = accept;
  el.value = '';
  return new Promise(resolve => {
    el.onchange = async () => {
      const file = el.files && el.files[0];
      resolve(file ? await file.text() : null);
    };
    el.oncancel = () => resolve(null);
    el.click();
  });
}

/** Kreis mit Initialen (Farbe aus dem Namen). @param {{ name: string }} props */
export function Avatar({ name }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % Model.COLORS.length;
  return <span class={`avatar c-${Model.COLORS[h]}`} aria-hidden="true">{Util.initials(name)}</span>;
}
