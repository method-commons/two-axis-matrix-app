/*
 * BCG-Matrix (Boston-Consulting-Portfolio): Produkte bzw. Geschäftsfelder nach relativem
 * Marktanteil und Marktwachstum – Stars, Cash Cows, Question Marks, Poor Dogs. Hoher
 * Marktanteil steht wie üblich links; ein relativer Marktanteil von 1 heißt „so groß wie der
 * größte Wettbewerber“.
 */

/** @type {MethodDef} */
export const method = {
  id: 'bcg',
  order: 60,
  icon: '★',
  color: 'yellow',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 0, max: 2, step: 0.1, reverse: true },
  y: { min: 0, max: 20, step: 1 },
  split: { x: 1, y: 10 },
  regions: [
    { id: 'star', color: 'yellow', qx: 'high', qy: 'high' },
    { id: 'question', color: 'blue', qx: 'low', qy: 'high' },
    { id: 'cow', color: 'green', qx: 'high', qy: 'low' },
    { id: 'dog', color: 'gray', qx: 'low', qy: 'low' },
  ],
  fields: [
    { key: 'revenue', type: 'text' },
    // Ohne Farben: die Punkte zeigen die Farbe des Felds, nicht die der Strategie
    { key: 'strategy', type: 'choice', options: [{ id: 'build' }, { id: 'hold' }, { id: 'harvest' }, { id: 'divest' }] },
    { key: 'owner', type: 'person' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'BCG-Matrix',
      short: 'BCG',
      aka: 'Marktwachstum-Marktanteil-Portfolio, Boston-Matrix',
      description: 'Produkte nach Marktanteil und Marktwachstum einordnen: Stars, Cash Cows, Question Marks, Poor Dogs.',
      itemName: { one: 'Produkt', many: 'Produkte' },
      noteLabel: 'Begründung',
      x: { label: 'Relativer Marktanteil', low: 'gering', high: 'hoch' },
      y: { label: 'Marktwachstum (%)', low: 'gering', high: 'hoch' },
      regions: {
        star: { label: 'Stars', hint: 'Position halten, weiter investieren' },
        question: { label: 'Question Marks', hint: 'auswählen: ausbauen oder aufgeben' },
        cow: { label: 'Cash Cows', hint: 'Gewinne abschöpfen, wenig investieren' },
        dog: { label: 'Poor Dogs', hint: 'aufgeben oder neu ausrichten' },
      },
      fields: { revenue: 'Umsatzanteil', strategy: 'Normstrategie', owner: 'Verantwortlich' },
      options: { strategy: { build: 'ausbauen', hold: 'halten', harvest: 'abschöpfen', divest: 'aufgeben' } },
      leadQuestions: [
        'Womit verdienen wir heute das Geld – und womit morgen?',
        'Welche Question Marks können Stars werden, welche nicht?',
        'Wie groß ist unser Anteil im Vergleich zum größten Wettbewerber?',
      ],
      help: {
        paras: [
          'Die BCG-Matrix ordnet Produkte oder Geschäftsfelder nach dem relativen Marktanteil (eigener Anteil ÷ Anteil des größten Wettbewerbers) und dem Wachstum des Markts. Hoher Marktanteil steht wie üblich links.',
          'Ein ausgewogenes Portfolio finanziert mit den Cash Cows die Stars und ausgewählte Question Marks; Poor Dogs binden Mittel, ohne viel beizutragen.',
        ],
        list: [
          'Stars: Marktführer im Wachstumsmarkt – investieren, um die Position zu halten.',
          'Cash Cows: Marktführer im gesättigten Markt – Gewinne abschöpfen.',
          'Question Marks: kleiner Anteil im Wachstumsmarkt – gezielt ausbauen oder aufgeben.',
          'Poor Dogs: kleiner Anteil im gesättigten Markt – aufgeben oder neu ausrichten.',
          'Relativer Marktanteil 1 = so groß wie der größte Wettbewerber (Trennlinie anpassbar).',
        ],
      },
      hints: {
        cowTitle: 'Keine Cash Cow',
        cowDetail: 'Ohne Cash Cow fehlt die Finanzierung für Stars und Question Marks.',
        questionTitle: 'Question Marks entscheiden',
        questionDetail: '{n} Produkt(e) ohne Normstrategie – ausbauen oder aufgeben?',
        dogTitle: 'Poor Dogs prüfen',
        dogDetail: '{names} – aufgeben oder neu ausrichten?',
        balanceTitle: 'Portfolio trägt sich',
        balanceDetail: '{cows} Cash Cow(s) für {stars} Star(s) und {questions} Question Mark(s).',
      },
    },
    en: {
      name: 'BCG matrix',
      short: 'BCG',
      aka: 'Growth-share matrix, Boston matrix',
      description: 'Place products by market share and market growth: stars, cash cows, question marks, dogs.',
      itemName: { one: 'product', many: 'products' },
      noteLabel: 'Rationale',
      x: { label: 'Relative market share', low: 'low', high: 'high' },
      y: { label: 'Market growth (%)', low: 'low', high: 'high' },
      regions: {
        star: { label: 'Stars', hint: 'hold position, keep investing' },
        question: { label: 'Question marks', hint: 'choose: build or divest' },
        cow: { label: 'Cash cows', hint: 'harvest profits, invest little' },
        dog: { label: 'Dogs', hint: 'divest or reposition' },
      },
      fields: { revenue: 'Share of revenue', strategy: 'Standard strategy', owner: 'Owner' },
      options: { strategy: { build: 'build', hold: 'hold', harvest: 'harvest', divest: 'divest' } },
      leadQuestions: [
        'What earns the money today – and what will tomorrow?',
        'Which question marks can become stars, and which cannot?',
        'How big is our share compared with the largest competitor?',
      ],
      help: {
        paras: [
          'The BCG matrix places products or business units by relative market share (own share ÷ share of the largest competitor) and market growth. As usual, high market share is on the left.',
          'A balanced portfolio uses the cash cows to fund the stars and selected question marks; dogs tie up resources without contributing much.',
        ],
        list: [
          'Stars: leader in a growing market – invest to hold the position.',
          'Cash cows: leader in a mature market – harvest profits.',
          'Question marks: small share in a growing market – build selectively or divest.',
          'Dogs: small share in a mature market – divest or reposition.',
          'Relative market share 1 = as large as the largest competitor (dividing line adjustable).',
        ],
      },
      hints: {
        cowTitle: 'No cash cow',
        cowDetail: 'Without a cash cow, nothing funds the stars and question marks.',
        questionTitle: 'Decide on question marks',
        questionDetail: '{n} product(s) without a standard strategy – build or divest?',
        dogTitle: 'Review the dogs',
        dogDetail: '{names} – divest or reposition?',
        balanceTitle: 'Portfolio funds itself',
        balanceDetail: '{cows} cash cow(s) for {stars} star(s) and {questions} question mark(s).',
      },
    },
  },
  hints(m, { items, inRegion, hasField, isEmpty, names, hint }) {
    if (!items.length) return [];
    const cows = inRegion('cow');
    const stars = inRegion('star');
    const questions = inRegion('question');
    /** @type {Hint[]} */
    const out = [];
    out.push(cows.length ? hint('balance', 'ok', { cows: cows.length, stars: stars.length, questions: questions.length }) : hint('cow', 'warn'));
    if (hasField('strategy')) {
      const open = questions.filter(it => isEmpty(it, 'strategy'));
      if (open.length) out.push(hint('question', 'warn', { n: open.length }, open));
    }
    const dogs = inRegion('dog');
    if (dogs.length) out.push(hint('dog', 'open', { names: names(dogs) }, dogs));
    return out;
  },
};
