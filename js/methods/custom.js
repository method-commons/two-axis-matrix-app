/*
 * Eigene Matrix: freie Achsen (0–10, stufenlos) und vier neutrale Felder – Ausgangspunkt für
 * Methoden, die (noch) keine eigene Vorlage haben, z. B. Kano, BCG, Dringlichkeit/Auswirkung.
 * Muss vorhanden sein (Rückfall für unbekannte Methoden).
 */

/** @type {MethodDef} */
export const method = {
  id: 'custom',
  order: 1000,
  icon: '✳',
  color: 'gray',
  layout: 'quadrants',
  view: 'plot',
  x: { min: 0, max: 10, step: 0 },
  y: { min: 0, max: 10, step: 0 },
  split: { x: 5, y: 5 },
  regions: [
    { id: 'tl', color: 'green', qx: 'low', qy: 'high' },
    { id: 'tr', color: 'blue', qx: 'high', qy: 'high' },
    { id: 'bl', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'br', color: 'orange', qx: 'high', qy: 'low' },
  ],
  fields: [],
  rank: 'none',
  texts: {
    de: {
      name: 'Eigene Matrix',
      short: 'Eigene',
      aka: 'freie Achsen, z. B. Kano, BCG, SWOT-Strategien',
      description: 'Achsen, Skalen, Aufteilung und Felder selbst festlegen.',
      itemName: { one: 'Eintrag', many: 'Einträge' },
      noteLabel: 'Notiz',
      x: { label: 'X-Achse', low: 'niedrig', high: 'hoch' },
      y: { label: 'Y-Achse', low: 'niedrig', high: 'hoch' },
      regions: {
        tl: { label: 'Feld A', hint: '' },
        tr: { label: 'Feld B', hint: '' },
        bl: { label: 'Feld C', hint: '' },
        br: { label: 'Feld D', hint: '' },
      },
      leadQuestions: [
        'Was genau messen die beiden Achsen – und woran erkennt man „hoch“?',
        'Was folgt für Einträge in jedem Feld?',
      ],
      help: {
        paras: [
          'Eine eigene Matrix beginnt mit zwei freien Achsen von 0 bis 10 und vier Feldern. Unter „Achsen & Bereiche“ lassen sich Beschriftungen, Skalen, Aufteilung (vier Felder, Raster mit Stufen, Zonen), Farben und Felder je Eintrag einstellen.',
          'Eine gelungene Einstellung kann als eigene Vorlage gespeichert und für neue Matrizen wiederverwendet werden.',
        ],
        list: [],
      },
    },
    en: {
      name: 'Custom matrix',
      short: 'Custom',
      aka: 'free axes, e.g. Kano, BCG, SWOT strategies',
      description: 'Define axes, scales, layout and fields yourself.',
      itemName: { one: 'item', many: 'items' },
      noteLabel: 'Note',
      x: { label: 'X axis', low: 'low', high: 'high' },
      y: { label: 'Y axis', low: 'low', high: 'high' },
      regions: {
        tl: { label: 'Field A', hint: '' },
        tr: { label: 'Field B', hint: '' },
        bl: { label: 'Field C', hint: '' },
        br: { label: 'Field D', hint: '' },
      },
      leadQuestions: [
        'What exactly do the two axes measure – and what does “high” look like?',
        'What follows for items in each field?',
      ],
      help: {
        paras: [
          'A custom matrix starts with two free axes from 0 to 10 and four fields. Under “Axes & areas” you can set labels, scales, layout (four fields, graded grid, zones), colours and fields per item.',
          'A good setup can be saved as your own template and reused for new matrices.',
        ],
        list: [],
      },
    },
  },
};
