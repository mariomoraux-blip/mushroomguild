// Estados de prueba solo para desarrollo (`?debugState=<nombre>`); en producción no existe.
import { endDay, newGame, recruit, type GameState, type RecruitableSpecies } from './rules';

const presets: Record<string, () => GameState> = {
  /** Gremio completo: 6 reclutables y Maestra Bruna (escenario "Gremio completo en el dock"). */
  fullGuild: () => {
    let s: GameState = { ...newGame(), spores: 20, nutrients: 10 };
    const tiles = s.tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t));
    s = { ...s, tiles, mageDue: true };
    (['lactarius', 'champi', 'gliophorus'] as RecruitableSpecies[]).forEach((sp) => (s = recruit(s, sp).state));
    return endDay(s).state;
  },
  /** Otoño e invierno con árboles vivos, red y troncos usados (para ver las piezas por estación). */
  autumn: () => seasonPreview(7),
  winter: () => seasonPreview(10),
  /** Árbol Padre despierto (solo para ver su sprite; no dispara el final). */
  fatherAwake: () => {
    const s = newGame();
    return { ...s, tiles: s.tiles.map((t) => (t.kind === 'mother' ? { ...t, alive: true } : t)) };
  },
};

function seasonPreview(day: number): GameState {
  const s = newGame();
  const tiles = s.tiles.map((t, i) =>
    t.kind === 'tree' && i % 2 ? { ...t, alive: true, net: true } : t.kind === 'log' && i % 2 ? { ...t, uses: 1 } : t.kind === 'soil' && i % 3 === 0 ? { ...t, net: true } : t,
  );
  return { ...s, day, tiles };
}

export function debugGame(): GameState | null {
  if (!import.meta.env.DEV) return null;
  const name = new URLSearchParams(location.search).get('debugState');
  return name ? (presets[name]?.() ?? null) : null;
}
