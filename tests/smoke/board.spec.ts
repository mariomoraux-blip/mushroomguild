// Escenarios de las specs que se verifican aquí (openspec/specs/):
// board-interaction › Móvil primero: "Teléfono en vertical", "Safari con barras", "Teléfono en horizontal" y
//   "Escritorio" → "layout" (un proyecto por tamaño); "Gremio completo en el dock" → "gremio completo".
// board-interaction › Objetivos táctiles: "Tocar un miembro con el pulgar" → "layout" (≥ 44 px) y "táctil".
// board-interaction › Accesibilidad básica: "Jugar con teclado" → "teclado".
// board-interaction › Retratos del gremio: "Retratos en el dock" y "Trabajó este mes" → "estilo cozy".
// board-interaction › Estilo cozy: "Pantalla de juego" → "estilo cozy".
// board-interaction › Casilla ocupada: "Hongo sobre un tronco" → tests/paint.test.ts.
// board-interaction › Fondo vivo: "Movimiento reducido" → "fondo vivo".
// board-interaction › Retratos del gremio: "La maga en el tablero" → "Maestra Bruma: retrato propio…".
// player-guidance › Libreta de campo: "Consultar la ayuda" → "Libreta de campo".
// player-guidance › Meta visible: "Inicio" → "guía".
import { expect, test, type Page } from '@playwright/test';

const cell = (page: Page, x: number, y: number) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const valid = (page: Page) => page.locator('.cell[data-valid="true"]');
const nutrients = (page: Page) => page.locator('.chip__value').nth(0);
const month = (page: Page) => page.locator('.hud__month-value');
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
  // "Terminar el mes" en la misma fila que las tarjetas.
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

test('táctil: elegir al Lactarius, tejer y terminar el mes (con captura)', async ({ page }, info) => {
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
  await expect(month(page)).toHaveText('Mes 2/12');
  // Doble toque en el tablero: ni zoom ni scroll.
  await cell(page, 2, 3).tap();
  await cell(page, 2, 3).tap();
  await noScrollNoZoom(page);
  // Captura con Añil seleccionado el mes 2.
  await page.locator('[data-id="1"]').tap();
  await page.screenshot({ path: `docs/screenshots/002-${info.project.name}.png` });
});

test('estado visible: el Champiñón descompone y el HUD suma nutrientes', async ({ page }) => {
  await page.goto('/?map=clasico');
  await page.locator('[data-id="2"]').click();
  await cell(page, 1, 7).click();
  await expect(nutrients(page)).toHaveText('4');
});

test('teclado: Tab, Enter y Esc bastan para elegir, actuar y terminar el mes', async ({ page }, info) => {
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
  // Terminar el mes.
  for (let i = 0; i < 10; i++) {
    if (await page.locator('.end').evaluate((b) => b === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('.end')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(month(page)).toHaveText('Mes 2/12');
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

test('Maestra Bruma: retrato pintado en el dock y más alta en el tablero', async ({ page }, info) => {
  await page.goto('/?debugState=fullGuild');
  const img = page.locator('.card--mago .portrait img');
  await expect(img).toHaveAttribute('src', /characters\/maestra-bruma\/portrait\.webp$/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => (i.complete ? i.naturalHeight : 0))).toBe(141);
  const mage = page.locator('.card--mago');
  await mage.scrollIntoViewIfNeeded();
  await mage.click();
  await page.getByRole('button', { name: /Lluvia de esporas/ }).click();
  await valid(page).first().click();
  // Su retrato (119 × 141) conserva la proporción: más alto que ancho, a diferencia de los demás.
  const ratio = () =>
    page.evaluate(() => {
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: { type: string; visible: boolean; texture: { key: string }; displayWidth: number; displayHeight: number }[] } } } } };
      const s = w.game.scene.getScene('Game').children.list.find((o) => o.type === 'Image' && o.visible && o.texture.key === 'characters/maestra-bruma/portrait');
      return s ? s.displayHeight / s.displayWidth : 0;
    });
  await expect.poll(ratio).toBeCloseTo(141 / 119, 2);
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

test('Libreta de campo: no se abre sola; "?" abre Cómo jugar y de ahí la libreta', async ({ page }) => {
  await page.goto('/?map=clasico');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayuda: Cómo jugar' }).click();
  await expect(page.locator('#screen')).toContainText('Elige un hongo');
  await page.getByRole('button', { name: 'Libreta de campo' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Despierta al Árbol Padre');
  await expect(dialog).toContainText('Gliophorus · Mensajera');
  await page.getByRole('button', { name: '¡A jugar!' }).first().click();
  await expect(dialog).toHaveCount(0);
  // "¡A jugar!" de Cómo jugar vuelve al tablero.
  await page.locator('#screen').getByRole('button', { name: '¡A jugar!' }).click();
  await expect(page.locator('#screen')).toBeHidden();
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
  await expect(page.getByRole('dialog')).toContainText('Pasa la voz: un compañero que ya trabajó este mes vuelve a trabajar');
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

test('estilo cozy: bosque de fondo, pastillas, medallones, luna pintada, marco de raíces y fondo vivo', async ({ page }, info) => {
  await page.goto('/?seed=7');
  const imgs = page.locator('.dock__item .portrait img');
  await expect(imgs).toHaveCount(3);
  for (const img of await imgs.all()) expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  // Piezas pintadas (010–011) como fondos CSS.
  const bg = (sel: string, prop = 'background-image') => page.locator(sel).first().evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), prop);
  expect(await bg('.chip--nutrients .chip__icon')).toContain('ui/icons/nutrients.webp');
  // Las variables --art-* llevan URL absoluta: una relativa se resuelve contra el CSS del build y en producción no carga.
  const frameVar = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--art-frame'));
  expect(frameVar).toMatch(/url\("https?:\/\//);
  expect(await bg('body')).toMatch(/backgrounds\/menu(-landscape)?\.webp/);
  await expect(page.locator('.dock__item .card__medal').first()).toBeVisible();
  if (info.project.name !== 'safari-390x664') await page.screenshot({ path: `docs/screenshots/011-${info.project.name}.png` });
  expect(await bg('.hud__help')).toContain('ui/buttons/help.webp');
  expect(await bg('.end__moon')).toContain('ui/icons/moon.webp');
  expect(await bg('.board', 'border-image-source')).toContain('ui/frames/roots.webp');
  await expect(page.locator('canvas.ambient')).toBeAttached();
  // Trabajó este mes: al descomponer, el sprite de Bruno aparece en el tablero.
  const visibleSprites = () =>
    page.evaluate(() => {
      type Obj = { type: string; visible: boolean; texture?: { key: string } };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: Obj[] } } } } };
      // Retratos de miembros sobre el tablero.
      return w.game.scene.getScene('Game').children.list.filter((o) => o.type === 'Image' && o.visible && o.texture?.key.startsWith('characters/')).length;
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

test('Árbol Padre: pintado dormido y despierto, sobresaliendo de su casilla', async ({ page }, info) => {
  const father = () =>
    page.evaluate(() => {
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: { type: string; visible: boolean; texture: { key: string }; displayWidth: number; displayHeight: number }[] } } } } };
      const s = w.game.scene.getScene('Game').children.list.find((o) => o.type === 'Image' && o.visible && o.texture.key.startsWith('board/father-tree/'));
      return s ? { key: s.texture.key, ratio: s.displayHeight / s.displayWidth } : null;
    });
  await page.goto('/?seed=7');
  await expect.poll(father).toEqual({ key: 'board/father-tree/asleep-painted', ratio: expect.closeTo(450 / 590, 2) });
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/009-arbol-dormido-390x844.png' });
  await page.goto('/?debugState=fatherAwake');
  await expect.poll(async () => (await father())?.key).toBe('board/father-tree/awake-painted');
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/009-arbol-despierto-390x844.png' });
});

test('Bosque pintado: el tablero usa las piezas de cada estación', async ({ page }, info) => {
  const keys = () =>
    page.evaluate(() => {
      const w = window as unknown as { game: { textures: { exists: (k: string) => boolean } } };
      return ['board/terrain/grass', 'board/terrain/grass-autumn', 'board/terrain/grass-winter', 'board/trees/autumn', 'board/rocks/rock-winter'].every((k) => w.game.textures.exists(k));
    });
  await page.goto('/?map=clasico');
  await expect.poll(keys).toBe(true);
  if (info.project.name !== 'vertical-390x844') return;
  await page.screenshot({ path: 'docs/screenshots/010-primavera-390x844.png' });
  for (const season of ['autumn', 'winter']) {
    await page.goto(`/?map=clasico&debugState=${season}`);
    await expect.poll(keys).toBe(true);
    await page.screenshot({ path: `docs/screenshots/010-${season === 'autumn' ? 'otono' : 'invierno'}-390x844.png` });
  }
});

test('La red alumbra el invierno: luz aditiva que crece con la estación, debajo del Árbol Padre', async ({ page }, info) => {
  const glow = () =>
    page.evaluate(() => {
      type Obj = { type: string; visible: boolean; texture?: { key: string }; alpha: number; depth: number; blendMode: number };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: Obj[] } } } } };
      const list = w.game.scene.getScene('Game').children.list;
      const light = list.find((o) => o.texture?.key === 'micelio');
      const father = list.find((o) => o.visible && o.texture?.key.startsWith('board/father-tree/'));
      // Phaser.BlendModes.ADD = 1; el Árbol Padre (4) y los retratos (5) van encima.
      return light ? { alpha: Math.round(light.alpha * 100) / 100, add: light.blendMode === 1, below: father ? light.depth < father.depth && light.depth < 5 : null } : null;
    });
  const shot = (name: string) => page.screenshot({ path: `docs/screenshots/016-${name}.png` });
  await page.goto('/?map=clasico');
  await expect.poll(glow).toEqual({ alpha: 0.2, add: true, below: true });
  if (info.project.name === 'vertical-390x844') await shot('primavera-390x844');
  await page.goto('/?map=clasico&debugState=autumn');
  await expect.poll(glow).toEqual({ alpha: 0.65, add: true, below: true });
  if (info.project.name === 'vertical-390x844') await shot('otono-390x844');
  await page.goto('/?map=clasico&debugState=winter');
  await expect.poll(glow).toEqual({ alpha: 1, add: true, below: true });
  if (info.project.name === 'vertical-390x844') await shot('invierno-390x844');
  if (info.project.name === 'horizontal-844x390') await shot('invierno-844x390');
});

test('Historia: intro de 3 cartas, llegada de la maga y finales', async ({ page }, info) => {
  test.setTimeout(90_000);
  const shot = (name: string) => (info.project.name === 'vertical-390x844' ? page.screenshot({ path: `docs/screenshots/003-${name}-390x844.png` }) : undefined);
  const card = page.locator('#story [role="dialog"]');
  // Intro: tras "Nueva partida" en la portada; el foco va al botón principal; "Saltar" la cierra.
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(card).toBeVisible();
  await expect(card).toContainText('El bosque se apaga');
  await expect(page.locator('#story .story__btn--primary')).toBeFocused();
  await shot('intro');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(card).toContainText('Un gremio despierta');
  await page.getByRole('button', { name: 'Saltar' }).click();
  await expect(card).toHaveCount(0);
  // Esc también la cierra.
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  // Llegada de Maestra Bruma al terminar el mes.
  await page.goto('/?debugState=mageNextMonth');
  await page.locator('.end').click();
  await expect(card).toContainText('El bosque volvió a hablar, y alguien escuchó.');
  await shot('maga');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await expect(card).toHaveCount(0);
  // Victoria: Rubí despierta al Árbol Padre.
  await page.goto('/?debugState=nearWin');
  await page.locator('.card--amanita').click();
  await page.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  await expect(card).toContainText('¡El bosque despertó!');
  await shot('victoria');
  await page.getByRole('button', { name: 'Ver el claro' }).click();
  await expect(card).toHaveCount(0);
  // Partida terminada (017): el botón de fin de mes vuelve a la carta; también con teclado.
  const end = page.getByRole('button', { name: 'Ver el final de la partida' });
  await expect(end).toBeEnabled();
  await expect(end).toHaveText('Ver final');
  const size = { 'vertical-390x844': '390x844', 'horizontal-844x390': '844x390' }[info.project.name];
  if (size) await page.screenshot({ path: `docs/screenshots/017-claro-terminado-${size}.png` });
  await end.focus();
  await page.keyboard.press('Enter');
  await expect(card).toContainText('¡El bosque despertó!');
  await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
  // Fin del invierno y "Jugar de nuevo".
  await page.goto('/?debugState=lastMonth');
  await page.locator('.end').click();
  await expect(card).toContainText('El bosque esperará la próxima primavera.');
  await shot('invierno');
  await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
});

test('Portada: Nueva partida, Cómo jugar (carrusel de 5) y El gremio (abre la ficha)', async ({ page }, info) => {
  const shot = (name: string) => (info.project.name === 'vertical-390x844' || info.project.name === 'horizontal-844x390' ? page.screenshot({ path: `docs/screenshots/012-${name}-${info.project.name}.png` }) : undefined);
  const screen = page.locator('#screen');
  await page.goto('/');
  await expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeFocused();
  await shot('portada');
  // Cómo jugar: ‹ › y puntos; la flecha anterior está desactivada en el paso 1 y la siguiente en el 5.
  await page.getByRole('button', { name: 'Cómo jugar', exact: true }).click();
  await expect(screen).toContainText('Paso 1 de 5');
  await expect(page.getByRole('button', { name: 'Paso anterior' })).toBeDisabled();
  await page.getByRole('button', { name: 'Paso siguiente' }).click();
  await expect(screen).toContainText('Trabaja junto a la red');
  await page.keyboard.press('ArrowRight');
  await expect(screen).toContainText('Paso 3 de 5');
  await page.getByRole('button', { name: 'Ir al paso 5' }).click();
  await expect(screen).toContainText('Despierta al Árbol Padre');
  await expect(page.getByRole('button', { name: 'Paso siguiente' })).toBeDisabled();
  await shot('como-jugar');
  // Esc vuelve a la portada.
  await page.keyboard.press('Escape');
  await expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeVisible();
  // El gremio: cinco especies; tocar una abre su ficha encima.
  await page.getByRole('button', { name: 'El gremio', exact: true }).click();
  await expect(screen.locator('.guild__row')).toHaveCount(5);
  await shot('gremio');
  await page.getByRole('button', { name: 'Ver la ficha de Maestra Bruma' }).click();
  await expect(page.getByRole('dialog')).toContainText('Conocybe arcana');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver' }).click();
  // Nueva partida: intro y después el tablero.
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('#story')).toContainText('El bosque se apaga');
  // Mientras hay carta, la partida es inerte.
  expect(await page.locator('#app').evaluate((n) => (n as HTMLElement).inert)).toBe(true);
  await page.getByRole('button', { name: 'Saltar' }).click();
  await expect(screen).toBeHidden();
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
  expect(await page.locator('#app').evaluate((n) => (n as HTMLElement).inert)).toBe(false);
  await noScrollNoZoom(page);
});

test('Efectos: animaciones al jugar, nada con movimiento reducido, y carga diferida de portada e historia', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion });
    const page = await ctx.newPage();
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto('/?map=clasico');
    // En la partida no se descargan el logo ni los fondos de intro y victoria.
    await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
    expect(requested.filter((u) => /ui\/hud\/logo|backgrounds\/(intro|victory)/.test(u))).toEqual([]);
    // Cuenta, cuadro a cuadro dentro de la página, cuántos objetos de efecto hay (y el máximo visto).
    await page.evaluate(() => {
      type Obj = { type: string; texture?: { key: string } };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => { children: { list: Obj[] } } } }; fxNow: number; fxMax: number };
      w.fxMax = 0;
      const tick = () => {
        w.fxNow = w.game.scene.getScene('Game').children.list.filter((o) => o.texture?.key === 'fx-dot' || o.type === 'Graphics').length;
        w.fxMax = Math.max(w.fxMax, w.fxNow);
        requestAnimationFrame(tick);
      };
      tick();
    });
    const fx = () =>
      page.evaluate(() => {
        const w = window as unknown as { fxNow: number; fxMax: number };
        return { fxNow: w.fxNow, fxMax: w.fxMax };
      });
    await page.locator('[data-id="1"]').click();
    await page.keyboard.press('Escape'); // cierra la ficha de primera vez
    await page.locator('.cell[data-valid="true"]').first().click();
    await page.waitForTimeout(800);
    const { fxNow, fxMax } = await fx();
    if (reducedMotion === 'reduce') expect(fxMax).toBe(0);
    else expect(fxMax).toBeGreaterThan(0);
    // Después de la animación no queda nada (≤ 400 ms y se limpia).
    expect(fxNow).toBe(0);
    await ctx.close();
  }
});

test('Puntaje: cronómetro que se pausa con una carta, carta de victoria con estrellas y almacenamiento que falla', async ({ page, browser }, info) => {
  test.setTimeout(90_000);
  const time = () => page.locator('.hud__time').textContent();
  // Cronómetro: en 00:00 hasta la primera acción; corre; se pausa con la carta de la maga.
  await page.goto('/?debugState=mageNextMonth');
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Primavera');
  await page.waitForTimeout(1300);
  expect(await time()).toBe('00:00');
  await page.locator('.end').click(); // primera acción aceptada: terminar el mes → llega la maga
  await expect(page.locator('#story')).toContainText('Llegó Maestra Bruma');
  const paused = await time();
  await page.waitForTimeout(2200);
  expect(await time()).toBe(paused);
  await page.getByRole('button', { name: 'Seguir' }).click();
  await expect.poll(time, { timeout: 4000 }).not.toBe(paused);
  // Victoria: estrellas legibles sin color, total, tiempo y desglose.
  await page.goto('/?debugState=nearWin');
  await page.locator('.card--amanita').click();
  await page.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  const stars = page.locator('#story .score__stars');
  await expect(stars).toHaveAttribute('aria-label', /^[123] de 3 estrellas$/);
  await expect(page.locator('#story .score__row')).toHaveCount(8);
  await expect(page.locator('#story')).not.toContainText('Nuevo récord');
  if (info.project.name === 'vertical-390x844' || info.project.name === 'horizontal-844x390') await page.screenshot({ path: `docs/screenshots/015-victoria-${info.project.name}.png` });
  // localStorage que falla: la carta se muestra completa y no hay errores sin manejar.
  if (info.project.name !== 'vertical-390x844') return;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx.newPage();
  const errors: string[] = [];
  p2.on('pageerror', (e) => errors.push(e.message));
  await p2.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('bloqueado'); };
    Storage.prototype.setItem = () => { throw new Error('lleno'); };
  });
  await p2.goto('/?debugState=nearWin');
  await p2.locator('.card--amanita').click();
  await p2.keyboard.press('Escape'); // la ficha de primera vez (sin almacenamiento, todas son nuevas)
  await p2.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  await expect(p2.locator('#story .score__stars')).toBeVisible();
  await expect(p2.locator('#story .score__row')).toHaveCount(8);
  expect(errors).toEqual([]);
  await ctx.close();
});
