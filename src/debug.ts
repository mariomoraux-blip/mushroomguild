// Estados de prueba solo para desarrollo (`?debugState=<nombre>`); en producción no existe.
import { endDay, newGame, recruit, type GameState, type RecruitableSpecies } from './rules';

const presets: Record<string, () => GameState> = {
  /** Gremio completo: 6 reclutables y Maese Bruma (escenario "Gremio completo en el dock"). */
  fullGuild: () => {
    let s: GameState = { ...newGame(), spores: 20, nutrients: 10 };
    const tiles = s.tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t));
    s = { ...s, tiles, mageDue: true };
    (['lactarius', 'champi', 'gliophorus'] as RecruitableSpecies[]).forEach((sp) => (s = recruit(s, sp).state));
    return endDay(s).state;
  },
};

export function debugGame(): GameState | null {
  if (!import.meta.env.DEV) return null;
  const name = new URLSearchParams(location.search).get('debugState');
  return name ? (presets[name]?.() ?? null) : null;
}
