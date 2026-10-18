/*
 * Macht/Interesse-Matrix (Stakeholder-Analyse): Beteiligte nach Einfluss und Interesse
 * einordnen; Haltung (unterstützend/neutral/kritisch), Ziel-Position und Ziel-Haltung,
 * Strategie und Kommunikation je Stakeholder.
 */

const STANCES = [
  { id: 'pro', color: /** @type {ColorKey} */ ('green') },
  { id: 'neutral', color: /** @type {ColorKey} */ ('gray') },
  { id: 'contra', color: /** @type {ColorKey} */ ('red') },
];

/** @type {MethodDef} */
export const method = {
  id: 'stakeholder',
  order: 30,
  icon: '◎',
  color: 'orange',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 1, max: 5, step: 0.5 },
  y: { min: 1, max: 5, step: 0.5 },
  split: { x: 3, y: 3 },
  regions: [
    { id: 'satisfy', color: 'orange', qx: 'low', qy: 'high' },
    { id: 'manage', color: 'red', qx: 'high', qy: 'high' },
    { id: 'monitor', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'inform', color: 'blue', qx: 'high', qy: 'low' },
  ],
  fields: [
    { key: 'stance', type: 'choice', options: STANCES },
    { key: 'stanceTarget', type: 'choice', options: STANCES, optionsText: 'stance' },
    { key: 'target', type: 'point' },
    { key: 'strategy', type: 'textarea' },
    { key: 'comms', type: 'text' },
    { key: 'owner', type: 'person' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Macht / Interesse',
      short: 'Stakeholder',
      aka: 'Stakeholder-Analyse, Einfluss-Interesse-Matrix, Power/Interest-Grid',
      description: 'Stakeholder einordnen und je Gruppe die passende Kommunikation festlegen.',
      itemName: { one: 'Stakeholder', many: 'Stakeholder' },
      noteLabel: 'Anliegen / Befürchtung',
      x: { label: 'Interesse / Betroffenheit', low: 'gering', high: 'hoch' },
      y: { label: 'Macht / Einfluss', low: 'gering', high: 'hoch' },
      regions: {
        satisfy: { label: 'Zufriedenstellen', hint: 'bei Bedarf einbeziehen, nicht überfrachten' },
        manage: { label: 'Eng einbinden', hint: 'Schlüsselpersonen – aktiv beteiligen' },
        monitor: { label: 'Beobachten', hint: 'minimaler Aufwand' },
        inform: { label: 'Informieren', hint: 'regelmäßig auf dem Laufenden halten' },
      },
      fields: { stance: 'Haltung', stanceTarget: 'Ziel-Haltung', target: 'Ziel-Position', strategy: 'Strategie', comms: 'Kommunikation (Kanal, Häufigkeit)', owner: 'Ansprechperson' },
      options: { stance: { pro: 'unterstützend', neutral: 'neutral', contra: 'kritisch' } },
      leadQuestions: [
        'Wer kann das Vorhaben stoppen oder beschleunigen?',
        'Wer ist betroffen, ohne gefragt zu werden?',
        'Was befürchtet jemand – und was würde ihn umstimmen?',
      ],
      help: {
        paras: [
          'Die Macht/Interesse-Matrix ordnet Stakeholder nach ihrem Einfluss auf das Vorhaben und ihrem Interesse daran. Daraus folgt, wie eng man sie einbindet.',
          'Die Haltung (unterstützend, neutral, kritisch) ergänzt das Bild: Kritische Stakeholder mit viel Einfluss brauchen zuerst Aufmerksamkeit. Mit der Ziel-Position wird sichtbar, wohin man jemanden bewegen will – etwa mehr Interesse wecken.',
        ],
        list: [
          'Eng einbinden: früh beteiligen, gemeinsam entscheiden.',
          'Zufriedenstellen: Anforderungen erfüllen, nicht mit Details belasten.',
          'Informieren: regelmäßig berichten, Fragen ernst nehmen.',
          'Beobachten: im Blick behalten, ob sich etwas ändert.',
        ],
      },
      hints: {
        criticalTitle: 'Kritisch mit viel Einfluss',
        criticalDetail: '{names} – zuerst ansprechen.',
        strategyTitle: 'Schlüsselpersonen ohne Strategie',
        strategyDetail: '{n} Stakeholder in „Eng einbinden“ ohne Strategie.',
        stanceTitle: 'Haltung offen',
        stanceDetail: '{n} Stakeholder ohne eingeschätzte Haltung.',
        targetTitle: 'Ziele gesetzt',
        targetDetail: '{n} Ziel-Position(en) bzw. Ziel-Haltung(en) festgelegt.',
      },
    },
    en: {
      name: 'Power / interest',
      short: 'Stakeholder',
      aka: 'Stakeholder analysis, power/interest grid, influence/interest matrix',
      description: 'Map stakeholders and decide how to communicate with each group.',
      itemName: { one: 'stakeholder', many: 'stakeholders' },
      noteLabel: 'Concern / fear',
      x: { label: 'Interest / impact', low: 'low', high: 'high' },
      y: { label: 'Power / influence', low: 'low', high: 'high' },
      regions: {
        satisfy: { label: 'Keep satisfied', hint: 'involve when needed, do not overload' },
        manage: { label: 'Manage closely', hint: 'key players – involve actively' },
        monitor: { label: 'Monitor', hint: 'minimal effort' },
        inform: { label: 'Keep informed', hint: 'keep up to date regularly' },
      },
      fields: { stance: 'Attitude', stanceTarget: 'Target attitude', target: 'Target position', strategy: 'Strategy', comms: 'Communication (channel, frequency)', owner: 'Contact person' },
      options: { stance: { pro: 'supportive', neutral: 'neutral', contra: 'critical' } },
      leadQuestions: [
        'Who can stop or speed up the project?',
        'Who is affected without being asked?',
        'What does someone fear – and what would change their mind?',
      ],
      help: {
        paras: [
          'The power/interest grid arranges stakeholders by their influence on the project and their interest in it. This tells you how closely to involve them.',
          'The attitude (supportive, neutral, critical) completes the picture: critical stakeholders with a lot of power need attention first. The target position shows where you want to move someone – for example raising their interest.',
        ],
        list: [
          'Manage closely: involve early, decide together.',
          'Keep satisfied: meet their requirements, do not burden them with details.',
          'Keep informed: report regularly, take questions seriously.',
          'Monitor: keep an eye on whether anything changes.',
        ],
      },
      hints: {
        criticalTitle: 'Critical and powerful',
        criticalDetail: '{names} – approach first.',
        strategyTitle: 'Key players without a strategy',
        strategyDetail: '{n} stakeholder(s) in “Manage closely” without a strategy.',
        stanceTitle: 'Attitude unknown',
        stanceDetail: '{n} stakeholder(s) without an assessed attitude.',
        targetTitle: 'Targets set',
        targetDetail: '{n} target position(s) or attitude(s) defined.',
      },
    },
  },
  hints(m, { items, inRegion, hasField, value, isEmpty, names, hint }) {
    /** @type {Hint[]} */
    const out = [];
    const powerful = items.filter(it => /** @type {number} */ (it.y) >= m.config.split.y);
    if (hasField('stance')) {
      const critical = powerful.filter(it => value(it, 'stance') === 'contra');
      if (critical.length) out.push(hint('critical', 'warn', { names: names(critical) }, critical));
      const unknown = items.filter(it => !value(it, 'stance'));
      if (unknown.length) out.push(hint('stance', 'open', { n: unknown.length }, unknown));
    }
    if (hasField('strategy')) {
      const none = inRegion('manage').filter(it => isEmpty(it, 'strategy'));
      if (none.length) out.push(hint('strategy', 'warn', { n: none.length }, none));
    }
    const targets = items.filter(it => value(it, 'target') || value(it, 'stanceTarget'));
    if (targets.length) out.push(hint('target', 'ok', { n: targets.length }, targets));
    return out;
  },
};
