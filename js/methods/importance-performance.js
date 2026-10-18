/*
 * Wichtigkeit/Zufriedenheit (Importance-Performance-Analyse): Merkmale eines Angebots nach
 * Zufriedenheit (Leistung) und Wichtigkeit, z. B. aus einer Befragung (Mittelwerte 1–5) –
 * konzentrieren, weiter so, geringe Priorität, zu viel des Guten. Rangfolge nach
 * Wichtigkeit ÷ Zufriedenheit (größte Lücke zuerst).
 */

/** @type {MethodDef} */
export const method = {
  id: 'importance-performance',
  order: 120,
  icon: '◎',
  color: 'blue',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 1, max: 5, step: 0.1 },
  y: { min: 1, max: 5, step: 0.1 },
  split: { x: 3, y: 3 },
  regions: [
    { id: 'focus', color: 'red', qx: 'low', qy: 'high' },
    { id: 'keep', color: 'green', qx: 'high', qy: 'high' },
    { id: 'low', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'overkill', color: 'blue', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'measure', type: 'textarea' },
    { key: 'owner', type: 'person' },
  ],
  rank: 'ratio',
  texts: {
    de: {
      name: 'Wichtigkeit / Zufriedenheit',
      short: 'Wichtigkeit/Zufr.',
      aka: 'Importance-Performance-Analyse (IPA), Kundenzufriedenheitsportfolio',
      description: 'Merkmale nach Wichtigkeit und Zufriedenheit: hier konzentrieren, weiter so, zu viel des Guten.',
      itemName: { one: 'Merkmal', many: 'Merkmale' },
      noteLabel: 'Quelle / Beleg',
      x: { label: 'Zufriedenheit', low: 'gering', high: 'hoch' },
      y: { label: 'Wichtigkeit', low: 'gering', high: 'hoch' },
      regions: {
        focus: { label: 'Hier konzentrieren', hint: 'wichtig, aber unzufrieden – verbessern' },
        keep: { label: 'Weiter so', hint: 'wichtig und zufrieden – halten' },
        low: { label: 'Geringe Priorität', hint: 'unwichtig und unzufrieden – vorerst lassen' },
        overkill: { label: 'Zu viel des Guten', hint: 'unwichtig, aber zufrieden – Aufwand senken?' },
      },
      fields: { measure: 'Maßnahme', owner: 'Verantwortlich' },
      leadQuestions: [
        'Woher stammen die Werte – Befragung, Bewertungen, Beschwerden?',
        'Wo ist die Lücke zwischen Wichtigkeit und Zufriedenheit am größten?',
        'Wofür betreiben wir Aufwand, den niemand vermissen würde?',
      ],
      help: {
        paras: [
          'Die Importance-Performance-Analyse stellt für jedes Merkmal eines Angebots zwei Werte gegenüber: Wie wichtig ist es den Kunden, und wie zufrieden sind sie damit? Meist sind das Mittelwerte aus einer Befragung (z. B. 1–5).',
          'Verbessert wird zuerst, was wichtig ist, aber schlecht abschneidet. Was unwichtig ist und trotzdem sehr gut, bindet vielleicht unnötig Aufwand.',
        ],
        list: [
          'Werte direkt eintippen (Seitenleiste oder Liste) oder Merkmale ziehen.',
          'Die Trennlinien liegen bei 3; oft sinnvoller ist der Mittelwert aller Merkmale (unter „Achsen & Bereiche“).',
          'Rangfolge: Wichtigkeit ÷ Zufriedenheit – größte Lücke zuerst.',
        ],
      },
      hints: {
        focusTitle: 'Hier konzentrieren',
        focusDetail: '{names}',
        measureTitle: 'Ohne Maßnahme',
        measureDetail: '{n} Merkmal(e) in „Hier konzentrieren“ ohne Maßnahme.',
        overkillTitle: 'Zu viel des Guten?',
        overkillDetail: '{names} – Aufwand senken, ohne dass es auffällt?',
        fineTitle: 'Keine großen Lücken',
        fineDetail: 'Nichts Wichtiges schneidet schlecht ab.',
      },
    },
    en: {
      name: 'Importance / performance',
      short: 'Importance/perf.',
      aka: 'Importance-performance analysis (IPA), customer satisfaction portfolio',
      description: 'Attributes by importance and satisfaction: concentrate here, keep up, possible overkill.',
      itemName: { one: 'attribute', many: 'attributes' },
      noteLabel: 'Source / evidence',
      x: { label: 'Satisfaction', low: 'low', high: 'high' },
      y: { label: 'Importance', low: 'low', high: 'high' },
      regions: {
        focus: { label: 'Concentrate here', hint: 'important but unsatisfied – improve' },
        keep: { label: 'Keep up the good work', hint: 'important and satisfied – maintain' },
        low: { label: 'Low priority', hint: 'unimportant and unsatisfied – leave for now' },
        overkill: { label: 'Possible overkill', hint: 'unimportant but satisfied – reduce effort?' },
      },
      fields: { measure: 'Action', owner: 'Owner' },
      leadQuestions: [
        'Where do the values come from – survey, reviews, complaints?',
        'Where is the gap between importance and satisfaction largest?',
        'Where do we spend effort that nobody would miss?',
      ],
      help: {
        paras: [
          'The importance-performance analysis compares two values for each attribute of an offer: how important is it to customers, and how satisfied are they with it? These are usually averages from a survey (e.g. 1–5).',
          'Improve first what is important but performs poorly. What is unimportant but very good may tie up unnecessary effort.',
        ],
        list: [
          'Type values directly (side panel or list) or drag attributes.',
          'The dividing lines are at 3; the average of all attributes is often more useful (under “Axes & areas”).',
          'Ranking: importance ÷ satisfaction – largest gap first.',
        ],
      },
      hints: {
        focusTitle: 'Concentrate here',
        focusDetail: '{names}',
        measureTitle: 'Without action',
        measureDetail: '{n} attribute(s) in “Concentrate here” without an action.',
        overkillTitle: 'Possible overkill?',
        overkillDetail: '{names} – reduce effort without anyone noticing?',
        fineTitle: 'No large gaps',
        fineDetail: 'Nothing important performs poorly.',
      },
    },
  },
  hints(m, { regionOf, placed, value, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const list = placed(m);
    if (!list.length) return [];
    const of = (/** @type {string} */ id) => list.filter(it => { const r = regionOf(m, it); return r != null && r.id === id; });
    const names = (/** @type {Item[]} */ items) => items.map(i => i.title.trim() || `#${i.no}`).join(', ');
    /** @type {Hint[]} */
    const out = [];
    const focus = of('focus');
    if (focus.length) {
      out.push({ key: 'focus', state: 'warn', title: H.focusTitle, detail: fill(H.focusDetail, { names: names(focus) }), items: focus.map(i => i.id) });
      if (m.config.fields.some(f => f.key === 'measure')) {
        const none = focus.filter(it => !String(value(it, 'measure') || '').trim());
        if (none.length) out.push({ key: 'measure', state: 'open', title: H.measureTitle, detail: fill(H.measureDetail, { n: none.length }), items: none.map(i => i.id) });
      }
    } else {
      out.push({ key: 'fine', state: 'ok', title: H.fineTitle, detail: H.fineDetail });
    }
    const overkill = of('overkill');
    if (overkill.length) out.push({ key: 'overkill', state: 'open', title: H.overkillTitle, detail: fill(H.overkillDetail, { names: names(overkill) }), items: overkill.map(i => i.id) });
    return out;
  },
};
