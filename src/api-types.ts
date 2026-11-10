// Contrato de la API del ranking (036), compartido por el cliente (`src/leaderboard.ts`) y el servidor (`server/`).
import type { Level, Stars } from './rules';

/** Cabecera con la clave del dispositivo en `GET /api/leaderboard` (nunca va en la URL). */
export const DEVICE_HEADER = 'x-gremio-device';

/** Fila pública del ranking: nunca lleva la clave ni el id del jugador. */
export interface Row {
  readonly rank: number;
  readonly alias: string;
  readonly total: number;
  readonly level: Level;
  readonly stars: Stars;
  readonly wonMonth: number;
  readonly at: number;
  readonly me: boolean;
}

export interface BoardResponse {
  readonly season: number;
  readonly players: number;
  readonly top: readonly Row[];
  readonly me: Row | null;
}

export interface ScoreResponse {
  readonly season: number;
  readonly accepted: boolean;
  readonly best: number;
  readonly rank: number;
  readonly players: number;
}
