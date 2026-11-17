// Spots de la costa este y sureste de Gran Canaria, distancia estimada de cada ruta y su esquema en SVG.
// Las coordenadas son aproximadas: sirven para dibujar y estimar, no para navegar.
// Para añadir un spot: una línea en SPOTS, en su sitio de norte a sur.

import { esc } from "./util.js";

export const SPOTS = [
  { id: "garita", name: "La Garita", lat: 28.005, lon: -15.376 },
  { id: "melenara", name: "Melenara", lat: 27.99, lon: -15.371 },
  { id: "salinetas", name: "Salinetas", lat: 27.98, lon: -15.375 },
  { id: "tufia", name: "Tufia", lat: 27.962, lon: -15.378 },
  { id: "ojos", name: "Ojos de Garza", lat: 27.947, lon: -15.379 },
  { id: "burrero", name: "El Burrero", lat: 27.91, lon: -15.386 },
  { id: "vargas", name: "Vargas", lat: 27.885, lon: -15.391 },
  { id: "cabron", name: "El Cabrón", lat: 27.872, lon: -15.384 },
  { id: "arinaga", name: "Arinaga", lat: 27.857, lon: -15.394 },
  { id: "pozo", name: "Pozo Izquierdo", lat: 27.82, lon: -15.422 },
  { id: "formas", name: "Bahía de Formas", lat: 27.805, lon: -15.441 },
  { id: "castillo", name: "Castillo del Romeral", lat: 27.796, lon: -15.463 },
  { id: "feliz", name: "Bahía Feliz", lat: 27.78, lon: -15.512 },
  { id: "agustin", name: "San Agustín", lat: 27.77, lon: -15.542 },
  { id: "ingles", name: "Playa del Inglés", lat: 27.756, lon: -15.566 },
];

export const spotName = (id) => SPOTS.find((s) => s.id === id)?.name || "Por decidir";

// Carril mar adentro, más o menos a un kilómetro de la costa y por fuera de las puntas (Gando, Arinaga).
// Un run sale de su playa, sigue el carril y entra en la playa de llegada.
const LANE = [
  [28.01, -15.366], [27.99, -15.361], [27.975, -15.364], [27.955, -15.366], [27.936, -15.356], [27.915, -15.372],
  [27.89, -15.378], [27.868, -15.374], [27.856, -15.378], [27.838, -15.392], [27.814, -15.414], [27.798, -15.436],
  [27.787, -15.46], [27.776, -15.488], [27.77, -15.51], [27.76, -15.54], [27.747, -15.562],
];

const COAST = [
  [28.06, -15.405], [28.03, -15.392], [28.005, -15.378], [27.99, -15.373], [27.98, -15.377], [27.962, -15.38],
  [27.947, -15.381], [27.936, -15.366], [27.928, -15.372], [27.922, -15.387], [27.91, -15.388], [27.897, -15.39],
  [27.885, -15.393], [27.872, -15.385], [27.862, -15.38], [27.855, -15.396], [27.84, -15.404], [27.82, -15.424],
  [27.812, -15.429], [27.805, -15.443], [27.796, -15.465], [27.787, -15.49], [27.78, -15.514], [27.77, -15.544],
  [27.756, -15.568], [27.74, -15.586], [27.734, -15.598], [27.742, -15.625], [27.75, -15.66],
];

const GEO = { latMax: 28.03, latMin: 27.715, lonMin: -15.62, lonMax: -15.325 };
const MAP_H = 340;
const SCALE = MAP_H / (GEO.latMax - GEO.latMin);
const KX = Math.cos((27.88 * Math.PI) / 180);
const MAP_W = Math.round((GEO.lonMax - GEO.lonMin) * KX * SCALE);
const KM_PER_PX = 111.19 / SCALE;
const px = (lat, lon) => [(lon - GEO.lonMin) * KX * SCALE, (GEO.latMax - lat) * SCALE];
const r1 = (n) => Math.round(n * 10) / 10;
const LANE_PX = LANE.map(([lat, lon]) => px(lat, lon));

// Posición de un punto a lo largo del carril: índice del tramo más cercano + fracción recorrida
function lanePos(p) {
  let best = { d: Infinity, pos: 0 };
  for (let i = 0; i < LANE_PX.length - 1; i++) {
    const a = LANE_PX[i];
    const b = LANE_PX[i + 1];
    const vx = b[0] - a[0];
    const vy = b[1] - a[1];
    const t = Math.min(1, Math.max(0, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy)));
    const d = Math.hypot(p[0] - (a[0] + vx * t), p[1] - (a[1] + vy * t));
    if (d < best.d) best = { d, pos: i + t };
  }
  return best.pos;
}

// Puntos de la ruta en píxeles del mapa: playa de salida, vértices del carril que quedan entre medias y playa de llegada
function routePoints(startId, endId) {
  const a = SPOTS.find((s) => s.id === startId);
  const b = SPOTS.find((s) => s.id === endId);
  if (!a || !b || a === b) return [];
  const pa = px(a.lat, a.lon);
  const pb = px(b.lat, b.lon);
  const ta = lanePos(pa);
  const tb = lanePos(pb);
  const lo = Math.min(ta, tb);
  const hi = Math.max(ta, tb);
  const mid = LANE_PX.filter((_, i) => i > lo + 0.05 && i < hi - 0.05);
  if (ta > tb) mid.reverse();
  return [pa, ...mid, pb];
}

/** Distancia del run: la que escribió el organizador o, si no la puso, la estimada siguiendo el carril */
export function routeKm(run) {
  if (run.km) return { km: run.km, approx: false };
  const pts = routePoints(run.startId, run.endId);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { km: Math.max(1, Math.round(len * KM_PER_PX)), approx: true };
}

export function kmLabel(run) {
  const { km, approx } = routeKm(run);
  return `${approx ? "~" : ""}${String(km).replace(".", ",")} km`;
}

function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

const LAND_PATH = (() => {
  const pts = COAST.map(([lat, lon]) => px(lat, lon));
  return `M${pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(" L")} L-40 ${r1(pts[pts.length - 1][1])} L-40 -60 Z`;
})();

let mapSeq = 0;

/** SVG de la ruta sobre la costa. `thumb` es la miniatura de las tarjetas: sin rótulos y acercada a la ruta. */
export function routeMap(run, { thumb = false } = {}) {
  const id = `rm${++mapSeq}`;
  const pts = routePoints(run.startId, run.endId);
  const line = smoothPath(pts);
  let view = `0 0 ${MAP_W} ${MAP_H}`;

  if (thumb && pts.length) {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const ratio = 1.15;
    let h = Math.max(150, Math.max(...ys) - Math.min(...ys) + 70);
    let w = h / ratio;
    const spanX = Math.max(...xs) - Math.min(...xs) + 70;
    if (spanX > w) {
      w = spanX;
      h = w * ratio;
    }
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2 - w * 0.12;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    view = `${r1(cx - w / 2)} ${r1(cy - h / 2)} ${r1(w)} ${r1(h)}`;
  }

  const spots = thumb
    ? ""
    : SPOTS.map((s) => {
        const [x, y] = px(s.lat, s.lon);
        return `<circle class="spot" cx="${r1(x)}" cy="${r1(y)}" r="2.5"/>`;
      }).join("");

  const gusts = [
    [262, 44],
    [258, 138],
    [222, 236],
    [128, 306],
  ]
    .map(([x, y]) => `<path class="gust" d="M${x} ${y}l-9 19m0 0l-1-8m1 8l7-4"/>`)
    .join("");

  let ends = "";
  if (pts.length) {
    const s = pts[0];
    const e = pts[pts.length - 1];
    const label = (p, text, dy) => {
      const w = text.length * 6.3 + 14;
      const x = Math.max(4, p[0] - 12 - w);
      const y = Math.min(MAP_H - 24, Math.max(4, p[1] + dy));
      return `<rect class="label-bg" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="20" rx="10"/><text x="${r1(x + 7)}" y="${r1(y + 14)}">${esc(text)}</text>`;
    };
    const down = e[1] >= s[1];
    ends = `<circle class="pin pin--start" cx="${r1(s[0])}" cy="${r1(s[1])}" r="${thumb ? 8 : 6.5}"/>
      <circle class="pin pin--end" cx="${r1(e[0])}" cy="${r1(e[1])}" r="${thumb ? 8 : 6.5}"/>
      <circle cx="${r1(e[0])}" cy="${r1(e[1])}" r="${thumb ? 2.6 : 2.2}" fill="#0b0b09"/>
      ${thumb ? "" : label(s, spotName(run.startId), down ? -22 : 4) + label(e, spotName(run.endId), down ? 4 : -22)}`;
  }

  const alt = `Esquema de la costa este de Gran Canaria con la ruta de ${spotName(run.startId)} a ${spotName(run.endId)}`;
  return `<svg viewBox="${view}" ${thumb ? 'aria-hidden="true"' : `role="img" aria-label="${esc(alt)}"`} preserveAspectRatio="xMidYMid slice">
    <defs><pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><circle class="dots" cx="2" cy="2" r="1.1"/></pattern></defs>
    ${thumb ? "" : gusts}
    <path class="land" d="${LAND_PATH}"/>
    <path d="${LAND_PATH}" fill="url(#${id})"/>
    ${thumb ? "" : `<text class="sea-label" x="${MAP_W - 66}" y="${MAP_H - 14}">ALISIO</text>`}
    ${spots}
    ${line ? `<path class="route-under" d="${line}"/><path class="route" d="${line}"/>` : ""}
    ${ends}
  </svg>`;
}
