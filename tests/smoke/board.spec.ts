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
// game-rules › Victoria (031): "Árbol Padre de Ancestral (031)".
// game-rules › Plaga y player-guidance › Avisos de la presión (plaga): "Plaga de Ancestral (032, 035)".
// game-rules › Árboles marcados (Ancestral, cinco veces): "Ancestral cada dos meses (034)".
// player-guidance › Recetas visuales: "Ficha de Bruno", "Libreta con las cinco recetas" y "Movimiento reducido" → "Recetas (026)".
// story-presentation › Llega el frío y player-guidance › Avisos de la presión (hongo con hambre) → "Temporadas frías (028, 030)".
// title-screens › Cómo jugar: "El paso se parece a la partida" → "Cómo jugar (029)".
// title-screens › Elige tu dificultad y player-guidance › Ancestral sin pistas, board-interaction › Árbol marcado y apagado
//   y Escarcha en el HUD (019) → "Niveles".
import { expect, test, type Page } from '@playwright/test';

const cell = (page: Page, x: number, y: number) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const valid = (page: Page) => page.locator('.cell[data-valid="true"]');
const nutrients = (page: Page) => page.locator('.chip__value').nth(0);
const month = (page: Page) => page.locator('.hud__month-value');
const isTouch = (name: string) => name !== 'escritorio-1280x800';

const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }, info) => {
  // Las especies nuevas llevan un punto en "Ficha" (022); salvo en su propia prueba, se dan por vistas.
  if (!info.title.startsWith('Ficha')) {
    await page.addInitScript(() =>
      localStorage.setItem('gremio.seenSpecies', JSON.stringify(['champi', 'lactarius', 'amanita', 'gliophorus', 'morchella', 'ganoderma', 'lycoperdon', 'mago'])),
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
  await expect(page.locator('#notice')).toHaveText('Indi: toca una casilla resaltada.');
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
  // Captura con Indi seleccionado el mes 2.
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

test('gremio completo: el dock se desplaza por dentro, solo con tarjetas enteras, y la página no se mueve', async ({ page }, info) => {
  test.skip(info.project.name !== 'vertical-390x844', 'solo a 390 px de ancho');
  await page.goto('/?debugState=fullGuild');
  const cards = page.locator('.dock__cards');
  await expect(page.locator('.dock__item')).toHaveCount(8);
  const ids = () => page.locator('.dock__item .card').evaluateAll((bs) => bs.map((b) => b.getAttribute('data-id')));
  const order = await ids();
  expect(await cards.evaluate((c) => c.scrollWidth > c.clientWidth)).toBe(true);
  // Ninguna tarjeta visible queda cortada por el borde (018); la flecha avisa de qué lado hay más.
  const cut = () =>
    cards.evaluate((c) => {
      const r = c.getBoundingClientRect();
      return [...c.children].filter((i) => {
        const b = i.getBoundingClientRect();
        return b.right > r.left + 1 && b.left < r.right - 1 && (b.left < r.left - 0.5 || b.right > r.right + 0.5);
      }).length;
    });
  const rail = page.locator('.dock__rail');
  expect(await cut()).toBe(0);
  await expect(rail).toHaveAttribute('data-more', 'end');
  await cards.evaluate((c) => c.scrollBy(70, 0));
  await expect(rail).toHaveAttribute('data-more', 'start end');
  await expect.poll(cut).toBe(0);
  await cards.evaluate((c) => c.scrollBy(800, 0));
  await expect(rail).toHaveAttribute('data-more', 'start');
  await expect.poll(cut).toBe(0);
  await page.screenshot({ path: 'docs/screenshots/018-dock-390x844.png' });
  await page.screenshot({ path: 'docs/screenshots/041-gremio-completo-390x844.png' });
  await expect(page.locator('.end')).toBeInViewport();
  await noScrollNoZoom(page);
  await page.locator('.end').click();
  expect(await ids()).toEqual(order);
});

test('fichas de criatura: nombre científico, rol, acción y línea con humor', async ({ page }) => {
  await page.goto('/?map=clasico');
  await page.locator('.card--recruit').click();
  await page.getByRole('button', { name: 'Ficha de Morchella esculenta' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Morchella esculenta');
  await expect(dialog).toContainText('Rompe-rocas');
  await expect(dialog).toContainText('Para ella, cada roca es una puerta que nadie ha abierto todavía.');
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

test('Ficha al seleccionar: nunca se abre sola, "Ficha" con punto la primera vez, "Entendido" mantiene la selección (022)', async ({ page }, info) => {
  await page.goto('/?map=clasico');
  await page.locator('[data-id="1"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCount(0);
  await expect(valid(page)).toHaveCount(2);
  await expect(page.locator('#notice')).toHaveText('Toca Ficha para conocer a Indi.');
  const ficha = page.getByRole('button', { name: 'Ver la ficha de Indi' });
  await expect(ficha).toHaveClass(/is-new/);
  await ficha.click();
  await expect(dialog).toContainText('Indi · Lactarius indigo');
  await expect(dialog).toContainText('«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»');
  for (const h of ['Habilidad', 'Cómo usarlo', 'Movimiento', 'Nutrientes']) await expect(dialog.getByRole('heading', { name: h })).toBeVisible();
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/005-ficha-390x844.png' });
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(valid(page)).toHaveCount(2);
  // Segunda vez: sin punto, y se recuerda entre visitas.
  await page.reload();
  await page.locator('[data-id="1"]').click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver la ficha de Indi' })).not.toHaveClass(/is-new/);
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
  await page.locator('[data-level="brote"]').click();
  await expect(card).toBeVisible();
  await expect(card).toContainText('El bosque se apaga');
  await expect(page.locator('#story .story__btn--primary')).toBeFocused();
  await shot('intro');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(card).toContainText('Un gremio despierta');
  await page.getByRole('button', { name: 'Saltar' }).click();
  await expect(card).toHaveCount(0);
  // Esc también la cierra (en otro nivel: la intro sale solo la primera vez por nivel).
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('[data-level="bosque"]').click();
  await expect(card).toBeVisible();
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
  await page.getByRole('button', { name: 'Ver tablero' }).click();
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
  // Portada limpia (018): sin personajes y con el logo entero (ninguna fila del borde pintada).
  await expect(screen.locator('.portrait')).toHaveCount(0);
  const logo = screen.locator('.title__logo-img');
  await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const edge = await logo.evaluate((img: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const alpha = (x: number, y: number) => data[(y * c.width + x) * 4 + 3]!;
    let painted = 0;
    for (let x = 0; x < c.width; x++) painted += Number(alpha(x, 0) > 20) + Number(alpha(x, c.height - 1) > 20);
    for (let y = 0; y < c.height; y++) painted += Number(alpha(0, y) > 20) + Number(alpha(c.width - 1, y) > 20);
    return painted;
  });
  expect(edge).toBe(0);
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
  await expect(screen.locator('.guild__row')).toHaveCount(8);
  await expect(screen.locator('.guild__tag')).toHaveCount(4);
  await shot('gremio');
  await page.getByRole('button', { name: 'Ver la ficha de Maestra Bruma' }).click();
  await expect(page.getByRole('dialog')).toContainText('Conocybe arcana');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver' }).click();
  // Nueva partida: Elige tu dificultad, intro y después el tablero.
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('[data-level="brote"]').click();
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
    // Phaser listo (la escena creó sus efectos y ya sabe el tamaño de casilla): antes, una jugada no se anima.
    await page.waitForFunction(() => {
      const w = window as unknown as { game?: { scene: { getScene: (k: string) => { fx?: { T: number } | null } | null } } };
      return (w.game?.scene.getScene('Game')?.fx?.T ?? 0) > 0;
    });
    // Cuenta los objetos de efecto que entran a la escena (fxMax: sin depender de muestrear cuadros, que bajo carga
    // se pierde una jugada de 280 ms) y, cuadro a cuadro, cuántos quedan vivos (fxNow).
    await page.evaluate(() => {
      type Obj = { type: string; texture?: { key: string } };
      type Scene = { children: { list: Obj[] }; sys: { events: { on: (e: string, fn: (o: Obj) => void) => void } } };
      const w = window as unknown as { game: { scene: { getScene: (k: string) => Scene } }; fxNow: number; fxMax: number };
      const scene = w.game.scene.getScene('Game');
      const isFx = (o: Obj) => o.texture?.key === 'fx-dot' || o.type === 'Graphics';
      w.fxMax = 0;
      scene.sys.events.on('addedtoscene', (o) => {
        if (isFx(o)) w.fxMax++;
      });
      const tick = () => {
        w.fxNow = scene.children.list.filter(isFx).length;
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
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Primavera · Brote');
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
  await p2.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  await expect(p2.locator('#story .score__stars')).toBeVisible();
  await expect(p2.locator('#story .score__row')).toHaveCount(8);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('Portada: crédito del autor fijo abajo, en letra pequeña, con contraste ≥ 4,5:1 y sin tapar el menú', async ({ page }, info) => {
  await page.goto('/');
  const credit = page.locator('#screen .title__credit');
  await expect(credit).toHaveText('By Mario Mora for BerryLab');
  await expect(credit).toBeVisible();
  // Contraste WCAG entre el color del texto y el fondo sólido de la pastilla.
  const ratio = await credit.evaluate((n) => {
    const rgb = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    const st = getComputedStyle(n);
    const [a, b] = [lum(rgb(st.color)), lum(rgb(st.backgroundColor))].sort((x, y) => y - x);
    // El fondo debe ser sólido: con transparencia, el contraste dependería del fondo pintado.
    return { ratio: (a! + 0.05) / (b! + 0.05), size: parseFloat(st.fontSize), opaque: !st.backgroundColor.startsWith('rgba') };
  });
  expect(ratio.ratio).toBeGreaterThanOrEqual(4.5);
  expect(ratio.size).toBeLessThanOrEqual(12);
  expect(ratio.opaque).toBe(true);
  // Fija abajo y centrada, con un margen pequeño (021); no se superpone al menú ni al logo.
  const box = (await credit.boundingBox())!;
  const vp = page.viewportSize()!;
  const gap = vp.height - (box.y + box.height);
  expect(gap).toBeGreaterThanOrEqual(8);
  expect(gap).toBeLessThanOrEqual(12);
  expect(Math.abs(box.x + box.width / 2 - vp.width / 2)).toBeLessThanOrEqual(2);
  expect(await page.locator('#screen').evaluate((n) => n.scrollHeight - n.clientHeight)).toBeLessThanOrEqual(0);
  for (const sel of ['.title__menu', '.title__logo']) {
    const o = (await page.locator(`#screen ${sel}`).boundingBox())!;
    const overlap = box.x < o.x + o.width && o.x < box.x + box.width && box.y < o.y + o.height && o.y < box.y + box.height;
    expect(overlap, sel).toBe(false);
  }
  await noScrollNoZoom(page);
  if (info.project.name === 'vertical-390x844' || info.project.name === 'horizontal-844x390') await page.screenshot({ path: `docs/screenshots/021-credito-fijo-${info.project.name}.png` });
});

test('Niveles: Elige tu dificultad con teclado, Ancestral sin ★, árbol marcado, escarcha y Jugar de nuevo con el mismo nivel', async ({ page }, info) => {
  test.setTimeout(120_000);
  const size = info.project.name === 'vertical-390x844' || info.project.name === 'horizontal-844x390' ? info.project.name : null;
  const shot = (name: string) => (size ? page.screenshot({ path: `docs/screenshots/019-${name}-${size}.png` }) : undefined);
  const screen = page.locator('#screen');
  const card = page.locator('#story [role="dialog"]');
  // Teclado: Enter en "Nueva partida" abre los niveles con el foco en Brote; Esc vuelve a la portada.
  await page.goto('/');
  await expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(screen.locator('.level')).toHaveCount(3);
  await expect(screen.locator('[data-level="brote"]')).toBeFocused();
  for (const b of await screen.locator('.level').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(screen).toContainText('Puntaje ×1,5');
  await noScrollNoZoom(page);
  await shot('elegir-nivel');
  await page.keyboard.press('Escape');
  await expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeFocused();
  // Elegir Ancestral con Tab y Enter: intro la primera vez; después, el tablero sin ★ ni «Pista:».
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(screen.locator('[data-level="ancestral"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card).toContainText('El bosque se apaga');
  await page.keyboard.press('Escape');
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Primavera · Ancestral');
  await expect(page.locator('.card__badge[data-kind="star"]')).toHaveCount(0);
  await expect(page.locator('#notice')).not.toContainText('Pista');
  await page.locator('.card--champi').click();
  await expect(page.locator('.cell[aria-label*="★"]')).toHaveCount(0);
  // La próxima vez, el foco está en Ancestral y ya no hay intro.
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(screen.locator('[data-level="ancestral"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card).toHaveCount(0);
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');

  // Bosque: al empezar el mes 6 se marca un árbol; al terminarlo se apaga y empieza el otoño con escarcha.
  await page.goto('/?nivel=bosque&seed=1');
  for (let m = 1; m < 6; m++) await page.locator('.end').click();
  await expect(page.locator('#notice')).toContainText('Este árbol se apagará al terminar el mes si nadie lo revive.');
  await expect(page.locator('.cell[aria-label*="se apagará al terminar el mes"]')).toHaveCount(1);
  await shot('arbol-marcado');
  await page.locator('.end').click();
  // Al empezar el otoño (mes 7) aparece la carta «Llega el frío» (030).
  await expect(card).toContainText('Llega el frío');
  await card.getByRole('button', { name: 'Seguir' }).click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Otoño, con escarcha · Bosque');
  await expect(page.locator('.hud__frost')).toBeVisible();
  await expect(page.locator('.cell[aria-label*="apagado: revivirlo cuesta 7 nutrientes"]')).toHaveCount(1);
  await expect(page.locator('.card--lactarius')).toHaveAttribute('aria-label', /Teje · −2 nutrientes/);
  await shot('escarcha');
  // "Jugar de nuevo" conserva el nivel.
  for (let m = 7; m <= 12; m++) await page.locator('.end').click();
  await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 1/12');
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Primavera · Bosque');
  await noScrollNoZoom(page);
});

test('Mes vacío: el reporte de Ancestral (semilla 745) avisa que nadie tiene trabajo, sin «Pista:»', async ({ page }, info) => {
  // Las jugadas del jugador en los meses 1 a 3 (iguales a la línea ganadora del certificador, 024).
  // El claro queda fijo: desde el 027 (reclutar 3, 5, 7) la semilla 745 genera otro (igual que en empty-month.test.ts).
  await page.goto('/?nivel=ancestral&map=clasico');
  await page.evaluate(() => {
    const map = ['.T.ML', '.R..T', '....T', 'LT.R.', '.RLLR', 'RT.TT', 'R.RR.', 'RRLH.'];
    const kind: Record<string, string> = { H: 'home', M: 'mother', '.': 'soil', L: 'log', T: 'tree', R: 'rock' };
    type S = { getState(): { game: { tiles: { x: number; y: number }[] } }; dispatch(a: object): void };
    const store = (window as unknown as { store: S }).store;
    const game = store.getState().game;
    const tiles = game.tiles.map((t) => {
      const k = kind[map[t.y]![t.x]!]!;
      return { ...t, kind: k, net: k === 'home', uses: 0, alive: false, fading: false, faded: false };
    });
    store.dispatch({ type: 'start', game: { ...game, tiles, mapId: 'seed-745' }, intro: false });
  });
  const months: [string, number, number][][] = [
    [['champi', 2, 7], ['lactarius', 4, 7]],
    [['champi', 2, 7], ['lactarius', 4, 6], ['amanita', 4, 5]],
    [['lactarius', 2, 7]],
  ];
  for (const moves of months) {
    for (const [species, x, y] of moves) {
      await page.locator(`.card--${species}`).click();
      await cell(page, x, y).click();
    }
    await page.locator('.end').click();
  }
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 4/12');
  await expect(page.locator('#notice')).toContainText('Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá 1 nutriente.');
  await expect(page.locator('#notice')).not.toContainText('Pista');
  await noScrollNoZoom(page);
  if (info.project.name === 'vertical-390x844' || info.project.name === 'horizontal-844x390') await page.screenshot({ path: `docs/screenshots/024-mes-vacio-${info.project.name}.png` });
});

test('Niveles: con movimiento reducido el árbol marcado no late', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/?nivel=bosque&seed=1');
  for (let m = 1; m < 6; m++) await page.locator('.end').click();
  await expect(page.locator('.cell[aria-label*="se apagará"]')).toHaveCount(1);
  const alpha = () => page.evaluate(() => (window as unknown as { game: { scene: { getScene(k: string): { frostImage: { alpha: number } | null } } } }).game.scene.getScene('Game').frostImage?.alpha);
  await expect.poll(alpha).toBe(0.5); // la capa aparece en el cuadro siguiente al mes nuevo
  const first = await alpha();
  await page.waitForTimeout(900);
  expect(first).toBe(0.5);
  expect(await alpha()).toBe(0.5);
  await ctx.close();
});

test('Movimiento (022): atrás cierra la ficha, rechazo en la casilla, «±n» en el HUD y pasar la voz', async ({ page }, info) => {
  await page.goto('/');
  await page.goto('/?map=clasico');
  // «Atrás» con la ficha abierta la cierra y sigue la partida.
  await page.locator('[data-id="2"]').click();
  await page.getByRole('button', { name: 'Ver la ficha de Bruno' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/map=clasico/);
  await expect(page.locator('[data-id="2"]')).toHaveAttribute('aria-pressed', 'true');
  // Jugada válida: el contador de nutrientes dice «+2».
  await cell(page, 1, 7).click();
  await expect(page.locator('.chip--nutrients .chip__delta')).toHaveText('+2');
  // Toque inválido: aro en la casilla tocada.
  await page.locator('[data-id="1"]').click();
  await cell(page, 0, 0).click();
  await expect(cell(page, 0, 0)).toHaveClass(/is-reject/);
  // Captura con el aro todavía visible (y la «+2» del contador).
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/022-rechazo-390x844.png' });
  // Miembro cansado: su «Zz» se mece.
  await page.locator('[data-id="2"]').click();
  await expect(page.locator('[data-id="2"]')).toHaveClass(/is-tired/);
  // Pasar la voz: la tarjeta del llamado despierta.
  await page.goto('/?map=clasico&debugState=fullGuild');
  while (await page.locator('#story:not([hidden]):not(.is-leaving)').count()) await page.locator('.story__btn--primary').click();
  await page.locator('.card--champi').first().click();
  await page.locator('.cell[data-valid="true"]').first().click();
  const bruno = await page.locator('.card--champi').first().getAttribute('data-id');
  await page.locator('.card--gliophorus').first().click();
  await page.locator('.cell[data-valid="true"]').first().click();
  await expect(page.locator(`.card[data-id="${bruno}"]`)).toHaveClass(/is-called/);
  // Esc sobre la ficha de Maestra Bruma la cierra del todo.
  await page.locator('.card--mago').click();
  await page.locator('#sheet [data-action="member"]').click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.card--mago')).toHaveAttribute('aria-pressed', 'false');
});


test('Movimiento P1 (022): capas que entran y salen, intro, selección, gremio, mes nuevo, estación y finales', async ({ page }, info) => {
  test.setTimeout(90_000);
  type W = { store: { getState(): { ui: { story: unknown } } }; game: { scene: { getScene(k: string): { fx?: { T: number }; sys: { events: { on(e: string, fn: (o: { texture?: { key: string } }) => void): void } } } } }; added: string[] };
  const ready = () => page.waitForFunction(() => ((window as unknown as W).game?.scene.getScene('Game')?.fx?.T ?? 0) > 0);
  const watch = () => page.evaluate(() => {
    const w = window as unknown as W;
    w.added = [];
    w.game.scene.getScene('Game').sys.events.on('addedtoscene', (o) => w.added.push(o.texture?.key ?? ''));
  });
  const added = (key: string) => page.evaluate((k) => (window as unknown as W).added.filter((a) => a === k).length, key);
  // Hojas: suben al abrir y bajan al cerrar sin atrapar toques.
  await page.goto('/?map=clasico');
  await ready();
  await page.locator('.card--recruit').click();
  await expect.poll(() => page.locator('#sheet .sheet__panel').evaluate((n) => getComputedStyle(n).animationName)).toBe('layer-in');
  const leaving = await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const s = document.querySelector('#sheet')!;
    return { cls: s.className, pe: getComputedStyle(s).pointerEvents };
  });
  expect(leaving).toEqual({ cls: 'sheet is-leaving', pe: 'none' });
  await expect(page.locator('#sheet')).toBeHidden();
  // Selección: la tarjeta hace su firma y las casillas válidas aparecen en un fundido (recortes del claro anterior).
  await watch();
  await page.locator('[data-id="1"]').click();
  await expect(page.locator('[data-id="1"]')).toHaveClass(/is-picked/);
  await expect.poll(() => added('fx-cover')).toBeGreaterThan(0);
  // Mes nuevo: la luna gira, los retratos se van y vuelan esporas y hojas; en el mes 4 cambia la estación.
  await valid(page).first().click();
  await page.locator('.end').click();
  await expect(page.locator('.end')).toHaveClass(/is-turning/);
  await expect(page.locator('[data-id="1"]')).toHaveClass(/is-waking/);
  await page.locator('.end').click();
  await page.locator('.end').click();
  await expect(month(page)).toHaveText('Mes 4/12');
  await expect(page.locator('.hud__season')).toHaveClass(/is-new-season/);
  await expect.poll(() => added('fx-season')).toBe(1);
  // Intro: la carta nueva entra desde la derecha sobre la anterior, que es una copia muda.
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('[data-level="brote"]').click();
  await expect(page.locator('#story [role="dialog"]')).toBeVisible();
  const turn = await page.evaluate(() => {
    document.querySelector<HTMLElement>('#story [data-action="next"]')!.click();
    return [...document.querySelectorAll('#story .story__card')].map((c) => `${c.className}|${c.getAttribute('role')}`);
  });
  expect(turn).toEqual(['story__card is-out|null', 'story__card is-in|dialog']);
  await expect(page.locator('#story .story__card')).toHaveCount(1);
  // Maestra Bruma: al cerrar su carta, su tarjeta entra al dock con su halo; quien se recluta entra creciendo.
  await page.goto('/?debugState=mageNextMonth');
  await page.locator('.end').click();
  await expect(page.locator('#story')).toContainText('Llegó Maestra Bruma');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await expect(page.locator('.card--mago')).toHaveClass(/is-arriving/);
  // Un mes más para juntar las 3 esporas del primer recluta (027).
  await page.locator('.end').click();
  await page.locator('.end').click();
  await expect(page.locator('.chip__value').nth(1)).toHaveText('3');
  await page.locator('.card--recruit').click();
  await page.locator('#sheet [data-action="recruit"]').first().click();
  await expect(page.locator('.dock__item').nth(4).locator('.card')).toHaveClass(/is-joining/);
  // Victoria: la carta espera para que se vea despertar al Árbol Padre; un toque la trae antes.
  // Todo dentro de la página: los temporizadores corren en orden y no dependen de la carga de la máquina.
  for (const skip of [false, true]) {
    await page.goto('/?debugState=nearWin');
    await ready();
    const held = await page.evaluate(async (skip) => {
      type S = { getState(): { game: { members: { id: number; species: string }[]; tiles: { kind: string; x: number; y: number }[] } }; dispatch(a: object): void };
      const store = (window as unknown as { store: S }).store;
      const story = document.querySelector<HTMLElement>('#story')!;
      const g = store.getState().game;
      store.dispatch({ type: 'select', id: g.members.find((m) => m.species === 'amanita')!.id });
      const mother = g.tiles.find((t) => t.kind === 'mother')!;
      store.dispatch({ type: 'tapTile', x: mother.x, y: mother.y });
      const start = story.hidden;
      if (skip) document.querySelector('.board-area')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      else await new Promise((r) => setTimeout(r, 300));
      return { start, later: story.hidden };
    }, skip);
    expect(held).toEqual({ start: true, later: !skip });
    await expect(page.locator('#story [role="dialog"]')).toBeVisible();
    if (!skip && info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/022-victoria-390x844.png' });
  }
  // Fin del invierno: el claro baja la luz y después entra la carta.
  await page.goto('/?debugState=lastMonth');
  await page.locator('.end').click();
  await expect(page.locator('html')).toHaveClass(/is-dusk/);
  await expect(page.locator('#story')).toContainText('Llegó el invierno');
});

test('Movimiento P1 (022) con movimiento reducido: fundidos cortos y la victoria espera menos', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/?map=clasico');
  await page.locator('.card--recruit').click();
  const style = await page.locator('#sheet .sheet__panel').evaluate((n) => ({ name: getComputedStyle(n).animationName, ms: parseFloat(getComputedStyle(n).animationDuration) * 1000 }));
  expect(style).toEqual({ name: 'fade-in', ms: 180 });
  await page.keyboard.press('Escape');
  await page.locator('[data-id="1"]').click();
  await expect(page.locator('[data-id="1"]')).toHaveCSS('transform', 'none');
  await page.goto('/?debugState=nearWin');
  await page.locator('.card--amanita').click();
  await page.locator('.cell[data-valid="true"][aria-label*="Padre"]').click();
  await expect(page.locator('#story [role="dialog"]')).toBeVisible();
  await ctx.close();
});

test('Recetas (026): «Cómo usarlo» de la ficha y la Libreta muestran qué hace cada hongo, sin desbordarse', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'El gremio', exact: true }).click();
  await page.getByRole('button', { name: 'Ver la ficha de Champiñón' }).click();
  const dialog = page.getByRole('dialog');
  const bruno = dialog.getByRole('img', { name: /^Antes: la red y un tronco resaltado/ });
  await expect(bruno).toHaveCount(1);
  await expect(bruno.locator('.recipe__chip')).toHaveText('+2');
  await expect(bruno.locator('.recipe__after > *').first()).toHaveCSS('animation-name', 'recipe-pop');
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/026-ficha-390x844.png' });
  await page.goto('/?map=clasico');
  await page.getByRole('button', { name: 'Ayuda: Cómo jugar' }).click();
  await page.getByRole('button', { name: 'Libreta de campo' }).click();
  const recipes = page.getByRole('dialog').locator('.recipe');
  await expect(recipes).toHaveCount(10);
  for (const name of [/la red creció/, /el tronco usado/, /un árbol gris resaltado\. Después: el árbol vivo/, /la roca es tierra libre/, /a dos casillas/, /^Soplar esporas/, /^Abonar el árbol/, /compañero cansado/, /^Brote arcano/, /^Lluvia de esporas/])
    await expect(page.getByRole('dialog').getByRole('img', { name })).toHaveCount(1);
  // Ninguna receta se sale de su caja (las piezas no se recortan a 360 px ni en horizontal).
  const overflow = await recipes.evaluateAll((ns) => ns.map((n) => n.scrollWidth - n.clientWidth));
  expect(overflow.every((o) => o <= 0)).toBe(true);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/026-libreta-390x844.png' });
});

test('Recetas (026) con movimiento reducido: quietas desde el principio', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('gremio.seenSpecies', JSON.stringify(['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'])));
  await page.goto('/?map=clasico');
  await page.getByRole('button', { name: 'Ayuda: Cómo jugar' }).click();
  await page.getByRole('button', { name: 'Libreta de campo' }).click();
  const names = await page.locator('.recipe__arrow, .recipe__after > *').evaluateAll((ns) => [...new Set(ns.map((n) => getComputedStyle(n).animationName))]);
  expect(names).toEqual(['none']);
  await ctx.close();
});

test('Reclutar (027, 041): cada recluta cuesta más (3, 4, 6 y 7) y la hoja dice cuánto cuesta el próximo', async ({ page }, info) => {
  await page.goto('/?map=clasico');
  const recruitCard = page.locator('.card--recruit');
  // Sin esporas: el medallón se atenúa y dice el costo del primero.
  await expect(recruitCard).toHaveClass(/is-used/);
  await expect(recruitCard).toHaveAttribute('aria-label', 'Reclutar: 3 esporas');
  await expect(page.getByRole('button', { name: 'Esporas: 0. El próximo recluta cuesta 3. Abrir reclutar.' })).toHaveCount(1);
  // Partida con 7 esporas (vía el store de desarrollo): el primero cuesta 3 y deja 4 para el segundo.
  await page.evaluate(() => {
    type S = { getState(): { game: object }; dispatch(a: object): void };
    const store = (window as unknown as { store: S }).store;
    store.dispatch({ type: 'start', game: { ...store.getState().game, spores: 7 }, intro: false });
  });
  await expect(recruitCard).not.toHaveClass(/is-used/);
  await recruitCard.click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toContainText('El próximo recluta cuesta 3 esporas; cada uno cuesta más (3, 4, 6 y 7).');
  await sheet.locator('[data-action="recruit"][data-species="gliophorus"]').click();
  await expect(page.locator('.chip__value').nth(1)).toHaveText('4');
  // 039: una de cada especie; la Gliophorus ya no se puede reclutar otra vez.
  await recruitCard.click();
  await expect(sheet.locator('.row.is-taken')).toContainText('Ya está en el gremio.');
  await expect(sheet.locator('[data-action="recruit"][data-species="gliophorus"]')).toHaveCount(0);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/039-reclutar-390x844.png' });
  await page.keyboard.press('Escape');
  await expect(recruitCard).toHaveAttribute('aria-label', 'Reclutar: 4 esporas');
  await expect(recruitCard).not.toHaveClass(/is-used/);
  await recruitCard.click();
  await expect(sheet).toContainText('El próximo recluta cuesta 4 esporas');
  await sheet.locator('[data-action="recruit"][data-species="morchella"]').click();
  // Quedan 0 esporas y el tercero cuesta 6: la hoja lo dice y sus botones no se pueden pulsar.
  await expect(page.locator('.chip__value').nth(1)).toHaveText('0');
  await expect(recruitCard).toHaveClass(/is-used/);
  await expect(recruitCard).toHaveAttribute('aria-label', 'Reclutar: 6 esporas');
  await recruitCard.click();
  await expect(sheet).toContainText('El próximo recluta cuesta 6 esporas');
  await expect(sheet.locator('[data-action="recruit"]').first()).toBeDisabled();
  const overflow = await sheet.evaluate((n) => n.scrollWidth - n.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/027-reclutar-390x844.png' });
  // Esc cierra la hoja (teclado).
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
});

test('Temporadas frías (028, 030): carta «Llega el frío» al empezar el otoño en Bosque y el primero del gremio con hambre en el dock', async ({ page }, info) => {
  await page.goto('/?map=clasico&nivel=bosque');
  const start = (patch: object) =>
    page.evaluate((p) => {
      type S = { getState(): { game: object }; dispatch(a: object): void };
      const store = (window as unknown as { store: S }).store;
      store.dispatch({ type: 'start', game: { ...store.getState().game, ...p }, intro: false });
    }, patch);
  await start({ month: 6 });
  await page.locator('.end').click();
  const card = page.locator('#story [role="dialog"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Llega el frío');
  await expect(card).toContainText('Llegó el otoño');
  await expect(card).toContainText('Al terminar cada mes de otoño e invierno, el gremio come 1 nutriente.');
  await expect(card).toContainText('En invierno, los árboles no dan esporas.');
  const overflow = await card.evaluate((n) => n.scrollWidth - n.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/030-frio-390x844.png' });
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  // Un mes de otoño sin nutrientes: Indi, el primero en llegar, se queda con hambre; los demás trabajan.
  await start({ month: 8, nutrients: 0 });
  await page.locator('.end').click();
  await expect(page.locator('#notice')).toContainText('sin comer');
  await expect(page.locator('[data-id="1"]')).toHaveAttribute('aria-label', /Con hambre/);
  await expect(page.locator('[data-id="1"]')).toHaveClass(/is-used/);
  await expect(page.locator('[data-id="2"]')).not.toHaveClass(/is-used/);
});

test('Cómo jugar (029): cada paso muestra la interfaz de la partida, decorativa y sin desbordarse', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cómo jugar', exact: true }).click();
  const art = page.locator('.howto__art');
  const expected = ['.card[aria-pressed="true"] .card__badge[data-kind="star"]', '.recipe__tile.is-valid', '.card.is-used .card__badge[data-kind="rest"]', '.card--recruit', '.chip--trees'];
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: `Ir al paso ${i + 1}` }).click();
    await expect(art.locator(expected[i]!).first()).toBeVisible();
    await expect(art).toHaveAttribute('aria-hidden', 'true');
    expect(await art.evaluate((n) => n.hasAttribute('inert') && n.querySelectorAll('button, a, [tabindex]').length === 0)).toBe(true);
    // Ninguna pieza se sale de la tarjeta del paso.
    const outside = await art.evaluate((n) => {
      const box = n.closest('.howto__card')!.getBoundingClientRect();
      return [...n.querySelectorAll('*')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom);
      }).length;
    });
    expect(outside).toBe(0);
    if (i === 2) {
      await expect(art.locator('.end')).toHaveText('Fin del mes');
      if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/029-como-jugar-390x844.png' });
    }
  }
  await noScrollNoZoom(page);
});

test('Árbol Padre de Ancestral (031, 041): tocarlo y la Libreta dicen que pide 4 árboles y 13 nutrientes', async ({ page }, info) => {
  await page.goto('/?map=clasico&nivel=ancestral');
  await cell(page, 2, 0).click();
  await expect(page.locator('#notice')).toContainText('(4 árboles vivos y 13 nutrientes)');
  await page.getByRole('button', { name: 'Ayuda: Cómo jugar' }).click();
  await page.getByRole('button', { name: 'Libreta de campo' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Necesitas que la red lo toque, 4 árboles revividos y 13 nutrientes.');
  await expect(dialog).toContainText('el Árbol Padre pide 4 árboles revividos y 13 nutrientes');
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/031-libreta-ancestral-390x844.png' });
  // En Bosque pide 3 y 11 (041).
  await page.goto('/?map=clasico&nivel=bosque');
  await cell(page, 2, 0).click();
  await expect(page.locator('#notice')).toContainText('(3 árboles vivos y 11 nutrientes)');
});

test('Plaga de Ancestral (032, 033, 035): la carta del frío la explica y la casilla marcada se ve pintada, se nombra y se explica', async ({ page }, info) => {
  await page.goto('/?map=clasico&nivel=ancestral');
  // Red tejida en (2,6), (2,4) y (2,3): la más cercana al Árbol Padre (2,0) es (2,3).
  const weave = (month: number) =>
    page.evaluate((m) => {
      type T = { x: number; y: number; net: boolean };
      type S = { getState(): { game: { tiles: T[] } }; dispatch(a: object): void };
      const store = (window as unknown as { store: S }).store;
      const g = store.getState().game;
      const woven = ['2,6', '2,4', '2,3'];
      // Sin plaga previa (035: la marchita se queda), para empezar cada estación desde cero.
      const tiles = g.tiles.map((t) => ({ ...t, blighted: false, net: t.net || woven.includes(`${t.x},${t.y}`) }));
      store.dispatch({ type: 'start', game: { ...g, month: m, tiles }, intro: false });
    }, month);
  await weave(6);
  await page.locator('.end').click();
  const card = page.locator('#story [role="dialog"]');
  await expect(card).toContainText('la plaga marca una casilla de la red');
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  await expect(page.locator('#notice')).toContainText('La plaga llegó a la red');
  await expect(cell(page, 2, 3)).toHaveAttribute('aria-label', /con plaga/);
  await expect(cell(page, 2, 4)).not.toHaveAttribute('aria-label', /con plaga/);
  // La hoja podrida junto a la estación (033) y la etiqueta de la estación lo dicen.
  await expect(page.locator('.hud__plague')).toBeVisible();
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', /con plaga/);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/033-plaga-390x844.png' });
  await cell(page, 2, 3).click();
  await expect(page.locator('#notice')).toContainText('Red con plaga: se marchitará al terminar el mes');
  // Nadie trabaja cerca: al terminar el mes se marchita, deja de estar en la red y la plaga se queda (035).
  await page.locator('.end').click();
  await expect(page.locator('#notice')).toContainText('La plaga marchitó una casilla de la red: no se puede tejer');
  await expect(cell(page, 2, 3)).toHaveAttribute('aria-label', /con plaga marchita/);
  await expect(cell(page, 2, 3)).not.toHaveAttribute('aria-label', /en la red/);
  await expect(page.locator('.hud__plague')).toBeVisible();
  await cell(page, 2, 3).click();
  await expect(page.locator('#notice')).toContainText('Plaga marchita: no se puede tejer.');
  if (info.project.name === 'vertical-390x844') {
    await page.waitForTimeout(1500); // que termine el fundido de la plaga viva sobre la red muerta
    await page.screenshot({ path: 'docs/screenshots/035-plaga-marchita-390x844.png' });
  }
  // En invierno (mes 10) la casilla usa su variante con nieve.
  await weave(9);
  await page.locator('.end').click();
  await expect(cell(page, 2, 3)).toHaveAttribute('aria-label', /con plaga/);
  // Solo para la captura: que terminen el fundido de la casilla marchita (~0,9 s) y el cambio de estación.
  if (info.project.name === 'vertical-390x844') {
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/033-plaga-invierno-390x844.png' });
  }
});

test('Ancestral cada dos meses (034): Elige tu dificultad lo dice y al empezar el mes 5 ya hay un árbol apagado y otro marcado', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('#screen')).toContainText('cinco árboles que se apagan');
  await page.goto('/?nivel=ancestral&seed=1');
  for (let m = 1; m < 5; m++) await page.locator('.end').click();
  await expect(page.locator('.hud__month-value')).toHaveText('Mes 5/12');
  await expect(page.locator('#notice')).toContainText('Este árbol se apagará al terminar el mes si nadie lo revive.');
  await expect(page.locator('.cell[aria-label*="se apagará al terminar el mes"]')).toHaveCount(1);
  await expect(page.locator('.cell[aria-label*="apagado: revivirlo cuesta 7 nutrientes"]')).toHaveCount(1);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/034-ancestral-mes-5-390x844.png' });
});

test('Hongos para reclutar (039): Ámbar cura a distancia con su ficha completa', async ({ page }, info) => {
  await page.goto('/?map=clasico&debugState=fullGuild');
  while (await page.locator('#story:not([hidden]):not(.is-leaving)').count()) await page.locator('.story__btn--primary').click();
  const ambar = page.locator('.card--ganoderma');
  await ambar.scrollIntoViewIfNeeded();
  await expect(ambar.locator('.portrait img')).toHaveAttribute('src', /characters\/ambar\/portrait\.webp$/);
  await ambar.click();
  // Solo el árbol gris a 2 pasos del Hogar, aunque la red no lo toque.
  await expect(valid(page)).toHaveCount(1);
  await expect(cell(page, 2, 5)).toHaveAttribute('data-valid', 'true');
  await page.getByRole('button', { name: 'Ver la ficha de Ámbar' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Ganoderma lucidum');
  await expect(dialog.getByRole('img', { name: /a dos casillas/ })).toHaveCount(1);
  expect(await dialog.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(0);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/039-ambar-390x844.png' });
  await page.keyboard.press('Escape');
  await cell(page, 2, 5).click();
  await expect(page.locator('#notice')).toContainText('curó un árbol a distancia');
  await expect(cell(page, 2, 5)).toHaveAttribute('aria-label', /Árbol vivo/);
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/039-curar-390x844.png' });
});

test('Pompón cambia en los dos sentidos (040): elige soplar o abonar y después el árbol', async ({ page }, info) => {
  await page.goto('/?map=clasico&debugState=pompon');
  while (await page.locator('#story:not([hidden]):not(.is-leaving)').count()) await page.locator('.story__btn--primary').click();
  const pompon = page.locator('.card--lycoperdon');
  await pompon.scrollIntoViewIfNeeded();
  await pompon.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('¿Qué cambia Pompón?');
  await expect(valid(page)).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /Soplar esporas/ })).toBeEnabled();
  await expect(dialog.getByRole('button', { name: /Abonar el árbol/ })).toBeEnabled();
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/040-pompon-390x844.png' });
  await dialog.getByRole('button', { name: /Abonar el árbol/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect(valid(page).first()).toHaveAttribute('aria-label', /Árbol vivo/);
  await valid(page).first().click();
  await expect(page.locator('#notice')).toContainText('abonó el árbol');
  if (info.project.name === 'vertical-390x844') await page.screenshot({ path: 'docs/screenshots/040-abonar-390x844.png' });
});

test('Partida nueva (041): el dock no guarda las tarjetas de los reclutas de la partida anterior', async ({ page }) => {
  await page.goto('/?map=clasico&debugState=fullGuild');
  while (await page.locator('#story:not([hidden]):not(.is-leaving)').count()) await page.locator('.story__btn--primary').click();
  await expect(page.locator('.dock__item')).toHaveCount(8);
  // Lo mismo que hace «Jugar de nuevo»: una partida nueva con solo los tres iniciales.
  await page.evaluate(() => {
    type S = { getState(): { game: { members: { used: boolean; at: unknown }[] } }; dispatch(a: object): void };
    const store = (window as unknown as { store: S }).store;
    const g = store.getState().game;
    store.dispatch({ type: 'restart', game: { ...g, month: 1, members: g.members.slice(0, 3).map((m) => ({ ...m, used: false, at: null })) } });
  });
  await expect(page.locator('.dock__item')).toHaveCount(3);
  for (const sp of ['ganoderma', 'morchella', 'gliophorus', 'lycoperdon', 'mago']) await expect(page.locator(`.card--${sp}`)).toHaveCount(0);
});
