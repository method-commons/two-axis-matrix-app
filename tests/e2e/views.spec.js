import fs from 'node:fs';
import { download, expect, menu, openExample, test } from './fixtures.js';

test.describe('Liste', () => {
  test('bearbeitet Titel und Werte, sortiert', async ({ page }) => {
    await openExample(page, 'ideen-saison');
    await page.click('[data-nav="list"]');
    const rows = page.locator('#itemTable tbody tr');
    await expect(rows).toHaveCount(12);
    await expect(rows.first()).toContainText('#1');
    await page.selectOption('#listSort', 'rank');
    await expect(rows.first().locator('input').first()).toHaveValue('Kombi-Angebot Mittag');
    await page.selectOption('#listSort', 'region');
    await expect(rows.first().locator('.region-chip')).toHaveText('Quick Wins');
    const row = page.locator('#itemTable tr[data-item]').filter({ has: page.locator('td.id', { hasText: /^#9$/ }) });
    await row.locator('input[type=number]').first().fill('1');
    await row.locator('input[type=number]').first().press('Enter');
    await row.locator('input[type=number]').nth(1).fill('9');
    await row.locator('input[type=number]').nth(1).press('Enter');
    await expect(row.locator('.region-chip')).toHaveText('Quick Wins');
    await page.click('#listAdd');
    await expect(page.locator('#listNew')).toBeFocused();
    await page.keyboard.type('Neue Idee');
    await expect(rows).toHaveCount(13);
    await expect(rows.last().locator('.chip')).toHaveText('nicht eingeordnet');
    await row.locator('.row-actions button').first().click();
    await expect(page.locator('#itemTitle')).toHaveValue('Neues Logo');
  });
});

test.describe('Bericht', () => {
  test('zeigt Bereiche, Rangfolge und exportiert Markdown, CSV, JSON, PNG', async ({ page }) => {
    await openExample(page, 'stadtfest-risiken');
    await page.click('[data-nav="report"]');
    await expect(page.locator('#report h1')).toHaveText('Stadtfest 2026 – Risiken');
    await expect(page.locator('#reportSvg')).toBeVisible();
    await expect(page.locator('#rankTable tbody tr').first()).toContainText('Ware geht am Samstag aus');
    await expect(page.locator('.report-box[data-region="critical"] li')).toHaveCount(2);
    const md = await download(page, () => page.click('#mdBtn'));
    expect(md.name).toBe('stadtfest-2026-risiken.md');
    expect(md.text).toContain('## Sehr hoch (2)');
    const csv = await download(page, () => page.click('#csvBtn'));
    expect(csv.text.split('\r\n')[0]).toContain('Nr.;Titel;Auswirkung');
    const json = await download(page, () => page.click('#jsonBtn'));
    expect(JSON.parse(json.text).items).toHaveLength(9);
    const png = await download(page, () => page.click('#pngBtn'));
    expect(png.name).toBe('stadtfest-2026-risiken.png');
    expect(fs.readFileSync(png.path).subarray(1, 4).toString()).toBe('PNG');
  });

  test('Karten-Darstellung im Bericht und Markdown in die Zwischenablage', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openExample(page, 'wochenplanung');
    await page.click('[data-nav="report"]');
    await expect(page.locator('#reportSvg circle')).toHaveCount(13);
    await expect(page.locator('.report-open')).toContainText('#14 Steuerberater anrufen');
    await page.click('#mdCopy');
    await expect(page.locator('.toast')).toContainText('Markdown kopiert');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# Wochenplanung KW 42');
  });
});

test.describe('Einstellungen', () => {
  test('ändert Achsen, rechnet Positionen um, Felder ergänzen', async ({ page }) => {
    await openExample(page, 'ideen-saison');
    await page.click('#settingsBtn');
    await expect(page.locator('#settingsDialog')).toBeVisible();
    await page.fill('#ax-x-label', 'Kosten');
    await page.fill('#ax-x-max', '5');
    await page.locator('#ax-x-max').blur();
    await page.selectOption('#ax-x-step', '1');
    await page.click('[data-add-field="owner"]');
    await page.click('[data-add-field="text"]');
    await expect(page.locator('#fieldsEdit .field-edit')).toHaveCount(2);
    await page.locator('#regionsEdit .region-edit').first().locator('[data-role="label"]').fill('Sofort');
    await page.click('#applySettings');
    await expect(page.locator('.plot-x .ax-title')).toContainText('Kosten');
    await expect(page.locator('.region-label', { hasText: 'Sofort' })).toBeVisible();
    await page.locator('#plot .tok', { hasText: 'Zweiter Truck' }).click();
    await expect(page.locator('#itemX')).toHaveValue('5');
    await expect(page.locator('#field-owner')).toBeVisible();
    await page.click('#undoBtn');
    await expect(page.locator('.plot-x .ax-title')).toContainText('Aufwand');
  });

  test('wechselt die Aufteilung: vier Felder → Raster → Zonen; Karten-Darstellung', async ({ page }) => {
    await openExample(page, 'ideen-saison');
    await page.click('#settingsBtn');
    await page.selectOption('#setLayout', 'grid');
    await expect(page.locator('#setView')).toHaveValue('heatmap');
    await page.click('#addRegion');
    await expect(page.locator('#regionsEdit .region-edit')).toHaveCount(5);
    await page.locator('#regionsEdit .region-edit').last().locator('.icon-btn').click();
    await page.click('#applySettings');
    await expect(page.locator('#surface')).toHaveAttribute('data-view', 'heatmap');
    await expect(page.locator('.cell')).toHaveCount(441);
    await page.click('#settingsBtn');
    await page.selectOption('#setLayout', 'zones');
    await page.locator('#regionsEdit .region-edit').first().locator('.swatch').first().click();
    await page.click('#applySettings');
    await expect(page.locator('#surface')).toHaveAttribute('data-view', 'plot');
    await expect(page.locator('.plot-bg ellipse')).toHaveCount(3);
    await page.click('#settingsBtn');
    await page.selectOption('#setLayout', 'quadrants');
    await page.selectOption('#setView', 'board');
    await page.click('#applySettings');
    await expect(page.locator('#surface')).toHaveAttribute('data-view', 'board');
    await expect(page.locator('.quad')).toHaveCount(4);
  });
});

test.describe('Auswahlfelder', () => {
  test('Optionen umbenennen, ergänzen, einfärben und entfernen', async ({ page }) => {
    await openExample(page, 'stadtfest-risiken');
    await page.click('#settingsBtn');
    const opts = page.locator('#fieldsEdit [data-field="response"] [data-role="options"]');
    await expect(opts.locator('.option-edit')).toHaveCount(4);
    await opts.locator('[data-option="avoid"] [data-role="option-label"]').fill('ausschließen');
    await opts.locator('[data-option="accept"] .icon-btn').click();
    await opts.locator('[data-role="add-option"]').click();
    await opts.locator('.option-edit').last().locator('[data-role="option-label"]').fill('beobachten');
    await opts.locator('.option-edit').last().locator('.swatch.c-blue').click();
    await page.click('#applySettings');
    await page.locator('.pill', { hasText: 'Diebstahl' }).first().click();
    const choice = page.locator('#itemEditor [data-field="response"] .choice button');
    await expect(choice).toHaveText(['ausschließen', 'vermindern', 'übertragen', 'beobachten']);
    // „akzeptieren“ entfernt: der Wert des Eintrags ist geleert
    await expect(page.locator('#itemEditor [data-field="response"] button.on')).toHaveCount(0);
    await choice.last().click();
    await expect(choice.last()).toHaveAttribute('aria-pressed', 'true');
    await expect(choice.last()).toHaveClass(/c-blue/);
    // Umbenennen behält gesetzte Werte
    await page.locator('.pill', { hasText: 'Mängel' }).first().click();
    await expect(page.locator('#itemEditor [data-field="response"] button.on')).toHaveText('ausschließen');
  });

  test('eigenes Auswahlfeld anlegen; leere Namen werden ergänzt, letzte Option bleibt', async ({ page }) => {
    await openExample(page, 'ideen-saison');
    await page.click('#settingsBtn');
    await page.click('[data-add-field="choice"]');
    const field = page.locator('#fieldsEdit .field-edit').last();
    await field.locator('input').first().fill('Status');
    await field.locator('[data-role="option-label"]').first().fill('offen');
    await field.locator('[data-role="option-label"]').nth(1).fill('');
    await field.locator('.option-edit').nth(1).locator('.swatch.c-green').click();
    await page.click('#applySettings');
    await page.locator('#plot .tok').first().click();
    const choice = page.locator('#itemEditor .choice button');
    await expect(choice).toHaveText(['offen', 'Option 2']);
    await choice.nth(1).click();
    await expect(page.locator('#plot .tok.sel i')).toHaveClass(/c-green/);
    await page.click('#settingsBtn');
    const f2 = page.locator('#fieldsEdit .field-edit').last();
    await f2.locator('.option-edit').first().locator('.icon-btn').click();
    await expect(f2.locator('.option-edit .icon-btn')).toBeDisabled();
  });
});

test.describe('Datei', () => {
  test('exportiert, importiert (gleiche überspringen, abweichende als Kopie) und sichert', async ({ page }) => {
    await openExample(page, 'vorhaben-2027');
    const json = await download(page, () => menu(page, 'export'));
    expect(json.name).toBe('vorhaben-2027.json');
    await page.click('#homeLink');
    const file = test.info().outputPath('m.json');
    fs.writeFileSync(file, json.text);
    const [c1] = await Promise.all([page.waitForEvent('filechooser'), page.click('#importBtn')]);
    await c1.setFiles(file);
    await expect(page.locator('.toast').last()).toContainText('1 bereits vorhanden');
    const changed = { ...JSON.parse(json.text), name: 'Geändert' };
    fs.writeFileSync(file, JSON.stringify(changed));
    const [c2] = await Promise.all([page.waitForEvent('filechooser'), page.click('#importBtn')]);
    await c2.setFiles(file);
    await expect(page.locator('#matrixName')).toHaveValue('Geändert (Import)');
    await page.click('#homeLink');
    const backup = await download(page, () => menu(page, 'backup'));
    expect(JSON.parse(backup.text).matrices).toHaveLength(2);
    fs.writeFileSync(file, '{kaputt');
    const [c3] = await Promise.all([page.waitForEvent('filechooser'), page.click('#importBtn')]);
    await c3.setFiles(file);
    await expect(page.locator('.toast').last()).toContainText('Import fehlgeschlagen');
  });

  test('übernimmt Einträge aus einer anderen Matrix', async ({ page }) => {
    await openExample(page, 'stadtfest-risiken');
    await page.click('#homeLink');
    await openExample(page, 'ideen-saison');
    await menu(page, 'copyItems');
    await page.selectOption('#copySource', { label: 'Stadtfest 2026 – Risiken (Risiko)' });
    await page.locator('#copyDialog .check-row', { hasText: 'Generator' }).locator('input').check();
    await page.locator('#copyDialog .check-row', { hasText: 'Unwetter' }).locator('input').check();
    await page.click('#copyRun');
    await expect(page.locator('#inbox .inbox-item')).toHaveCount(2);
    await expect(page.locator('#inbox')).toContainText('Generator fällt aus');
  });

  test('wechselt die Sprache', async ({ page }) => {
    await page.click('#menuBtn');
    await page.click('[data-lang="en"]');
    await expect(page.locator('h1')).toHaveText('My matrices');
    await page.click('#exampleBtn');
    await page.click('[data-example="ideen-saison"]');
    await expect(page.locator('#matrixName')).toHaveValue('Ideas for season 2027');
    await expect(page.locator('.region-label', { hasText: 'Quick wins' })).toBeVisible();
    await page.click('#menuBtn');
    await page.click('[data-lang="de"]');
    await expect(page.locator('[data-nav="list"]')).toHaveText(/Liste/);
  });
});

test.describe('Mobil', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Felder untereinander, Navigation unten', async ({ page }) => {
    await openExample(page, 'wochenplanung');
    const quads = page.locator('.quad');
    const a = await quads.nth(0).boundingBox();
    const b = await quads.nth(1).boundingBox();
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    const nav = await page.locator('nav.nav').boundingBox();
    expect(nav.y + nav.height).toBeGreaterThan(800);
    await page.click('[data-nav="report"]');
    await expect(page.locator('#report')).toBeVisible();
  });
});
