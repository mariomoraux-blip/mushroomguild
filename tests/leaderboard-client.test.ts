import { describe, expect, it } from 'vitest';
import { handle } from '../server/handler';
import { memoryStore } from '../server/store';
import { createLeaderboardClient, PENDING_KEY, PLAYER_KEY, type ClientEnv } from '../src/leaderboard';
import { initialState, reduce } from '../src/store';
import { aliasFor, newRandomGame, playAdvised, SCORE_VERSION, scoreResult, thresholds, type ScoreResult } from '../src/rules';

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  };
}
const brokenStorage = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); }, removeItem: () => { throw new Error('no'); } };

function win(seed: number): ScoreResult {
  const start = newRandomGame(seed);
  return scoreResult(playAdvised(start), 200_000, thresholds(start));
}

/** Cliente contra el handler real con el almacén en memoria; `online` corta la red. */
function setup(storage: ClientEnv['storage'] = memStorage()) {
  const deps = { store: memoryStore(), salt: 't', now: () => 1 };
  const net = { online: true };
  let n = 0;
  const env: ClientEnv = {
    storage,
    base: 'http://local/api',
    uuid: () => `uuid-device-${String(++n).padStart(8, '0')}`,
    fetch: (async (url: string, init?: RequestInit) => {
      if (!net.online) throw new TypeError('Failed to fetch');
      return handle(new Request(url, init), deps);
    }) as typeof fetch,
  };
  return { client: createLeaderboardClient(env), net, storage };
}

describe('Requirement: Nombre en el gremio (038)', () => {
  it('un nombre escrito válido se guarda; uno de la lista negra lo rechaza el servidor y no se guarda', async () => {
    const { client } = setup();
    client.ensureToken();
    expect(await client.saveAlias('Bitchy Ana')).toBe('rejected'); // «bitch» dentro, tras normalizar
    expect(client.readPlayer()?.alias).toBeNull();
    expect(await client.saveAlias('Ana Lucía')).toBe('saved');
    expect(client.readPlayer()?.alias).toBe('Ana Lucía');
  });

  it('sin conexión, un nombre escrito ya validado se guarda igual', async () => {
    const { client, net } = setup();
    net.online = false;
    expect(await client.saveAlias('Ana Lucía')).toBe('saved');
    expect(client.readPlayer()?.alias).toBe('Ana Lucía');
  });
});

describe('Requirement: Jugador del dispositivo', () => {
  it('Scenario: Jugador que vuelve — la clave y el alias quedan en el dispositivo', async () => {
    const { client, storage } = setup();
    const token = client.ensureToken()!;
    expect(client.ensureToken()).toBe(token);
    const alias = aliasFor(token, 0);
    expect(await client.saveAlias(alias)).toBe('saved');
    expect(createLeaderboardClient({ storage, base: '', uuid: () => 'x', fetch }).readPlayer()).toEqual({ token, alias });
  });

  it('Scenario: Almacenamiento que falla — no hay clave ni registro, y no lanza', async () => {
    const { client } = setup(brokenStorage);
    expect(client.ensureToken()).toBeNull();
    expect(client.readPlayer()).toBeNull();
    expect(await client.saveAlias('Bruno del Musgo')).toBe('failed');
    expect((await client.board()).kind).toBe('ready');
  });

  it('la clave nunca va en la URL', async () => {
    const urls: string[] = [];
    const storage = memStorage();
    const client = createLeaderboardClient({ storage, base: 'http://local/api', uuid: () => 'uuid-device-00000001', fetch: (async (url: string) => (urls.push(url), new Response('{}'))) as typeof fetch });
    await client.saveAlias(aliasFor('uuid-device-00000001', 0));
    await client.board();
    expect(urls.every((u) => !u.includes('uuid-device'))).toBe(true);
  });
});

describe('Requirement: Registrar un puntaje', () => {
  it('sin alias no envía; registrado, responde el puesto', async () => {
    const { client } = setup();
    expect(await client.submit(win(1))).toEqual({ kind: 'unregistered' });
    await client.saveAlias(aliasFor(client.ensureToken()!, 0));
    const r = win(1);
    expect(await client.submit(r)).toEqual({ kind: 'ok', rank: 1, players: 1, best: r.total, improved: true });
  });

  it('Scenario: Sin mejora — dice el mejor total', async () => {
    const { client } = setup();
    await client.saveAlias(aliasFor(client.ensureToken()!, 0));
    const [a, b] = [win(1), win(2)].sort((x, y) => y.total - x.total) as [ScoreResult, ScoreResult];
    await client.submit(a);
    expect(await client.submit(b)).toMatchObject({ kind: 'ok', best: a.total, improved: false });
  });

  it('un resultado alterado se rechaza', async () => {
    const { client } = setup();
    await client.saveAlias(aliasFor(client.ensureToken()!, 0));
    const r = win(1);
    expect(await client.submit({ ...r, total: r.total + 1 })).toEqual({ kind: 'rejected' });
  });
});

describe('Requirement: Sin conexión', () => {
  it('Scenario: Ganar sin red — queda pendiente y se envía al abrir el ranking', async () => {
    const { client, net, storage } = setup();
    await client.saveAlias(aliasFor(client.ensureToken()!, 0));
    net.online = false;
    const r = win(1);
    expect(await client.submit(r)).toEqual({ kind: 'offline' });
    expect(await client.board()).toEqual({ kind: 'offline' });
    expect(storage!.getItem(PENDING_KEY)).not.toBeNull();
    net.online = true;
    await client.flush();
    expect(storage!.getItem(PENDING_KEY)).toBeNull();
    const view = await client.board();
    expect(view.kind === 'ready' && view.data.top[0]).toMatchObject({ total: r.total, me: true });
  });

  it('solo guarda el mejor pendiente, y descarta el de otra temporada', async () => {
    const { client, net, storage } = setup();
    await client.saveAlias(aliasFor(client.ensureToken()!, 0));
    net.online = false;
    const [hi, lo] = [win(1), win(2)].sort((x, y) => y.total - x.total) as [ScoreResult, ScoreResult];
    await client.submit(hi);
    await client.submit(lo);
    expect((JSON.parse(storage!.getItem(PENDING_KEY)!) as ScoreResult).total).toBe(hi.total);
    storage!.setItem(PENDING_KEY, JSON.stringify({ ...hi, scoringVersion: SCORE_VERSION - 1 }));
    net.online = true;
    await client.flush();
    expect(storage!.getItem(PENDING_KEY)).toBeNull();
    expect(storage!.getItem(PLAYER_KEY)).not.toBeNull();
  });
});

describe('Store del ranking', () => {
  it('«Ver ranking» desde la carta de final: Esc cierra el ranking y la carta sigue', () => {
    let s = initialState(newRandomGame(1));
    s = { ...s, ui: { ...s.ui, story: { kind: 'won' } } };
    s = reduce(s, { type: 'openScreen', screen: { kind: 'ranking', back: 'game' } });
    expect(s.ui.screen?.kind).toBe('ranking');
    s = reduce(s, { type: 'cancel' });
    expect(s.ui.screen).toBeNull();
    expect(s.ui.story).toEqual({ kind: 'won' });
  });

  it('desde la portada, Esc vuelve a la portada', () => {
    let s = initialState(newRandomGame(1), [], { title: true });
    s = reduce(s, { type: 'openScreen', screen: { kind: 'ranking', back: 'title' } });
    expect(reduce(s, { type: 'cancel' }).ui.screen).toEqual({ kind: 'title' });
  });

  it('registrar el alias cierra «Tu nombre en el gremio»; jugar de nuevo conserva el alias y limpia el envío', () => {
    let s = initialState(newRandomGame(1));
    s = reduce(s, { type: 'openSheet', sheet: { kind: 'alias', alias: 'Bruno del Musgo', n: 0, purpose: 'register' } });
    s = reduce(s, { type: 'submission', submission: { kind: 'unregistered' } });
    s = reduce(s, { type: 'player', alias: 'Bruno del Musgo' });
    expect(s.ui.sheet).toBeNull();
    expect(s.ui.player).toBe('Bruno del Musgo');
    s = reduce(s, { type: 'restart', game: newRandomGame(2) });
    expect(s.ui.player).toBe('Bruno del Musgo');
    expect(s.ui.submission).toBeNull();
  });
});
