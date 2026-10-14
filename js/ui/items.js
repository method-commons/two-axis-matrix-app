/*
 * Einträge aus der Oberfläche anlegen und löschen (Werkzeugleiste, Seitenleiste, Tastatur, Liste).
 */
import { Ops } from '../ops.js';
import { Texts } from '../texts.js';
import { mutate, select, toast, undo } from './core.js';

/** Eintrag löschen (mit Rückgängig in der Meldung). @param {string} id */
export function removeItem(id) {
  mutate(m => Ops.removeItem(m, id));
  select(null);
  toast(Texts.matrix.removed, { label: Texts.ui.undone, run: undo });
}

/** Neuen Eintrag anlegen, auswählen und den Titel zum Schreiben öffnen. @param {string} [focusId] */
export function addAndEdit(focusId = 'itemTitle') {
  const it = mutate(m => Ops.addItem(m, {}));
  if (!it) return;
  select(it.id);
  requestAnimationFrame(() => {
    const el = /** @type {HTMLInputElement | null} */ (document.getElementById(focusId));
    if (el) el.focus();
  });
}
