import { expect, test, type Page } from '@playwright/test';

const cell = (page: Page, x: number, y: number) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const valid = (page: Page) => page.locator('.cell[data-valid="true"]');
const hudValue = (page: Page, i: number) => page.locator('.chip__value').nth(i);
const isTouch = (name: string) => name !== 'escritorio-1280x800';

const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

async function noScrollNoZoom(page: Page) {
  const v = await page.evaluate(() => ({
    scrollY: window.scrollY,
    overflow: document.documentElement.scrollHeight - window.innerHeight,
    scale: window.visualViewport?.scale ?? 1,
  }));
  expect(v).toEqual({ scrollY: 0, overflow: 0, scale: 1 });
}

test('layout: tablero completo, casillas en rango y controles ≥ 44 px', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  const minTile = Number(info.project.metadata.minTile);
  const first = (await cell(page, 0, 0).boundingBox())!;
  expect(first.width).toBeGreaterThanOrEqual(minTile);
  expect(first.width).toBeLessThanOrEqual(96);
  // Tablero completo dentro de la ventana.
  const last = (await cell(page, 4, 7).boundingBox())!;
  const vp = page.viewportSize()!;
  expect(last.x + last.width).toBeLessThanOrEqual(vp.width);
  expect(last.y + last.height).toBeLessThanOrEqual(vp.height);
  // HUD arriba y dock abajo (vertical) o a la derecha (horizontal).
  const hud = (await page.locator('#hud').boundingBox())!;
  const dock = (await page.locator('#dock').boundingBox())!;
  if (info.project.name.startsWith('horizontal')) {
    expect(dock.x).toBeGreaterThan(last.x + last.width);
  } else {
    expect(hud.y + hud.height).toBeLessThanOrEqual(first.y);
    expect(dock.y).toBeGreaterThanOrEqual(last.y + last.height);
  }
  // "Terminar el día" en la misma fila que las tarjetas.
  const end = (await page.locator('.end').boundingBox())!;
  const card = (await page.locator('.card').first().boundingBox())!;
  expect(Math.abs(end.y - card.y)).toBeLessThan(4);
  // Todo control visible mide ≥ 44 × 44.
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .map((b) => ({ b, r: b.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
      .map(({ b, r }) => `${b.className} ${r.width}×${r.height}`),
  );
  expect(small).toEqual([]);
  await noScrollNoZoom(page);
});

test('táctil: elegir a la Lactarius, tejer y terminar el día (con captura)', async ({ page }, info) => {
  test.skip(!isTouch(info.project.name), 'flujo táctil');
  await page.goto('/');
  await page.locator('[data-id="1"]').tap();
  await expect(valid(page)).toHaveCount(2);
  await expect(page.locator('#notice')).toHaveText('Añil: toca una casilla resaltada.');
  // Toque en una casilla no válida: motivo exacto y sigue seleccionada.
  await cell(page, 0, 0).tap();
  await expect(page.locator('#notice')).toHaveText('Muy lejos: la tierra debe tocar la red.');
  await expect(page.locator('[data-id="1"]')).toHaveAttribute('aria-pressed', 'true');
  await cell(page, 3, 7).tap();
  await expect(hudValue(page, 1)).toHaveText('1');
  await page.locator('.end').tap();
  await expect(hudValue(page, 0)).toHaveText('2/12');
  // Doble toque en el tablero: ni zoom ni scroll.
  await cell(page, 2, 3).tap();
  await cell(page, 2, 3).tap();
  await noScrollNoZoom(page);
  // Captura con Añil seleccionada el día 2.
  await page.locator('[data-id="1"]').tap();
  await page.screenshot({ path: `docs/screenshots/002-${info.project.name}.png` });
});

test('estado visible: el Champiñón descompone y el HUD suma nutrientes', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-id="2"]').click();
  await cell(page, 1, 7).click();
  await expect(hudValue(page, 1)).toHaveText('5');
});

test('teclado: Tab, Enter y Esc bastan para elegir, actuar y terminar el día', async ({ page }, info) => {
  test.skip(isTouch(info.project.name), 'teclado en escritorio');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-id="1"]')).toBeFocused();
  // Esc deselecciona y devuelve el foco a la tarjeta.
  await page.keyboard.press('Enter');
  await expect(valid(page)).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(valid(page)).toHaveCount(0);
  await expect(page.locator('[data-id="1"]')).toBeFocused();
  // Elegir y actuar: el foco salta a la primera casilla válida y es visible.
  await page.keyboard.press('Enter');
  await expect(valid(page).first()).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(hudValue(page, 1)).toHaveText('1');
  // Terminar el día.
  for (let i = 0; i < 10; i++) {
    if (await page.locator('.end').evaluate((b) => b === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('.end')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(hudValue(page, 0)).toHaveText('2/12');
  await page.screenshot({ path: `docs/screenshots/002-${info.project.name}.png` });
});

test('Maestra Bruma: primero el hechizo, después las casillas', async ({ page }) => {
  await page.goto('/?debugState=fullGuild');
  const mage = page.locator('.card--mago');
  await mage.scrollIntoViewIfNeeded();
  await mage.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(valid(page)).toHaveCount(0);
  await page.getByRole('button', { name: /Lluvia de esporas/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await valid(page).count()).toBeGreaterThan(0);
  await expect(valid(page).first()).toHaveAttribute('aria-label', /Árbol vivo/);
});

test('gremio completo: el dock se desplaza por dentro y la página no se mueve', async ({ page }, info) => {
  test.skip(info.project.name !== 'vertical-390x844', 'solo a 390 px de ancho');
  await page.goto('/?debugState=fullGuild');
  const cards = page.locator('.dock__cards');
  await expect(page.locator('.dock__item')).toHaveCount(7);
  const ids = () => page.locator('.dock__item .card').evaluateAll((bs) => bs.map((b) => b.getAttribute('data-id')));
  const order = await ids();
  const right = await cards.evaluate((c) => (c.scrollWidth > c.clientWidth ? c.getBoundingClientRect().right : -1));
  expect(right).toBeGreaterThan(0);
  // La tarjeta siguiente asoma cortada en el borde del dock.
  const peeking = await page
    .locator('.dock__item')
    .evaluateAll((items, edge) => items.some((i) => i.getBoundingClientRect().left < edge && i.getBoundingClientRect().right > edge), right);
  expect(peeking).toBe(true);
  await cards.evaluate((c) => c.scrollBy(400, 0));
  await expect(page.locator('.end')).toBeInViewport();
  await noScrollNoZoom(page);
  await page.locator('.end').click();
  expect(await ids()).toEqual(order);
});

test('fichas de criatura: nombre científico, rol, acción y línea con humor', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card--recruit').click();
  await page.getByRole('button', { name: 'Ficha de Champiñón' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Agaricus bisporus');
  await expect(dialog).toContainText('Descompositor');
  await expect(dialog).toContainText('Comestible: sí, y lo sabe. Por eso trabaja rápido.');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
