import { expect, test, type Page } from '@playwright/test';

const cell = (page: Page, x: number, y: number) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const valid = (page: Page) => page.locator('.cell[data-valid="true"]');
const hudValue = (page: Page, i: number) => page.locator('.chip__value').nth(i);
const isTouch = (name: string) => name !== 'escritorio-1280x800';

const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }, info) => {
  // La ficha de cada especie se abre sola la primera vez; salvo en su propia prueba, se dan por vistas.
  if (!info.title.startsWith('Ficha')) {
    await page.addInitScript(() =>
      localStorage.setItem('gremio.seenSpecies', JSON.stringify(['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'])),
    );
  }
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

test('táctil: elegir al Lactarius, tejer y terminar el día (con captura)', async ({ page }, info) => {
  test.skip(!isTouch(info.project.name), 'flujo táctil');
  await page.goto('/');
  await page.locator('[data-id="1"]').tap();
  await expect(valid(page)).toHaveCount(2);
  await expect(page.locator('#notice')).toHaveText('Añil: toca una casilla resaltada.');
  // Toque en una casilla no válida: motivo exacto y sigue seleccionado.
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
  // Captura con Añil seleccionado el día 2.
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
  // Tab recorre el HUD (esporas, ayuda) y llega a las tarjetas del gremio.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    if (await page.locator('[data-id="1"]').evaluate((b) => b === document.activeElement)) break;
  }
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

test('Maestra Bruna: primero el hechizo, después las casillas', async ({ page }) => {
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

test('Libreta de campo: no se abre sola y se consulta con "?"', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayuda: Libreta de campo' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Despierta al Árbol Padre');
  await expect(dialog).toContainText('Gliophorus · Mensajera');
  await page.getByRole('button', { name: '¡A jugar!' }).click();
  await expect(dialog).toHaveCount(0);
});

test('Ficha al seleccionar: primera vez por especie, "Entendido" mantiene la selección y "Ficha" la reabre', async ({ page }, info) => {
  await page.goto('/');
  await page.locator('[data-id="1"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Añil · Lactarius indigo');
  await expect(dialog).toContainText('«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»');
  for (const h of ['Habilidad', 'Cómo usarlo', 'Movimiento', 'Nutrientes']) await expect(dialog.getByRole('heading', { name: h })).toBeVisible();
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/005-ficha-390x844.png' });
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(valid(page)).toHaveCount(2);
  // Segunda vez: no se abre sola.
  await page.locator('[data-id="1"]').click();
  await page.locator('[data-id="1"]').click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver la ficha de Añil' }).click();
  await expect(page.getByRole('dialog')).toContainText('Añil · Lactarius indigo');
  // Se recuerda entre visitas.
  await page.reload();
  await page.locator('[data-id="1"]').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('guía: ★ en el sugerido, camino hacia el árbol, meta marcada y esporas que abren reclutar', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('#notice')).toHaveText('Pista: Bruno puede descomponer un tronco junto a la red (+3 nutrientes).');
  await expect(page.locator('[data-id="2"]')).toHaveClass(/is-suggested/);
  await expect(cell(page, 2, 0)).toHaveAttribute('aria-label', /la meta/);
  // Tocar un tronco sin selección lo explica.
  await cell(page, 1, 7).click();
  await expect(page.locator('#notice')).toContainText('Tronco caído: el Champiñón lo descompone');
  await page.locator('[data-id="2"]').click();
  await cell(page, 1, 7).click();
  await expect(page.locator('[data-id="1"]')).toHaveClass(/is-suggested/);
  await page.locator('[data-id="1"]').click();
  await expect(cell(page, 2, 6)).toHaveAttribute('aria-label', /★/);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/005-camino-390x844.png' });
  // El chip de esporas abre la hoja de reclutar, que dice para qué sirve cada especie.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Esporas: 0/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Reclutar al gremio');
  await expect(page.getByRole('dialog')).toContainText('Pasa la voz desde un árbol vivo');
});
