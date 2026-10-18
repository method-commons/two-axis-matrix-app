/*
 * Matrix als fertige SVG-Zeichnung (ohne Bedienung): Vorschaubild auf der Startseite und in der
 * Methodenwahl, Bild im Bericht und für den Export als PNG. Feste Farben (helles Papier), damit
 * das Bild auch außerhalb der App gleich aussieht.
 */
import { IO } from '../io.js';
import { Layout } from '../layout.js';
import { Model } from '../model.js';

const INK = '#344054';
const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';

/**
 * @param {{ m: Matrix, width: number, height: number, detail?: boolean, id?: string }} props
 * `detail`: mit Achsen, Beschriftungen und Nummern (Bericht); sonst Vorschaubild.
 */
export function MatrixSvg({ m, width, height, detail = false, id }) {
  const c = m.config;
  const pad = detail ? { l: 34, r: 8, t: 8, b: 34 } : { l: 0, r: 0, t: 0, b: 0 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const shapes = Layout.shapes(c, W, H);
  const clip = `clip-${id || m.id}`;
  const dot = detail ? Math.max(8, Math.min(11, W / 40)) : Math.max(3.5, W / 30);
  const placed = Model.placed(m);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ width: `${width}px`, height: `${height}px` }}
      role="img" aria-label={m.name} id={id} class="matrix-svg" font-family={FONT}>
      <rect width={width} height={height} fill="#ffffff" />
      <defs><clipPath id={clip}><rect x={0} y={0} width={W} height={H} /></clipPath></defs>
      <g transform={`translate(${pad.l} ${pad.t})`}>
        <g clip-path={`url(#${clip})`}>
          {shapes.map((s, i) => s.kind === 'rect'
            ? <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={Model.PALETTE[s.region.color].bg} stroke={c.layout === 'grid' ? '#ffffff' : 'none'} stroke-width={c.layout === 'grid' ? 1.5 : 0} />
            : <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={Model.PALETTE[s.region.color].bg} stroke="#ffffff" stroke-width={1.5} />)}
        </g>
        {detail && Layout.labelAnchors(c).map(a => (
          <text key={a.region.id} x={a.left * W + (a.alignX === 'end' ? -6 : 6)} y={a.top * H + (a.alignY === 'top' ? 14 : -6)}
            text-anchor={a.alignX} font-size="11" font-weight="700" fill={Model.PALETTE[a.region.color].fg}>{a.region.label}</text>
        ))}
        {detail && <path d={`M0 0 V${H} H${W}`} fill="none" stroke={INK} stroke-width="1.5" />}
        {c.view === 'board' && shapes.map(sh => sh.kind === 'rect' && boardItems(m, sh, detail))}
        {c.view !== 'board' && placed.map(it => {
          const p = Layout.toScreen(c, /** @type {number} */ (it.x), /** @type {number} */ (it.y));
          const x = (p.left / 100) * W;
          const y = H - (p.bottom / 100) * H;
          const col = Model.PALETTE[Layout.colorOf(m, it)].fg;
          return (
            <g key={it.id}>
              <circle cx={x} cy={y} r={dot} fill={col} stroke="#ffffff" stroke-width={detail ? 1.5 : 1} />
              {detail && <text x={x} y={y + 3.5} text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">{it.no}</text>}
            </g>
          );
        })}
      </g>
      {detail && <>
        <text x={pad.l + W / 2} y={height - 6} text-anchor="middle" font-size="10.5" font-weight="700" fill={INK}>{(c.x.label || 'X').toUpperCase()} {c.x.reverse ? '←' : '→'}</text>
        <text x={12} y={pad.t + H / 2} text-anchor="middle" font-size="10.5" font-weight="700" fill={INK} transform={`rotate(-90 12 ${pad.t + H / 2})`}>{(c.y.label || 'Y').toUpperCase()} {c.y.reverse ? '←' : '→'}</text>
        <text x={pad.l} y={pad.t + H + 13} text-anchor="start" font-size="9.5" fill="#667085">{c.x.reverse ? c.x.high || IO.num(c.x.max) : c.x.low || IO.num(c.x.min)}</text>
        <text x={pad.l + W} y={pad.t + H + 13} text-anchor="end" font-size="9.5" fill="#667085">{c.x.reverse ? c.x.low || IO.num(c.x.min) : c.x.high || IO.num(c.x.max)}</text>
      </>}
    </svg>
  );
}

/**
 * Karten-Darstellung: Einträge eines Felds als Balken (Vorschaubild) bzw. nummerierte Kreise
 * in Reihen (Bericht) statt an ihrer Position – bei zwei Stufen je Achse lägen sonst alle
 * Einträge eines Felds auf einem Punkt.
 * @param {Matrix} m @param {{ region: Region, x: number, y: number, w: number, h: number }} sh @param {boolean} detail
 */
function boardItems(m, sh, detail) {
  const items = Model.placed(m).filter(it => Layout.regionOf(m, it) === sh.region).sort((a, b) => a.no - b.no);
  const col = Model.PALETTE[sh.region.color].fg;
  if (!detail) {
    const n = Math.max(1, Math.floor((sh.h - 8) / 9));
    return items.slice(0, n).map((it, i) => (
      <rect key={it.id} x={sh.x + 5} y={sh.y + 5 + i * 9} width={Math.max(4, sh.w - 10)} height={6} rx={1.5} fill="#ffffff" stroke={col} stroke-opacity=".35" stroke-width={0.75} />
    ));
  }
  const per = Math.max(1, Math.floor((sh.w - 12) / 24));
  return items.map((it, i) => {
    const x = sh.x + 18 + (i % per) * 24;
    const y = sh.y + 34 + Math.floor(i / per) * 24;
    if (y > sh.y + sh.h - 6) return null;
    return (
      <g key={it.id}>
        <circle cx={x} cy={y} r={9} fill={col} stroke="#ffffff" stroke-width={1.5} opacity={it.values.done === true ? 0.4 : 1} />
        <text x={x} y={y + 3.5} text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">{it.no}</text>
      </g>
    );
  });
}

/**
 * SVG-Element als PNG (doppelte Auflösung).
 * @param {SVGSVGElement} svg @returns {Promise<Blob | null>}
 */
export function svgToPng(svg) {
  const text = new XMLSerializer().serializeToString(svg);
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
  const w = Number(svg.getAttribute('width'));
  const h = Number(svg.getAttribute('height'));
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
