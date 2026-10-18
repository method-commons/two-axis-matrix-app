/*
 * Porters Wettbewerbsstrategien: strategische Optionen nach Art des Wettbewerbsvorteils
 * (Kosten/Einzigartigkeit) und Marktabdeckung (Gesamtmarkt/Nische) – Kostenführerschaft,
 * Differenzierung, Kosten- bzw. Differenzierungsfokus. Zwei Stufen je Achse, Karten.
 */

/** @type {MethodDef} */
export const method = {
  id: 'porter',
  order: 140,
  icon: '⛉',
  color: 'violet',
  layout: 'quadrants',
  view: 'board',
  x: { min: 1, max: 2, step: 1 },
  y: { min: 1, max: 2, step: 1 },
  split: { x: 1.5, y: 1.5 },
  regions: [
    { id: 'cost', color: 'blue', qx: 'low', qy: 'high' },
    { id: 'differentiation', color: 'violet', qx: 'high', qy: 'high' },
    { id: 'costFocus', color: 'teal', qx: 'low', qy: 'low' },
    { id: 'diffFocus', color: 'orange', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'owner', type: 'person' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Porters Wettbewerbsstrategien',
      short: 'Porter',
      aka: 'Generische Wettbewerbsstrategien, Strategiematrix nach Porter',
      description: 'Strategische Optionen nach Wettbewerbsvorteil und Marktabdeckung: Kostenführerschaft, Differenzierung, Fokus.',
      itemName: { one: 'Option', many: 'Optionen' },
      noteLabel: 'Beschreibung',
      x: { label: 'Wettbewerbsvorteil', low: 'Kosten', high: 'Einzigartigkeit' },
      y: { label: 'Marktabdeckung', low: 'Nische', high: 'Gesamtmarkt' },
      regions: {
        cost: { label: 'Kostenführerschaft', hint: 'am günstigsten für alle' },
        differentiation: { label: 'Differenzierung', hint: 'besonders für alle – höherer Preis' },
        costFocus: { label: 'Kostenfokus', hint: 'am günstigsten für eine Zielgruppe' },
        diffFocus: { label: 'Differenzierungsfokus', hint: 'besonders für eine Zielgruppe' },
      },
      fields: { owner: 'Verantwortlich' },
      leadQuestions: [
        'Warum sollen Kunden bei uns kaufen – weil es günstig ist oder weil es besonders ist?',
        'Für wen genau – alle oder eine klar umrissene Gruppe?',
        'Welche Optionen widersprechen sich?',
      ],
      help: {
        paras: [
          'Nach Michael Porter erzielt ein Unternehmen einen Wettbewerbsvorteil entweder über niedrige Kosten oder über Einzigartigkeit – und zwar im Gesamtmarkt oder in einer Nische.',
          'Wer beides zugleich versucht, gerät leicht „zwischen die Stühle“: zu teuer für Preisbewusste, zu gewöhnlich für Anspruchsvolle. Die Matrix hilft, Optionen einer klaren Richtung zuzuordnen.',
        ],
        list: [
          'Kostenführerschaft: schlanke Abläufe, große Mengen, günstigster Preis.',
          'Differenzierung: Qualität, Marke, Erlebnis – dafür höherer Preis.',
          'Fokus: dasselbe, aber für eine Zielgruppe, einen Ort oder einen Anlass.',
        ],
      },
      hints: {
        middleTitle: 'Zwischen den Stühlen?',
        middleDetail: 'Optionen für Kosten ({cost}) und für Einzigartigkeit ({unique}) – passt das zusammen?',
        scopeTitle: 'Gesamtmarkt und Nische',
        scopeDetail: 'Optionen für beide Marktabdeckungen – bewusst so?',
        clearTitle: 'Klare Richtung',
        clearDetail: 'Alle Optionen gehören zu {name}.',
      },
    },
    en: {
      name: 'Porter’s generic strategies',
      short: 'Porter',
      aka: 'Generic competitive strategies, Porter’s strategy matrix',
      description: 'Strategic options by competitive advantage and market scope: cost leadership, differentiation, focus.',
      itemName: { one: 'option', many: 'options' },
      noteLabel: 'Description',
      x: { label: 'Competitive advantage', low: 'cost', high: 'uniqueness' },
      y: { label: 'Market scope', low: 'niche', high: 'broad market' },
      regions: {
        cost: { label: 'Cost leadership', hint: 'cheapest for everyone' },
        differentiation: { label: 'Differentiation', hint: 'special for everyone – higher price' },
        costFocus: { label: 'Cost focus', hint: 'cheapest for one target group' },
        diffFocus: { label: 'Differentiation focus', hint: 'special for one target group' },
      },
      fields: { owner: 'Owner' },
      leadQuestions: [
        'Why should customers buy from us – because it is cheap or because it is special?',
        'For whom exactly – everyone or a clearly defined group?',
        'Which options contradict each other?',
      ],
      help: {
        paras: [
          'According to Michael Porter, a company gains a competitive advantage either through low cost or through uniqueness – in the broad market or in a niche.',
          'Trying both at once easily leaves you “stuck in the middle”: too expensive for the price-conscious, too ordinary for the demanding. The matrix helps assign options to one clear direction.',
        ],
        list: [
          'Cost leadership: lean processes, large volumes, lowest price.',
          'Differentiation: quality, brand, experience – at a higher price.',
          'Focus: the same, but for one target group, place or occasion.',
        ],
      },
      hints: {
        middleTitle: 'Stuck in the middle?',
        middleDetail: 'Options for cost ({cost}) and for uniqueness ({unique}) – do they fit together?',
        scopeTitle: 'Broad market and niche',
        scopeDetail: 'Options for both market scopes – on purpose?',
        clearTitle: 'Clear direction',
        clearDetail: 'All options belong to {name}.',
      },
    },
  },
  hints(m, { items, regionOf, hint }) {
    if (!items.length) return [];
    const regions = items.map(it => regionOf(m, it)).filter(/** @returns {r is Region} */ r => r != null);
    const cost = regions.filter(r => r.qx === 'low').length;
    const unique = regions.filter(r => r.qx === 'high').length;
    /** @type {Hint[]} */
    const out = [];
    if (cost && unique) out.push(hint('middle', 'warn', { cost, unique }));
    if (regions.some(r => r.qy === 'high') && regions.some(r => r.qy === 'low')) out.push(hint('scope', 'open'));
    const ids = new Set(regions.map(r => r.id));
    if (ids.size === 1) out.push(hint('clear', 'ok', { name: regions[0].label || regions[0].id }));
    return out;
  },
};
