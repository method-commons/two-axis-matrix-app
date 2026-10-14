import { createMatrix, dragTo, expect, item, openExample, quickAdd, stored, test } from './fixtures.js';

test.describe('Matrix – Karten (Eisenhower)', () => {
  test('Eingang füllen, per Taste und Ziehen einordnen, abhaken', async ({ page }) => {
    await createMatrix(page, 'eisenhower', 'Woche');
    await quickAdd(page, 'Steuer', 'Flyer', 'Anruf');
    await expect(page.locator('#inbox .inbox-item')).toHaveCount(3);
    await expect(page.locator('#inboxCount')).toHaveText('3');
    // Taste 2 = zweiter Bereich („Einplanen“)
    await item(page, 'Steuer').click();
    await expect(page.locator('#itemTitle')).toHaveValue('Steuer');
    await page.locator('#surface').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('2');
    await expect(page.locator('.quad[data-region="plan"] .card-item')).toHaveText(/Steuer/);
    // Ziehen in „Weglassen“
    await dragTo(page, item(page, 'Flyer'), page.locator('.quad[data-region="drop"]'));
    await expect(page.locator('.quad[data-region="drop"] .card-item')).toHaveText(/Flyer/);
    // zurück in den Eingang (Taste 0)
    await page.keyboard.press('0');
    await expect(page.locator('#inbox .inbox-item', { hasText: 'Flyer' })).toBeVisible();
    // Bereich in der Seitenleiste wählen, Person und Termin setzen
    await item(page, 'Anruf').click();
    await page.click('#itemEditor [data-place="delegate"]');
    await page.fill('#field-owner', 'Ben');
    await page.locator('#field-owner').blur();
    await expect(page.locator('.quad[data-region="delegate"] .avatar')).toHaveText('B');
    await page.click('#itemEditor [data-place="do"]');
    await page.fill('#field-due', '2020-01-01');
    await expect(page.locator('.quad[data-region="do"] .chip.bad')).toBeVisible();
    await page.locator('.quad[data-region="do"] .card-item input[type=checkbox]').check();
    await expect(page.locator('.quad[data-region="do"] .card-item.done')).toBeVisible();
    await expect(page.locator('.quad[data-region="do"] .quad-head small')).toHaveText('0 offen');
    const [m] = await stored(page);
    expect(m.items.find(i => i.title === 'Anruf')).toMatchObject({ x: 2, y: 2, values: { owner: 'Ben', due: '2020-01-01', done: true } });
  });

  test('Hinweise markieren betroffene Einträge', async ({ page }) => {
    await openExample(page, 'wochenplanung');
    await page.click('#hints [data-hint="plan"]');
    await expect(page.locator('.card-item.hl')).toHaveCount(2);
    await expect(page.locator('.card-item.dim').first()).toBeVisible();
    await page.click('#hints [data-hint="delegate"]');
    await expect(page.locator('#itemTitle')).toHaveValue('Getränkelieferant zurückrufen');
  });
});

test.describe('Matrix – Punkte (Wert/Aufwand)', () => {
  test('Ziehen setzt die Position, Pfeiltasten verschieben, Werte eintippen', async ({ page }) => {
    await createMatrix(page, 'value-effort', 'Ideen');
    await quickAdd(page, 'Kombi-Angebot');
    await expect(page.locator('.plot-empty')).toBeVisible();
    await dragTo(page, item(page, 'Kombi-Angebot'), page.locator('#plot'), 0.2, 0.2);
    await expect(page.locator('#plot .tok', { hasText: 'Kombi-Angebot' })).toBeVisible();
    await expect(page.locator('#itemX')).toHaveValue('2');
    await expect(page.locator('#itemY')).toHaveValue('8');
    await expect(page.locator('#itemEditor .region-btn.on')).toHaveText('Quick Wins');
    await page.locator('#surface').click({ position: { x: 3, y: 3 } });
    await page.locator('#plot .tok').first().click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await expect(page.locator('#itemX')).toHaveValue('2.5');
    await expect(page.locator('#itemY')).toHaveValue('7');
    await page.fill('#itemX', '9');
    await page.press('#itemX', 'Enter');
    await expect(page.locator('#itemEditor .region-btn.on')).toHaveText('Großprojekte');
    // Rückgängig / Wiederholen
    await page.click('#undoBtn');
    await expect(page.locator('#itemX')).toHaveValue('2.5');
    await page.click('#redoBtn');
    await expect(page.locator('#itemX')).toHaveValue('9');
    // Nummern statt Namen
    await page.click('#showNumbers');
    await expect(page.locator('#plot .tok span')).toHaveCount(0);
    await page.click('#showNames');
    await expect(page.locator('#plot .tok span')).toHaveCount(1);
  });

  test('Löschen per Taste mit Rückgängig, Esc hebt die Auswahl auf', async ({ page }) => {
    await openExample(page, 'ideen-saison');
    await expect(page.locator('#plot .tok')).toHaveCount(12);
    await page.locator('#plot .tok', { hasText: 'Neues Logo' }).click();
    await page.locator('#surface').click({ position: { x: 3, y: 3 } });
    await page.keyboard.press('Delete');
    await expect(page.locator('#plot .tok')).toHaveCount(11);
    await page.locator('.toast button').click();
    await expect(page.locator('#plot .tok')).toHaveCount(12);
    await page.locator('#plot .tok', { hasText: 'Neues Logo' }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#itemEditor')).toHaveCount(0);
    await expect(page.locator('#ranking li').first()).toContainText('Kombi-Angebot');
  });

  test('neuer Eintrag über die Werkzeugleiste', async ({ page }) => {
    await createMatrix(page, 'value-effort', 'Ideen');
    await page.click('#addItem');
    await expect(page.locator('#itemTitle')).toBeFocused();
    await page.keyboard.type('Neu');
    await page.click('#itemEditor [data-place="major"]');
    await expect(page.locator('#plot .tok', { hasText: 'Neu' })).toBeVisible();
    await page.click('#removeItem');
    await expect(page.locator('#plot .tok')).toHaveCount(0);
  });
});

test.describe('Matrix – Stakeholder', () => {
  test('Haltung färbt, Ziel-Position mit Pfeil, Ziehen der Ziel-Position', async ({ page }) => {
    await createMatrix(page, 'stakeholder', 'Stellplatz');
    await quickAdd(page, 'Ordnungsamt');
    await item(page, 'Ordnungsamt').click();
    await page.click('#itemEditor [data-place="satisfy"]');
    await page.click('#itemEditor [data-field="stance"] [data-option="contra"]');
    await expect(page.locator('#plot .tok i').first()).toHaveClass(/c-red/);
    await page.click('#itemEditor [data-field="stance"] [data-option="contra"]');
    await expect(page.locator('#plot .tok i').first()).toHaveClass(/c-orange/);
    await page.click('#field-target-set');
    await expect(page.locator('#plot .tok.ghost')).toHaveCount(1);
    // Eintrag weg von seiner Ziel-Position schieben, dann die Ziel-Position ziehen
    await page.keyboard.press('Shift+ArrowLeft');
    await dragTo(page, page.locator('#plot .tok.ghost'), page.locator('#plot'), 0.9, 0.1);
    await expect(page.locator('#plot .arrow')).toHaveCount(1);
    await expect(page.locator('#field-target-x')).toHaveValue('4.5');
    await page.uncheck('#showPoints');
    await expect(page.locator('#plot .tok.ghost')).toHaveCount(0);
    await page.check('#showPoints');
    await page.click('#itemEditor [data-field="target"] .link');
    await expect(page.locator('#plot .tok.ghost')).toHaveCount(0);
  });
});

test.describe('Matrix – Zellen (Risiko)', () => {
  test('Ziehen in Zellen, Klick auf Zelle verschiebt die Auswahl, Bewertung nach Maßnahme', async ({ page }) => {
    await createMatrix(page, 'risk', 'Risiken');
    await quickAdd(page, 'Unwetter');
    await dragTo(page, item(page, 'Unwetter'), page.locator('.cell[data-x="5"][data-y="3"]'));
    await expect(page.locator('.cell[data-x="5"][data-y="3"] .pill')).toHaveText(/Unwetter/);
    await expect(page.locator('#itemEditor .region-btn.on')).toHaveText('Sehr hoch');
    await page.locator('.cell[data-x="4"][data-y="4"]').click({ position: { x: 60, y: 60 } });
    await expect(page.locator('.cell[data-x="4"][data-y="4"] .pill')).toHaveCount(1);
    await page.click('#itemEditor [data-field="response"] [data-option="transfer"]');
    await page.fill('#field-measure', 'Versicherung');
    await page.locator('#field-measure').blur();
    await page.click('#field-residual-set');
    await dragTo(page, page.locator('.cell .pill.ghost'), page.locator('.cell[data-x="3"][data-y="2"]'));
    await expect(page.locator('.cell[data-x="3"][data-y="2"] .pill.ghost')).toHaveCount(1);
    await expect(page.locator('#itemEditor [data-field="residual"] .region-chip')).toHaveText('Mittel');
    await page.click('#itemEditor #closeEditor');
    await expect(page.locator('#hints [data-hint="measure"]')).toHaveAttribute('data-state', 'ok');
  });
});

test.describe('Matrix – Zonen (Stacey)', () => {
  test('Fragen bestimmen die Position', async ({ page }) => {
    await createMatrix(page, 'stacey', 'Vorhaben');
    await quickAdd(page, 'App');
    await item(page, 'App').click();
    for (const [q, v] of [['goals', 4], ['agree', 5], ['done', 5], ['tech', 4]]) await page.click(`#questions [data-question="${q}"] button >> nth=${v - 1}`);
    await expect(page.locator('#itemX')).toHaveValue('8.8');
    await expect(page.locator('#itemY')).toHaveValue('8.8');
    await expect(page.locator('#itemEditor .region-btn.on')).toHaveText('Chaotisch');
    await page.click('#questions [data-question="tech"] button >> nth=3');
    await expect(page.locator('#itemX')).toHaveValue('10');
    await page.keyboard.press('Escape');
    await expect(page.locator('#distribution [data-region="chaotic"] small')).toContainText('stabilisieren');
  });
});
