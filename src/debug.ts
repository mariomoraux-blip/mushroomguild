// Estados de prueba solo para desarrollo (`?debugState=<nombre>`); en producción no existe.
import { endMonth, newGame, recruit, type GameState, type RecruitableSpecies } from './rules';

const presets: Record<string, () => GameState> = {
  /** Gremio completo: 7 reclutables (las cuatro especies, 041) y Maestra Bruma (escenario "Gremio completo en el dock"). */
  fullGuild: () => {
    let s: GameState = { ...newGame(), spores: 25, nutrients: 10 };
    const tiles = s.tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t));
    s = { ...s, tiles, mageDue: true };
    (['gliophorus', 'morchella', 'ganoderma', 'lycoperdon'] as RecruitableSpecies[]).forEach((sp) => (s = recruit(s, sp).state));
    return endMonth(s).state;
  },
  /** Pompón listo, con árboles vivos, 1 nutriente y 2 esporas: puede soplar o abonar (040). */
  pompon: () => {
    let s: GameState = { ...newGame(), spores: 10 };
    const tiles = s.tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t));
    s = recruit({ ...s, tiles }, 'lycoperdon').state;
    return { ...endMonth(s).state, nutrients: 1, spores: 2 };
  },
  /** Maestra Bruma llega al terminar el mes (carta de su llegada). */
  mageNextMonth: () => ({ ...newGame(), tiles: newGame().tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t)), mageDue: true }),
  /** A un toque de ganar: 3 árboles vivos, 10 nutrientes y la red tocando al Árbol Ancestral (carta de victoria). */
  nearWin: () => {
    const s = newGame();
    const mother = s.tiles.find((t) => t.kind === 'mother')!;
    let alive = 0;
    const tiles = s.tiles.map((t) => {
      if (t.kind === 'tree' && alive < 3) return (alive++, { ...t, alive: true, net: true });
      const near = Math.abs(t.x - mother.x) + Math.abs(t.y - mother.y) === 1;
      return near && t.kind === 'soil' ? { ...t, net: true } : t;
    });
    return { ...s, tiles, nutrients: 10 };
  },
  /** Último mes (carta del fin del invierno al terminarlo). */
  lastMonth: () => ({ ...newGame(), month: 12 }),
  /** Otoño e invierno con árboles vivos, red y troncos usados (para ver las piezas por estación). */
  autumn: () => seasonPreview(7),
  winter: () => seasonPreview(10),
  /** Árbol Ancestral despierto (solo para ver su sprite; no dispara el final). */
  fatherAwake: () => {
    const s = newGame();
    return { ...s, tiles: s.tiles.map((t) => (t.kind === 'mother' ? { ...t, alive: true } : t)) };
  },
};

function seasonPreview(month: number): GameState {
  const s = newGame();
  const tiles = s.tiles.map((t, i) =>
    t.kind === 'tree' && i % 2 ? { ...t, alive: true, net: true } : t.kind === 'log' && i % 2 ? { ...t, uses: 1 } : t.kind === 'soil' && i % 3 === 0 ? { ...t, net: true } : t,
  );
  return { ...s, month, tiles };
}

export function debugGame(): GameState | null {
  if (!import.meta.env.DEV) return null;
  const name = new URLSearchParams(location.search).get('debugState');
  const game = name ? presets[name]?.() : undefined;
  // Los estados de depuración no guardan récord (015): su claro no se puede rejugar desde el inicio.
  return game ? { ...game, mapId: 'debug', log: [] } : null;
}
