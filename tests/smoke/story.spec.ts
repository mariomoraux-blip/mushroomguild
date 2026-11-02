import { expect, test, type Page } from '@playwright/test';

// 003 · Cartas de historia y luz por estación. Las capturas salen solo del proyecto vertical 390 × 844.
const SHOTS = 'vertical-390x844';
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('gremio.seenSpecies', JSON.stringify(['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'])),
  );
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

const dialog = (page: Page) => page.getByRole('dialog');
/** Espera a que Phaser haya dibujado el escenario (contenedor con el claro). */
const sceneReady = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() => {
        const w = window as unknown as { game?: { scene: { getScene: (k: string) => { children: { list: { type: string; list?: unknown[] }[] } } | null } } };
        return w.game?.scene.getScene('Game')?.children.list.some((o) => o.type === 'Container' && (o.list?.length ?? 0) > 0) ?? false;
      }),
    )
    .toBe(true);

test('intro: tres cartas, foco en el botón principal, Tab no sale y «Saltar» invita a elegir un miembro', async ({ page }, info) => {
  await page.goto('/?map=clasico');
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#story-title')).toHaveText('El bosque se apaga');
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeFocused();
  // El resto de la app queda inactivo.
  await expect(page.locator('.app')).toHaveJSProperty('inert', true);
  if (info.project.name === SHOTS) await page.screenshot({ path: 'docs/screenshots/003-intro-390x844.png' });
  if (info.project.name.startsWith('escritorio')) {
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('#story') !== null)).toBe(true);
  }
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.locator('#story-title')).toHaveText('Un gremio despierta');
  await page.getByRole('button', { name: 'Saltar' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('#notice')).toHaveText('Elige a un miembro del gremio.');
  await expect(page.locator('.app')).toHaveJSProperty('inert', false);
  // Ya vista: al volver a abrir el juego no sale.
  await page.reload();
  await sceneReady(page);
  await expect(dialog(page)).toBeHidden();
});

test('intro con teclado: Enter avanza hasta «Comenzar» y Esc salta', async ({ page }, info) => {
  test.skip(!info.project.name.startsWith('escritorio'), 'teclado en escritorio');
  await page.goto('/?map=clasico');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Saltar' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  // El foco vuelve al juego.
  await expect(page.locator('#dock button').first()).toBeFocused();
});

test('cartas legibles a 360 px: sin desbordar, texto ≥ 16 px y botones ≥ 44 px', async ({ page }, info) => {
  test.skip(info.project.name !== SHOTS, 'una vez basta');
  await page.setViewportSize({ width: 360, height: 740 });
  for (const url of ['/?map=clasico', '/?debugState=won', '/?debugState=mage']) {
    await page.goto(url);
    const card = page.locator('.story__card');
    await expect(card).toBeVisible();
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(16);
    expect(box.x + box.width).toBeLessThanOrEqual(360 - 16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    const size = await page.locator('.story__text').evaluate((n) => parseFloat(getComputedStyle(n).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
    for (const b of await card.getByRole('button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

test('estaciones: la luz cambia sobre el escenario y los personajes no llevan filtro', async ({ page }, info) => {
  const seasons = [
    [1, 'primavera', 'Primavera'],
    [4, 'verano', 'Verano'],
    [7, 'otono', 'Otoño'],
    [10, 'invierno', 'Invierno'],
  ] as const;
  for (const [day, slug, name] of seasons) {
    await page.goto(`/?debugDay=${day}`);
    await sceneReady(page);
    await expect(page.locator('.hud')).toContainText(name);
    const layers = await page.evaluate(() => {
      type Obj = { type: string; texture?: { key: string }; filters?: { internal: { list: unknown[] } } | null; list?: Obj[] };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: Obj[] } } } } };
      const list = w.game.scene.getScene('Game').children.list;
      const graded = (o: Obj) => (o.filters?.internal.list.length ?? 0) > 0;
      const stage = list.find((o) => o.type === 'Container');
      return {
        stage: stage && graded(stage) ? (stage.list ?? []).map((o) => o.texture?.key ?? '') : [],
        // Fuera del contenedor solo lleva filtro el Árbol Padre: ni la luz del micelio ni los personajes.
        gradedOutside: list.filter((o) => o !== stage && graded(o)).map((o) => o.texture?.key ?? ''),
      };
    });
    expect(layers.stage).toEqual(['claro']);
    expect(layers.gradedOutside).toHaveLength(1);
    expect(layers.gradedOutside[0]).toMatch(/^arbol-padre/);
    if (info.project.name === SHOTS) await page.screenshot({ path: `docs/screenshots/003-${slug}-390x844.png` });
  }
});

test('finales: victoria y fin del invierno, «Ver el claro» y «Jugar otra vez»', async ({ page }, info) => {
  await page.goto('/?debugState=won');
  await expect(page.locator('#story-title')).toHaveText('¡El bosque despertó!');
  await expect(page.locator('#story-text')).toHaveText(/^El Árbol Padre despertó en el día \d+\.$/);
  await expect(page.locator('.story__note')).toContainText('Árboles revividos');
  await expect(page.getByRole('button', { name: 'Jugar otra vez' })).toBeFocused();
  if (info.project.name === SHOTS) await page.screenshot({ path: 'docs/screenshots/003-victoria-390x844.png' });
  await page.getByRole('button', { name: 'Ver el claro' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('#again-btn')).toBeVisible();
  await page.locator('#again-btn').click();
  await expect(page.locator('#again-btn')).toBeHidden();
  await expect(page.locator('.hud')).toContainText('Primavera');
  await expect(dialog(page)).toBeHidden(); // jugar otra vez no repite la intro

  await page.goto('/?debugState=lost');
  await expect(page.locator('#story-title')).toHaveText('Fin del invierno');
  await expect(page.locator('#story-text')).toHaveText('El bosque esperará la próxima primavera.');
  await expect(page.locator('.story__note')).toContainText('temprano');
  if (info.project.name === SHOTS) await page.screenshot({ path: 'docs/screenshots/003-fin-invierno-390x844.png' });
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
});

test('llegada de Maestra Bruna: su carta con los dos hechizos', async ({ page }, info) => {
  await page.goto('/?debugState=mage');
  await expect(page.locator('#story-text')).toHaveText('El bosque volvió a hablar, y alguien escuchó.');
  await expect(page.locator('.story__list li')).toHaveCount(2);
  if (info.project.name === SHOTS) await page.screenshot({ path: 'docs/screenshots/003-maga-390x844.png' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(dialog(page)).toBeHidden();
});
