/*
 * Risikomatrix: Risiken nach Wahrscheinlichkeit und Auswirkung (5 × 5) bewerten; Risikostufe
 * aus dem Produkt, Strategie, Maßnahme und Bewertung nach der Maßnahme (Restrisiko).
 */

/** @type {MethodDef} */
export const method = {
  id: 'risk',
  order: 40,
  icon: '▦',
  color: 'orange',
  layout: 'grid',
  view: 'heatmap',
  x: { min: 1, max: 5, step: 1 },
  y: { min: 1, max: 5, step: 1 },
  regions: [
    { id: 'low', color: 'green', min: 0 },
    { id: 'medium', color: 'yellow', min: 5 },
    { id: 'high', color: 'orange', min: 10 },
    { id: 'critical', color: 'red', min: 15 },
  ],
  fields: [
    { key: 'response', type: 'choice', options: [{ id: 'avoid' }, { id: 'reduce' }, { id: 'transfer' }, { id: 'accept' }] },
    { key: 'measure', type: 'textarea' },
    { key: 'owner', type: 'person' },
    { key: 'residual', type: 'point' },
  ],
  rank: 'product',
  texts: {
    de: {
      name: 'Risikomatrix',
      short: 'Risiko',
      aka: 'Risikobewertung, Wahrscheinlichkeits-Auswirkungs-Matrix, Heatmap',
      description: 'Risiken nach Wahrscheinlichkeit und Auswirkung bewerten, Maßnahmen und Restrisiko.',
      itemName: { one: 'Risiko', many: 'Risiken' },
      noteLabel: 'Ursache / Folge',
      x: { label: 'Auswirkung', low: 'unbedeutend', high: 'existenziell' },
      y: { label: 'Wahrscheinlichkeit', low: 'sehr selten', high: 'sehr wahrscheinlich' },
      regions: {
        low: { label: 'Niedrig', hint: 'beobachten' },
        medium: { label: 'Mittel', hint: 'Maßnahmen prüfen' },
        high: { label: 'Hoch', hint: 'Maßnahmen festlegen' },
        critical: { label: 'Sehr hoch', hint: 'sofort handeln' },
      },
      fields: { response: 'Strategie', measure: 'Maßnahme', owner: 'Verantwortlich', residual: 'Nach Maßnahme' },
      options: { response: { avoid: 'vermeiden', reduce: 'vermindern', transfer: 'übertragen', accept: 'akzeptieren' } },
      leadQuestions: [
        'Was kann schiefgehen – und woran merken wir es früh?',
        'Wie oft ist das schon passiert, bei uns oder anderen?',
        'Was kostet es, wenn es eintritt – Geld, Zeit, Ruf, Gesundheit?',
      ],
      help: {
        paras: [
          'Die Risikomatrix bewertet jedes Risiko mit zwei Zahlen: Wie wahrscheinlich tritt es ein, und wie schwer wiegt es dann? Das Produkt ergibt die Risikostufe.',
          'Für hohe Risiken wird eine Strategie gewählt (vermeiden, vermindern, übertragen, akzeptieren) und eine Maßnahme festgelegt. Die Bewertung nach der Maßnahme zeigt das Restrisiko (netto).',
        ],
        list: [
          'Stufen: niedrig 1–4, mittel 5–9, hoch 10–14, sehr hoch 15–25 (anpassbar).',
          'Zelle anklicken oder Risiko hineinziehen, um es zu bewerten.',
          '„Nach Maßnahme“ setzt die Netto-Bewertung; die Matrix zeigt sie gestrichelt.',
        ],
      },
      hints: {
        measureTitle: 'Hohe Risiken ohne Maßnahme',
        measureDetail: '{names}',
        residualTitle: 'Restrisiko nicht bewertet',
        residualDetail: '{n} Risiko(s) mit Maßnahme, aber ohne Bewertung danach.',
        notLowerTitle: 'Maßnahme ohne Wirkung',
        notLowerDetail: '{n} Risiko(s) sind nach der Maßnahme nicht niedriger bewertet.',
        acceptTitle: 'Sehr hohes Risiko akzeptiert',
        acceptDetail: '{n} sehr hohe(s) Risiko(s) mit Strategie „akzeptieren“ – bewusst entschieden?',
        coveredTitle: 'Hohe Risiken abgedeckt',
        coveredDetail: 'Alle {n} hohen und sehr hohen Risiken haben eine Maßnahme.',
      },
    },
    en: {
      name: 'Risk matrix',
      short: 'Risk',
      aka: 'Risk assessment, probability/impact matrix, heat map',
      description: 'Rate risks by probability and impact, with actions and residual risk.',
      itemName: { one: 'risk', many: 'risks' },
      noteLabel: 'Cause / consequence',
      x: { label: 'Impact', low: 'negligible', high: 'severe' },
      y: { label: 'Probability', low: 'very rare', high: 'very likely' },
      regions: {
        low: { label: 'Low', hint: 'monitor' },
        medium: { label: 'Medium', hint: 'consider actions' },
        high: { label: 'High', hint: 'define actions' },
        critical: { label: 'Very high', hint: 'act now' },
      },
      fields: { response: 'Response', measure: 'Action', owner: 'Owner', residual: 'After action' },
      options: { response: { avoid: 'avoid', reduce: 'reduce', transfer: 'transfer', accept: 'accept' } },
      leadQuestions: [
        'What can go wrong – and how do we notice early?',
        'How often has it happened, to us or to others?',
        'What does it cost if it happens – money, time, reputation, health?',
      ],
      help: {
        paras: [
          'The risk matrix rates each risk with two numbers: how likely is it to happen, and how severe would it be? The product gives the risk level.',
          'For high risks, choose a response (avoid, reduce, transfer, accept) and define an action. The rating after the action shows the residual (net) risk.',
        ],
        list: [
          'Levels: low 1–4, medium 5–9, high 10–14, very high 15–25 (adjustable).',
          'Click a cell or drag a risk into it to rate it.',
          '“After action” sets the net rating; the matrix shows it dashed.',
        ],
      },
      hints: {
        measureTitle: 'High risks without action',
        measureDetail: '{names}',
        residualTitle: 'Residual risk not rated',
        residualDetail: '{n} risk(s) with an action but no rating after it.',
        notLowerTitle: 'Action without effect',
        notLowerDetail: '{n} risk(s) are not rated lower after the action.',
        acceptTitle: 'Very high risk accepted',
        acceptDetail: '{n} very high risk(s) with response “accept” – a conscious decision?',
        coveredTitle: 'High risks covered',
        coveredDetail: 'All {n} high and very high risks have an action.',
      },
    },
  },
  hints(m, { items, inRegion, hasField, value, isEmpty, names, hint }) {
    const high = inRegion('high', 'critical');
    /** @type {Hint[]} */
    const out = [];
    if (hasField('measure')) {
      const none = high.filter(it => isEmpty(it, 'measure'));
      if (none.length) out.push(hint('measure', 'warn', { names: names(none) }, none));
      else if (high.length) out.push(hint('measure', 'ok', { n: high.length }, undefined, 'covered'));
      if (hasField('residual')) {
        const withMeasure = items.filter(it => !isEmpty(it, 'measure'));
        const unrated = withMeasure.filter(it => !value(it, 'residual'));
        if (unrated.length) out.push(hint('residual', 'open', { n: unrated.length }, unrated));
        const notLower = withMeasure.filter(it => {
          const p = /** @type {Point | null} */ (value(it, 'residual'));
          return p && p.x * p.y >= /** @type {number} */ (it.x) * /** @type {number} */ (it.y);
        });
        if (notLower.length) out.push(hint('notLower', 'warn', { n: notLower.length }, notLower));
      }
    }
    if (hasField('response')) {
      const accepted = inRegion('critical').filter(it => value(it, 'response') === 'accept');
      if (accepted.length) out.push(hint('accept', 'warn', { n: accepted.length }, accepted));
    }
    return out;
  },
};
