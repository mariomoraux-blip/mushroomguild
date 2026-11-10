// Cliente del ranking (036 · leaderboard). Clave del dispositivo y alias en `localStorage`, envío pendiente y llamadas
// a `/api`. Como `records.ts`: si el almacenamiento o la red fallan, el juego sigue sin ranking y sin errores.
import { DEVICE_HEADER, type BoardResponse, type ScoreResponse } from './api-types';
import { SCORE_VERSION, type ScoreResult } from './rules';

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const PLAYER_KEY = 'gremio.player.v1';
export const PENDING_KEY = 'gremio.pending.v1';

export interface Player {
  readonly token: string;
  /** `null` hasta que se registra. */
  readonly alias: string | null;
}

/** Estado del envío de la victoria actual, para la carta de victoria. */
export type Submission =
  | { readonly kind: 'unregistered' }
  | { readonly kind: 'sending' }
  | { readonly kind: 'ok'; readonly rank: number; readonly players: number; readonly best: number; readonly improved: boolean }
  | { readonly kind: 'offline' }
  | { readonly kind: 'rejected' };

/** Lo que muestra la pantalla «Ranking». */
export type BoardView = { readonly kind: 'loading' } | { readonly kind: 'offline' } | { readonly kind: 'ready'; readonly data: BoardResponse };

export interface ClientEnv {
  readonly fetch: typeof fetch;
  readonly storage: Storage | undefined;
  readonly uuid: () => string;
  /** Base de la API: `./api` (relativa a la página, como los assets). */
  readonly base: string;
}

const defaultEnv = (): ClientEnv => ({
  fetch: (...args) => globalThis.fetch(...args),
  storage: (() => {
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  })(),
  uuid: () => globalThis.crypto.randomUUID(),
  base: './api',
});

export function createLeaderboardClient(env: ClientEnv = defaultEnv()) {
  const read = <T>(key: string): T | null => {
    try {
      const raw = env.storage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };
  const write = (key: string, value: unknown): boolean => {
    try {
      if (!env.storage) return false;
      env.storage.setItem(key, JSON.stringify(value));
      return env.storage.getItem(key) !== null;
    } catch {
      return false;
    }
  };
  const remove = (key: string) => {
    try {
      env.storage?.removeItem(key);
    } catch {
      /* sin almacenamiento */
    }
  };

  const readPlayer = (): Player | null => {
    const p = read<Player>(PLAYER_KEY);
    return p && typeof p.token === 'string' ? { token: p.token, alias: typeof p.alias === 'string' ? p.alias : null } : null;
  };

  /** Clave del dispositivo; la crea la primera vez. `null` si no se puede guardar (entonces no hay registro). */
  const ensureToken = (): string | null => {
    const p = readPlayer();
    if (p) return p.token;
    const token = env.uuid();
    return write(PLAYER_KEY, { token, alias: null } satisfies Player) ? token : null;
  };

  const post = (path: string, body: unknown) =>
    env.fetch(`${env.base}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  /** Guarda el alias en el dispositivo y avisa al servidor (si falla la red, el próximo envío lo lleva). */
  async function saveAlias(alias: string): Promise<boolean> {
    const token = ensureToken();
    if (!token || !write(PLAYER_KEY, { token, alias } satisfies Player)) return false;
    try {
      await post('player', { token, alias });
    } catch {
      /* sin conexión */
    }
    return true;
  }

  const pending = () => read<ScoreResult>(PENDING_KEY);
  const keepPending = (r: ScoreResult) => {
    const p = pending();
    if (!p || p.scoringVersion !== r.scoringVersion || r.total > p.total) write(PENDING_KEY, r);
  };

  /** Envía una victoria. Sin conexión, la deja pendiente (solo la mejor) para después. */
  async function submit(result: ScoreResult): Promise<Submission> {
    const p = readPlayer();
    if (!p?.alias) return { kind: 'unregistered' };
    if (result.scoringVersion !== SCORE_VERSION) return { kind: 'rejected' };
    let res: Response;
    try {
      res = await post('scores', { token: p.token, alias: p.alias, result });
    } catch {
      keepPending(result);
      return { kind: 'offline' };
    }
    if (res.ok) {
      const body = (await res.json()) as ScoreResponse;
      const left = pending();
      if (left && left.total <= body.best) remove(PENDING_KEY);
      return { kind: 'ok', rank: body.rank, players: body.players, best: body.best, improved: body.accepted };
    }
    if (res.status === 422 || res.status === 400) {
      if (pending()?.total === result.total) remove(PENDING_KEY);
      return { kind: 'rejected' };
    }
    keepPending(result);
    return { kind: 'offline' };
  }

  /** Reintenta el envío pendiente (al abrir el ranking o al ganar otra vez). Descarta el de otra temporada. */
  async function flush(): Promise<void> {
    const p = pending();
    if (!p) return;
    if (p.scoringVersion !== SCORE_VERSION) return remove(PENDING_KEY);
    if (readPlayer()?.alias) await submit(p);
  }

  async function board(): Promise<BoardView> {
    const token = readPlayer()?.token;
    try {
      const res = await env.fetch(`${env.base}/leaderboard`, { headers: token ? { [DEVICE_HEADER]: token } : {} });
      if (!res.ok) return { kind: 'offline' };
      return { kind: 'ready', data: (await res.json()) as BoardResponse };
    } catch {
      return { kind: 'offline' };
    }
  }

  return { readPlayer, ensureToken, saveAlias, submit, flush, board, hasPending: () => pending() !== null };
}

export type LeaderboardClient = ReturnType<typeof createLeaderboardClient>;
