/*
 * SWOT-Analyse: Faktoren nach Wirkung (hilfreich/schädlich) und Ursprung (intern/extern) –
 * Stärken, Schwächen, Chancen, Risiken. Zwei Stufen je Achse, Karten; Strategie je Faktor
 * (TOWS) als Textfeld.
 */

/** @type {MethodDef} */
export const method = {
  id: 'swot',
  order: 100,
  icon: '⊞',
  color: 'green',
  layout: 'quadrants',
  view: 'board',
  x: { min: 1, max: 2, step: 1 },
  y: { min: 1, max: 2, step: 1 },
  split: { x: 1.5, y: 1.5 },
  regions: [
    { id: 'strengths', color: 'green', qx: 'low', qy: 'high' },
    { id: 'weaknesses', color: 'red', qx: 'high', qy: 'high' },
    { id: 'opportunities', color: 'blue', qx: 'low', qy: 'low' },
    { id: 'threats', color: 'orange', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'strategy', type: 'textarea' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'SWOT-Analyse',
      short: 'SWOT',
      aka: 'Stärken-Schwächen-Chancen-Risiken, TOWS',
      description: 'Stärken, Schwächen, Chancen und Risiken sammeln und daraus Strategien ableiten.',
      itemName: { one: 'Faktor', many: 'Faktoren' },
      noteLabel: 'Beleg / Beschreibung',
      x: { label: 'Wirkung', low: 'hilfreich', high: 'schädlich' },
      y: { label: 'Ursprung', low: 'extern (Umfeld)', high: 'intern (wir selbst)' },
      regions: {
        strengths: { label: 'Stärken', hint: 'intern, hilfreich – ausbauen und nutzen' },
        weaknesses: { label: 'Schwächen', hint: 'intern, schädlich – abbauen' },
        opportunities: { label: 'Chancen', hint: 'extern, hilfreich – ergreifen' },
        threats: { label: 'Risiken', hint: 'extern, schädlich – abwehren' },
      },
      fields: { strategy: 'Strategie (z. B. Stärke nutzen, um Chance zu ergreifen)' },
      leadQuestions: [
        'Was können wir besser als andere – und was schlechter?',
        'Was verändert sich im Umfeld: Kunden, Wettbewerb, Regeln, Preise?',
        'Welche Stärke hilft, eine Chance zu nutzen oder ein Risiko abzuwehren?',
      ],
      help: {
        paras: [
          'Die SWOT-Analyse sammelt interne Faktoren (Stärken, Schwächen – im eigenen Einfluss) und externe Faktoren (Chancen, Risiken – im Umfeld). Sie ist ein Ausgangspunkt für Strategien, kein Ergebnis.',
          'Aus den Kombinationen entstehen Strategien (TOWS): Stärken nutzen, um Chancen zu ergreifen; Schwächen abbauen, um Chancen zu nutzen; Stärken nutzen, um Risiken abzuwehren; Schwächen abbauen, um Risiken zu vermeiden.',
        ],
        list: [
          'Konkret und belegbar formulieren („12 Stammkunden pro Tag“ statt „beliebt“).',
          'Intern = beeinflussbar, extern = nicht beeinflussbar.',
          'Je Faktor eine Strategie notieren; Tasten 1–4 legen in die Felder.',
        ],
      },
      hints: {
        emptyTitle: 'Feld leer',
        emptyDetail: 'Noch nichts unter: {names}.',
        strategyTitle: 'Strategien ableiten',
        strategyDetail: '{n} Faktor(en) ohne Strategie.',
        completeTitle: 'Alle Felder gefüllt',
        completeDetail: 'Stärken, Schwächen, Chancen und Risiken sind gesammelt.',
      },
    },
    en: {
      name: 'SWOT analysis',
      short: 'SWOT',
      aka: 'Strengths, weaknesses, opportunities, threats, TOWS',
      description: 'Collect strengths, weaknesses, opportunities and threats and derive strategies.',
      itemName: { one: 'factor', many: 'factors' },
      noteLabel: 'Evidence / description',
      x: { label: 'Effect', low: 'helpful', high: 'harmful' },
      y: { label: 'Origin', low: 'external (environment)', high: 'internal (ourselves)' },
      regions: {
        strengths: { label: 'Strengths', hint: 'internal, helpful – build on them' },
        weaknesses: { label: 'Weaknesses', hint: 'internal, harmful – reduce them' },
        opportunities: { label: 'Opportunities', hint: 'external, helpful – seize them' },
        threats: { label: 'Threats', hint: 'external, harmful – fend them off' },
      },
      fields: { strategy: 'Strategy (e.g. use a strength to seize an opportunity)' },
      leadQuestions: [
        'What can we do better than others – and what worse?',
        'What is changing around us: customers, competition, rules, prices?',
        'Which strength helps to seize an opportunity or fend off a threat?',
      ],
      help: {
        paras: [
          'The SWOT analysis collects internal factors (strengths, weaknesses – within our control) and external factors (opportunities, threats – in the environment). It is a starting point for strategies, not a result.',
          'Strategies come from the combinations (TOWS): use strengths to seize opportunities; reduce weaknesses to use opportunities; use strengths to fend off threats; reduce weaknesses to avoid threats.',
        ],
        list: [
          'Be concrete and verifiable (“12 regulars a day” rather than “popular”).',
          'Internal = within our control, external = not within our control.',
          'Note a strategy per factor; keys 1–4 place items in the fields.',
        ],
      },
      hints: {
        emptyTitle: 'Empty field',
        emptyDetail: 'Nothing yet under: {names}.',
        strategyTitle: 'Derive strategies',
        strategyDetail: '{n} factor(s) without a strategy.',
        completeTitle: 'All fields filled',
        completeDetail: 'Strengths, weaknesses, opportunities and threats are collected.',
      },
    },
  },
  hints(m, { items, regionId, hasField, isEmpty, hint }) {
    if (!items.length) return [];
    const used = new Set(items.map(regionId));
    const empty = m.config.regions.filter(r => !used.has(r.id));
    /** @type {Hint[]} */
    const out = [];
    out.push(empty.length ? hint('empty', 'open', { names: empty.map(r => r.label || r.id).join(', ') }) : hint('complete', 'ok'));
    if (hasField('strategy')) {
      const none = items.filter(it => isEmpty(it, 'strategy'));
      if (none.length) out.push(hint('strategy', 'open', { n: none.length }, none));
    }
    return out;
  },
};
