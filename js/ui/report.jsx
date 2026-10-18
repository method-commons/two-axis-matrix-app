/*
 * Ansicht „Bericht“: Matrix als Bild, Rangfolge, Einträge je Bereich mit Notiz und Feldern,
 * nicht eingeordnete Einträge – zum Drucken (PDF) und als PNG, Markdown, CSV oder JSON.
 */
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Methods } from '../methods.js';
import { Model } from '../model.js';
import { Texts } from '../texts.js';
import { Util } from '../util.js';
import { download, MethodChip } from './components.jsx';
import { toast, useMatrix } from './core.js';
import { MatrixSvg, svgToPng } from './svg.jsx';


/** Markdown in die Zwischenablage. @param {string} text */
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(Texts.report.copied);
  } catch (e) {
    toast(Texts.report.copyFailed);
  }
}

/** @param {Matrix} m */
async function exportPng(m) {
  const svg = /** @type {SVGSVGElement | null} */ (document.getElementById('reportSvg'));
  const blob = svg ? await svgToPng(svg) : null;
  if (!blob) { toast(Texts.report.pngFailed); return; }
  download(blob, Util.fileName(m.name, 'png'), 'image/png');
}

export function ReportView() {
  const m = useMatrix();
  const c = m.config;
  const R = Texts.report;
  const names = Methods.itemName(m);
  const groups = [...Layout.byRegion(m)];
  const ranking = c.rank !== 'none' ? Layout.ranking(m) : [];
  const open = Model.unplaced(m);
  return (
    <div class="page report-page">
      <div class="toolbar no-print">
        <span class="sub">{R.title}</span>
        <span class="spacer" />
        <button type="button" class="btn sm" id="printBtn" onClick={() => window.print()}>⎙ {R.print}</button>
        <button type="button" class="btn sm" id="pngBtn" onClick={() => exportPng(m)}>{R.png}</button>
        <button type="button" class="btn sm" id="mdCopy" onClick={() => copy(IO.markdown(m))}>{R.copyMarkdown}</button>
        <button type="button" class="btn sm" id="mdBtn" onClick={() => download(IO.markdown(m), Util.fileName(m.name, 'md'), 'text/markdown')}>Markdown</button>
        <button type="button" class="btn sm" id="csvBtn" onClick={() => download('﻿' + IO.csv(m), Util.fileName(m.name, 'csv'), 'text/csv')}>CSV</button>
        <button type="button" class="btn sm" id="jsonBtn" onClick={() => download(IO.matrixJson(m), Util.fileName(m.name, 'json'), 'application/json')}>JSON</button>
      </div>
      <article class="paper" id="report">
        <header class="paper-head">
          <div>
            <h1>{m.name || Texts.ui.untitledMatrix}</h1>
            <div class="sub small">{[Methods.texts(Methods.get(m.method)).name, m.context.trim(), Util.count(m.items.length, names.one, names.many), `${R.asOf} ${Util.formatDay(Util.today(), Texts.locale, 0)}`].filter(Boolean).join(' · ')}</div>
          </div>
          <MethodChip id={m.method} />
        </header>
        <div class="report-top">
          <MatrixSvg m={m} width={380} height={330} detail id="reportSvg" />
          <div class="report-side">
            <h4>{R.axes}</h4>
            <p class="small"><b>X</b> {IO.axisText(c.x)}<br /><b>Y</b> {IO.axisText(c.y)}</p>
            {ranking.length > 0 && <>
              <h4>{R.ranking}</h4>
              <div class="table-wrap">
                <table class="tbl compact" id="rankTable">
                  <thead><tr><th>{R.rank}</th><th>{names.one}</th><th>{c.y.label || 'Y'}</th><th>{c.x.label || 'X'}</th><th>{IO.scoreLabel(m)}</th></tr></thead>
                  <tbody>
                    {ranking.slice(0, 10).map((r, i) => (
                      <tr key={r.item.id}><td>{i + 1}</td><td>{IO.label(r.item)}</td><td>{IO.num(/** @type {number} */ (r.item.y))}</td><td>{IO.num(/** @type {number} */ (r.item.x))}</td><td>{IO.score(r.score)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>}
          </div>
        </div>
        <div class="report-regions">
          {groups.map(([r, items]) => (
            <section key={r.id} class={`report-box c-${r.color}`} data-region={r.id}>
              <h4><i class={`c-${r.color}`} />{r.label || r.id} · {items.length}</h4>
              {r.hint && <p class="sub small">{r.hint}</p>}
              {items.length ? (
                <ol>
                  {items.map(it => {
                    const extra = c.fields.map(f => [f.label, IO.formatValue(m, f, it.values[f.key] ?? null)]).filter(([, v]) => v);
                    return (
                      <li key={it.id} value={it.no}>
                        <b>{IO.title(it)}</b>{it.note.trim() && <> – {it.note.trim()}</>}
                        {extra.length > 0 && <div class="sub small">{extra.map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>}
                      </li>
                    );
                  })}
                </ol>
              ) : <p class="sub small">–</p>}
            </section>
          ))}
        </div>
        {open.length > 0 && (
          <section class="report-open">
            <h4>{R.unplaced} · {open.length}</h4>
            <p class="small">{open.map(it => IO.label(it)).join(' · ')}</p>
          </section>
        )}
      </article>
    </div>
  );
}
