import { validTargets } from './actions';
import { COST } from './config';
import { magicSpent, member, touchesNet, weaveCost, workerAt } from './state';
import type { GameState, Resource } from './types';

/** Motivo por el que un miembro no tiene ninguna casilla válida (clave; el texto vive en es.ts). */
export type IdleReason = 'noLogs' | 'noNutrients' | 'noSoil' | 'noGreyTrees' | 'noSpores' | 'noWorkers' | 'magicSpent';

/** Recurso que falta detrás de un motivo de inactividad, si es eso (022). */
export const idleShort = (r: IdleReason): Resource | null => (r === 'noNutrients' ? 'nutrients' : r === 'noSpores' ? 'spores' : null);

/**
 * Mes vacío (024): hay miembros listos, ninguno tiene una casilla válida y en este mes nadie actuó (reclutar no
 * cuenta: el recluta llega cansado). El final normal de un mes, con alguien que ya actuó, no es un mes vacío.
 */
export function noWorkThisMonth(s: GameState): boolean {
  if (s.status !== 'playing') return false;
  const ready = s.members.filter((m) => !m.used);
  if (!ready.length || ready.some((m) => validTargets(s, m.id).length)) return false;
  for (let i = s.log.length - 1; i >= 0 && s.log[i]!.type !== 'endMonth'; i--) if (s.log[i]!.type === 'act') return false;
  return true;
}

/**
 * Por qué el miembro `id` no tiene ninguna casilla válida, o `null` si tiene trabajo.
 * Un miembro que ya actuó este mes devuelve `null`: eso se informa con el motivo de `check()`.
 */
export function idleReason(s: GameState, id: number): IdleReason | null {
  const m = member(s, id);
  if (!m || m.used || s.status !== 'playing') return null;
  if (validTargets(s, id).length) return null;
  switch (m.species) {
    case 'champi':
      return 'noLogs';
    case 'lactarius':
      return s.nutrients < weaveCost(s) ? 'noNutrients' : 'noSoil';
    case 'amanita':
      // Un árbol gris junto a la red que no alcanza (p. ej., apagado, 019) es falta de nutrientes.
      return s.nutrients < COST.revive || s.tiles.some((t) => t.kind === 'tree' && !t.alive && touchesNet(s, t.x, t.y)) ? 'noNutrients' : 'noGreyTrees';
    case 'gliophorus':
      return s.members.some((w) => workerAt(s, w.at?.x ?? -1, w.at?.y ?? -1)) ? 'noSpores' : 'noWorkers';
    case 'mago':
      return magicSpent(s) ? 'magicSpent' : null;
  }
}
