// Efectos visuales de una jugada (004): qué cambió entre el juego antes y después de una acción.
// Es presentación pura (sin Phaser ni DOM): la escena y la interfaz deciden cómo animarlo.
import { neighbors, type GameState, type Point, type Tile } from './rules';

export type Effect =
  /** Micelio nuevo en (x, y), que crece desde una casilla vecina que ya era red. */
  | { kind: 'weave'; at: Point; from: Point | null; before: Tile }
  /** Un tronco se descompuso (un uso o se volvió tierra). */
  | { kind: 'decompose'; at: Point; before: Tile }
  /** Un árbol gris revivió. */
  | { kind: 'revive'; at: Point }
  /** El Árbol Padre despertó. */
  | { kind: 'awaken'; at: Point }
  /** Esporas ganadas: al empezar el mes (desde los árboles vivos) o por la Lluvia de esporas (desde el árbol del hechizo). */
  | { kind: 'spores'; from: Point[]; amount: number };

const key = (p: Point) => `${p.x},${p.y}`;

/** Efectos de pasar de `prev` a `next`. Vacío si es otra partida (reinicio) o si no cambió nada visible. */
export function diffEffects(prev: GameState, next: GameState): Effect[] {
  if (prev === next || next.month < prev.month || prev.tiles.length !== next.tiles.length || next.members.length < prev.members.length) return [];
  const before = new Map(prev.tiles.map((t) => [key(t), t]));
  const effects: Effect[] = [];
  for (const t of next.tiles) {
    const b = before.get(key(t));
    // Claro distinto (otra partida): una casilla solo cambia de tipo si un tronco o una roca se vuelven tierra.
    if (!b || (b.kind !== t.kind && !(t.kind === 'soil' && (b.kind === 'log' || b.kind === 'rock')))) return [];
    if (b.kind === 'log' && (t.kind !== 'log' || t.uses > b.uses)) effects.push({ kind: 'decompose', at: t, before: b });
    if (t.kind === 'tree' && t.alive && !b.alive) effects.push({ kind: 'revive', at: t });
    if (t.kind === 'mother' && t.alive && !b.alive) effects.push({ kind: 'awaken', at: t });
    if (t.net && !b.net && t.kind !== 'home') {
      const from = neighbors(prev, t.x, t.y).find((n) => n.net) ?? null;
      effects.push({ kind: 'weave', at: t, from: from && { x: from.x, y: from.y }, before: b });
    }
  }
  const gained = next.spores - prev.spores;
  if (gained > 0) {
    const alive = (g: GameState) => g.tiles.filter((t) => (t.kind === 'tree' || t.kind === 'mother') && t.alive);
    // Al empezar el mes salen de cada árbol vivo; de mes (Lluvia de esporas), del árbol donde la maga lanzó el hechizo.
    const mage = next.members.find((m) => m.species === 'mago' && m.at);
    const from = next.month > prev.month ? alive(prev) : mage?.at ? [mage.at] : alive(next);
    if (from.length) effects.push({ kind: 'spores', from: from.map(({ x, y }) => ({ x, y })), amount: gained });
  }
  return effects;
}
