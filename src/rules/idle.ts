import { validTargets } from './actions';
import { COST } from './config';
import { magicSpent, member } from './state';
import type { GameState } from './types';

/** Motivo por el que un miembro no tiene ninguna casilla válida (clave; el texto vive en es.ts). */
export type IdleReason = 'noLogs' | 'noNutrients' | 'noSoil' | 'noGreyTrees' | 'noSpores' | 'noLiveTrees' | 'magicSpent';

/**
 * Por qué el miembro `id` no tiene ninguna casilla válida, o `null` si tiene trabajo.
 * Un miembro que ya actuó hoy devuelve `null`: eso se informa con el motivo de `check()`.
 */
export function idleReason(s: GameState, id: number): IdleReason | null {
  const m = member(s, id);
  if (!m || m.used || s.status !== 'playing') return null;
  if (validTargets(s, id).length) return null;
  const liveTrees = s.tiles.some((t) => t.kind === 'tree' && t.alive);
  switch (m.species) {
    case 'champi':
      return 'noLogs';
    case 'lactarius':
      return s.nutrients < COST.weave ? 'noNutrients' : 'noSoil';
    case 'amanita':
      return s.nutrients < COST.revive ? 'noNutrients' : 'noGreyTrees';
    case 'gliophorus':
      return liveTrees ? 'noSpores' : 'noLiveTrees';
    case 'mago':
      return magicSpent(s) ? 'magicSpent' : null;
  }
}
