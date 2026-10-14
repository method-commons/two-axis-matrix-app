/*
 * Eisenhower-Matrix: Aufgaben nach Dringlichkeit und Wichtigkeit – sofort erledigen,
 * einplanen, delegieren, weglassen. Zwei Stufen je Achse, Karten in vier Feldern;
 * „dringend“ steht wie üblich links.
 */

/** @type {MethodDef} */
export const method = {
  id: 'eisenhower',
  order: 10,
  icon: '⏱',
  color: 'red',
  layout: 'quadrants',
  view: 'board',
  x: { min: 1, max: 2, step: 1, reverse: true },
  y: { min: 1, max: 2, step: 1 },
  split: { x: 1.5, y: 1.5 },
  regions: [
    { id: 'do', color: 'red', qx: 'high', qy: 'high' },
    { id: 'plan', color: 'green', qx: 'low', qy: 'high' },
    { id: 'delegate', color: 'orange', qx: 'high', qy: 'low' },
    { id: 'drop', color: 'gray', qx: 'low', qy: 'low' },
  ],
  fields: [
    { key: 'owner', type: 'person' },
    { key: 'due', type: 'date' },
    { key: 'done', type: 'check' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Eisenhower-Matrix',
      short: 'Eisenhower',
      aka: 'Dringend/Wichtig-Matrix, Zeitmanagement-Matrix',
      description: 'Aufgaben nach Dringlichkeit und Wichtigkeit sortieren: tun, einplanen, delegieren, weglassen.',
      itemName: { one: 'Aufgabe', many: 'Aufgaben' },
      noteLabel: 'Notiz',
      x: { label: 'Dringlichkeit', low: 'nicht dringend', high: 'dringend' },
      y: { label: 'Wichtigkeit', low: 'nicht wichtig', high: 'wichtig' },
      regions: {
        do: { label: 'Sofort erledigen', hint: 'wichtig & dringend – selbst, jetzt' },
        plan: { label: 'Einplanen', hint: 'wichtig, nicht dringend – Zeit blocken' },
        delegate: { label: 'Delegieren', hint: 'dringend, nicht wichtig – abgeben' },
        drop: { label: 'Weglassen', hint: 'weder noch – streichen oder später' },
      },
      fields: { owner: 'Wer', due: 'Termin', done: 'Erledigt' },
      leadQuestions: [
        'Was passiert, wenn ich es diese Woche nicht tue?',
        'Zahlt es auf ein Ziel ein – oder nur auf jemandes Dringlichkeit?',
        'Wer kann es genauso gut (oder besser)?',
      ],
      help: {
        paras: [
          'Die Eisenhower-Matrix trennt Wichtiges von Dringendem. Wichtig ist, was auf ein Ziel einzahlt; dringend ist, was einen nahen Termin hat oder bei Aufschub Folgen hat.',
          'Der wertvollste Quadrant ist „Einplanen“: wichtige Aufgaben ohne Zeitdruck. Wer dort Zeit blockt, hat später weniger in „Sofort erledigen“.',
        ],
        list: [
          'Neue Aufgaben landen im Eingang und werden per Ziehen oder Taste 1–4 eingeordnet.',
          'Delegierte Aufgaben bekommen eine Person, eingeplante einen Termin.',
          'Erledigtes abhaken statt löschen – so bleibt sichtbar, was geschafft wurde.',
        ],
      },
      hints: {
        delegateTitle: 'Delegieren ohne Person',
        delegateDetail: '{n} delegierte Aufgabe(n) ohne „Wer“.',
        planTitle: 'Einplanen ohne Termin',
        planDetail: '{n} Aufgabe(n) in „Einplanen“ ohne Termin – ohne Zeitblock rutscht Wichtiges in „Sofort“.',
        balanceTitle: 'Mehr „Sofort“ als „Einplanen“',
        balanceDetail: '{do} dringende gegenüber {plan} geplanten wichtigen Aufgaben – mehr vorausplanen.',
        balanceOkTitle: '„Einplanen“ gepflegt',
        balanceOkDetail: '{plan} wichtige Aufgaben ohne Zeitdruck – mindestens so viele wie in „Sofort“.',
        dropTitle: 'Weglassen wirklich weglassen',
        dropDetail: '{n} offene Aufgabe(n) in „Weglassen“ – streichen oder bewusst später.',
      },
    },
    en: {
      name: 'Eisenhower matrix',
      short: 'Eisenhower',
      aka: 'Urgent/important matrix, time management matrix',
      description: 'Sort tasks by urgency and importance: do, schedule, delegate, drop.',
      itemName: { one: 'task', many: 'tasks' },
      noteLabel: 'Note',
      x: { label: 'Urgency', low: 'not urgent', high: 'urgent' },
      y: { label: 'Importance', low: 'not important', high: 'important' },
      regions: {
        do: { label: 'Do now', hint: 'important & urgent – yourself, now' },
        plan: { label: 'Schedule', hint: 'important, not urgent – block time' },
        delegate: { label: 'Delegate', hint: 'urgent, not important – hand over' },
        drop: { label: 'Drop', hint: 'neither – delete or later' },
      },
      fields: { owner: 'Who', due: 'Due', done: 'Done' },
      leadQuestions: [
        'What happens if I do not do it this week?',
        'Does it serve a goal – or only someone else’s urgency?',
        'Who could do it just as well (or better)?',
      ],
      help: {
        paras: [
          'The Eisenhower matrix separates the important from the urgent. Important is what serves a goal; urgent is what has a close deadline or consequences if delayed.',
          'The most valuable quadrant is “Schedule”: important tasks without time pressure. Blocking time there means fewer tasks in “Do now” later.',
        ],
        list: [
          'New tasks land in the inbox and are sorted by dragging or with keys 1–4.',
          'Delegated tasks get a person, scheduled ones a date.',
          'Tick off what is done instead of deleting – progress stays visible.',
        ],
      },
      hints: {
        delegateTitle: 'Delegated without a person',
        delegateDetail: '{n} delegated task(s) without “Who”.',
        planTitle: 'Scheduled without a date',
        planDetail: '{n} task(s) in “Schedule” without a date – without a time slot, important work slides into “Do now”.',
        balanceTitle: 'More “Do now” than “Schedule”',
        balanceDetail: '{do} urgent versus {plan} scheduled important tasks – plan further ahead.',
        balanceOkTitle: '“Schedule” is cared for',
        balanceOkDetail: '{plan} important tasks without time pressure – at least as many as in “Do now”.',
        dropTitle: 'Really drop what you drop',
        dropDetail: '{n} open task(s) in “Drop” – delete them or consciously postpone.',
      },
    },
  },
  hints(m, { regionOf, placed, value, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const open = placed(m).filter(it => value(it, 'done') !== true);
    const inRegion = (/** @type {string} */ id) => open.filter(it => { const r = regionOf(m, it); return r != null && r.id === id; });
    /** @type {Hint[]} */
    const out = [];
    const doList = inRegion('do');
    const plan = inRegion('plan');
    if (doList.length || plan.length) {
      out.push(doList.length > plan.length
        ? { key: 'balance', state: 'warn', title: H.balanceTitle, detail: fill(H.balanceDetail, { do: doList.length, plan: plan.length }) }
        : { key: 'balance', state: 'ok', title: H.balanceOkTitle, detail: fill(H.balanceOkDetail, { plan: plan.length }) });
    }
    if (m.config.fields.some(f => f.key === 'owner')) {
      const noOwner = inRegion('delegate').filter(it => !String(value(it, 'owner') || '').trim());
      if (noOwner.length) out.push({ key: 'delegate', state: 'warn', title: H.delegateTitle, detail: fill(H.delegateDetail, { n: noOwner.length }), items: noOwner.map(i => i.id) });
    }
    if (m.config.fields.some(f => f.key === 'due')) {
      const noDue = plan.filter(it => !value(it, 'due'));
      if (noDue.length) out.push({ key: 'plan', state: 'warn', title: H.planTitle, detail: fill(H.planDetail, { n: noDue.length }), items: noDue.map(i => i.id) });
    }
    const drop = inRegion('drop');
    if (drop.length) out.push({ key: 'drop', state: 'open', title: H.dropTitle, detail: fill(H.dropDetail, { n: drop.length }), items: drop.map(i => i.id) });
    return out;
  },
};
