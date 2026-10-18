/*
 * IO – Import und Export: Matrix als JSON, Sicherung aller Matrizen, Bericht als Markdown,
 * Einträge als CSV. Exportiert den Namensraum `IO`.
 */
import { Layout } from './layout.js';
import { Methods } from './methods.js';
import { Model } from './model.js';
import { Texts } from './texts.js';
import { Util } from './util.js';

export const IO = (() => {
  const BACKUP_TYPE = 'two-axis-backup';

  /** Matrix als JSON-Text. @param {Matrix} m */
  function matrixJson(m) {
    return JSON.stringify(m, null, 2) + '\n';
  }

  /** Sicherung mehrerer Matrizen als JSON-Text. @param {Matrix[]} list @param {Date} [date] */
  function backupJson(list, date = new Date()) {
    return JSON.stringify({ type: BACKUP_TYPE, version: Model.SCHEMA_VERSION, exportedAt: date.toISOString(), matrices: list }, null, 2) + '\n';
  }

  /**
   * JSON-Text lesen: einzelne Matrix, Sicherung oder Liste von Matrizen.
   * @param {string} text @returns {Matrix[]}
   */
  function parse(text) {
    let raw;
    try { raw = JSON.parse(text); } catch (e) { throw new Error(Texts.io.invalid, { cause: e }); }
    const list = Array.isArray(raw) ? raw : raw && raw.type === BACKUP_TYPE && Array.isArray(raw.matrices) ? raw.matrices : [raw];
    if (!list.length) throw new Error(Texts.io.empty);
    return list.map((/** @type {unknown} */ r) => {
      try { return Model.normalize(r); } catch (e) { throw new Error(Texts.io.invalid, { cause: e }); }
    });
  }

  /** Inhalt ohne Zeitstempel (zum Vergleich). @param {Matrix} m */
  const content = m => JSON.stringify({ ...m, updatedAt: '' });

  /**
   * Wie wird eine importierte Matrix übernommen? Neu, schon vorhanden (identisch) oder – bei
   * abweichendem Stand – als Kopie mit neuer ID (nichts wird überschrieben).
   * @param {Matrix} m @param {Matrix | null} existing
   * @returns {{ action: 'new' | 'same' | 'copy', matrix: Matrix }}
   */
  function resolveImport(m, existing) {
    if (!existing) return { action: 'new', matrix: m };
    if (content(existing) === content(m)) return { action: 'same', matrix: existing };
    return { action: 'copy', matrix: { ...m, id: Util.uid('m'), name: `${m.name} ${Texts.io.copySuffix}` } };
  }

  /** Zahl in der Sprache der App. @param {number} v */
  const num = v => Util.formatNumber(v, Texts.locale);

  /** Titel eines Eintrags (sonst „ohne Titel“). @param {Item} it */
  const title = it => it.title.trim() || Texts.ui.untitled;

  /** Eintrag mit Nummer („#3 Vegane Pommes“). @param {Item} it */
  const label = it => `#${it.no} ${title(it)}`;

  /** Wert der Rangfolge („–“ ohne Wert). @param {number | null} s */
  const score = s => (s == null || !Number.isFinite(s) ? '–' : num(s));

  /** Position als Text („X / Y“). @param {Point} p */
  const point = p => `${num(p.x)} / ${num(p.y)}`;

  /**
   * Wert eines Felds als Text.
   * @param {Matrix} m @param {FieldDef} f @param {FieldValue} v
   */
  function formatValue(m, f, v) {
    if (v == null || v === '') return '';
    if (f.type === 'check') return v === true ? Texts.ui.yes : '';
    if (f.type === 'date') return Util.formatDay(/** @type {string} */ (v), Texts.locale, 0);
    if (f.type === 'choice') { const o = (f.options || []).find(x => x.id === v); return o ? o.label : ''; }
    if (f.type === 'point') {
      const p = /** @type {Point} */ (v);
      const r = Layout.regionAt(m.config, p.x, p.y);
      return `${point(p)}${r && r.label ? ` (${r.label})` : ''}`;
    }
    return String(v);
  }

  /**
   * Bezeichnung der Rangfolge aus den Achsen („Wichtigkeit ÷ Zufriedenheit“ bzw. „Auswirkung ×
   * Wahrscheinlichkeit“); ohne Achsennamen die allgemeine.
   * @param {Matrix} m
   */
  function scoreLabel(m) {
    const { x, y, rank } = m.config;
    if (rank === 'none' || !x.label.trim() || !y.label.trim()) return Texts.report.score[rank];
    return rank === 'ratio' ? `${y.label.trim()} ÷ ${x.label.trim()}` : `${x.label.trim()} × ${y.label.trim()}`;
  }

  /** Markdown-Zeichen in Text maskieren. @param {string} s */
  const md = s => String(s).replace(/([\\`*_[\]#|<>])/g, '\\$1');
  /** Tabellenzelle: Zeilenumbrüche entfernen. @param {string} s */
  const cell = s => md(String(s).replace(/\s*\n\s*/g, ' ').trim()) || '–';

  /** Beschreibung einer Achse („Aufwand: gering → hoch, 0–10“). @param {Axis} a */
  function axisText(a) {
    const range = `${num(a.min)}–${num(a.max)}`;
    const poles = a.low || a.high ? `: ${a.low || '…'} → ${a.high || '…'}` : '';
    return `${a.label || '–'}${poles} (${range})`;
  }

  /**
   * Bericht als Markdown: Achsen, Einträge je Bereich (mit Notiz und Feldern), Rangfolge,
   * nicht eingeordnete Einträge.
   * @param {Matrix} m @param {{ today?: string }} [opts]
   */
  function markdown(m, opts = {}) {
    const T = Texts;
    const R = T.report;
    const def = Methods.get(m.method);
    const names = Methods.itemName(m);
    const lines = [`# ${md(m.name || T.ui.untitledMatrix)}`, ''];
    const meta = [Methods.texts(def).name, m.context.trim(), `${R.asOf} ${Util.formatDay(opts.today || Util.today(), T.locale, 0)}`].filter(Boolean);
    lines.push(md(meta.join(' · ')), '');
    lines.push(`- **X:** ${md(axisText(m.config.x))}`, `- **Y:** ${md(axisText(m.config.y))}`, '');

    const fields = m.config.fields;
    for (const [region, items] of Layout.byRegion(m)) {
      lines.push(`## ${md(region.label || region.id)} (${items.length})`, '');
      if (region.hint.trim()) lines.push(`*${md(region.hint.trim())}*`, '');
      for (const it of items) {
        const extra = fields.map(f => [f.label, formatValue(m, f, it.values[f.key] ?? null)]).filter(([, v]) => v).map(([k, v]) => `${md(k)}: ${md(v)}`);
        lines.push(`- **#${it.no} ${md(title(it))}** (${point({ x: /** @type {number} */ (it.x), y: /** @type {number} */ (it.y) })})${it.note.trim() ? ` – ${md(it.note.trim().replace(/\s*\n\s*/g, ' '))}` : ''}`);
        if (extra.length) lines.push(`  ${extra.join(' · ')}`);
      }
      if (items.length) lines.push('');
    }

    if (m.config.rank !== 'none') {
      const ranking = Layout.ranking(m);
      if (ranking.length) {
        lines.push(`## ${R.ranking}`, '');
        lines.push(`| ${R.rank} | ${names.one} | ${cell(m.config.y.label || 'Y')} | ${cell(m.config.x.label || 'X')} | ${cell(scoreLabel(m))} |`, '|---|---|---|---|---|');
        ranking.forEach((r, i) => lines.push(`| ${i + 1} | #${r.item.no} ${cell(title(r.item))} | ${num(/** @type {number} */ (r.item.y))} | ${num(/** @type {number} */ (r.item.x))} | ${score(r.score)} |`));
        lines.push('');
      }
    }

    const open = Model.unplaced(m);
    if (open.length) {
      lines.push(`## ${R.unplaced} (${open.length})`, '');
      open.forEach(it => lines.push(`- #${it.no} ${md(title(it))}`));
      lines.push('');
    }
    return lines.join('\n');
  }

  /** CSV-Feld maskieren. @param {string} s @param {string} sep */
  const csvCell = (s, sep) => (/[\n"]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s);

  /**
   * Einträge als CSV (Trennzeichen je Sprache: Semikolon bei Komma als Dezimalzeichen).
   * @param {Matrix} m
   */
  function csv(m) {
    const T = Texts;
    const sep = num(1.5).includes(',') ? ';' : ',';
    const c = m.config;
    const head = [T.list.no, T.list.title, c.x.label || 'X', c.y.label || 'Y', T.list.region, c.noteLabel || T.list.note, ...c.fields.map(f => f.label || f.key)];
    const rows = m.items.map(it => {
      const r = Layout.regionOf(m, it);
      return [String(it.no), it.title, it.x == null ? '' : num(it.x), it.y == null ? '' : num(it.y), r ? r.label : '', it.note, ...c.fields.map(f => formatValue(m, f, it.values[f.key] ?? null))];
    });
    return [head, ...rows].map(row => row.map(s => csvCell(s, sep)).join(sep)).join('\r\n') + '\r\n';
  }

  return { BACKUP_TYPE, matrixJson, backupJson, parse, resolveImport, num, title, label, score, formatValue, axisText, scoreLabel, markdown, csv };
})();
