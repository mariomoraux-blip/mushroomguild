// Mejor resultado local por claro (015 · scoring › Mejor resultado local). Solo el mejor `ScoreResult`
// de cada `mapId`, con la clave versionada por `scoringVersion`. Si el almacenamiento falla, no hay récord.
import { SCORE_VERSION, type ScoreResult } from './rules';

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
/** Claros que no se pueden rejugar desde su inicio: no guardan récord. */
const UNSAVED = new Set(['debug', 'custom']);

export const recordKey = (mapId: string, version: number = SCORE_VERSION): string => `gremio.best.v${version}.${mapId}`;

export function readBest(mapId: string, storage: Storage | undefined = globalThis.localStorage): ScoreResult | null {
  if (UNSAVED.has(mapId)) return null;
  try {
    const raw = storage?.getItem(recordKey(mapId));
    return raw ? (JSON.parse(raw) as ScoreResult) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el resultado si es el mejor de su claro. `newRecord` solo es true si supera un récord ya guardado
 * del mismo `mapId` (el primer resultado de un claro no es "Nuevo récord").
 */
export function saveIfBest(result: ScoreResult, storage: Storage | undefined = globalThis.localStorage): { newRecord: boolean } {
  if (UNSAVED.has(result.mapId)) return { newRecord: false };
  const best = readBest(result.mapId, storage);
  if (best && result.total <= best.total) return { newRecord: false };
  try {
    storage?.setItem(recordKey(result.mapId), JSON.stringify(result));
  } catch {
    return { newRecord: false };
  }
  return { newRecord: Boolean(best) };
}
