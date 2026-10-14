/*
 * Ziehen und Ablegen mit Zeiger-Ereignissen (Maus, Stift, Touch) für alle Darstellungen.
 * Ablageziele tragen `data-drop`:
 *   - `plot`   Zeichenfläche; die Position ergibt sich aus der Stelle in der Fläche
 *   - `cell`   Zelle eines Rasters (`data-x`, `data-y`)
 *   - `region` Feld der Karten-Darstellung (`data-region`)
 *   - `inbox`  Eingang (Position entfernen)
 * Ohne Bewegung zählt das Loslassen als Klick (Auswahl).
 */
import { signal } from '@preact/signals';
import { Layout } from '../layout.js';
import { Ops } from '../ops.js';
import { matrix, mutate, select } from './core.js';

/**
 * Laufendes Ziehen: Eintrag, Art (Position oder Punkt-Feld), Zeigerposition, Ziel unter dem Zeiger.
 * @type {import('@preact/signals').Signal<null | { id: string, key: string | null, label: string, cx: number, cy: number, over: string | null }>}
 */
export const drag = signal(null);

const THRESHOLD = 4;

/** Ablageziel unter dem Zeiger. @param {number} x @param {number} y */
function targetAt(x, y) {
  for (const el of document.elementsFromPoint(x, y)) {
    const d = /** @type {HTMLElement} */ (el).closest && /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (el).closest('[data-drop]'));
    if (d) return d;
  }
  return null;
}

/** Schlüssel des Ziels (für die Hervorhebung). @param {HTMLElement | null} el */
function keyOf(el) {
  if (!el) return null;
  const d = el.dataset;
  return d.drop === 'cell' ? `cell:${d.x}:${d.y}` : d.drop === 'region' ? `region:${d.region}` : /** @type {string} */ (d.drop);
}

/**
 * Ablegen: Position bzw. Punkt-Feld setzen.
 * @param {string} id @param {string | null} key @param {HTMLElement} el @param {number} x @param {number} y
 */
function dropOn(id, key, el, x, y) {
  const d = el.dataset;
  mutate(m => {
    /** @type {Point | null} */
    let p = null;
    if (d.drop === 'plot') {
      const r = el.getBoundingClientRect();
      p = Layout.fromScreen(m.config, (x - r.left) / r.width, 1 - (y - r.top) / r.height);
    } else if (d.drop === 'cell') {
      p = { x: Number(d.x), y: Number(d.y) };
    } else if (d.drop === 'region' && !key) {
      Ops.placeIn(m, id, /** @type {string} */ (d.region));
      return;
    } else if (d.drop === 'inbox' && !key) {
      Ops.move(m, id, null);
      return;
    }
    if (!p) return;
    if (key) Ops.setValue(m, id, key, p);
    else Ops.move(m, id, p);
  });
}

/**
 * Zeiger-Druck auf einem Eintrag (bzw. dessen zweiter Position): Ziehen beginnen.
 * @param {PointerEvent} e @param {string} id @param {string} label @param {string | null} [key]
 */
export function startDrag(e, id, label, key = null) {
  if (e.button !== 0) return;
  const sx = e.clientX;
  const sy = e.clientY;
  let moved = false;
  /** @param {PointerEvent} ev */
  const onMove = ev => {
    if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < THRESHOLD) return;
    if (!moved) { moved = true; document.body.classList.add('dragging'); }
    ev.preventDefault();
    drag.value = { id, key, label, cx: ev.clientX, cy: ev.clientY, over: keyOf(targetAt(ev.clientX, ev.clientY)) };
  };
  /** @param {PointerEvent} ev */
  const onUp = ev => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    document.body.classList.remove('dragging');
    drag.value = null;
    if (!moved) { select(id); return; }
    const el = targetAt(ev.clientX, ev.clientY);
    if (el && matrix) dropOn(id, key, el, ev.clientX, ev.clientY);
    select(id);
  };
  const onCancel = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    document.body.classList.remove('dragging');
    drag.value = null;
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
}
