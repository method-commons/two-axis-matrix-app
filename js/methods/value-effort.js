/*
 * Wert/Aufwand-Matrix (Nutzen-Aufwand, Impact/Effort): Ideen oder Maßnahmen stufenlos
 * bewerten; Quick Wins zuerst, Zeitfresser streichen. Rangfolge nach Wert ÷ Aufwand.
 */

/** Abstand zur Trennlinie, ab dem eine Einordnung als „knapp“ gilt (Anteil der Achse). */
const NEAR = 0.05;

/** @type {MethodDef} */
export const method = {
  id: 'value-effort',
  order: 20,
  icon: '◆',
  color: 'green',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 0, max: 10, step: 0.5 },
  y: { min: 0, max: 10, step: 0.5 },
  split: { x: 5, y: 5 },
  regions: [
    { id: 'quick', color: 'green', qx: 'low', qy: 'high' },
    { id: 'major', color: 'blue', qx: 'high', qy: 'high' },
    { id: 'fill', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'sink', color: 'red', qx: 'high', qy: 'low' },
  ],
  fields: [],
  rank: 'ratio',
  texts: {
    de: {
      name: 'Wert / Aufwand',
      short: 'Wert/Aufwand',
      aka: 'Nutzen-Aufwand-Matrix, Impact/Effort, Prioritäten-Matrix',
      description: 'Ideen und Maßnahmen priorisieren: Quick Wins zuerst, Zeitfresser streichen.',
      itemName: { one: 'Idee', many: 'Ideen' },
      noteLabel: 'Begründung',
      x: { label: 'Aufwand', low: 'gering', high: 'hoch' },
      y: { label: 'Wert / Nutzen', low: 'gering', high: 'hoch' },
      regions: {
        quick: { label: 'Quick Wins', hint: 'zuerst umsetzen' },
        major: { label: 'Großprojekte', hint: 'sorgfältig planen' },
        fill: { label: 'Lückenfüller', hint: 'nebenbei, wenn Zeit ist' },
        sink: { label: 'Zeitfresser', hint: 'streichen' },
      },
      leadQuestions: [
        'Was bringt am meisten für den geringsten Einsatz?',
        'Woran messen wir den Wert – Umsatz, Zufriedenheit, Zeitersparnis?',
        'Ist der Aufwand geschätzt oder geraten?',
      ],
      help: {
        paras: [
          'Die Wert/Aufwand-Matrix ordnet Ideen nach ihrem erwarteten Nutzen und dem nötigen Einsatz. Oben liegt das Wertvolle, links das Günstige – links oben also die Quick Wins.',
          'Die Werte sind Schätzungen – am besten im Team und mit kurzer Begründung je Idee. Ideen nahe der Trennlinie verdienen einen zweiten Blick.',
        ],
        list: [
          'Quick Wins: hoher Wert, wenig Aufwand – zuerst umsetzen.',
          'Großprojekte: hoher Wert, viel Aufwand – planen und in Schritte zerlegen.',
          'Lückenfüller: wenig Wert, wenig Aufwand – nebenbei.',
          'Zeitfresser: wenig Wert, viel Aufwand – streichen.',
        ],
      },
      hints: {
        quickTitle: 'Mit Quick Wins beginnen',
        quickDetail: '{n} Quick Win(s), zuerst: {first}.',
        noQuickTitle: 'Keine Quick Wins',
        noQuickDetail: 'Gibt es kleinere Varianten der wertvollen Ideen?',
        nearTitle: 'Knapp an der Grenze',
        nearDetail: '{n} Idee(n) liegen nahe einer Trennlinie – Schätzung prüfen.',
        sinkTitle: 'Zeitfresser streichen',
        sinkDetail: '{n} Idee(n) mit viel Aufwand und wenig Wert.',
      },
    },
    en: {
      name: 'Value / effort',
      short: 'Value/effort',
      aka: 'Impact/effort matrix, benefit/effort, priority matrix',
      description: 'Prioritise ideas and actions: quick wins first, drop the time sinks.',
      itemName: { one: 'idea', many: 'ideas' },
      noteLabel: 'Rationale',
      x: { label: 'Effort', low: 'low', high: 'high' },
      y: { label: 'Value / impact', low: 'low', high: 'high' },
      regions: {
        quick: { label: 'Quick wins', hint: 'do first' },
        major: { label: 'Major projects', hint: 'plan carefully' },
        fill: { label: 'Fill-ins', hint: 'when there is time' },
        sink: { label: 'Time sinks', hint: 'drop' },
      },
      leadQuestions: [
        'What brings the most for the least effort?',
        'How do we measure value – revenue, satisfaction, time saved?',
        'Is the effort estimated or guessed?',
      ],
      help: {
        paras: [
          'The value/effort matrix arranges ideas by their expected benefit and the effort needed. The valuable ideas are at the top, the cheap ones on the left – so the quick wins are top left.',
          'Values are estimates – ideally made as a team with a short rationale per idea. Ideas close to a dividing line deserve a second look.',
        ],
        list: [
          'Quick wins: high value, low effort – do first.',
          'Major projects: high value, high effort – plan and split into steps.',
          'Fill-ins: low value, low effort – on the side.',
          'Time sinks: low value, high effort – drop.',
        ],
      },
      hints: {
        quickTitle: 'Start with quick wins',
        quickDetail: '{n} quick win(s), first: {first}.',
        noQuickTitle: 'No quick wins',
        noQuickDetail: 'Are there smaller versions of the valuable ideas?',
        nearTitle: 'Close to a line',
        nearDetail: '{n} idea(s) are close to a dividing line – check the estimate.',
        sinkTitle: 'Drop the time sinks',
        sinkDetail: '{n} idea(s) with high effort and low value.',
      },
    },
  },
  hints(m, { items, inRegion, hint }) {
    const c = m.config;
    if (!items.length) return [];
    /** @type {Hint[]} */
    const out = [];
    const ratio = (/** @type {Item} */ it) => /** @type {number} */ (it.y) / Math.max(/** @type {number} */ (it.x), 0.5);
    const quick = inRegion('quick').sort((a, b) => ratio(b) - ratio(a));
    out.push(quick.length
      ? hint('quick', 'ok', { n: quick.length, first: quick[0].title.trim() || `#${quick[0].no}` }, quick)
      : hint('quick', 'warn', {}, undefined, 'noQuick'));
    const nx = NEAR * (c.x.max - c.x.min);
    const ny = NEAR * (c.y.max - c.y.min);
    const near = items.filter(it => Math.abs(/** @type {number} */ (it.x) - c.split.x) < nx || Math.abs(/** @type {number} */ (it.y) - c.split.y) < ny);
    if (near.length) out.push(hint('near', 'warn', { n: near.length }, near));
    const sink = inRegion('sink');
    if (sink.length) out.push(hint('sink', 'open', { n: sink.length }, sink));
    return out;
  },
};
