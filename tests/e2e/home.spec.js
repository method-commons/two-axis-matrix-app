import { createMatrix, expect, menu, openExample, test } from './fixtures.js';

test.describe('Startseite', () => {
  test('zeigt ohne Matrizen Einstieg und Methoden', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Meine Matrizen');
    await expect(page.locator('.mcard-home')).toHaveCount(0);
    await expect(page.locator('.method-tile')).toHaveCount(5);
    await expect(page.locator('#methodFilter')).toHaveCount(0);
  });

  for (const [method, view] of [['eisenhower', 'board'], ['value-effort', 'plot'], ['stakeholder', 'plot'], ['risk', 'heatmap'], ['stacey', 'plot'], ['custom', 'plot']]) {
    test(`legt eine Matrix nach „${method}“ an`, async ({ page }) => {
      await createMatrix(page, method, `M ${method}`);
      await expect(page.locator('#surface')).toHaveAttribute('data-view', view);
      await expect(page.locator(`.method-chip[data-method="${method}"]`).first()).toBeVisible();
      await page.click('#homeLink');
      await expect(page.locator('.mcard-home')).toHaveCount(1);
    });
  }

  test('Methode aus der Übersicht vorauswählen und Hilfe öffnen', async ({ page }) => {
    await page.locator('.method-tile[data-method="risk"] button', { hasText: 'Anwenden' }).click();
    await expect(page.locator('[data-pick="risk"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#nmName')).toHaveAttribute('placeholder', 'Risikomatrix');
    await page.click('#nmCreate');
    await expect(page.locator('#matrixName')).toHaveValue('Risikomatrix');
    await page.click('#homeLink');
    await page.locator('.method-tile[data-method="stacey"] button', { hasText: 'Erklärung' }).click();
    await expect(page.locator('#helpDialog [data-help="stacey"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#helpDialog .help-body h2')).toHaveText('Stacey-Matrix');
    await page.click('#helpDialog [data-help="app"]');
    await expect(page.locator('#helpDialog .help-body h2')).toHaveText('Bedienung');
  });

  test('filtert nach Methode, dupliziert und löscht mit Rückgängig', async ({ page }) => {
    await openExample(page, 'wochenplanung');
    await page.click('#homeLink');
    await openExample(page, 'stadtfest-risiken');
    await page.click('#homeLink');
    await expect(page.locator('.mcard-home')).toHaveCount(2);
    await page.click('#methodFilter [data-filter="risk"]');
    await expect(page.locator('.mcard-home')).toHaveCount(1);
    await page.click('#methodFilter button >> nth=0');
    const card = page.locator('.mcard-home', { hasText: 'Wochenplanung' });
    await card.locator('[data-action="duplicate"]').click();
    await expect(page.locator('#matrixName')).toHaveValue('Wochenplanung KW 42 (Kopie)');
    await page.click('#homeLink');
    await expect(page.locator('.mcard-home')).toHaveCount(3);
    await page.locator('.mcard-home', { hasText: 'Stadtfest' }).locator('[data-action="delete"]').click();
    await page.click('#confirmOk');
    await expect(page.locator('.mcard-home')).toHaveCount(2);
    await page.locator('.toast button').click();
    await expect(page.locator('.mcard-home')).toHaveCount(3);
  });

  test('löscht die geöffnete Matrix über das Menü', async ({ page }) => {
    await createMatrix(page, 'custom', 'Weg damit');
    await menu(page, 'delete');
    await page.click('#confirmOk');
    await expect(page.locator('h1')).toHaveText('Meine Matrizen');
    await expect(page.locator('.mcard-home')).toHaveCount(0);
  });

  test('eigene Vorlage speichern, nutzen und löschen', async ({ page }) => {
    await createMatrix(page, 'custom', 'Kano-Analyse');
    await page.click('#settingsBtn');
    await page.fill('#ax-x-label', 'Erfüllung');
    await page.click('#saveTemplate');
    await expect(page.locator('.toast')).toContainText('Vorlage gespeichert');
    await page.click('#applySettings');
    await page.click('#homeLink');
    await page.click('#newBtn');
    const tpl = page.locator('[data-template]');
    await expect(tpl).toHaveCount(1);
    await tpl.locator('.mcard-btn').click();
    await expect(page.locator('#newDialog .pick-side h2')).toHaveText('Kano-Analyse');
    await page.click('#nmCreate');
    await page.click('#settingsBtn');
    await expect(page.locator('#ax-x-label')).toHaveValue('Erfüllung');
    await page.keyboard.press('Escape');
    await expect(page.locator('#settingsDialog')).toHaveCount(0);
    await page.click('#homeLink');
    await page.click('#newBtn');
    await page.locator('[data-template] .tpl-del').click();
    await expect(page.locator('[data-template]')).toHaveCount(0);
  });

  test('Escape direkt nach dem Öffnen schließt den Dialog', async ({ page }) => {
    await createMatrix(page, 'custom', 'Schnell');
    // Öffnen und Escape im selben Takt – vor dem nächsten Neuzeichnen des Browsers
    await page.evaluate(() => {
      document.getElementById('settingsBtn').click();
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await expect(page.locator('#settingsDialog')).toHaveCount(0);
    await page.click('#settingsBtn');
    await expect(page.locator('#setName')).toBeFocused();
  });

  test('bleibt nach dem Neuladen erhalten', async ({ page }) => {
    await createMatrix(page, 'value-effort', 'Bleibt');
    await page.waitForTimeout(400);
    await page.reload();
    await expect(page.locator('#matrixName')).toHaveValue('Bleibt');
    await page.goto('http://localhost:4173/#/m/gibt-es-nicht/matrix');
    await expect(page.locator('h1')).toHaveText('Meine Matrizen');
  });
});
