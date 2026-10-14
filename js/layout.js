/*
 * Layout – Geometrie der Fläche: Werte ↔ Anteile (0 … 1), Bereich eines Punkts je Aufteilung
 * (vier Felder, Raster mit Stufen, Zonen), Stufen einer Achse, Umrechnen bei geänderter Skala
 * und Position aus Antworten auf Fragen. Ohne DOM. Exportiert den Namensraum `Layout`.
 *
 * Neue Aufteilung ergänzen: Funktion in `RESOLVERS` eintragen (Punkt → Bereich) und die
 * Zeichnung in js/ui/plot.jsx bzw. js/ui/svg.jsx ergänzen.
 */
import { Model } from './model.js';
import { Util } from './util.js';

export const Layout = (() => {
  /** Wert → Anteil 0 … 1 der Achse. @param {Axis} a @param {number} v */
  function norm(a, v) {
    return Util.clamp((v - a.min) / (a.max - a.min), 0, 1);
  }

  /** Anteil 0 … 1 → Wert auf der Skala (auf Schritte gerundet). @param {Axis} a @param {number} u */
  function denorm(a, u) {
    return Util.snap(a.min + Util.clamp(u, 0, 1) * (a.max - a.min), a.min, a.max, a.step);
  }

  /**
   * Position auf der Zeichenfläche in Prozent (links, unten) – berücksichtigt umgekehrte Achsen.
   * @param {MatrixConfig} c @param {number} x @param {number} y
   */
  function toScreen(c, x, y) {
    const u = norm(c.x, x);
    const v = norm(c.y, y);
    return { left: (c.x.reverse ? 1 - u : u) * 100, bottom: (c.y.reverse ? 1 - v : v) * 100 };
  }

  /**
   * Anteile der Zeichenfläche (0 … 1 von links bzw. unten) → Werte.
   * @param {MatrixConfig} c @param {number} fx @param {number} fy @returns {Point}
   */
  function fromScreen(c, fx, fy) {
    return { x: denorm(c.x, c.x.reverse ? 1 - fx : fx), y: denorm(c.y, c.y.reverse ? 1 - fy : fy) };
  }

  /** Stufen einer Achse (nur mit Schrittweite). @param {Axis} a @returns {number[]} */
  function steps(a) {
    if (!(a.step > 0)) return [];
    const n = Math.min(100, Math.round((a.max - a.min) / a.step));
    const out = [];
    for (let i = 0; i <= n; i++) out.push(Util.snap(a.min + i * a.step, a.min, a.max, a.step));
    return [...new Set(out)];
  }

  /** Wert (Produkt) einer Zelle im Raster. @param {number} x @param {number} y */
  function score(x, y) {
    return Math.round(x * y * 100) / 100;
  }

  /**
   * Bereich eines Punkts je Aufteilung.
   * @type {Record<LayoutKind, (c: MatrixConfig, x: number, y: number) => Region | null>}
   */
  const RESOLVERS = {
    quadrants(c, x, y) {
      const qx = x >= c.split.x ? 'high' : 'low';
      const qy = y >= c.split.y ? 'high' : 'low';
      return c.regions.find(r => r.qx === qx && r.qy === qy) || null;
    },
    grid(c, x, y) {
      const s = score(x, y);
      const sorted = c.regions.filter(r => r.min != null).sort((a, b) => /** @type {number} */ (b.min) - /** @type {number} */ (a.min));
      return sorted.find(r => s >= /** @type {number} */ (r.min)) || sorted[sorted.length - 1] || null;
    },
    zones(c, x, y) {
      const d = distance(c, x, y);
      const sorted = c.regions.filter(r => r.r != null).sort((a, b) => /** @type {number} */ (a.r) - /** @type {number} */ (b.r));
      return sorted.find(r => d <= /** @type {number} */ (r.r)) || sorted[sorted.length - 1] || null;
    },
  };

  /** Abstand vom Ursprung (niedrig/niedrig) in Anteilen der Achsen, 0 … 1,42. @param {MatrixConfig} c @param {number} x @param {number} y */
  function distance(c, x, y) {
    return Math.hypot(norm(c.x, x), norm(c.y, y));
  }

  /** Bereich an einer Stelle. @param {MatrixConfig} c @param {number} x @param {number} y */
  function regionAt(c, x, y) {
    return RESOLVERS[c.layout](c, x, y);
  }

  /** Bereich eines Eintrags (`null`, wenn nicht eingeordnet). @param {Matrix} m @param {Item} it */
  function regionOf(m, it) {
    return it.x == null || it.y == null ? null : regionAt(m.config, it.x, it.y);
  }

  /**
   * Stelle, an die ein Eintrag beim Ablegen in einen Bereich gesetzt wird: Mitte des Felds
   * (vier Felder), Zelle mit passendem Wert (Raster) bzw. Mitte des Rings (Zonen).
   * @param {MatrixConfig} c @param {Region} r @returns {Point}
   */
  function centerOf(c, r) {
    if (c.layout === 'quadrants') {
      const mid = (/** @type {Axis} */ a, /** @type {number} */ s, /** @type {'high' | 'low' | undefined} */ q) => Util.snap(q === 'high' ? (s + a.max) / 2 : (a.min + s) / 2, a.min, a.max, a.step);
      const p = { x: mid(c.x, c.split.x, r.qx), y: mid(c.y, c.split.y, r.qy) };
      // Rundung kann auf die Trennlinie fallen – dann eine Stufe weiter
      if (regionAt(c, p.x, p.y) !== r) {
        if (r.qx === 'low' && p.x >= c.split.x) p.x = Util.snap(c.split.x - (c.x.step || 0.1), c.x.min, c.x.max, c.x.step);
        if (r.qy === 'low' && p.y >= c.split.y) p.y = Util.snap(c.split.y - (c.y.step || 0.1), c.y.min, c.y.max, c.y.step);
      }
      return p;
    }
    if (c.layout === 'zones') {
      const sorted = c.regions.filter(z => z.r != null).sort((a, b) => /** @type {number} */ (a.r) - /** @type {number} */ (b.r));
      const i = sorted.indexOf(r);
      const inner = i > 0 ? /** @type {number} */ (sorted[i - 1].r) : 0;
      const outer = Math.min(/** @type {number} */ (r.r), Math.SQRT2);
      const d = (inner + outer) / 2 / Math.SQRT2;
      return { x: denorm(c.x, d), y: denorm(c.y, d) };
    }
    // Raster: Zelle auf der Diagonalen bzw. erste Zelle, deren Wert zum Bereich gehört
    const xs = steps(c.x).length ? steps(c.x) : [0.1, 0.3, 0.5, 0.7, 0.9].map(u => denorm(c.x, u));
    const ys = steps(c.y).length ? steps(c.y) : [0.1, 0.3, 0.5, 0.7, 0.9].map(u => denorm(c.y, u));
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      const p = { x: xs[Math.min(i, xs.length - 1)], y: ys[Math.min(i, ys.length - 1)] };
      if (regionAt(c, p.x, p.y) === r) return p;
    }
    for (const x of xs) for (const y of ys) if (regionAt(c, x, y) === r) return { x, y };
    return { x: xs[0], y: ys[0] };
  }

  /**
   * Wert auf eine geänderte Skala umrechnen (gleicher Anteil der Achse).
   * @param {Axis} from @param {Axis} to @param {number} v
   */
  function rescale(from, to, v) {
    return denorm(to, norm(from, v));
  }

  /**
   * Position aus den Antworten auf die Fragen: je Achse Mittelwert der Antworten
   * (1 = trifft zu → niedrig, 5 = trifft nicht zu → hoch). Achsen ohne Antwort fehlen.
   * @param {MatrixConfig} c @param {Record<string, number>} answers @returns {Partial<Point>}
   */
  function fromAnswers(c, answers) {
    /** @type {Partial<Point>} */
    const out = {};
    for (const axis of /** @type {const} */ (['x', 'y'])) {
      const vals = c.questions.filter(q => q.axis === axis && answers[q.id] != null).map(q => answers[q.id]);
      if (!vals.length) continue;
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      out[axis] = denorm(c[axis], (avg - 1) / (Model.ANSWER_MAX - 1));
    }
    return out;
  }

  /** Einträge je Bereich (Reihenfolge der Bereiche). @param {Matrix} m @returns {Map<Region, Item[]>} */
  function byRegion(m) {
    /** @type {Map<Region, Item[]>} */
    const map = new Map(m.config.regions.map(r => [r, []]));
    for (const it of Model.placed(m)) {
      const r = regionOf(m, it);
      if (r) /** @type {Item[]} */ (map.get(r)).push(it);
    }
    return map;
  }

  /**
   * Rangfolge der eingeordneten Einträge: Wert ÷ Aufwand (y ÷ x, absteigend) bzw. Produkt
   * (x × y, absteigend); sonst nach Nummer.
   * @param {Matrix} m @returns {{ item: Item, score: number | null }[]}
   */
  function ranking(m) {
    const rank = m.config.rank;
    const list = Model.placed(m).map(item => {
      const x = /** @type {number} */ (item.x);
      const y = /** @type {number} */ (item.y);
      const s = rank === 'ratio' ? (x > 0 ? Math.round((y / x) * 100) / 100 : y > 0 ? Infinity : 0) : rank === 'product' ? score(x, y) : null;
      return { item, score: s };
    });
    if (rank === 'none') return list.sort((a, b) => a.item.no - b.item.no);
    return list.sort((a, b) => /** @type {number} */ (b.score) - /** @type {number} */ (a.score) || a.item.no - b.item.no);
  }

  /**
   * Farbe eines Eintrags: Farbe der gewählten Option im ersten Auswahlfeld mit Farben
   * (z. B. Haltung), sonst die Farbe des Bereichs; nicht eingeordnet grau.
   * @param {Matrix} m @param {Item} it @returns {ColorKey}
   */
  function colorOf(m, it) {
    const f = colorField(m.config);
    if (f) {
      const o = (f.options || []).find(x => x.id === it.values[f.key]);
      if (o && o.color) return o.color;
    }
    const r = regionOf(m, it);
    return r ? r.color : 'gray';
  }

  /** Erstes Auswahlfeld mit Farben (bestimmt die Farbe der Punkte). @param {MatrixConfig} c */
  function colorField(c) {
    return c.fields.find(f => f.type === 'choice' && (f.options || []).some(o => o.color)) || null;
  }

  /**
   * @typedef {{ region: Region, kind: 'rect', x: number, y: number, w: number, h: number }
   *   | { region: Region, kind: 'ellipse', cx: number, cy: number, rx: number, ry: number }} Shape
   */

  /**
   * Flächen der Bereiche für eine Zeichnung der Größe W × H (y nach unten): Rechtecke
   * (vier Felder, Raster) bzw. Ellipsen um den Ursprung (Zonen, die äußerste als Rechteck).
   * Reihenfolge = Zeichenreihenfolge.
   * @param {MatrixConfig} c @param {number} W @param {number} H @returns {Shape[]}
   */
  function shapes(c, W, H) {
    /** @type {Shape[]} */
    const out = [];
    if (c.layout === 'quadrants') {
      const s = toScreen(c, c.split.x, c.split.y);
      const sx = s.left / 100;
      const sy = 1 - s.bottom / 100;
      for (const r of c.regions) {
        if (!r.qx || !r.qy) continue;
        const right = (r.qx === 'high') !== c.x.reverse;
        const top = (r.qy === 'high') !== c.y.reverse;
        out.push({ region: r, kind: 'rect', x: right ? sx * W : 0, y: top ? 0 : sy * H, w: (right ? 1 - sx : sx) * W, h: (top ? sy : 1 - sy) * H });
      }
    } else if (c.layout === 'zones') {
      const sorted = c.regions.filter(r => r.r != null).sort((a, b) => /** @type {number} */ (b.r) - /** @type {number} */ (a.r));
      const cx = c.x.reverse ? W : 0;
      const cy = c.y.reverse ? 0 : H;
      sorted.forEach((r, i) => {
        if (i === 0) out.push({ region: r, kind: 'rect', x: 0, y: 0, w: W, h: H });
        else out.push({ region: r, kind: 'ellipse', cx, cy, rx: /** @type {number} */ (r.r) * W, ry: /** @type {number} */ (r.r) * H });
      });
    } else {
      const xs = steps(c.x);
      const ys = steps(c.y);
      const nx = xs.length || 20;
      const ny = ys.length || 20;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const x = xs.length ? xs[i] : denorm(c.x, (i + 0.5) / nx);
          const y = ys.length ? ys[j] : denorm(c.y, (j + 0.5) / ny);
          const r = regionAt(c, x, y);
          if (!r) continue;
          const col = c.x.reverse ? nx - 1 - i : i;
          const row = c.y.reverse ? j : ny - 1 - j;
          out.push({ region: r, kind: 'rect', x: (col * W) / nx, y: (row * H) / ny, w: W / nx, h: H / ny });
        }
      }
    }
    return out;
  }

  /**
   * Stellen für die Namen der Bereiche (Anteile von links/oben, Ausrichtung): äußere Ecken der
   * vier Felder bzw. entlang der unteren Kante für Zonen; im Raster keine (Legende).
   * @param {MatrixConfig} c
   * @returns {{ region: Region, left: number, top: number, alignX: 'start' | 'end', alignY: 'top' | 'bottom' }[]}
   */
  function labelAnchors(c) {
    if (c.layout === 'quadrants') {
      return c.regions.filter(r => r.qx && r.qy).map(r => {
        const right = (r.qx === 'high') !== c.x.reverse;
        const top = (r.qy === 'high') !== c.y.reverse;
        return { region: r, left: right ? 1 : 0, top: top ? 0 : 1, alignX: right ? 'end' : 'start', alignY: top ? 'top' : 'bottom' };
      });
    }
    if (c.layout === 'zones') {
      const sorted = c.regions.filter(r => r.r != null).sort((a, b) => /** @type {number} */ (a.r) - /** @type {number} */ (b.r));
      const bottom = c.y.reverse ? 0 : 1;
      return sorted.map((r, i) => {
        if (i === sorted.length - 1) {
          return { region: r, left: c.x.reverse ? 0 : 1, top: 1 - bottom, alignX: c.x.reverse ? 'start' : 'end', alignY: bottom ? 'top' : 'bottom' };
        }
        const inner = i > 0 ? /** @type {number} */ (sorted[i - 1].r) : 0;
        const u = Math.min(inner + 0.02, 0.95);
        return { region: r, left: c.x.reverse ? 1 - u : u, top: bottom, alignX: c.x.reverse ? 'end' : 'start', alignY: bottom ? 'bottom' : 'top' };
      });
    }
    return [];
  }

  return { norm, denorm, toScreen, fromScreen, steps, score, distance, RESOLVERS, regionAt, regionOf, centerOf, rescale, fromAnswers, byRegion, ranking, colorOf, colorField, shapes, labelAnchors };
})();
