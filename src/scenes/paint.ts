// Pintor del claro (Canvas2D): pradera con textura, micelio luminoso y objetos ilustrados.
// Solo dibuja a partir de datos; los colores salen de theme.ts. Es determinista (sin Math.random):
// la variación sale de un hash de la casilla.
import { H, neighbors, seasonIndex, W, type GameState, type Tile } from '../rules';
import { BOARD_ART, FROST_FADED, rgba, SEASON_SLUGS, type ColorToken, type SeasonSlug } from '../theme';

/** Busca una pieza pintada ya cargada (clave = ruta bajo `public/assets/`). */
export type ArtLookup = (key: string) => CanvasImageSource | undefined;

export interface PaintInput {
  readonly game: GameState;
  /** Casillas resaltadas para el miembro seleccionado ("x,y"). */
  readonly valid: ReadonlySet<string>;
  /** Casilla con la ★ sugerida. */
  readonly star: { x: number; y: number } | null;
  /** Casillas con un miembro trabajando encima ("x,y"): su objeto no se pinta. */
  readonly occupied: ReadonlySet<string>;
  /** El Árbol Padre se dibuja aparte con su sprite de Blender: aquí solo su aura y su aro. */
  readonly fatherSprite?: boolean;
  /** Piezas pintadas del tablero (cambio 010). Sin ellas, o si falta una, se usa el dibujo vectorial. */
  readonly art?: ArtLookup;
  /** Saturación del escenario, 0–1 (003 · el color vuelve). Sin valor: color pleno. */
  readonly saturation?: number;
}

/**
 * Saturación del claro según el progreso (003): apagado al empezar y color pleno al despertar al Árbol Padre.
 * FLOOR + (1 − FLOOR) × (árboles vivos + Árbol Padre × 2) / (árboles del claro + 2). El piso subió de 0,15
 * a 0,4 con las piezas pintadas (010): casi gris, el claro permes el arte.
 */
export const SATURATION_FLOOR = 0.4;
export function progressSaturation(game: GameState): number {
  const trees = game.tiles.filter((t) => t.kind === 'tree');
  const alive = trees.filter((t) => t.alive).length;
  const father = game.tiles.some((t) => t.kind === 'mother' && t.alive) ? 2 : 0;
  return Math.min(1, SATURATION_FLOOR + ((1 - SATURATION_FLOOR) * (alive + father)) / (trees.length + 2));
}

/** Lo que se pintó en cada casilla (para pruebas). */
export interface Painted {
  readonly x: number;
  readonly y: number;
  readonly object: Tile['kind'] | 'none';
  /** Pieza pintada usada para el objeto (si hubo arte). */
  readonly art?: string;
  /** Árbol apagado: lleva el velo fijo y el copo (019). */
  readonly faded?: boolean;
}

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

/** Hash determinista 0–1 por casilla y semilla. */
function hash(x: number, y: number, i = 0): number {
  let h = (x * 374761393 + y * 668265263 + i * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function radial(ctx: Ctx, x: number, y: number, r: number, stops: [number, ColorToken, number][]) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [at, c, a] of stops) g.addColorStop(at, rgba(c, a));
  return g;
}

function linear(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: [number, ColorToken, number][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, c, a] of stops) g.addColorStop(at, rgba(c, a));
  return g;
}

// ─── Suelo ─────────────────────────────────────────────────────────────────────
function paintGround(ctx: Ctx, T: number, game: GameState) {
  ctx.fillStyle = rgba('meadowDark');
  ctx.fillRect(0, 0, W * T, H * T);
  for (const t of game.tiles) {
    const x = t.x * T;
    const y = t.y * T;
    const inset = T * 0.035;
    // Almohadilla de pradera con luz desde arriba a la izquierda.
    roundRect(ctx, x + inset, y + inset, T - 2 * inset, T - 2 * inset, T * 0.2);
    ctx.fillStyle = linear(ctx, x, y, x + T, y + T, [
      [0, 'meadow', 1],
      [1, hash(t.x, t.y) > 0.5 ? 'meadowDark' : 'meadow', 0.95],
    ]);
    ctx.fill();
    ctx.fillStyle = radial(ctx, x + T * 0.32, y + T * 0.28, T * 0.6, [
      [0, 'glow', 0.35],
      [1, 'glow', 0],
    ]);
    ctx.fill();
    // Motas de tierra y semillas.
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = rgba(i % 2 ? 'leafDark' : 'soil', 0.18);
      ctx.beginPath();
      ctx.arc(x + T * (0.15 + 0.7 * hash(t.x, t.y, i)), y + T * (0.15 + 0.7 * hash(t.x, t.y, i + 9)), T * 0.018, 0, TAU);
      ctx.fill();
    }
    if (t.kind !== 'soil' || t.net) continue;
    // Pasto: briznas curvas.
    const tufts = 1 + Math.floor(hash(t.x, t.y, 3) * 2);
    for (let k = 0; k < tufts; k++) {
      const bx = x + T * (0.2 + 0.6 * hash(t.x, t.y, 20 + k));
      const by = y + T * (0.55 + 0.3 * hash(t.x, t.y, 30 + k));
      ctx.strokeStyle = rgba(k % 2 ? 'leafDark' : 'leaf', 0.95);
      ctx.lineWidth = T * 0.022;
      ctx.lineCap = 'round';
      for (const [dx, h, bend] of [
        [-0.05, 0.13, -0.05],
        [0, 0.17, 0.02],
        [0.05, 0.12, 0.06],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(bx + T * dx * 0.4, by);
        ctx.quadraticCurveTo(bx + T * (dx + bend * 0.5), by - T * h * 0.6, bx + T * (dx + bend), by - T * h);
        ctx.stroke();
      }
    }
    // Florecitas.
    if (hash(t.x, t.y, 7) > 0.72) {
      const fx = x + T * (0.25 + 0.5 * hash(t.x, t.y, 8));
      const fy = y + T * (0.25 + 0.3 * hash(t.x, t.y, 9));
      const petal: ColorToken = hash(t.x, t.y, 10) > 0.5 ? 'glow' : 'peach';
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * TAU;
        ctx.fillStyle = rgba(petal);
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * T * 0.035, fy + Math.sin(a) * T * 0.035, T * 0.028, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = rgba('sun');
      ctx.beginPath();
      ctx.arc(fx, fy, T * 0.022, 0, TAU);
      ctx.fill();
    }
  }
}

// ─── Red de micelio ────────────────────────────────────────────────────────────
function paintNet(ctx: Ctx, T: number, game: GameState) {
  for (const t of game.tiles) {
    if (!t.net) continue;
    const cx = (t.x + 0.5) * T;
    const cy = (t.y + 0.5) * T;
    ctx.fillStyle = radial(ctx, cx, cy, T * 0.62, [
      [0, 'mycelium', 0.75],
      [0.7, 'mycelium', 0.35],
      [1, 'mycelium', 0],
    ]);
    ctx.fillRect(t.x * T, t.y * T, T, T);
  }
  // Hilos ondulados entre casillas vecinas, con resplandor.
  const threads: [number, number, number, number, number][] = [];
  for (const t of game.tiles) {
    if (!t.net) continue;
    for (const n of neighbors(game, t.x, t.y)) {
      if (!n.net || n.y * W + n.x < t.y * W + t.x) continue;
      threads.push([(t.x + 0.5) * T, (t.y + 0.5) * T, (n.x + 0.5) * T, (n.y + 0.5) * T, hash(t.x + n.x, t.y + n.y, 5) - 0.5]);
    }
  }
  const strokeThreads = (width: number, color: ColorToken, alpha: number, blur: number) => {
    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.shadowColor = rgba('mycelium', 0.9);
    ctx.shadowBlur = blur;
    for (const [x0, y0, x1, y1, w] of threads) {
      const mx = (x0 + x1) / 2 + (y1 - y0) * w * 0.35;
      const my = (y0 + y1) / 2 + (x0 - x1) * w * 0.35;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(mx, my, x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  };
  strokeThreads(T * 0.075, 'mycelium', 1, T * 0.3);
  strokeThreads(T * 0.025, 'glow', 1, 0);
  // Nudos y destellos índigo del tejido.
  for (const t of game.tiles) {
    if (!t.net) continue;
    const cx = (t.x + 0.5) * T;
    const cy = (t.y + 0.5) * T;
    ctx.fillStyle = rgba('glow');
    ctx.beginPath();
    ctx.arc(cx, cy, T * 0.04, 0, TAU);
    ctx.fill();
    if (t.kind === 'soil') {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = rgba('indigo', 0.85);
        ctx.beginPath();
        ctx.arc(t.x * T + T * (0.2 + 0.6 * hash(t.x, t.y, 40 + i)), t.y * T + T * (0.2 + 0.6 * hash(t.x, t.y, 50 + i)), T * (0.018 + 0.015 * i), 0, TAU);
        ctx.fill();
      }
    }
  }
}

// ─── Objetos ───────────────────────────────────────────────────────────────────
const outline = (ctx: Ctx, T: number) => {
  ctx.strokeStyle = rgba('ink');
  ctx.lineWidth = T * 0.03;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
};

function softShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = rgba('ink', 0.18);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function paintLog(ctx: Ctx, T: number, t: Tile) {
  const cx = (t.x + 0.5) * T;
  const cy = (t.y + 0.55) * T;
  const w = T * 0.7;
  const h = T * 0.27;
  softShadow(ctx, cx, cy + h * 0.55, w * 0.55, h * 0.3);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = linear(ctx, 0, -h / 2, 0, h / 2, [
    [0, 'wood', 1],
    [0.55, 'wood', 1],
    [1, 'bark', 1],
  ]);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  // Vetas de corteza.
  ctx.strokeStyle = rgba('bark', 0.8);
  ctx.lineWidth = T * 0.015;
  for (const k of [-0.25, -0.05, 0.15]) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.35 + k * T * 0.2, -h * 0.2);
    ctx.bezierCurveTo(-w * 0.1, -h * 0.35 + k * h, w * 0.05, h * 0.1, w * 0.25, -h * 0.05 + k * h);
    ctx.stroke();
  }
  // Corte con anillos.
  const ex = w / 2 - h * 0.35;
  ctx.fillStyle = rgba('peach');
  ctx.beginPath();
  ctx.ellipse(ex, 0, h * 0.36, h * 0.48, 0, 0, TAU);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  ctx.strokeStyle = rgba('wood', 0.7);
  ctx.lineWidth = T * 0.012;
  for (const r of [0.26, 0.14]) {
    ctx.beginPath();
    ctx.ellipse(ex, 0, h * r, h * r * 1.3, 0, 0, TAU);
    ctx.stroke();
  }
  if (t.uses) {
    // Grieta: ya se descompuso una vez.
    ctx.strokeStyle = rgba('ink', 0.7);
    ctx.lineWidth = T * 0.018;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.5);
    ctx.lineTo(-w * 0.12, -h * 0.05);
    ctx.lineTo(-w * 0.2, h * 0.15);
    ctx.lineTo(-w * 0.1, h * 0.5);
    ctx.stroke();
  } else {
    // Hongo diminuto y musgo.
    ctx.fillStyle = rgba('leaf');
    ctx.beginPath();
    ctx.ellipse(-w * 0.15, -h * 0.45, w * 0.16, h * 0.16, 0, Math.PI, TAU);
    ctx.fill();
    ctx.fillStyle = rgba('paper');
    ctx.fillRect(-w * 0.31, -h * 0.75, T * 0.03, h * 0.3);
    ctx.fillStyle = rgba('berry');
    ctx.beginPath();
    ctx.ellipse(-w * 0.295, -h * 0.75, T * 0.06, T * 0.045, 0, Math.PI, TAU);
    ctx.fill();
    outline(ctx, T);
    ctx.lineWidth = T * 0.015;
    ctx.stroke();
  }
  ctx.restore();
}

function paintRock(ctx: Ctx, T: number, t: Tile) {
  const cx = (t.x + 0.5) * T;
  const cy = (t.y + 0.58) * T;
  const r = T * 0.3;
  const wob = (i: number) => 1 + (hash(t.x, t.y, 60 + i) - 0.5) * 0.22;
  softShadow(ctx, cx, cy + r * 0.62, r * 1.05, r * 0.28);
  ctx.beginPath();
  const pts = 9;
  for (let i = 0; i <= pts; i++) {
    const a = Math.PI + (i / pts) * Math.PI;
    const px = cx + Math.cos(a) * r * 1.1 * wob(i);
    const py = cy + Math.sin(a) * r * 0.95 * wob(i);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.quadraticCurveTo(cx + r * 1.15, cy + r * 0.55, cx, cy + r * 0.6);
  ctx.quadraticCurveTo(cx - r * 1.15, cy + r * 0.55, cx - r * 1.1 * wob(0), cy);
  ctx.closePath();
  ctx.fillStyle = linear(ctx, cx - r, cy - r, cx + r, cy + r, [
    [0, 'stone', 1],
    [1, 'stoneDark', 1],
  ]);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  // Musgo en la cima y brillo.
  ctx.fillStyle = rgba('leaf', 0.95);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.15, cy - r * 0.72, r * 0.55, r * 0.2, -0.15, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba('glow', 0.55);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.45, cy - r * 0.2, r * 0.18, r * 0.09, -0.6, 0, TAU);
  ctx.fill();
}

function paintTree(ctx: Ctx, T: number, t: Tile) {
  const big = t.kind === 'mother';
  const cx = (t.x + 0.5) * T;
  const base = (t.y + (big ? 0.95 : 0.9)) * T;
  const s = big ? 1.12 : 1;
  const alive = t.alive;
  const [light, dark]: [ColorToken, ColorToken] = alive ? ['leaf', 'leafDark'] : ['stone', 'stoneDark'];
  softShadow(ctx, cx, base, T * 0.3 * s, T * 0.06);
  // Tronco con raíces.
  ctx.beginPath();
  ctx.moveTo(cx - T * 0.16 * s, base);
  ctx.quadraticCurveTo(cx - T * 0.06 * s, base - T * 0.05, cx - T * 0.055 * s, base - T * 0.32 * s);
  ctx.lineTo(cx + T * 0.055 * s, base - T * 0.32 * s);
  ctx.quadraticCurveTo(cx + T * 0.06 * s, base - T * 0.05, cx + T * 0.16 * s, base);
  ctx.closePath();
  ctx.fillStyle = linear(ctx, cx - T * 0.1, 0, cx + T * 0.1, 0, [
    [0, 'wood', 1],
    [1, 'bark', 1],
  ]);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  // Copa: bolas superpuestas; primero el contorno de todas, después el relleno (contorno limpio).
  const cy = base - T * 0.47 * s;
  const R = T * 0.21 * s;
  const blobs: [number, number, number][] = [
    [-0.95, 0.25, 0.75],
    [0.95, 0.25, 0.75],
    [-0.5, -0.45, 0.85],
    [0.5, -0.45, 0.85],
    [0, 0.1, 1],
    [0, -0.85, 0.7],
  ];
  ctx.fillStyle = rgba('ink');
  for (const [dx, dy, r] of blobs) {
    ctx.beginPath();
    ctx.arc(cx + dx * R, cy + dy * R, r * R + T * 0.03, 0, TAU);
    ctx.fill();
  }
  for (const [dx, dy, r] of blobs) {
    ctx.beginPath();
    ctx.arc(cx + dx * R, cy + dy * R, r * R, 0, TAU);
    ctx.fillStyle = radial(ctx, cx + dx * R - r * R * 0.35, cy + dy * R - r * R * 0.4, r * R * 1.4, [
      [0, light, 1],
      [0.6, light, 1],
      [1, dark, 1],
    ]);
    ctx.fill();
  }
  if (alive) {
    // Flores y brillo: el árbol respira.
    for (let i = 0; i < (big ? 7 : 4); i++) {
      const a = hash(t.x, t.y, 70 + i) * TAU;
      const d = R * (0.4 + 0.9 * hash(t.x, t.y, 80 + i));
      ctx.fillStyle = rgba(i % 2 ? 'berry' : 'glow');
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, T * 0.025, 0, TAU);
      ctx.fill();
    }
  } else {
    // Hojas secas que caen.
    ctx.fillStyle = rgba('stoneDark', 0.8);
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + R * (1.2 - 2.4 * i), base - T * 0.08 - i * T * 0.06, T * 0.03, T * 0.015, 0.6, 0, TAU);
      ctx.fill();
    }
  }
  ctx.fillStyle = rgba('glow', alive ? 0.5 : 0.25);
  ctx.beginPath();
  ctx.ellipse(cx - R * 0.55, cy - R * 0.75, R * 0.32, R * 0.18, -0.5, 0, TAU);
  ctx.fill();
}

function paintHome(ctx: Ctx, T: number, t: Tile) {
  const cx = (t.x + 0.5) * T;
  const base = (t.y + 0.88) * T;
  softShadow(ctx, cx, base, T * 0.3, T * 0.06);
  // Tallo-casa.
  ctx.beginPath();
  ctx.moveTo(cx - T * 0.2, base);
  ctx.quadraticCurveTo(cx - T * 0.23, base - T * 0.22, cx - T * 0.16, base - T * 0.34);
  ctx.lineTo(cx + T * 0.16, base - T * 0.34);
  ctx.quadraticCurveTo(cx + T * 0.23, base - T * 0.22, cx + T * 0.2, base);
  ctx.closePath();
  ctx.fillStyle = linear(ctx, cx - T * 0.2, 0, cx + T * 0.2, 0, [
    [0, 'paper', 1],
    [1, 'peach', 1],
  ]);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  // Puerta y ventana iluminada.
  ctx.beginPath();
  ctx.moveTo(cx - T * 0.06, base);
  ctx.lineTo(cx - T * 0.06, base - T * 0.12);
  ctx.arc(cx, base - T * 0.12, T * 0.06, Math.PI, 0);
  ctx.lineTo(cx + T * 0.06, base);
  ctx.closePath();
  ctx.fillStyle = rgba('wood');
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba('sun');
  ctx.beginPath();
  ctx.arc(cx + T * 0.12, base - T * 0.2, T * 0.035, 0, TAU);
  ctx.fill();
  ctx.lineWidth = T * 0.015;
  ctx.stroke();
  // Sombrero rojo con lunares.
  const cy = base - T * 0.36;
  ctx.beginPath();
  ctx.moveTo(cx - T * 0.38, cy + T * 0.04);
  ctx.bezierCurveTo(cx - T * 0.36, cy - T * 0.34, cx + T * 0.36, cy - T * 0.34, cx + T * 0.38, cy + T * 0.04);
  ctx.quadraticCurveTo(cx, cy + T * 0.12, cx - T * 0.38, cy + T * 0.04);
  ctx.closePath();
  ctx.fillStyle = radial(ctx, cx - T * 0.1, cy - T * 0.18, T * 0.45, [
    [0, 'accent', 1],
    [0.55, 'berry', 1],
    [1, 'berry', 1],
  ]);
  ctx.fill();
  outline(ctx, T);
  ctx.stroke();
  ctx.fillStyle = rgba('paper');
  for (const [dx, dy, r] of [
    [-0.18, -0.08, 0.045],
    [0.05, -0.18, 0.055],
    [0.22, -0.04, 0.035],
    [-0.02, -0.02, 0.03],
  ] as const) {
    ctx.beginPath();
    ctx.arc(cx + dx * T, cy + dy * T, r * T, 0, TAU);
    ctx.fill();
  }
}

/** Aura y aro de meta del Árbol Padre (se pinta aunque alguien trabaje encima). */
function paintMotherAura(ctx: Ctx, T: number, t: Tile) {
  const cx = (t.x + 0.5) * T;
  const cy = (t.y + 0.5) * T;
  ctx.fillStyle = radial(ctx, cx, cy, T * 0.75, [
    [0, 'glow', t.alive ? 0.95 : 0.6],
    [0.6, 'sun', t.alive ? 0.45 : 0.2],
    [1, 'sun', 0],
  ]);
  ctx.fillRect(cx - T, cy - T, T * 2, T * 2);
  ctx.save();
  ctx.strokeStyle = rgba('sun');
  ctx.lineWidth = T * 0.045;
  ctx.setLineDash(t.alive ? [] : [T * 0.09, T * 0.06]);
  ctx.shadowColor = rgba('sun', 0.9);
  ctx.shadowBlur = T * 0.2;
  ctx.beginPath();
  ctx.arc(cx, cy, T * 0.46, 0, TAU);
  ctx.stroke();
  ctx.restore();
  // Destellos alrededor.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    sparkle(ctx, cx + Math.cos(a) * T * 0.46, cy + Math.sin(a) * T * 0.46, T * 0.06);
  }
}

function sparkle(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = rgba('glow');
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const d = i % 2 ? r * 0.3 : r;
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
  ctx.fill();
}

function paintValid(ctx: Ctx, T: number, x: number, y: number) {
  const inset = T * 0.07;
  ctx.save();
  roundRect(ctx, x * T + inset, y * T + inset, T - 2 * inset, T - 2 * inset, T * 0.2);
  ctx.fillStyle = rgba('sun', 0.2);
  ctx.fill();
  ctx.strokeStyle = rgba('sun');
  ctx.lineWidth = T * 0.055;
  ctx.setLineDash([T * 0.12, T * 0.07]);
  ctx.shadowColor = rgba('sun', 0.9);
  ctx.shadowBlur = T * 0.15;
  ctx.stroke();
  ctx.restore();
}

/** Velo de escarcha (019): la casilla del árbol cubierta de color `frost`. */
function frostVeil(ctx: Ctx, T: number, x: number, y: number, alpha: number) {
  const inset = T * 0.05;
  ctx.save();
  roundRect(ctx, x * T + inset, y * T + inset, T - 2 * inset, T - 2 * inset, T * 0.2);
  ctx.fillStyle = radial(ctx, (x + 0.5) * T, (y + 0.45) * T, T * 0.6, [
    [0, 'frost', alpha * 0.7],
    [1, 'frost', alpha],
  ]);
  ctx.fill();
  ctx.restore();
}

/** Copo de seis brazos con contorno de tinta: que el estado no dependa solo del color. */
function snowflake(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.lineCap = 'round';
  const arms = () => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU - Math.PI / 2;
      const [dx, dy] = [Math.cos(a), Math.sin(a)];
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * r, cy + dy * r);
      // Ramitas a dos tercios del brazo.
      const bx = cx + dx * r * 0.6;
      const by = cy + dy * r * 0.6;
      for (const s of [-1, 1]) {
        const b = a + s * 0.7;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(b) * r * 0.35, by + Math.sin(b) * r * 0.35);
      }
    }
  };
  arms();
  ctx.strokeStyle = rgba('ink');
  ctx.lineWidth = r * 0.42;
  ctx.stroke();
  arms();
  ctx.strokeStyle = rgba('frost');
  ctx.lineWidth = r * 0.2;
  ctx.stroke();
  ctx.restore();
}

/** Árbol apagado (019): velo fijo y un copo en la esquina superior. */
function paintFaded(ctx: Ctx, T: number, x: number, y: number) {
  frostVeil(ctx, T, x, y, FROST_FADED);
  snowflake(ctx, (x + 0.8) * T, (y + 0.2) * T, T * 0.13);
}

/**
 * Capa del árbol marcado (019): velo pleno, contorno punteado y un copo chico; la escena le pone el alfa
 * que late (`FROST_PULSE`). Devuelve las casillas pintadas.
 */
export function paintMarked(ctx: Ctx, T: number, game: GameState): { x: number; y: number }[] {
  ctx.clearRect(0, 0, W * T, H * T);
  const marked = game.tiles.filter((t) => t.kind === 'tree' && t.fading && !t.alive);
  for (const t of marked) {
    frostVeil(ctx, T, t.x, t.y, 1);
    const inset = T * 0.08;
    ctx.save();
    roundRect(ctx, t.x * T + inset, t.y * T + inset, T - 2 * inset, T - 2 * inset, T * 0.18);
    ctx.strokeStyle = rgba('ink');
    ctx.lineWidth = T * 0.04;
    ctx.setLineDash([T * 0.1, T * 0.08]);
    ctx.stroke();
    ctx.restore();
    snowflake(ctx, (t.x + 0.8) * T, (t.y + 0.2) * T, T * 0.09);
  }
  return marked.map(({ x, y }) => ({ x, y }));
}

function paintStar(ctx: Ctx, T: number, x: number, y: number) {
  const cx = (x + 0.5) * T;
  const cy = (y + 0.32) * T;
  const R = T * 0.22;
  ctx.save();
  ctx.shadowColor = rgba('sun', 0.9);
  ctx.shadowBlur = T * 0.2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? R * 0.45 : R;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = radial(ctx, cx - R * 0.3, cy - R * 0.3, R * 1.3, [
    [0, 'glow', 1],
    [0.5, 'sun', 1],
    [1, 'accent', 1],
  ]);
  ctx.fill();
  ctx.restore();
  outline(ctx, T);
  ctx.stroke();
}


// ─── Piezas pintadas (cambio 010) ──────────────────────────────────────────────
type Art = { readonly get: ArtLookup; readonly season: SeasonSlug };

const size = (img: CanvasImageSource): [number, number] => {
  const i = img as { width: number; height: number };
  return [Number(i.width) || 1, Number(i.height) || 1];
};

/** Fondo de casilla pintado (pasto de la estación o red de micelio). */
export function groundKey(t: Tile, season: SeasonSlug, occupied = false): string {
  // La casa-hongo es una casilla entera; con alguien encima queda solo la red.
  if (t.kind === 'home' && !occupied) return BOARD_ART.home;
  if (t.net) return BOARD_ART.net[Math.floor(hash(t.x, t.y, 90) * BOARD_ART.net.length)]!;
  const set = BOARD_ART.grass[season];
  return set[Math.floor(hash(t.x, t.y, 91) * set.length)]!;
}

/** Pieza pintada del objeto de la casilla, o null si se queda en el suelo. */
export function objectKey(t: Tile, season: SeasonSlug): string | null {
  switch (t.kind) {
    case 'log':
      return BOARD_ART.log[Math.min(t.uses, BOARD_ART.log.length - 1)]!;
    case 'rock':
      return BOARD_ART.rock[season];
    case 'tree':
      // Dormido: gris; si la red ya lo alcanza, empieza a despertar.
      return t.alive ? BOARD_ART.tree[season] : t.net ? BOARD_ART.tree.waking : BOARD_ART.tree.grey;
    default:
      return null;
  }
}

/** Dibuja una pieza llenando la casilla (suelo). */
function drawTile(ctx: Ctx, T: number, img: CanvasImageSource, x: number, y: number) {
  ctx.drawImage(img, x * T, y * T, T, T);
}

/** Dibuja un objeto apoyado en la base de su casilla, a lo ancho `scale`, conservando su proporción. */
function drawObject(ctx: Ctx, T: number, img: CanvasImageSource, x: number, y: number, scale: number, base = 0.97) {
  const [iw, ih] = size(img);
  const w = T * scale;
  const h = (w * ih) / iw;
  ctx.drawImage(img, (x + 0.5) * T - w / 2, (y + base) * T - h, w, h);
}

/** Suelo pintado de todo el claro; devuelve false si falta alguna pieza (entonces va el vectorial). */
function paintGroundArt(ctx: Ctx, T: number, game: GameState, art: Art, occupied: ReadonlySet<string>): boolean {
  const pieces = game.tiles.map((t) => art.get(groundKey(t, art.season, occupied.has(`${t.x},${t.y}`))));
  if (pieces.some((p) => !p)) return false;
  ctx.fillStyle = rgba('leafDark');
  ctx.fillRect(0, 0, W * T, H * T);
  game.tiles.forEach((t, i) => drawTile(ctx, T, pieces[i]!, t.x, t.y));
  return true;
}

/**
 * Luz propia de la red (016): un halo amplio en cada casilla de la red, un núcleo pequeño y el
 * resplandor de los hilos. Va en una capa aparte con mezcla aditiva; su intensidad (la de la
 * estación) es el alfa de esa capa. Devuelve las casillas que alumbró.
 */
export function paintMyceliumGlow(ctx: Ctx, T: number, game: GameState): { x: number; y: number }[] {
  ctx.clearRect(0, 0, W * T, H * T);
  ctx.save();
  roundRect(ctx, 0, 0, W * T, H * T, T * 0.16);
  ctx.clip();
  const lit: { x: number; y: number }[] = [];
  for (const t of game.tiles) {
    if (!t.net) continue;
    lit.push({ x: t.x, y: t.y });
    const cx = (t.x + 0.5) * T;
    const cy = (t.y + 0.5) * T;
    // Sobre un objeto (árbol, tronco, casa) la luz lo rodea sin taparlo: el centro queda limpio.
    const ring = t.kind !== 'soil';
    ctx.fillStyle = radial(ctx, cx, cy, T * 1.05, [
      [0, 'mycelium', ring ? 0 : 0.32],
      [ring ? 0.42 : 0.35, 'mycelium', 0.26],
      [1, 'mycelium', 0],
    ]);
    ctx.fillRect(cx - T * 1.05, cy - T * 1.05, T * 2.1, T * 2.1);
    if (ring) continue;
    ctx.fillStyle = radial(ctx, cx, cy, T * 0.22, [
      [0, 'glow', 0.45],
      [1, 'glow', 0],
    ]);
    ctx.fillRect(cx - T * 0.22, cy - T * 0.22, T * 0.44, T * 0.44);
  }
  ctx.strokeStyle = rgba('mycelium', 0.55);
  ctx.lineWidth = T * 0.05;
  ctx.lineCap = 'round';
  ctx.shadowColor = rgba('mycelium');
  ctx.shadowBlur = T * 0.3;
  for (const t of game.tiles) {
    if (!t.net) continue;
    for (const n of neighbors(game, t.x, t.y)) {
      if (!n.net || n.y * W + n.x < t.y * W + t.x) continue;
      const w = hash(t.x + n.x, t.y + n.y, 5) - 0.5; // la misma curva que paintNet
      const [x0, y0, x1, y1] = [(t.x + 0.5) * T, (t.y + 0.5) * T, (n.x + 0.5) * T, (n.y + 0.5) * T];
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * w * 0.35, (y0 + y1) / 2 + (x0 - x1) * w * 0.35, x1, y1);
      ctx.stroke();
    }
  }
  ctx.restore();
  return lit;
}

/** Pinta el claro completo. Devuelve qué objeto se pintó en cada casilla. */
export function paintBoard(ctx: Ctx, T: number, input: PaintInput): Painted[] {
  const { game, valid, star, occupied, fatherSprite = false } = input;
  const art: Art | null = input.art ? { get: input.art, season: SEASON_SLUGS[seasonIndex(game.month)] ?? 'spring' } : null;
  ctx.clearRect(0, 0, W * T, H * T);
  // Esquinas redondeadas como el marco (el canvas ya no las recorta: sobresale por arriba).
  ctx.save();
  roundRect(ctx, 0, 0, W * T, H * T, T * 0.16);
  ctx.clip();
  const groundArt = art ? paintGroundArt(ctx, T, game, art, occupied) : false;
  if (!groundArt) {
    paintGround(ctx, T, game);
    paintNet(ctx, T, game);
  }
  const painted: Painted[] = [];
  for (const t of game.tiles) {
    if (t.kind === 'mother') paintMotherAura(ctx, T, t);
    // Con sprite, el Árbol Padre se ve siempre (quien trabaje encima se dibuja delante).
    if (t.kind === 'mother' && fatherSprite) {
      painted.push({ x: t.x, y: t.y, object: 'mother' });
      continue;
    }
    // Si un miembro trabaja encima, su retrato ocupa la casilla: el objeto de abajo no se pinta.
    if (occupied.has(`${t.x},${t.y}`) || t.kind === 'soil') {
      painted.push({ x: t.x, y: t.y, object: 'none' });
      continue;
    }
    // Con arte, la casa-hongo ya es su casilla de suelo.
    if (t.kind === 'home' && groundArt) {
      painted.push({ x: t.x, y: t.y, object: 'home', art: BOARD_ART.home });
      continue;
    }
    const key = art ? objectKey(t, art.season) : null;
    const img = key ? art!.get(key) : undefined;
    if (img && key) {
      const scale = t.kind === 'tree' ? 1.0 : t.kind === 'rock' ? 0.86 : 0.92;
      drawObject(ctx, T, img, t.x, t.y, scale, t.kind === 'tree' ? 0.98 : 0.9);
      painted.push({ x: t.x, y: t.y, object: t.kind, art: key });
      continue;
    }
    if (t.kind === 'log') paintLog(ctx, T, t);
    else if (t.kind === 'rock') paintRock(ctx, T, t);
    else if (t.kind === 'tree' || t.kind === 'mother') paintTree(ctx, T, t);
    else if (t.kind === 'home') paintHome(ctx, T, t);
    painted.push({ x: t.x, y: t.y, object: t.kind });
  }
  // El color vuelve: mezcla con gris en modo "saturation" (los resaltes y la ★ van después, a color).
  const sat = input.saturation ?? 1;
  if (sat < 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = rgba('neutral', 1 - sat);
    ctx.fillRect(0, 0, W * T, H * T);
    ctx.restore();
  }
  // Árboles apagados (019): el velo va sobre la saturación para que la escarcha siempre se lea.
  game.tiles.forEach((t, i) => {
    if (t.kind !== 'tree' || !t.faded || t.alive) return;
    paintFaded(ctx, T, t.x, t.y);
    painted[i] = { ...painted[i]!, faded: true };
  });
  for (const key of valid) {
    const [x, y] = key.split(',').map(Number) as [number, number];
    paintValid(ctx, T, x, y);
  }
  if (star && valid.has(`${star.x},${star.y}`)) {
    const img = art?.get(BOARD_ART.star);
    if (img) {
      ctx.save();
      ctx.shadowColor = rgba('sun', 0.9);
      ctx.shadowBlur = T * 0.2;
      drawObject(ctx, T, img, star.x, star.y, 0.42, 0.52);
      ctx.restore();
    } else paintStar(ctx, T, star.x, star.y);
  }
  ctx.restore();
  return painted;
}
