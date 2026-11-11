import { describe, expect, it } from 'vitest';
import { DEVICE_HEADER, type BoardResponse, type ScoreResponse } from '../src/api-types';
import { handle, type Deps } from '../server/handler';
import { memoryStore, upstashStore } from '../server/store';
import { aliasFor, LEADERBOARD, newRandomGame, playAdvised, SCORE_VERSION, scoreResult, thresholds, type ScoreResult } from '../src/rules';

const BASE = 'http://localhost/api';
const tokenOf = (n: number) => `device-token-${String(n).padStart(6, '0')}`;
const aliasOf = (n: number) => aliasFor(tokenOf(n), 0);

function win(seed: number, timeMs = 200_000): ScoreResult {
  const start = newRandomGame(seed);
  return scoreResult(playAdvised(start), timeMs, thresholds(start));
}

function deps(over: Partial<Deps> = {}): Deps {
  let t = 1_000;
  return { store: memoryStore(() => t), salt: 'test', now: () => (t += 1), ...over };
}

const post = (d: Deps, path: string, body: unknown, ip = '1.2.3.4') =>
  handle(new Request(`${BASE}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) }), d);
const submit = (d: Deps, n: number, result: ScoreResult, ip?: string) => post(d, 'scores', { token: tokenOf(n), alias: aliasOf(n), result }, ip);
const board = async (d: Deps, n?: number) =>
  (await (await handle(new Request(`${BASE}/leaderboard`, { headers: n === undefined ? {} : { [DEVICE_HEADER]: tokenOf(n) } }), d)).json()) as BoardResponse;

describe('Requirement: Registrar un puntaje', () => {
  const a = win(1);
  const b = win(2);
  const [high, low] = a.total >= b.total ? [a, b] : [b, a];

  it('Scenario: Primer registro — responde el puesto y el número de jugadores', async () => {
    const d = deps();
    const res = await submit(d, 1, high);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ season: SCORE_VERSION, accepted: true, best: high.total, rank: 1, players: 1 } satisfies ScoreResponse);
  });

  it('Scenario: Sin mejora — guarda solo el mejor total del jugador', async () => {
    const d = deps();
    await submit(d, 1, high);
    const r = (await (await submit(d, 1, low)).json()) as ScoreResponse;
    expect(r).toMatchObject({ accepted: low.total > high.total, best: high.total, players: 1 });
    expect((await board(d)).top[0]!.total).toBe(high.total);
  });

  it('los empates comparten puesto y el ranking no expone claves', async () => {
    const d = deps();
    await submit(d, 1, high);
    await submit(d, 2, high);
    await submit(d, 3, low);
    const view = await board(d, 3);
    expect(view.players).toBe(3);
    expect(view.top.map((r) => r.rank)).toEqual(low.total === high.total ? [1, 1, 1] : [1, 1, 3]);
    expect(view.top.find((r) => r.me)?.alias).toBe(aliasOf(3));
    expect(JSON.stringify(view)).not.toContain(tokenOf(3));
  });

  it('Scenario: Fuera del top — la fila propia llega aparte con su puesto', async () => {
    const d = deps();
    for (let n = 0; n < LEADERBOARD.topSize; n++) await submit(d, n, high, `10.0.0.${n}`);
    await submit(d, 99, low, '10.0.1.1');
    const view = await board(d, 99);
    expect(view.top).toHaveLength(LEADERBOARD.topSize);
    expect(view.top.some((r) => r.me)).toBe(false);
    if (low.total < high.total) expect(view.me).toMatchObject({ rank: LEADERBOARD.topSize + 1, alias: aliasOf(99), me: true });
  });

  it('Scenario: Ranking vacío — sin filas', async () => {
    expect(await board(deps())).toEqual({ season: SCORE_VERSION, players: 0, top: [], me: null });
  });
});

describe('Requirement: Verificación en el servidor', () => {
  it('Scenario: Total alterado — 422 y el ranking no cambia', async () => {
    const d = deps();
    const r = win(1);
    const res = await submit(d, 1, { ...r, total: r.total + 100 });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'invalid', reason: 'score' });
    expect((await board(d)).players).toBe(0);
  });

  it('Scenario: Demasiados envíos — 429 al pasar el límite por dispositivo y por IP', async () => {
    const d = deps();
    const r = win(1);
    for (let i = 0; i < LEADERBOARD.rate.device; i++) expect((await submit(d, 1, r)).status).toBe(200);
    expect((await submit(d, 1, r)).status).toBe(429);
    for (let n = 2; n < 2 + LEADERBOARD.rate.ip - LEADERBOARD.rate.device; n++) await submit(d, n, r);
    expect((await submit(d, 500, r)).status).toBe(429);
    expect((await submit(d, 501, r, '9.9.9.9')).status).toBe(200);
  });

  it('Scenario: Nombre inválido en el servidor — 400 y no se guarda nada (038)', async () => {
    const d = deps();
    for (const alias of ['Ana92', 'Al', 'P u u t a', ' Ana Lucía', 'Ana  Lucía', 42]) {
      expect((await post(d, 'player', { token: tokenOf(1), alias })).status).toBe(400);
      expect((await post(d, 'scores', { token: tokenOf(1), alias, result: win(1) })).status).toBe(400);
    }
    expect((await board(d)).players).toBe(0);
  });

  it('un nombre escrito válido se acepta y aparece en el ranking (038)', async () => {
    const d = deps();
    expect((await post(d, 'scores', { token: tokenOf(1), alias: 'Ana Lucía', result: win(1) })).status).toBe(200);
    expect((await board(d, 1)).top[0]).toMatchObject({ alias: 'Ana Lucía', me: true });
  });

  it('clave inválida, cuerpo roto o demasiado grande: 400', async () => {
    const d = deps();
    expect((await post(d, 'player', { token: 'corta', alias: aliasOf(1) })).status).toBe(400);
    const raw = (body: string) => handle(new Request(`${BASE}/scores`, { method: 'POST', body }), d);
    expect((await raw('{no es json')).status).toBe(400);
    expect((await raw('x'.repeat(LEADERBOARD.maxBodyBytes + 1))).status).toBe(400);
  });
});

describe('Cambiar nombre y servicio', () => {
  it('cambiar el alias actualiza la fila sin tocar el puntaje', async () => {
    const d = deps();
    const r = win(1);
    await submit(d, 1, r);
    const renamed = aliasFor(tokenOf(1), 5);
    expect((await post(d, 'player', { token: tokenOf(1), alias: renamed })).status).toBe(200);
    expect((await board(d, 1)).top[0]).toMatchObject({ alias: renamed, total: r.total, me: true });
  });

  it('sin base configurada: 503; ruta desconocida: 404', async () => {
    const d = deps({ store: null });
    expect((await handle(new Request(`${BASE}/leaderboard`), d)).status).toBe(503);
    expect((await handle(new Request(`${BASE}/nada`), deps())).status).toBe(404);
  });

  it('un error del almacén responde 500', async () => {
    const broken = upstashStore('https://example.invalid', 't', (async () => new Response('', { status: 500 })) as typeof fetch);
    expect((await handle(new Request(`${BASE}/leaderboard`), deps({ store: broken }))).status).toBe(500);
  });
});

describe('Upstash por REST', () => {
  it('manda los comandos en un pipeline con el token', async () => {
    const calls: { url: string; body: unknown; auth: string | null }[] = [];
    const fake = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)), auth: new Headers(init.headers).get('authorization') });
      return new Response(JSON.stringify([{ result: 3 }, { result: 1 }]));
    }) as unknown as typeof fetch;
    const store = upstashStore('https://kv.example/', 'secreto', fake);
    expect(await store.hit('rl:dev:x', 3600)).toBe(3);
    expect(calls[0]).toEqual({ url: 'https://kv.example/pipeline', body: [['INCR', 'rl:dev:x'], ['EXPIRE', 'rl:dev:x', 3600, 'NX']], auth: 'Bearer secreto' });
  });
});
