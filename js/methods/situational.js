/*
 * Situatives Führen (nach Hersey/Blanchard): je Person und Aufgabe Kompetenz und Motivation
 * einschätzen – daraus folgt der Führungsstil: anleiten, überzeugen, unterstützen,
 * delegieren. Einordnen per Fragen oder Ziehen.
 */

/** @type {MethodDef} */
export const method = {
  id: 'situational',
  order: 130,
  icon: '⇄',
  color: 'violet',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 1, max: 5, step: 0.5 },
  y: { min: 1, max: 5, step: 0.5 },
  split: { x: 3, y: 3 },
  regions: [
    { id: 'directing', color: 'orange', qx: 'low', qy: 'high' },
    { id: 'delegating', color: 'green', qx: 'high', qy: 'high' },
    { id: 'coaching', color: 'red', qx: 'low', qy: 'low' },
    { id: 'supporting', color: 'blue', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'task', type: 'text' },
    { key: 'next', type: 'textarea' },
  ],
  questions: [
    { id: 'guidance', axis: 'x' },
    { id: 'unsure', axis: 'x' },
    { id: 'hesitant', axis: 'y' },
    { id: 'distant', axis: 'y' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Situatives Führen',
      short: 'Sit. Führen',
      aka: 'Reifegradmodell nach Hersey/Blanchard, Kompetenz-Motivation-Matrix',
      description: 'Je Person und Aufgabe Kompetenz und Motivation einschätzen und den passenden Führungsstil wählen.',
      itemName: { one: 'Einschätzung', many: 'Einschätzungen' },
      noteLabel: 'Beobachtung',
      x: { label: 'Kompetenz (für diese Aufgabe)', low: 'gering', high: 'hoch' },
      y: { label: 'Motivation (für diese Aufgabe)', low: 'gering', high: 'hoch' },
      regions: {
        directing: { label: 'Anleiten', hint: 'genau erklären, eng begleiten' },
        delegating: { label: 'Delegieren', hint: 'Verantwortung übergeben, Ergebnis vereinbaren' },
        coaching: { label: 'Überzeugen', hint: 'erklären warum, ermutigen, gemeinsam üben' },
        supporting: { label: 'Unterstützen', hint: 'beteiligen, zuhören, Vertrauen stärken' },
      },
      fields: { task: 'Aufgabe', next: 'Nächster Schritt' },
      questions: {
        guidance: 'Braucht bei dieser Aufgabe noch Anleitung',
        unsure: 'Macht bei dieser Aufgabe noch Fehler',
        hesitant: 'Zögert oder braucht Ermutigung',
        distant: 'Wirkt bei dieser Aufgabe wenig engagiert',
      },
      leadQuestions: [
        'Geht es um diese eine Aufgabe – nicht um die Person insgesamt?',
        'Fehlt es am Können oder am Wollen bzw. Zutrauen?',
        'Was braucht die Person, um eine Stufe weiterzukommen?',
      ],
      help: {
        paras: [
          'Situatives Führen passt den Führungsstil an den Entwicklungsstand einer Person bei einer bestimmten Aufgabe an: Wer etwas noch nicht kann, braucht Anleitung; wer es kann und will, bekommt Verantwortung.',
          'Eingeschätzt wird je Aufgabe – dieselbe Person kann bei der Kasse delegiert werden und bei der Fritteuse noch angeleitet. Ziel ist, dass Einschätzungen mit der Zeit Richtung „Delegieren“ wandern.',
        ],
        list: [
          'Anleiten: geringe Kompetenz, hohe Motivation – klare Anweisungen, eng begleiten.',
          'Überzeugen: geringe Kompetenz, geringe Motivation – erklären, ermutigen, üben.',
          'Unterstützen: hohe Kompetenz, geringe Motivation – beteiligen, Zutrauen stärken.',
          'Delegieren: hohe Kompetenz, hohe Motivation – Verantwortung übergeben.',
          'Fragen beantworten (1 = trifft zu … 5 = trifft nicht zu) – daraus ergibt sich die Position.',
        ],
      },
      hints: {
        nextTitle: 'Ohne nächsten Schritt',
        nextDetail: '{n} Einschätzung(en) außerhalb von „Delegieren“ ohne nächsten Schritt.',
        delegateTitle: 'Bereit für mehr Verantwortung',
        delegateDetail: '{names}',
        unansweredTitle: 'Ohne Fragen eingeschätzt',
        unansweredDetail: '{n} Einschätzung(en) nur geschätzt.',
      },
    },
    en: {
      name: 'Situational leadership',
      short: 'Sit. leadership',
      aka: 'Hersey-Blanchard model, competence/commitment matrix',
      description: 'Assess competence and commitment per person and task and choose the matching leadership style.',
      itemName: { one: 'assessment', many: 'assessments' },
      noteLabel: 'Observation',
      x: { label: 'Competence (for this task)', low: 'low', high: 'high' },
      y: { label: 'Commitment (for this task)', low: 'low', high: 'high' },
      regions: {
        directing: { label: 'Directing', hint: 'explain exactly, supervise closely' },
        delegating: { label: 'Delegating', hint: 'hand over responsibility, agree the outcome' },
        coaching: { label: 'Coaching', hint: 'explain why, encourage, practise together' },
        supporting: { label: 'Supporting', hint: 'involve, listen, build confidence' },
      },
      fields: { task: 'Task', next: 'Next step' },
      questions: {
        guidance: 'Still needs guidance for this task',
        unsure: 'Still makes mistakes in this task',
        hesitant: 'Hesitates or needs encouragement',
        distant: 'Seems disengaged in this task',
      },
      leadQuestions: [
        'Is this about this one task – not the person as a whole?',
        'Is it a lack of skill or of will and confidence?',
        'What does the person need to move up one stage?',
      ],
      help: {
        paras: [
          'Situational leadership adapts the leadership style to a person’s development level for a specific task: someone who cannot yet do it needs direction; someone who can and wants to gets responsibility.',
          'The assessment is per task – the same person can be delegated the till and still be directed at the fryer. Over time, assessments should move towards “Delegating”.',
        ],
        list: [
          'Directing: low competence, high commitment – clear instructions, close supervision.',
          'Coaching: low competence, low commitment – explain, encourage, practise.',
          'Supporting: high competence, low commitment – involve, build confidence.',
          'Delegating: high competence, high commitment – hand over responsibility.',
          'Answer the questions (1 = applies … 5 = does not apply) – they determine the position.',
        ],
      },
      hints: {
        nextTitle: 'Without a next step',
        nextDetail: '{n} assessment(s) outside “Delegating” without a next step.',
        delegateTitle: 'Ready for more responsibility',
        delegateDetail: '{names}',
        unansweredTitle: 'Assessed without questions',
        unansweredDetail: '{n} assessment(s) only estimated.',
      },
    },
  },
  hints(m, { items, regionId, inRegion, hasField, isEmpty, names, hint }) {
    /** @type {Hint[]} */
    const out = [];
    if (hasField('next')) {
      const none = items.filter(it => regionId(it) !== 'delegating' && isEmpty(it, 'next'));
      if (none.length) out.push(hint('next', 'warn', { n: none.length }, none));
    }
    const ready = inRegion('delegating');
    if (ready.length) out.push(hint('delegate', 'ok', { names: names(ready) }, ready));
    if (m.config.questions.length) {
      const guessed = items.filter(it => !Object.keys(it.answers).length);
      if (guessed.length) out.push(hint('unanswered', 'open', { n: guessed.length }, guessed));
    }
    return out;
  },
};
