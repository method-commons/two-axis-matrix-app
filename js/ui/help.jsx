/*
 * Methodik-Hilfe: je Methode Zweck, Bereiche, Vorgehen und Leitfragen (aus der Definition der
 * Methode) sowie die Bedienung der App – als Dialog mit Reitern.
 */
import { useState } from 'preact/hooks';
import { Methods } from '../methods.js';
import { Texts } from '../texts.js';
import { Dialog } from './components.jsx';
import { openDialog } from './core.js';

/** @param {string} [section] Methode oder `app` */
export function openHelp(section) {
  openDialog(() => <Help initial={section || Methods.list()[0].id} />);
}

/** @param {{ initial: string }} props */
function Help({ initial }) {
  const [sec, setSec] = useState(initial);
  const defs = Methods.list();
  const def = defs.find(d => d.id === sec);
  return (
    <Dialog title={Texts.help.title} wide id="helpDialog">
      <div class="help">
        <nav class="help-nav" role="tablist" aria-label={Texts.help.title}>
          {defs.map(d => (
            <button type="button" role="tab" key={d.id} aria-selected={sec === d.id} class={sec === d.id ? 'on' : ''} data-help={d.id} onClick={() => setSec(d.id)}>
              <span aria-hidden="true">{d.icon}</span> {Methods.texts(d).name}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={sec === 'app'} class={sec === 'app' ? 'on' : ''} data-help="app" onClick={() => setSec('app')}>{Texts.help.app.title}</button>
        </nav>
        <div class="help-body" role="tabpanel">
          {def ? <MethodHelp def={def} /> : <>
            <h2>{Texts.help.app.title}</h2>
            {Texts.help.app.paras.map((x, i) => <p key={i}>{x}</p>)}
            <ul>{Texts.help.app.list.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </>}
        </div>
      </div>
    </Dialog>
  );
}

/** @param {{ def: MethodDef }} props */
function MethodHelp({ def }) {
  const t = Methods.texts(def);
  return (
    <>
      <h2>{t.name}</h2>
      <p class="sub small">{t.aka}</p>
      {t.help.paras.map((x, i) => <p key={i}>{x}</p>)}
      <div class="help-axes small">
        <div><b>X</b> {t.x.label}: {t.x.low} → {t.x.high}</div>
        <div><b>Y</b> {t.y.label}: {t.y.low} → {t.y.high}</div>
      </div>
      <div class="help-regions">
        {def.regions.map(r => (
          <div key={r.id} class={`help-region c-${r.color}`}><b>{t.regions[r.id].label}</b>{t.regions[r.id].hint && <span>{t.regions[r.id].hint}</span>}</div>
        ))}
      </div>
      {t.help.list.length > 0 && <ul>{t.help.list.map((x, i) => <li key={i}>{x}</li>)}</ul>}
      <h3>{Texts.matrix.leadQuestions}</h3>
      <ul>{t.leadQuestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </>
  );
}
