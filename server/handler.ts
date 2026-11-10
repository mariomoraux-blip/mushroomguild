// API del ranking (036 · leaderboard). Un solo handler web (Request → Response) para las tres rutas, así se prueba
// sin red y se monta igual en Vercel y en `npm run dev`.
import { DEVICE_HEADER, type BoardResponse, type Row, type ScoreResponse } from '../src/api-types';
import { isValidAlias, LEADERBOARD, SCORE_VERSION, verifyResult } from '../src/rules';
import type { LeaderboardStore } from './store';

export interface Deps {
  /** `null`: sin base configurada; las rutas responden 503. */
  readonly store: LeaderboardStore | null;
  /** Sal para el hash de la IP. */
  readonly salt: string;
  readonly now: () => number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function sha256(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const isToken = (t: unknown): t is string => typeof t === 'string' && /^[A-Za-z0-9-]{16,64}$/.test(t);
const playerId = (token: string) => sha256(`gremio:${token}`);
const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > LEADERBOARD.maxBodyBytes) return null;
  try {
    const body: unknown = JSON.parse(text);
    return typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const { store } = deps;
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  const route = `${req.method} ${path}`;
  if (!['POST /api/player', 'POST /api/scores', 'GET /api/leaderboard'].includes(route)) return json({ error: 'not_found' }, 404);
  if (!store) return json({ error: 'unavailable' }, 503);
  const season = SCORE_VERSION;
  try {
    if (route === 'GET /api/leaderboard') {
      const token = req.headers.get(DEVICE_HEADER);
      const id = isToken(token) ? await playerId(token) : null;
      const [top, players] = await Promise.all([store.top(season, LEADERBOARD.topSize), store.count(season)]);
      // Empates en el mismo puesto: el puesto es el de la primera fila con ese total.
      const rows: Row[] = [];
      top.forEach(({ id: rowId, alias, entry }, i) => {
        const rank = i > 0 && rows[i - 1]!.total === entry.total ? rows[i - 1]!.rank : i + 1;
        rows.push({ rank, alias, total: entry.total, level: entry.level, stars: entry.stars, wonMonth: entry.wonMonth, at: entry.at, me: rowId === id });
      });
      let me = rows.find((r) => r.me) ?? null;
      if (!me && id) {
        const [entry, alias] = await Promise.all([store.getEntry(season, id), store.getAlias(id)]);
        if (entry) me = { rank: (await store.countAbove(season, entry.total)) + 1, alias: alias ?? '', total: entry.total, level: entry.level, stars: entry.stars, wonMonth: entry.wonMonth, at: entry.at, me: true };
      }
      return json({ season, players, top: rows, me } satisfies BoardResponse);
    }

    const body = await readJson(req);
    if (!body || !isToken(body.token)) return json({ error: 'bad_request' }, 400);
    if (!isValidAlias(body.alias)) return json({ error: 'bad_alias' }, 400);
    const id = await playerId(body.token);

    if (route === 'POST /api/player') {
      await store.setAlias(id, body.alias);
      return json({ alias: body.alias });
    }

    // POST /api/scores
    const { rate } = LEADERBOARD;
    const ip = await sha256(`${deps.salt}:${clientIp(req)}`);
    const [byDevice, byIp] = await Promise.all([store.hit(`rl:dev:${id}`, rate.windowS), store.hit(`rl:ip:${ip}`, rate.windowS)]);
    if (byDevice > rate.device || byIp > rate.ip) return json({ error: 'rate_limited' }, 429);
    const verified = verifyResult(body.result);
    if (!verified.ok) return json({ error: 'invalid', reason: verified.reason }, 422);
    const r = verified.result;
    await store.setAlias(id, body.alias);
    const prev = await store.getEntry(season, id);
    const accepted = !prev || r.total > prev.total;
    if (accepted) await store.putEntry(season, id, { total: r.total, level: r.level, stars: r.stars, wonMonth: r.wonMonth, timeMs: r.timeMs, at: deps.now() });
    const best = accepted ? r.total : prev.total;
    const [above, players] = await Promise.all([store.countAbove(season, best), store.count(season)]);
    return json({ season, accepted, best, rank: above + 1, players } satisfies ScoreResponse);
  } catch {
    return json({ error: 'server' }, 500);
  }
}
