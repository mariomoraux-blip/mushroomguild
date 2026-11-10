// Ranking (036). La API se intercepta con `page.route`: estas pruebas nunca tocan el ranking real.
// leaderboard › Jugador del dispositivo: "Jugador que vuelve" → "registrar y volver".
// leaderboard › Registrar un puntaje: "Primer registro" y "Partida que no cuenta" → "registrar y volver", "no cuenta".
// leaderboard › Pantalla Ranking: "Fuera del top" y "Esc" → "pantalla"; title-screens › Portada: "Abrir el ranking".
// leaderboard › Sin conexión: "Ganar sin red" → "sin conexión".
import { expect, test, type Page, type Route } from '@playwright/test';

const SEEN = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];
const row = (rank: number, alias: string, total: number, me = false) => ({ rank, alias, total, level: rank % 3 ? 'brote' : 'bosque', stars: rank < 4 ? 3 : 2, wonMonth: 9, at: 1, me });
const TOP = [
  'Coral del Alba', 'Lía del Rocío', 'Mora de la Corteza', 'Tomillo de la Brisa', 'Olmo del Otoño',
  'Ciro del Liquen', 'Brezo de la Hojarasca', 'Junco del Arroyo', 'Perla de la Luna', 'Tilo del Valle',
].map((alias, i) => row(i + 1, alias, 3400 - i * 90));
const BOARD = { season: 8, players: 340, top: TOP, me: row(27, 'Bruno del Musgo', 2210, true) };

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await page.addInitScript((seen) => {
    localStorage.setItem('gremio.seenSpecies', JSON.stringify(seen));
    localStorage.setItem('gremio.playedLevels', JSON.stringify(['brote', 'bosque', 'ancestral']));
  }, SEEN);
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

/** Intercepta la API; devuelve las peticiones que llegaron. */
async function mockApi(page: Page, scores: (route: Route) => Promise<void> = (r) => r.fulfill({ json: { season: 8, accepted: true, best: 2731, rank: 3, players: 40 } })) {
  const calls: { url: string; method: string; body: string | null; device: string | null }[] = [];
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    calls.push({ url: req.url(), method: req.method(), body: req.postData(), device: req.headers()['x-gremio-device'] ?? null });
    if (req.url().endsWith('/api/scores')) return scores(route);
    if (req.url().endsWith('/api/player')) return route.fulfill({ json: { alias: JSON.parse(req.postData() ?? '{}').alias } });
    return route.fulfill({ json: BOARD });
  });
  return calls;
}

/** Desde la portada: «Nueva partida» → Brote, y el bot con criterio gana despachando al store (solo en desarrollo). */
async function winFromTitle(page: Page) {
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('[data-level="brote"]').click();
  await page.evaluate(async () => {
    // Módulo que sirve Vite en la página (no se resuelve en Node): se tipa con el de las reglas.
    const R = (await import(/* @vite-ignore */ '/src/rules/index.ts' as string)) as typeof import('../../src/rules');
    const store = (window as unknown as { store: import('../../src/store').Store }).store;
    const plan = R.playAdvised(store.getState().game);
    for (const a of plan.log) {
      // Cada carta cerrada consume su entrada del historial (022) de forma asíncrona: se le da tiempo.
      while (store.getState().ui.story || store.getState().ui.sheet) {
        store.dispatch({ type: 'cancel' });
        await new Promise((r) => setTimeout(r, 120));
      }
      if (a.type === 'act') {
        store.dispatch({ type: 'select', id: a.memberId });
        if (store.getState().ui.sheet?.kind === 'spell') {
          const g = store.getState().game;
          const spell = (['sprout', 'rain'] as const).find((sp) => R.validTargets(g, a.memberId, sp).some((t) => t.x === a.x && t.y === a.y))!;
          store.dispatch({ type: 'chooseSpell', spell });
        }
        store.dispatch({ type: 'tapTile', x: a.x, y: a.y });
      } else if (a.type === 'recruit') store.dispatch({ type: 'recruit', species: a.species });
      else store.dispatch({ type: 'endMonth' });
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await expect(page.locator('#story .score__stars')).toBeVisible({ timeout: 10_000 });
}

const shotFor = (name: string, project: string, change = '036') =>
  project === 'vertical-390x844' || project === 'horizontal-844x390' ? `docs/screenshots/${change}-${name}-${project}.png` : null;

test('pantalla: ranking desde la portada, fila propia fijada, sin scroll de página y Esc', async ({ page }, info) => {
  const calls = await mockApi(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Ranking' }).click();
  await expect(page.locator('.ranking__meta')).toHaveText('Temporada 8 · 340 jugadores');
  await expect(page.locator('.ranking__row')).toHaveCount(11);
  const mine = page.locator('.ranking__row.is-me');
  await expect(mine).toHaveAttribute('aria-label', 'Puesto 27, Bruno del Musgo (tú), 2210 puntos, Bosque, 2 de 3 estrellas');
  await expect(mine).toBeInViewport();
  for (const box of await page.locator('.ranking__row').evaluateAll((rows) => rows.map((r) => r.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBe(0);
  await expect(page.locator('.ranking__privacy')).toBeVisible();
  // Sin jugador registrado no hay «Cambiar nombre» ni cabecera del dispositivo.
  await expect(page.getByRole('button', { name: 'Cambiar nombre' })).toHaveCount(0);
  expect(calls.every((c) => c.device === null)).toBe(true);
  const shot = shotFor('ranking', info.project.name);
  if (shot) await page.screenshot({ path: shot });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Ranking' })).toBeFocused();
});

test('registrar y volver: primer registro desde la carta, ranking encima de la carta y saludo al volver', async ({ page }, info) => {
  test.setTimeout(60_000);
  const calls = await mockApi(page);
  await page.goto('/');
  await winFromTitle(page);
  // story-presentation › Finales: "Acciones del final" (037).
  const box = page.locator('#story .story__ranking');
  await expect(box.getByRole('button', { name: 'Registra tu puntaje' })).toHaveClass(/is-primary/);
  await expect(box.getByRole('button', { name: 'Registra tu puntaje' })).toBeFocused();
  await expect(box.getByRole('button', { name: 'Ver ranking' })).not.toHaveClass(/is-primary/);
  await expect(page.locator('#story .story__card').getByRole('button', { name: 'Jugar de nuevo' })).toHaveCount(0);
  await expect(page.locator('#story .story__again')).toHaveText('Jugar de nuevo');
  await expect(page.locator('#story .story__card .story__board')).toHaveText('Ver tablero');
  await expect(page.locator('#story [role="dialog"]')).toHaveCount(1);
  for (const b of await page.locator('#story button').evaluateAll((bs) => bs.map((x) => x.getBoundingClientRect().height))) expect(b).toBeGreaterThanOrEqual(44);
  const unregistered = shotFor('victoria-sin-registro', info.project.name, '037');
  if (unregistered) await page.screenshot({ path: unregistered });
  await page.getByRole('button', { name: 'Registra tu puntaje' }).click();
  const name = page.locator('.alias__name');
  const first = await name.textContent();
  await page.getByRole('button', { name: 'Otro nombre' }).click();
  await expect(name).not.toHaveText(first!);
  const alias = (await name.textContent())!;
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.locator('#story .story__rank')).toHaveText('Puesto 3 de 40');
  const sent = calls.find((c) => c.url.endsWith('/api/scores'))!;
  const body = JSON.parse(sent.body!) as { token: string; alias: string; result: { actionLog: unknown[] } };
  expect(body.alias).toBe(alias);
  expect(body.result.actionLog.length).toBeGreaterThan(0);
  expect(calls.every((c) => !c.url.includes(body.token))).toBe(true);
  const shot = shotFor('victoria', info.project.name, '037');
  if (shot) await page.screenshot({ path: shot });
  // «Ver ranking» abre el ranking encima de la carta; Esc vuelve a la carta.
  await page.getByRole('button', { name: 'Ver ranking' }).click();
  await expect(page.locator('.ranking__list')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar nombre' })).toBeVisible();
  expect(calls.at(-1)!.device).toBe(body.token);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Ver ranking' })).toBeFocused();
  // Jugador que vuelve: la portada lo saluda y su próxima victoria se envía sola.
  await page.goto('/');
  await expect(page.locator('.title__hello')).toHaveText(`Hola de nuevo, ${alias}`);
  if (info.project.name !== 'vertical-390x844') return;
  const before = calls.filter((c) => c.url.endsWith('/api/scores')).length;
  await winFromTitle(page);
  await expect(page.locator('#story .story__rank')).toHaveText('Puesto 3 de 40');
  await expect(page.getByRole('button', { name: 'Registra tu puntaje' })).toHaveCount(0);
  expect(calls.filter((c) => c.url.endsWith('/api/scores')).length).toBe(before + 1);
});

test('sin conexión: la carta lo dice, el puntaje queda pendiente y se envía al abrir el ranking', async ({ page }, info) => {
  test.skip(info.project.name !== 'vertical-390x844', 'un tamaño basta');
  test.setTimeout(60_000);
  let online = false;
  const calls = await mockApi(page, (r) => {
    if (!online) return r.abort('internetdisconnected');
    const best = (JSON.parse(r.request().postData() ?? '{}') as { result: { total: number } }).result.total;
    return r.fulfill({ json: { season: 8, accepted: true, best, rank: 5, players: 41 } });
  });
  await page.addInitScript(() => {
    if (!localStorage.getItem('gremio.player.v1')) localStorage.setItem('gremio.player.v1', JSON.stringify({ token: 'smoke-device-0000001', alias: 'Lía del Rocío' }));
  });
  await page.goto('/');
  await winFromTitle(page);
  await expect(page.locator('#story')).toContainText('No pudimos llegar al bosque. Tu puntaje quedó guardado y lo enviaremos después.');
  expect(await page.evaluate(() => localStorage.getItem('gremio.pending.v1'))).not.toBeNull();
  online = true;
  await page.getByRole('button', { name: 'Ver ranking' }).click();
  await expect(page.locator('.ranking__list')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('gremio.pending.v1'))).toBeNull();
  expect(calls.filter((c) => c.url.endsWith('/api/scores')).length).toBe(2);
});

test('no cuenta: una victoria de ?debugState no ofrece registrar ni envía nada', async ({ page }) => {
  const calls = await mockApi(page);
  await page.goto('/?debugState=nearWin');
  await page.locator('.card--amanita').click();
  await page.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  await expect(page.locator('#story .score__stars')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Registra tu puntaje' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver ranking' })).toBeVisible();
  expect(calls.filter((c) => c.url.endsWith('/api/scores'))).toHaveLength(0);
});
