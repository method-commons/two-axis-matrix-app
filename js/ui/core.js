/*
 * Zustand der Oberfläche: Route (Hash), geöffnete Matrix, Speichern, Rückgängig/Wiederholen,
 * Auswahl, Dialoge, Meldungen.
 *
 * Regeln für Änderungen:
 *  - Strukturelle Änderungen laufen über `mutate(fn)` (Verlaufseintrag, Speichern, Neuzeichnen).
 *  - Texteingaben über `fieldProps(get, set)`: Änderung sofort sichtbar, Verlaufseintrag beim
 *    Verlassen des Felds.
 *
 * Die Matrix ist ein normales Objekt, das `Ops` direkt ändert; das Signal `revision` zählt
 * Änderungen, Komponenten lesen es über `useMatrix()` und zeichnen dadurch neu.
 */
import { signal } from '@preact/signals';
import { Ops } from '../ops.js';
import { Store } from '../storage.js';

/** Zähler für Änderungen; Komponenten lesen ihn, um neu zu zeichnen. */
export const revision = signal(0);

/** @typedef {'matrix' | 'list' | 'report'} Tab */
/** @typedef {{ view: 'home' } | { view: 'matrix', mid: string, tab: Tab }} Route */

/** @type {readonly Tab[]} */
export const TABS = ['matrix', 'list', 'report'];

/** Hash → Route. @param {string} hash @returns {Route} */
export function parseHash(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'm' && parts[1]) {
    const tab = /** @type {Tab} */ (TABS.includes(/** @type {Tab} */ (parts[2])) ? parts[2] : 'matrix');
    return { view: 'matrix', mid: parts[1], tab };
  }
  return { view: 'home' };
}

/** Route → Hash. @param {Route} r */
export function hashOf(r) {
  return r.view === 'matrix' ? `#/m/${encodeURIComponent(r.mid)}/${r.tab}` : '#/';
}

/** Aktuelle Route. */
export const route = signal(parseHash(typeof location !== 'undefined' ? location.hash : ''));

/** Zur Route wechseln (neuer Verlaufseintrag im Browser). @param {Route} r */
export function go(r) {
  const h = hashOf(r);
  if (location.hash !== h) location.hash = h;
  else applyRoute();
}

/** Matrix öffnen. @param {string} mid @param {Tab} [tab] */
export function openMatrix(mid, tab = 'matrix') {
  go({ view: 'matrix', mid, tab });
}

/** Geöffnete Matrix (oder `null` auf der Startseite). @type {Matrix | null} */
export let matrix = null;
/** @type {string[]} */
let undoStack = [];
/** @type {string[]} */
let redoStack = [];
const HISTORY_LIMIT = 200;

/** Route aus dem Hash übernehmen und die passende Matrix laden. */
export function applyRoute() {
  const r = parseHash(location.hash);
  if (r.view === 'matrix') {
    if (!matrix || matrix.id !== r.mid) {
      flushSave();
      matrix = Store.load(r.mid);
      undoStack = [];
      redoStack = [];
      selected.value = null;
    }
    if (!matrix) { location.replace('#/'); route.value = { view: 'home' }; render(); return; }
  } else {
    flushSave();
    matrix = null;
    selected.value = null;
  }
  // Neue Ansicht beginnt oben (sonst landet man mitten in Liste oder Bericht)
  const moved = hashOf(r) !== hashOf(route.value);
  route.value = r;
  render();
  if (moved) window.scrollTo(0, 0);
}

/** Neu zeichnen. */
export function render() {
  revision.value++;
}

/**
 * Für Komponenten: geöffnete Matrix – und bei jeder Änderung neu zeichnen.
 * @returns {Matrix}
 */
export function useMatrix() {
  revision.value;
  return /** @type {Matrix} */ (matrix);
}

/** Für Komponenten, die nur neu zeichnen müssen (z. B. Startseite). */
export function useRevision() {
  return revision.value;
}

// ===== Speichern =====
/** @type {ReturnType<typeof setTimeout> | null} */
let saveTimer = null;

/** Gleich speichern (nach kurzer Pause gebündelt). */
export function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 300);
}

/** Gibt es Eingaben, die noch nicht gespeichert sind (verzögertes Speichern läuft)? */
export const hasPendingSave = () => saveTimer != null;

/** Ausstehendes Speichern sofort ausführen. */
export function flushSave() {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  if (matrix && !Store.save(matrix)) toast(storageFailedText);
}

/** Geöffnete Matrix verwerfen, ohne sie zu speichern (nach dem Löschen). */
export function discardMatrix() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  editSnapshot = null;
  matrix = null;
}

let storageFailedText = 'Speichern fehlgeschlagen';
/** Text der Meldung bei vollem Speicher (aus den Sprachdateien). @param {string} t */
export function setStorageFailedText(t) { storageFailedText = t; }

/** Matrix neu setzen (z. B. nach Änderung in einem anderen Browser-Tab). @param {Matrix} m */
export function replaceMatrix(m) {
  matrix = m;
  if (selected.value && !m.items.some(it => it.id === selected.value)) selected.value = null;
  render();
}

/**
 * Gespeicherten Stand übernehmen, nachdem ein anderer Browser-Tab (oder die Ablage) die Matrix
 * geändert hat: geöffnete Matrix neu laden – außer während einer Texteingabe –, sonst die Übersicht.
 * `force`: auch während einer Texteingabe (die Ablage übernimmt nur ohne ungespeicherte Eingaben).
 * @param {string} id @param {boolean} [force]
 */
export function adoptStored(id, force = false) {
  if (matrix && matrix.id === id) {
    const doc = Store.load(id);
    if (!doc) { applyRoute(); return; }
    const active = document.activeElement;
    if (!force && active && /^(INPUT|TEXTAREA)$/.test(active.tagName)) return;
    replaceMatrix(doc);
  } else if (route.value.view === 'home') {
    render();
  }
}

// ===== Änderungen und Verlauf =====
/** Stand vor einer Texteingabe (Verlaufseintrag beim Verlassen des Felds). @type {string | null} */
let editSnapshot = null;

/** @param {string} snap */
function pushUndo(snap) {
  undoStack.push(snap);
  if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
  redoStack = [];
}

/**
 * Strukturelle Änderung an der geöffneten Matrix.
 * @template T
 * @param {(m: Matrix) => T} fn
 * @returns {T | undefined}
 */
export function mutate(fn) {
  if (!matrix) return undefined;
  commitEdit();
  const before = JSON.stringify(matrix);
  const result = fn(matrix);
  if (JSON.stringify(matrix) !== before) {
    Ops.touch(matrix);
    pushUndo(before);
    scheduleSave();
  }
  render();
  return result;
}

/** Laufende Texteingabe als Verlaufseintrag abschließen. */
export function commitEdit() {
  if (editSnapshot == null || !matrix) return;
  const snap = editSnapshot;
  editSnapshot = null;
  if (snap !== JSON.stringify({ ...matrix, updatedAt: JSON.parse(snap).updatedAt })) pushUndo(snap);
  flushSave();
}

/**
 * Eigenschaften für ein Eingabefeld: Änderung sofort, Verlauf beim Verlassen.
 * @param {() => string} get @param {(v: string) => void} set
 */
export function fieldProps(get, set) {
  return {
    value: get(),
    onFocus: () => { if (matrix && editSnapshot == null) editSnapshot = JSON.stringify(matrix); },
    /** @param {Event} e */
    onInput: e => {
      if (!matrix) return;
      if (editSnapshot == null) editSnapshot = JSON.stringify(matrix);
      set(/** @type {HTMLInputElement} */ (e.currentTarget).value);
      Ops.touch(matrix);
      scheduleSave();
      render();
    },
    onBlur: commitEdit,
  };
}

export const canUndo = () => undoStack.length > 0 || editSnapshot != null;
export const canRedo = () => redoStack.length > 0;

export function undo() {
  commitEdit();
  if (!matrix || !undoStack.length) return;
  redoStack.push(JSON.stringify(matrix));
  matrix = JSON.parse(/** @type {string} */ (undoStack.pop()));
  afterHistory();
}

export function redo() {
  commitEdit();
  if (!matrix || !redoStack.length) return;
  undoStack.push(JSON.stringify(matrix));
  matrix = JSON.parse(/** @type {string} */ (redoStack.pop()));
  afterHistory();
}

function afterHistory() {
  const m = /** @type {Matrix} */ (matrix);
  if (selected.value && !m.items.some(it => it.id === selected.value)) selected.value = null;
  scheduleSave();
  render();
}

// ===== Ansichtszustand =====
/** Ausgewählter Eintrag (ID). @type {import('@preact/signals').Signal<string | null>} */
export const selected = signal(null);

/** Markierte Einträge (aus einem Hinweis). @type {import('@preact/signals').Signal<string[]>} */
export const highlighted = signal([]);

/** Darstellung: Namen oder nur Nummern an den Punkten; zweite Positionen zeigen. */
export const viewPrefs = signal({ names: true, points: true });

/** Eintrag auswählen (oder abwählen). @param {string | null} id */
export function select(id) {
  selected.value = id;
  highlighted.value = [];
}

// ===== Meldungen und Dialoge =====
/** @typedef {{ id: number, text: string, action?: { label: string, run: () => void } }} Toast */
/** @type {import('@preact/signals').Signal<Toast[]>} */
export const toasts = signal([]);
let toastId = 0;

/** Kurze Meldung unten. @param {string} text @param {Toast['action']} [action] */
export function toast(text, action) {
  const t = { id: ++toastId, text, action };
  toasts.value = [...toasts.value, t];
  setTimeout(() => { toasts.value = toasts.value.filter(x => x.id !== t.id); }, action ? 6000 : 3500);
}

/** Geöffneter Dialog: Funktion, die den Inhalt zeichnet. @type {import('@preact/signals').Signal<null | (() => import('preact').JSX.Element)>} */
export const dialog = signal(null);

/** @param {() => import('preact').JSX.Element} content */
export function openDialog(content) {
  commitEdit();
  dialog.value = content;
}

export function closeDialog() {
  dialog.value = null;
}
