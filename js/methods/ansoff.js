/*
 * Ansoff-Matrix (Produkt-Markt-Matrix): Wachstumsideen nach Produkt (bestehend/neu) und Markt
 * (bestehend/neu) – Marktdurchdringung, Produktentwicklung, Marktentwicklung, Diversifikation.
 * Zwei Stufen je Achse, Karten; wie üblich steht „bestehend“ links bzw. oben.
 */

/** @type {MethodDef} */
export const method = {
  id: 'ansoff',
  order: 90,
  icon: '↗',
  color: 'blue',
  layout: 'quadrants',
  view: 'board',
  x: { min: 1, max: 2, step: 1 },
  y: { min: 1, max: 2, step: 1, reverse: true },
  split: { x: 1.5, y: 1.5 },
  regions: [
    { id: 'penetration', color: 'green', qx: 'low', qy: 'low' },
    { id: 'product', color: 'blue', qx: 'high', qy: 'low' },
    { id: 'market', color: 'orange', qx: 'low', qy: 'high' },
    { id: 'diversification', color: 'red', qx: 'high', qy: 'high' },
  ],
  fields: [
    { key: 'owner', type: 'person' },
    { key: 'due', type: 'date' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Ansoff-Matrix',
      short: 'Ansoff',
      aka: 'Produkt-Markt-Matrix, Wachstumsstrategien',
      description: 'Wachstumsideen nach Produkt und Markt: Marktdurchdringung, Produkt- und Marktentwicklung, Diversifikation.',
      itemName: { one: 'Wachstumsidee', many: 'Wachstumsideen' },
      noteLabel: 'Beschreibung',
      x: { label: 'Produkte', low: 'bestehend', high: 'neu' },
      y: { label: 'Märkte', low: 'bestehend', high: 'neu' },
      regions: {
        penetration: { label: 'Marktdurchdringung', hint: 'mehr vom Bestehenden an Bestehende – geringstes Risiko' },
        product: { label: 'Produktentwicklung', hint: 'Neues für bestehende Kunden' },
        market: { label: 'Marktentwicklung', hint: 'Bestehendes für neue Kunden, Orte, Kanäle' },
        diversification: { label: 'Diversifikation', hint: 'Neues für Neue – höchstes Risiko' },
      },
      fields: { owner: 'Verantwortlich', due: 'Termin' },
      leadQuestions: [
        'Können wir mit dem, was wir haben, mehr verkaufen?',
        'Was wünschen sich unsere Kunden zusätzlich?',
        'Wo gibt es Kunden, die uns noch nicht kennen?',
      ],
      help: {
        paras: [
          'Die Ansoff-Matrix ordnet Wachstumsideen danach, ob sie mit bestehenden oder neuen Produkten und auf bestehenden oder neuen Märkten wachsen wollen.',
          'Das Risiko steigt von der Marktdurchdringung (Bekanntes für Bekannte) bis zur Diversifikation (Neues für Neue). Ein Wachstumsplan beginnt meist links oben.',
        ],
        list: [
          'Marktdurchdringung: Angebote, Treue, Preise, mehr Präsenz.',
          'Produktentwicklung: neue Produkte oder Varianten für bestehende Kunden.',
          'Marktentwicklung: neue Zielgruppen, Orte oder Vertriebswege für bestehende Produkte.',
          'Diversifikation: neue Produkte für neue Märkte – sorgfältig prüfen.',
        ],
      },
      hints: {
        riskTitle: 'Viel Diversifikation',
        riskDetail: '{n} von {total} Ideen sind Diversifikation – höchstes Risiko.',
        penetrationTitle: 'Erst durchdringen?',
        penetrationDetail: 'Noch keine Idee zur Marktdurchdringung – der risikoärmste Weg.',
        spreadTitle: 'Breit aufgestellt',
        spreadDetail: 'Ideen in {n} von 4 Feldern.',
      },
    },
    en: {
      name: 'Ansoff matrix',
      short: 'Ansoff',
      aka: 'Product-market matrix, growth strategies',
      description: 'Growth ideas by product and market: market penetration, product and market development, diversification.',
      itemName: { one: 'growth idea', many: 'growth ideas' },
      noteLabel: 'Description',
      x: { label: 'Products', low: 'existing', high: 'new' },
      y: { label: 'Markets', low: 'existing', high: 'new' },
      regions: {
        penetration: { label: 'Market penetration', hint: 'more of the existing to existing customers – lowest risk' },
        product: { label: 'Product development', hint: 'new offers for existing customers' },
        market: { label: 'Market development', hint: 'existing offers for new customers, places, channels' },
        diversification: { label: 'Diversification', hint: 'new for new – highest risk' },
      },
      fields: { owner: 'Owner', due: 'Due' },
      leadQuestions: [
        'Can we sell more with what we already have?',
        'What else do our customers want?',
        'Where are customers who do not know us yet?',
      ],
      help: {
        paras: [
          'The Ansoff matrix sorts growth ideas by whether they grow with existing or new products and in existing or new markets.',
          'Risk rises from market penetration (known to known) to diversification (new to new). A growth plan usually starts at the top left.',
        ],
        list: [
          'Market penetration: offers, loyalty, prices, more presence.',
          'Product development: new products or variants for existing customers.',
          'Market development: new target groups, places or channels for existing products.',
          'Diversification: new products for new markets – check carefully.',
        ],
      },
      hints: {
        riskTitle: 'Much diversification',
        riskDetail: '{n} of {total} ideas are diversification – highest risk.',
        penetrationTitle: 'Penetrate first?',
        penetrationDetail: 'No market penetration idea yet – the lowest-risk path.',
        spreadTitle: 'Well spread',
        spreadDetail: 'Ideas in {n} of 4 fields.',
      },
    },
  },
  hints(m, { items, regionId, inRegion, hint }) {
    if (!items.length) return [];
    const ids = items.map(regionId);
    /** @type {Hint[]} */
    const out = [];
    if (!ids.includes('penetration')) out.push(hint('penetration', 'open'));
    const div = inRegion('diversification');
    if (div.length * 2 > items.length) out.push(hint('risk', 'warn', { n: div.length, total: items.length }, div));
    const used = new Set(ids.filter(Boolean)).size;
    if (used >= 3) out.push(hint('spread', 'ok', { n: used }));
    return out;
  },
};
