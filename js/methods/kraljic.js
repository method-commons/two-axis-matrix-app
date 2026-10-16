/*
 * Kraljic-Matrix (Einkaufsportfolio): Materialien und Leistungen nach Versorgungsrisiko und
 * Einfluss auf das Ergebnis – strategische, Engpass-, Hebel- und unkritische Produkte mit je
 * eigener Einkaufsstrategie.
 */

/** @type {MethodDef} */
export const method = {
  id: 'kraljic',
  order: 80,
  icon: '◇',
  color: 'teal',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 1, max: 5, step: 0.5 },
  y: { min: 1, max: 5, step: 0.5 },
  split: { x: 3, y: 3 },
  regions: [
    { id: 'leverage', color: 'blue', qx: 'low', qy: 'high' },
    { id: 'strategic', color: 'red', qx: 'high', qy: 'high' },
    { id: 'routine', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'bottleneck', color: 'orange', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'supplier', type: 'text' },
    { key: 'strategy', type: 'textarea' },
    { key: 'owner', type: 'person' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Kraljic-Matrix',
      short: 'Kraljic',
      aka: 'Einkaufsportfolio, Beschaffungsmatrix',
      description: 'Einkauf nach Versorgungsrisiko und Ergebniseinfluss: strategische, Engpass-, Hebel- und unkritische Produkte.',
      itemName: { one: 'Material', many: 'Materialien' },
      noteLabel: 'Begründung',
      x: { label: 'Versorgungsrisiko', low: 'gering', high: 'hoch' },
      y: { label: 'Einfluss auf das Ergebnis', low: 'gering', high: 'hoch' },
      regions: {
        leverage: { label: 'Hebelprodukte', hint: 'Marktmacht nutzen, Angebote vergleichen' },
        strategic: { label: 'Strategische Produkte', hint: 'Partnerschaft, langfristig absichern' },
        routine: { label: 'Unkritische Produkte', hint: 'Aufwand senken, bündeln, automatisieren' },
        bottleneck: { label: 'Engpassprodukte', hint: 'Versorgung sichern: Vorrat, Alternativen' },
      },
      fields: { supplier: 'Lieferant', strategy: 'Einkaufsstrategie', owner: 'Verantwortlich' },
      leadQuestions: [
        'Was passiert, wenn dieser Lieferant morgen ausfällt?',
        'Wie viel vom Einkaufsvolumen bzw. vom Gewinn hängt daran?',
        'Gibt es Alternativen – andere Lieferanten, andere Materialien?',
      ],
      help: {
        paras: [
          'Die Kraljic-Matrix teilt den Einkauf nach zwei Fragen ein: Wie riskant ist die Versorgung (wenige Anbieter, lange Lieferzeit, knappes Gut)? Und wie stark wirkt sich das Material auf Kosten und Ergebnis aus?',
          'Jedes Feld hat eine eigene Einkaufsstrategie – so fließt die Aufmerksamkeit dorthin, wo Risiko oder Wirkung groß sind.',
        ],
        list: [
          'Strategische Produkte: hohes Risiko, hohe Wirkung – Partnerschaften, langfristige Verträge.',
          'Engpassprodukte: hohes Risiko, geringe Wirkung – Versorgung sichern, Alternativen suchen.',
          'Hebelprodukte: geringes Risiko, hohe Wirkung – Wettbewerb nutzen, verhandeln.',
          'Unkritische Produkte: geringes Risiko, geringe Wirkung – Aufwand senken.',
        ],
      },
      hints: {
        strategyTitle: 'Kritisch ohne Strategie',
        strategyDetail: '{n} strategische bzw. Engpassprodukt(e) ohne Einkaufsstrategie.',
        bottleneckTitle: 'Engpässe absichern',
        bottleneckDetail: '{names}',
        coveredTitle: 'Kritisches abgesichert',
        coveredDetail: 'Alle {n} strategischen und Engpassprodukte haben eine Strategie.',
      },
    },
    en: {
      name: 'Kraljic matrix',
      short: 'Kraljic',
      aka: 'Purchasing portfolio, supply matrix',
      description: 'Purchasing by supply risk and profit impact: strategic, bottleneck, leverage and non-critical items.',
      itemName: { one: 'item', many: 'items' },
      noteLabel: 'Rationale',
      x: { label: 'Supply risk', low: 'low', high: 'high' },
      y: { label: 'Profit impact', low: 'low', high: 'high' },
      regions: {
        leverage: { label: 'Leverage items', hint: 'use buying power, compare offers' },
        strategic: { label: 'Strategic items', hint: 'partnership, secure long term' },
        routine: { label: 'Non-critical items', hint: 'reduce effort, bundle, automate' },
        bottleneck: { label: 'Bottleneck items', hint: 'secure supply: stock, alternatives' },
      },
      fields: { supplier: 'Supplier', strategy: 'Purchasing strategy', owner: 'Owner' },
      leadQuestions: [
        'What happens if this supplier fails tomorrow?',
        'How much of the spend or the profit depends on it?',
        'Are there alternatives – other suppliers, other materials?',
      ],
      help: {
        paras: [
          'The Kraljic matrix divides purchasing by two questions: how risky is the supply (few suppliers, long lead time, scarce goods)? And how strongly does the item affect costs and profit?',
          'Each field has its own purchasing strategy – so attention goes where risk or impact is high.',
        ],
        list: [
          'Strategic items: high risk, high impact – partnerships, long-term contracts.',
          'Bottleneck items: high risk, low impact – secure supply, look for alternatives.',
          'Leverage items: low risk, high impact – use competition, negotiate.',
          'Non-critical items: low risk, low impact – reduce effort.',
        ],
      },
      hints: {
        strategyTitle: 'Critical without a strategy',
        strategyDetail: '{n} strategic or bottleneck item(s) without a purchasing strategy.',
        bottleneckTitle: 'Secure the bottlenecks',
        bottleneckDetail: '{names}',
        coveredTitle: 'Critical items covered',
        coveredDetail: 'All {n} strategic and bottleneck items have a strategy.',
      },
    },
  },
  hints(m, { regionOf, placed, value, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const list = placed(m);
    const of = (/** @type {string} */ id) => list.filter(it => { const r = regionOf(m, it); return r != null && r.id === id; });
    /** @type {Hint[]} */
    const out = [];
    const critical = [...of('strategic'), ...of('bottleneck')];
    if (critical.length && m.config.fields.some(f => f.key === 'strategy')) {
      const none = critical.filter(it => !String(value(it, 'strategy') || '').trim());
      out.push(none.length
        ? { key: 'strategy', state: 'warn', title: H.strategyTitle, detail: fill(H.strategyDetail, { n: none.length }), items: none.map(i => i.id) }
        : { key: 'strategy', state: 'ok', title: H.coveredTitle, detail: fill(H.coveredDetail, { n: critical.length }) });
    }
    const bottleneck = of('bottleneck');
    if (bottleneck.length) out.push({ key: 'bottleneck', state: 'open', title: H.bottleneckTitle, detail: fill(H.bottleneckDetail, { names: bottleneck.map(i => i.title.trim() || `#${i.no}`).join(', ') }), items: bottleneck.map(i => i.id) });
    return out;
  },
};
