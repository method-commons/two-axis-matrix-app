/*
 * GE-/McKinsey-Matrix (Neun-Felder-Portfolio): Geschäftsfelder nach Wettbewerbsstärke und
 * Marktattraktivität in je drei Stufen. Die Normstrategien liegen auf den Diagonalen; als
 * Raster mit Stufen nach X × Y gilt: ab 6 investieren, ab 3 selektiv, darunter abschöpfen.
 */

/** @type {MethodDef} */
export const method = {
  id: 'ge-mckinsey',
  order: 70,
  icon: '▤',
  color: 'teal',
  layout: 'grid',
  view: 'heatmap',
  x: { min: 1, max: 3, step: 1 },
  y: { min: 1, max: 3, step: 1 },
  regions: [
    { id: 'harvest', color: 'red', min: 0 },
    { id: 'selective', color: 'yellow', min: 3 },
    { id: 'invest', color: 'green', min: 6 },
  ],
  fields: [
    { key: 'measure', type: 'textarea' },
    { key: 'owner', type: 'person' },
  ],
  rank: 'product',
  texts: {
    de: {
      name: 'GE-/McKinsey-Matrix',
      short: 'GE-McKinsey',
      aka: 'Neun-Felder-Matrix, Marktattraktivitäts-Wettbewerbsstärken-Portfolio',
      description: 'Geschäftsfelder nach Wettbewerbsstärke und Marktattraktivität: investieren, selektiv vorgehen, abschöpfen.',
      itemName: { one: 'Geschäftsfeld', many: 'Geschäftsfelder' },
      noteLabel: 'Begründung',
      x: { label: 'Relative Wettbewerbsstärke', low: 'gering', high: 'hoch' },
      y: { label: 'Marktattraktivität', low: 'gering', high: 'hoch' },
      regions: {
        harvest: { label: 'Abschöpfen', hint: 'Gewinne mitnehmen, Rückzug prüfen' },
        selective: { label: 'Selektiv vorgehen', hint: 'gezielt ausbauen oder halten' },
        invest: { label: 'Investieren', hint: 'wachsen, Position ausbauen' },
      },
      fields: { measure: 'Maßnahme', owner: 'Verantwortlich' },
      leadQuestions: [
        'Was macht den Markt attraktiv – Größe, Wachstum, Marge, Wettbewerb?',
        'Worin sind wir stärker als andere – Preis, Qualität, Lage, Marke?',
        'Wohin fließen Zeit und Geld im nächsten Jahr?',
      ],
      help: {
        paras: [
          'Die GE-/McKinsey-Matrix bewertet Geschäftsfelder feiner als die BCG-Matrix: Marktattraktivität und eigene Wettbewerbsstärke werden je in drei Stufen (gering, mittel, hoch) eingeschätzt, meist aus mehreren Kriterien.',
          'Daraus ergeben sich drei Normstrategien entlang der Diagonalen: oben rechts investieren, auf der Mitteldiagonalen selektiv vorgehen, unten links abschöpfen.',
        ],
        list: [
          'Zelle anklicken oder Geschäftsfeld hineinziehen, um es einzuordnen.',
          'Stufen: Wert X × Y ab 6 = investieren, 3–4 = selektiv, 1–2 = abschöpfen (anpassbar).',
          'Für eine feinere Bewertung die Skala unter „Achsen & Bereiche“ auf 1–5 stellen und die Grenzen anpassen.',
        ],
      },
      hints: {
        harvestTitle: 'Abschöpfen oder aufgeben',
        harvestDetail: '{names}',
        measureTitle: 'Ohne Maßnahme',
        measureDetail: '{n} Geschäftsfeld(er) zum Investieren ohne Maßnahme.',
        investTitle: 'Investitionsschwerpunkte',
        investDetail: '{n} Geschäftsfeld(er) im Bereich „Investieren“.',
      },
    },
    en: {
      name: 'GE-McKinsey matrix',
      short: 'GE-McKinsey',
      aka: 'Nine-box portfolio, industry attractiveness/business strength matrix',
      description: 'Rate business units by competitive strength and market attractiveness: invest, be selective, harvest.',
      itemName: { one: 'business unit', many: 'business units' },
      noteLabel: 'Rationale',
      x: { label: 'Competitive strength', low: 'low', high: 'high' },
      y: { label: 'Market attractiveness', low: 'low', high: 'high' },
      regions: {
        harvest: { label: 'Harvest', hint: 'take the profits, consider exiting' },
        selective: { label: 'Selective', hint: 'build or hold selectively' },
        invest: { label: 'Invest', hint: 'grow, build the position' },
      },
      fields: { measure: 'Action', owner: 'Owner' },
      leadQuestions: [
        'What makes the market attractive – size, growth, margin, competition?',
        'Where are we stronger than others – price, quality, location, brand?',
        'Where will time and money go next year?',
      ],
      help: {
        paras: [
          'The GE-McKinsey matrix rates business units in more detail than the BCG matrix: market attractiveness and own competitive strength are each rated in three levels (low, medium, high), usually from several criteria.',
          'This gives three standard strategies along the diagonals: invest at the top right, be selective on the middle diagonal, harvest at the bottom left.',
        ],
        list: [
          'Click a cell or drag a business unit into it to place it.',
          'Levels: score X × Y from 6 = invest, 3–4 = selective, 1–2 = harvest (adjustable).',
          'For a finer rating, set the scale to 1–5 under “Axes & areas” and adjust the borders.',
        ],
      },
      hints: {
        harvestTitle: 'Harvest or exit',
        harvestDetail: '{names}',
        measureTitle: 'Without action',
        measureDetail: '{n} business unit(s) to invest in without an action.',
        investTitle: 'Investment focus',
        investDetail: '{n} business unit(s) in “Invest”.',
      },
    },
  },
  hints(m, { regionOf, placed, value, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const list = placed(m);
    const of = (/** @type {string} */ id) => list.filter(it => { const r = regionOf(m, it); return r != null && r.id === id; });
    /** @type {Hint[]} */
    const out = [];
    const invest = of('invest');
    if (invest.length) {
      const none = m.config.fields.some(f => f.key === 'measure') ? invest.filter(it => !String(value(it, 'measure') || '').trim()) : [];
      out.push(none.length
        ? { key: 'measure', state: 'warn', title: H.measureTitle, detail: fill(H.measureDetail, { n: none.length }), items: none.map(i => i.id) }
        : { key: 'invest', state: 'ok', title: H.investTitle, detail: fill(H.investDetail, { n: invest.length }), items: invest.map(i => i.id) });
    }
    const harvest = of('harvest');
    if (harvest.length) out.push({ key: 'harvest', state: 'open', title: H.harvestTitle, detail: fill(H.harvestDetail, { names: harvest.map(i => i.title.trim() || `#${i.no}`).join(', ') }), items: harvest.map(i => i.id) });
    return out;
  },
};
