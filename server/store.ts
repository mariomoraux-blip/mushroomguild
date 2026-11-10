// Almacén del ranking (036). Una interfaz y dos implementaciones: memoria (pruebas y `npm run dev`) y Upstash Redis
// por su API REST (producción). Solo usa `fetch`: sin dependencias.
import type { Level, Stars } from '../src/rules';

/** Mejor resultado de un jugador en una temporada. */
export interface Entry {
  readonly total: number;
  readonly level: Level;
  readonly stars: Stars;
  readonly wonMonth: number;
  readonly timeMs: number;
  readonly at: number;
}

export interface LeaderboardStore {
  /** Suma 1 al contador `key` (que vence en `windowS`) y devuelve el valor nuevo. */
  hit(key: string, windowS: number): Promise<number>;
  getAlias(id: string): Promise<string | null>;
  setAlias(id: string, alias: string): Promise<void>;
  getEntry(season: number, id: string): Promise<Entry | null>;
  putEntry(season: number, id: string, entry: Entry): Promise<void>;
  /** Jugadores con un total mayor que `total`. */
  countAbove(season: number, total: number): Promise<number>;
  count(season: number): Promise<number>;
  /** Los `n` primeros, de mayor a menor total, con su alias. */
  top(season: number, n: number): Promise<{ id: string; alias: string; entry: Entry }[]>;
}

const board = (season: number) => `lb:v${season}`;
const entryKey = (season: number, id: string) => `pl:v${season}:${id}`;
const aliasKey = (id: string) => `alias:${id}`;

export function memoryStore(now: () => number = Date.now): LeaderboardStore {
  const counters = new Map<string, { n: number; until: number }>();
  const aliases = new Map<string, string>();
  const entries = new Map<string, Entry>();
  const totals = new Map<number, Map<string, number>>();
  const season = (s: number) => totals.get(s) ?? totals.set(s, new Map()).get(s)!;
  return {
    async hit(key, windowS) {
      const c = counters.get(key);
      const fresh = !c || c.until <= now();
      const next = { n: fresh ? 1 : c.n + 1, until: fresh ? now() + windowS * 1000 : c.until };
      counters.set(key, next);
      return next.n;
    },
    async getAlias(id) {
      return aliases.get(id) ?? null;
    },
    async setAlias(id, alias) {
      aliases.set(id, alias);
    },
    async getEntry(s, id) {
      return entries.get(entryKey(s, id)) ?? null;
    },
    async putEntry(s, id, entry) {
      entries.set(entryKey(s, id), entry);
      season(s).set(id, entry.total);
    },
    async countAbove(s, total) {
      return [...season(s).values()].filter((t) => t > total).length;
    },
    async count(s) {
      return season(s).size;
    },
    async top(s, n) {
      return [...season(s).entries()]
        .sort((a, b) => b[1] - a[1] || entries.get(entryKey(s, a[0]))!.at - entries.get(entryKey(s, b[0]))!.at)
        .slice(0, n)
        .map(([id]) => ({ id, alias: aliases.get(id) ?? '', entry: entries.get(entryKey(s, id))! }));
    },
  };
}

type Command = (string | number)[];

/** Upstash Redis por REST: `POST <url>/pipeline` con una lista de comandos. */
export function upstashStore(url: string, token: string, fetcher: typeof fetch = fetch): LeaderboardStore {
  async function pipeline(commands: Command[]): Promise<unknown[]> {
    const res = await fetcher(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return out.map((r) => {
      if (r.error) throw new Error(`Upstash: ${r.error}`);
      return r.result;
    });
  }
  const one = async (c: Command) => (await pipeline([c]))[0];
  const parse = (raw: unknown): Entry | null => (typeof raw === 'string' ? (JSON.parse(raw) as Entry) : null);
  return {
    async hit(key, windowS) {
      const [n] = await pipeline([['INCR', key], ['EXPIRE', key, windowS, 'NX']]);
      return Number(n);
    },
    async getAlias(id) {
      const v = await one(['GET', aliasKey(id)]);
      return typeof v === 'string' ? v : null;
    },
    async setAlias(id, alias) {
      await one(['SET', aliasKey(id), alias]);
    },
    async getEntry(s, id) {
      return parse(await one(['GET', entryKey(s, id)]));
    },
    async putEntry(s, id, entry) {
      await pipeline([['SET', entryKey(s, id), JSON.stringify(entry)], ['ZADD', board(s), entry.total, id]]);
    },
    async countAbove(s, total) {
      return Number(await one(['ZCOUNT', board(s), `(${total}`, '+inf']));
    },
    async count(s) {
      return Number(await one(['ZCARD', board(s)]));
    },
    async top(s, n) {
      const ids = (await one(['ZRANGE', board(s), 0, n - 1, 'REV'])) as string[];
      if (!ids.length) return [];
      const [entriesRaw, aliasesRaw] = await pipeline([['MGET', ...ids.map((id) => entryKey(s, id))], ['MGET', ...ids.map(aliasKey)]]);
      const es = entriesRaw as (string | null)[];
      const as = aliasesRaw as (string | null)[];
      return ids.flatMap((id, i) => {
        const entry = parse(es[i]);
        return entry ? [{ id, alias: as[i] ?? '', entry }] : [];
      });
    },
  };
}
