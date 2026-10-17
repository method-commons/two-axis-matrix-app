/*
 * Dringlichkeit/Auswirkung (Prioritätsmatrix, z. B. nach ITIL): Vorgänge in je drei Stufen
 * bewerten; die Priorität 1–5 ergibt sich aus Auswirkung × Dringlichkeit (9 → P1, 6 → P2,
 * 3–4 → P3, 2 → P4, 1 → P5) – das entspricht der üblichen 3 × 3-Tabelle.
 */

/** @type {MethodDef} */
export const method = {
  id: 'urgency-impact',
  order: 110,
  icon: '⚑',
  color: 'red',
  layout: 'grid',
  view: 'heatmap',
  x: { min: 1, max: 3, step: 1 },
  y: { min: 1, max: 3, step: 1 },
  regions: [
    { id: 'p5', color: 'gray', min: 0 },
    { id: 'p4', color: 'blue', min: 2 },
    { id: 'p3', color: 'yellow', min: 3 },
    { id: 'p2', color: 'orange', min: 6 },
    { id: 'p1', color: 'red', min: 9 },
  ],
  fields: [
    { key: 'owner', type: 'person' },
    { key: 'due', type: 'date' },
    { key: 'done', type: 'check' },
  ],
  rank: 'product',
  texts: {
    de: {
      name: 'Dringlichkeit / Auswirkung',
      short: 'Priorität',
      aka: 'Prioritätsmatrix, Incident-Priorität (ITIL), Impact/Urgency',
      description: 'Vorgänge nach Auswirkung und Dringlichkeit bewerten – daraus folgt die Priorität 1 bis 5.',
      itemName: { one: 'Vorgang', many: 'Vorgänge' },
      noteLabel: 'Beschreibung',
      x: { label: 'Auswirkung', low: 'gering', high: 'hoch' },
      y: { label: 'Dringlichkeit', low: 'gering', high: 'hoch' },
      regions: {
        p5: { label: 'P5 Planbar', hint: 'bei Gelegenheit' },
        p4: { label: 'P4 Niedrig', hint: 'in den nächsten Tagen' },
        p3: { label: 'P3 Mittel', hint: 'heute bzw. morgen' },
        p2: { label: 'P2 Hoch', hint: 'innerhalb weniger Stunden' },
        p1: { label: 'P1 Kritisch', hint: 'sofort, alles andere zurückstellen' },
      },
      fields: { owner: 'Verantwortlich', due: 'Fällig', done: 'Erledigt' },
      leadQuestions: [
        'Wie viele sind betroffen – eine Person, ein Bereich, alle?',
        'Wie schnell wird es schlimmer, wenn niemand handelt?',
        'Gibt es eine Umgehung, die erst einmal hilft?',
      ],
      help: {
        paras: [
          'Die Prioritätsmatrix trennt zwei Fragen: Wie groß ist die Auswirkung (Umfang, Schaden)? Und wie dringend ist es (wie schnell wird es schlimmer)? Beides wird in drei Stufen bewertet.',
          'Aus der Kombination folgt die Priorität – so wird nicht der Lauteste zuerst bedient, sondern das Wichtigste. Die Stufen entsprechen der üblichen Tabelle aus dem IT-Service-Management (ITIL).',
        ],
        list: [
          'Zelle anklicken oder Vorgang hineinziehen, um ihn zu bewerten.',
          'P1 und P2 brauchen eine verantwortliche Person.',
          'Erledigte Vorgänge abhaken – sie zählen dann nicht mehr als offen.',
        ],
      },
      hints: {
        ownerTitle: 'Hohe Priorität ohne Verantwortung',
        ownerDetail: '{names}',
        openTitle: 'Kritisch offen',
        openDetail: '{n} offene(r) Vorgang/Vorgänge mit P1.',
        clearTitle: 'Nichts Kritisches offen',
        clearDetail: 'Kein offener Vorgang mit P1 oder P2.',
      },
    },
    en: {
      name: 'Urgency / impact',
      short: 'Priority',
      aka: 'Priority matrix, incident priority (ITIL), impact/urgency',
      description: 'Rate issues by impact and urgency – this gives priority 1 to 5.',
      itemName: { one: 'issue', many: 'issues' },
      noteLabel: 'Description',
      x: { label: 'Impact', low: 'low', high: 'high' },
      y: { label: 'Urgency', low: 'low', high: 'high' },
      regions: {
        p5: { label: 'P5 Planning', hint: 'when convenient' },
        p4: { label: 'P4 Low', hint: 'within the next days' },
        p3: { label: 'P3 Medium', hint: 'today or tomorrow' },
        p2: { label: 'P2 High', hint: 'within a few hours' },
        p1: { label: 'P1 Critical', hint: 'now, put everything else aside' },
      },
      fields: { owner: 'Owner', due: 'Due', done: 'Done' },
      leadQuestions: [
        'How many are affected – one person, one area, everyone?',
        'How quickly does it get worse if nobody acts?',
        'Is there a workaround that helps for now?',
      ],
      help: {
        paras: [
          'The priority matrix separates two questions: how big is the impact (scope, damage)? And how urgent is it (how quickly does it get worse)? Both are rated in three levels.',
          'The combination gives the priority – so the most important issue is handled first, not the loudest. The levels follow the usual table from IT service management (ITIL).',
        ],
        list: [
          'Click a cell or drag an issue into it to rate it.',
          'P1 and P2 need an owner.',
          'Tick off resolved issues – they no longer count as open.',
        ],
      },
      hints: {
        ownerTitle: 'High priority without an owner',
        ownerDetail: '{names}',
        openTitle: 'Critical open',
        openDetail: '{n} open issue(s) with P1.',
        clearTitle: 'Nothing critical open',
        clearDetail: 'No open issue with P1 or P2.',
      },
    },
  },
  hints(m, { regionOf, placed, value, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const open = placed(m).filter(it => value(it, 'done') !== true);
    if (!placed(m).length) return [];
    const level = (/** @type {Item} */ it) => { const r = regionOf(m, it); return r ? r.id : ''; };
    const p1 = open.filter(it => level(it) === 'p1');
    const high = open.filter(it => ['p1', 'p2'].includes(level(it)));
    /** @type {Hint[]} */
    const out = [];
    if (p1.length) out.push({ key: 'open', state: 'warn', title: H.openTitle, detail: fill(H.openDetail, { n: p1.length }), items: p1.map(i => i.id) });
    else if (!high.length) out.push({ key: 'clear', state: 'ok', title: H.clearTitle, detail: H.clearDetail });
    if (m.config.fields.some(f => f.key === 'owner')) {
      const none = high.filter(it => !String(value(it, 'owner') || '').trim());
      if (none.length) out.push({ key: 'owner', state: 'warn', title: H.ownerTitle, detail: fill(H.ownerDetail, { names: none.map(i => i.title.trim() || `#${i.no}`).join(', ') }), items: none.map(i => i.id) });
    }
    return out;
  },
};
