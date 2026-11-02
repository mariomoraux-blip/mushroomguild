// Escenarios de las specs que se verifican aquí (openspec/specs/):
// board-interaction › Móvil primero: "Teléfono en vertical", "Safari con barras", "Teléfono en horizontal" y
//   "Escritorio" → "layout" (un proyecto por tamaño); "Gremio completo en el dock" → "gremio completo".
// board-interaction › Objetivos táctiles: "Tocar un miembro con el pulgar" → "layout" (≥ 44 px) y "táctil".
// board-interaction › Accesibilidad básica: "Jugar con teclado" → "teclado".
// board-interaction › Retratos del gremio: "Retratos en el dock" y "Trabajó hoy" → "estilo cozy".
// board-interaction › Estilo cozy: "Pantalla de juego" → "estilo cozy".
// board-interaction › Casilla ocupada: "Hongo sobre un tronco" → tests/paint.test.ts.
// board-interaction › Fondo vivo: "Movimiento reducido" → "fondo vivo".
// board-interaction › Retratos del gremio: "La maga en el tablero" → "Maestra Bruna: retrato propio…".
// player-guidance › Libreta de campo: "Consultar la ayuda" → "Libreta de campo".
// player-guidance › Meta visible: "Inicio" → "guía".
import { expect, test, type Page } from '@playwright/test';

const cell = (page: Page, x: number, y: number) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const valid = (page: Page) => page.locator('.cell[data-valid="true"]');
const nutrients = (page: Page) => page.locator('.chip__value').nth(0);
const day = (page: Page) => page.locator('.hud__day-value');
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
  await page.goto('/?map=clasico');
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
  expect(Math.abs(end.y + end.height / 2 - (card.y + card.height / 2))).toBeLessThan(6);
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
  await page.goto('/?map=clasico');
  await page.locator('[data-id="1"]').tap();
  await expect(valid(page)).toHaveCount(2);
  await expect(page.locator('#notice')).toHaveText('Añil: toca una casilla resaltada.');
  // Toque en una casilla no válida: motivo exacto y sigue seleccionado.
  await cell(page, 0, 0).tap();
  await expect(page.locator('#notice')).toHaveText('Muy lejos: la tierra debe tocar la red.');
  await expect(page.locator('[data-id="1"]')).toHaveAttribute('aria-pressed', 'true');
  await cell(page, 3, 7).tap();
  await expect(nutrients(page)).toHaveText('1');
  await page.locator('.end').tap();
  await expect(day(page)).toHaveText('Día 2/12');
  // Doble toque en el tablero: ni zoom ni scroll.
  await cell(page, 2, 3).tap();
  await cell(page, 2, 3).tap();
  await noScrollNoZoom(page);
  // Captura con Añil seleccionado el día 2.
  await page.locator('[data-id="1"]').tap();
  await page.screenshot({ path: `docs/screenshots/002-${info.project.name}.png` });
});

test('estado visible: el Champiñón descompone y el HUD suma nutrientes', async ({ page }) => {
  await page.goto('/?map=clasico');
  await page.locator('[data-id="2"]').click();
  await cell(page, 1, 7).click();
  await expect(nutrients(page)).toHaveText('4');
});

test('teclado: Tab, Enter y Esc bastan para elegir, actuar y terminar el día', async ({ page }, info) => {
  test.skip(isTouch(info.project.name), 'teclado en escritorio');
  await page.goto('/?map=clasico');
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
  await expect(nutrients(page)).toHaveText('1');
  // Terminar el día.
  for (let i = 0; i < 10; i++) {
    if (await page.locator('.end').evaluate((b) => b === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('.end')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(day(page)).toHaveText('Día 2/12');
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

test('Maestra Bruna: retrato propio en el dock y más alta en el tablero', async ({ page }, info) => {
  await page.goto('/?debugState=fullGuild');
  const img = page.locator('.card--mago .portrait img');
  await expect(img).toHaveAttribute('src', /characters\/maestra-bruna\/(rest|happy)\.webp$/); // feliz si es la sugerida
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => (i.complete ? i.naturalHeight : 0))).toBe(160);
  const mage = page.locator('.card--mago');
  await mage.scrollIntoViewIfNeeded();
  await mage.click();
  await page.getByRole('button', { name: /Lluvia de esporas/ }).click();
  await valid(page).first().click();
  // Su sprite de trabajo (176 × 160) conserva la proporción: más alto que los de 176 × 128.
  const ratio = () =>
    page.evaluate(() => {
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: { type: string; visible: boolean; texture: { key: string }; displayWidth: number; displayHeight: number }[] } } } } };
      const s = w.game.scene.getScene('Game').children.list.find((o) => o.type === 'Image' && o.visible && o.texture.key === 'characters/maestra-bruna/work');
      return s ? s.displayHeight / s.displayWidth : 0;
    });
  await expect.poll(ratio).toBeCloseTo(160 / 176, 2);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/007-maga-390x844.png' });
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
  await page.goto('/?map=clasico');
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
  await page.goto('/?map=clasico');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayuda: Libreta de campo' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Despierta al Árbol Padre');
  await expect(dialog).toContainText('Gliophorus · Mensajera');
  await page.getByRole('button', { name: '¡A jugar!' }).click();
  await expect(dialog).toHaveCount(0);
});

test('Ficha al seleccionar: primera vez por especie, "Entendido" mantiene la selección y "Ficha" la reabre', async ({ page }, info) => {
  await page.goto('/?map=clasico');
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
  await page.goto('/?map=clasico');
  await expect(page.locator('#notice')).toHaveText('Pista: Bruno puede descomponer un tronco junto a la red (+2 nutrientes).');
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
  await expect(page.getByRole('dialog')).toContainText('Pasa la voz: un compañero que ya trabajó hoy vuelve a trabajar');
});

test('claros aleatorios: cada partida cambia y ?seed= repite el mismo mapa', async ({ page }) => {
  const layout = () => page.locator('.cell').evaluateAll((cs) => cs.map((c) => c.getAttribute('aria-label')!.split(',')[0]).join('|'));
  await page.goto('/?seed=11');
  const a = await layout();
  await page.goto('/?seed=12');
  const b = await layout();
  await page.goto('/?seed=11');
  expect(await layout()).toBe(a);
  expect(b).not.toBe(a);
  expect(a.split('|').filter((n) => n === 'Árbol gris')).toHaveLength(7);
});

test('estilo cozy: retratos en el dock, tablón de madera, sello, botón de luna y fondo vivo', async ({ page }, info) => {
  await page.goto('/?seed=7');
  const imgs = page.locator('.dock__item .portrait img');
  await expect(imgs).toHaveCount(3);
  for (const img of await imgs.all()) expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  // Piezas ilustradas en SVG (bosque ilustrado, 008).
  for (const sel of ['.hud .art--sign svg', '.hud__day .art--tag svg', '.chip .art--medal svg', '.hud__help .art--seal svg', '.notice .art--torn svg', '.end .art--moon svg', '.board .art--vine svg', '.card .art--mound svg']) {
    await expect(page.locator(sel).first()).toBeAttached();
  }
  await expect(page.locator('canvas.ambient')).toBeAttached();
  // Trabajó hoy: al descomponer, el sprite de Bruno aparece en el tablero.
  const visibleSprites = () =>
    page.evaluate(() => {
      type Obj = { type: string; visible: boolean; texture?: { key: string } };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: Obj[] } } } } };
      // Sprites de miembros: imágenes visibles que no son el claro pintado ("claro") ni el Árbol Padre.
      return w.game.scene
        .getScene('Game')
        .children.list.filter((o) => o.type === 'Image' && o.visible && o.texture?.key !== 'claro' && !o.texture?.key.startsWith('board/father-tree/')).length;
    });
  expect(await visibleSprites()).toBe(0);
  await page.locator('[data-id="2"]').click();
  await valid(page).first().click();
  await expect.poll(visibleSprites).toBe(1);
  if (info.project.name === 'vertical-390x844') {
    await page.locator('[data-id="1"]').click();
    await page.screenshot({ path: 'docs/screenshots/006-cozy-390x844.png' });
  }
});

test('fondo vivo: con movimiento reducido el shader pinta un solo cuadro', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/?map=clasico');
  const ready = await page.locator('canvas.ambient').getAttribute('data-ready');
  test.skip(ready !== 'true', 'sin WebGL en este navegador: queda el degradado CSS');
  const frame = () => page.locator('canvas.ambient').evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const a = await frame();
  await page.waitForTimeout(400);
  expect(await frame()).toBe(a);
  await ctx.close();
});

test('Árbol Padre: sprite de Blender dormido y despierto, sobresaliendo de su casilla', async ({ page }, info) => {
  const father = () =>
    page.evaluate(() => {
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: { type: string; visible: boolean; texture: { key: string }; displayWidth: number; displayHeight: number }[] } } } } };
      const s = w.game.scene.getScene('Game').children.list.find((o) => o.type === 'Image' && o.visible && o.texture.key.startsWith('board/father-tree/'));
      return s ? { key: s.texture.key, ratio: s.displayHeight / s.displayWidth } : null;
    });
  await page.goto('/?seed=7');
  await expect.poll(father).toEqual({ key: 'board/father-tree/asleep', ratio: expect.closeTo(192 / 176, 2) });
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/009-arbol-dormido-390x844.png' });
  await page.goto('/?debugState=fatherAwake');
  await expect.poll(async () => (await father())?.key).toBe('board/father-tree/awake');
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/009-arbol-despierto-390x844.png' });
});
