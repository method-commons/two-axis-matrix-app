import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';

/** Gebaute App, ausgeliefert von `vite preview` (siehe playwright.config.js). */
export const APP_URL = 'http://localhost:4173/';

/**
 * `page` öffnet die App mit leerem Speicher und lässt den Test bei jedem
 * JavaScript-Fehler der Seite fehlschlagen.
 */
export const test = base.extend({
  // Playwright verlangt hier ein Objektmuster als ersten Parameter
  // eslint-disable-next-line no-empty-pattern
  pageErrors: async ({}, use) => { await use([]); },
  page: async ({ page, pageErrors }, use) => {
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.goto(APP_URL);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await use(page);
    expect(pageErrors, 'JavaScript-Fehler auf der Seite').toEqual([]);
  },
});
export { expect };

/** Beispiel öffnen (landet in der Matrix). */
export async function openExample(page, key) {
  await page.click('#exampleBtn');
  await page.click(`[data-example="${key}"]`);
  await expect(page.locator('#surface')).toBeVisible();
}

/** Neue Matrix nach einer Methode anlegen. */
export async function createMatrix(page, method, name = 'Test') {
  await page.click('#newBtn');
  await page.click(`[data-pick="${method}"]`);
  await page.fill('#nmName', name);
  await page.click('#nmCreate');
  await expect(page.locator('#matrixName')).toHaveValue(name);
}

/** Eintrag über den Eingang anlegen. */
export async function quickAdd(page, ...titles) {
  for (const t of titles) {
    await page.fill('#quickAdd', t);
    await page.press('#quickAdd', 'Enter');
  }
}

/** Eintrag (Karte, Punkt, Zelle oder Eingang) mit diesem Titel. */
export function item(page, title) {
  return page.locator('[data-item]:not([data-point])', { hasText: title }).first();
}

/** Ziehen mit der Maus von einem Element zu einer Stelle (Anteile der Zielfläche). */
export async function dragTo(page, from, to, fx = 0.5, fy = 0.5) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * fx, b.y + b.height * fy, { steps: 6 });
  await page.mouse.up();
}

/** Gespeicherte Matrizen aus dem localStorage (wartet auf das verzögerte Speichern). */
export async function stored(page) {
  await page.waitForTimeout(400);
  return page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('two-axis:matrix:')).map(k => JSON.parse(localStorage.getItem(k))));
}

/** Download auslösen und Inhalt lesen. */
export async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  return { name: dl.suggestedFilename(), path: await dl.path(), text: fs.readFileSync(await dl.path(), 'utf8') };
}

/** Datei über den Dateiauswahl-Dialog der App einlesen. */
export async function chooseFile(page, button, file) {
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click(button)]);
  await chooser.setFiles(file);
}

/** Menü „Datei“ öffnen und Eintrag wählen. */
export async function menu(page, action) {
  await page.click('#menuBtn');
  await page.click(`[data-action="${action}"]`);
}
