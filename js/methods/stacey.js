/*
 * Stacey-Matrix: Vorhaben nach Einigkeit über das Was (Anforderungen) und Gewissheit über das
 * Wie (Technologie, Lösungsweg) einordnen – Zonen einfach, kompliziert, komplex, chaotisch mit
 * empfohlenem Vorgehen. Einordnen per Fragen oder Ziehen.
 */

/** @type {MethodDef} */
export const method = {
  id: 'stacey',
  order: 50,
  icon: '◠',
  color: 'violet',
  layout: 'zones',
  view: 'plot',
  x: { min: 0, max: 10, step: 0 },
  y: { min: 0, max: 10, step: 0 },
  regions: [
    { id: 'simple', color: 'green', r: 0.3 },
    { id: 'complicated', color: 'blue', r: 0.6 },
    { id: 'complex', color: 'violet', r: 0.9 },
    { id: 'chaotic', color: 'red', r: 1.5 },
  ],
  fields: [],
  questions: [
    { id: 'goals', axis: 'y' },
    { id: 'agree', axis: 'y' },
    { id: 'done', axis: 'x' },
    { id: 'tech', axis: 'x' },
  ],
  rank: 'none',
  texts: {
    de: {
      name: 'Stacey-Matrix',
      short: 'Stacey',
      aka: 'Stacey-Diagramm, Komplexitätsmatrix',
      description: 'Vorhaben nach Unsicherheit einordnen und das passende Vorgehen wählen.',
      itemName: { one: 'Vorhaben', many: 'Vorhaben' },
      noteLabel: 'Beschreibung',
      x: { label: 'Wie: Technologie / Lösungsweg', low: 'bekannt', high: 'unbekannt' },
      y: { label: 'Was: Anforderungen', low: 'Einigkeit', high: 'keine Einigkeit' },
      regions: {
        simple: { label: 'Einfach', hint: 'Bewährtes Vorgehen, Checkliste – einfach erledigen' },
        complicated: { label: 'Kompliziert', hint: 'Plangetrieben: analysieren, Fachleute fragen, Wasserfall' },
        complex: { label: 'Komplex', hint: 'Iterativ: kleine Schritte, Feedback, Scrum/Kanban, Prototypen' },
        chaotic: { label: 'Chaotisch', hint: 'Erst handeln und stabilisieren, dann Ziele klären' },
      },
      questions: {
        goals: 'Ziele und Anforderungen sind klar',
        agree: 'Alle Beteiligten wollen dasselbe',
        done: 'Wir haben so etwas schon gemacht',
        tech: 'Weg und Technik sind bekannt',
      },
      leadQuestions: [
        'Wissen wir, was am Ende herauskommen soll – und sind sich alle einig?',
        'Haben wir so etwas schon einmal gemacht?',
        'Was lernen wir erst unterwegs?',
      ],
      help: {
        paras: [
          'Die Stacey-Matrix fragt zweierlei: Wie einig sind sich die Beteiligten über das Was (Anforderungen, Ziele)? Und wie gewiss ist das Wie (Technik, Lösungsweg)? Je weiter ein Vorhaben vom Ursprung entfernt liegt, desto unsicherer ist es.',
          'Aus der Zone folgt das Vorgehen: Einfaches nach Checkliste, Kompliziertes mit Analyse und Plan, Komplexes in kurzen Schleifen mit Feedback, Chaotisches erst stabilisieren.',
        ],
        list: [
          'Fragen beantworten (1 = trifft zu … 5 = trifft nicht zu) – daraus ergibt sich die Position.',
          'Oder das Vorhaben direkt in die Fläche ziehen; Ziehen überschreibt die berechnete Position.',
          'Die Grenzen der Zonen lassen sich unter „Achsen & Bereiche“ anpassen.',
        ],
      },
      hints: {
        chaoticTitle: 'Chaotische Vorhaben',
        chaoticDetail: '{names} – zuerst Ziele klären und stabilisieren, bevor geplant wird.',
        complexTitle: 'Komplexe Vorhaben iterativ angehen',
        complexDetail: '{n} Vorhaben in kurzen Schleifen mit Feedback planen.',
        unansweredTitle: 'Ohne Fragen eingeordnet',
        unansweredDetail: '{n} Vorhaben nur geschätzt – Fragen beantworten für eine begründete Position.',
      },
    },
    en: {
      name: 'Stacey matrix',
      short: 'Stacey',
      aka: 'Stacey diagram, complexity matrix',
      description: 'Place projects by uncertainty and choose a suitable approach.',
      itemName: { one: 'project', many: 'projects' },
      noteLabel: 'Description',
      x: { label: 'How: technology / approach', low: 'known', high: 'unknown' },
      y: { label: 'What: requirements', low: 'agreement', high: 'no agreement' },
      regions: {
        simple: { label: 'Simple', hint: 'Proven approach, checklist – just do it' },
        complicated: { label: 'Complicated', hint: 'Plan-driven: analyse, ask experts, waterfall' },
        complex: { label: 'Complex', hint: 'Iterative: small steps, feedback, Scrum/Kanban, prototypes' },
        chaotic: { label: 'Chaotic', hint: 'Act and stabilise first, then clarify goals' },
      },
      questions: {
        goals: 'Goals and requirements are clear',
        agree: 'Everyone involved wants the same',
        done: 'We have done something like this before',
        tech: 'Approach and technology are known',
      },
      leadQuestions: [
        'Do we know what the result should be – and does everyone agree?',
        'Have we done something like this before?',
        'What will we only learn along the way?',
      ],
      help: {
        paras: [
          'The Stacey matrix asks two things: how much do those involved agree on the what (requirements, goals)? And how certain is the how (technology, approach)? The further a project lies from the origin, the more uncertain it is.',
          'The zone suggests the approach: simple work by checklist, complicated work with analysis and a plan, complex work in short loops with feedback, chaos is stabilised first.',
        ],
        list: [
          'Answer the questions (1 = applies … 5 = does not apply) – they determine the position.',
          'Or drag the project into the area directly; dragging overrides the calculated position.',
          'The zone borders can be adjusted under “Axes & areas”.',
        ],
      },
      hints: {
        chaoticTitle: 'Chaotic projects',
        chaoticDetail: '{names} – clarify goals and stabilise before planning.',
        complexTitle: 'Approach complex projects iteratively',
        complexDetail: 'Plan {n} project(s) in short loops with feedback.',
        unansweredTitle: 'Placed without questions',
        unansweredDetail: '{n} project(s) only estimated – answer the questions for a reasoned position.',
      },
    },
  },
  hints(m, { regionOf, placed, fill, t }) {
    const H = /** @type {Record<string, string>} */ (t.hints);
    const list = placed(m);
    const zone = (/** @type {string} */ id) => list.filter(it => { const r = regionOf(m, it); return r != null && r.id === id; });
    /** @type {Hint[]} */
    const out = [];
    const chaotic = zone('chaotic');
    if (chaotic.length) out.push({ key: 'chaotic', state: 'warn', title: H.chaoticTitle, detail: fill(H.chaoticDetail, { names: chaotic.map(i => i.title.trim() || `#${i.no}`).join(', ') }), items: chaotic.map(i => i.id) });
    const complex = zone('complex');
    if (complex.length) out.push({ key: 'complex', state: 'ok', title: H.complexTitle, detail: fill(H.complexDetail, { n: complex.length }), items: complex.map(i => i.id) });
    if (m.config.questions.length) {
      const guessed = list.filter(it => !Object.keys(it.answers).length);
      if (guessed.length) out.push({ key: 'unanswered', state: 'open', title: H.unansweredTitle, detail: fill(H.unansweredDetail, { n: guessed.length }), items: guessed.map(i => i.id) });
    }
    return out;
  },
};
